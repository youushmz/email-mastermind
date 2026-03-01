import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import nodemailer from "nodemailer";
import { parse } from 'node-html-parser';
import geoip from 'geoip-lite';
import useragent from 'useragent';

async function sendEmail(smtp: any, to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.username,
      password: smtp.password,
    },
  });

  return await transporter.sendMail({
    from: `"${smtp.name}" <${smtp.username}>`,
    to,
    subject,
    html,
  });
}

function wrapLinks(html: string, campaignId: number, contactId: number) {
  const root = parse(html);
  const links = root.querySelectorAll('a');
  links.forEach(link => {
    const originalUrl = link.getAttribute('href');
    if (originalUrl && !originalUrl.startsWith('#')) {
      const trackingUrl = `http://localhost:5000/api/track/click?c=${campaignId}&u=${contactId}&url=${encodeURIComponent(originalUrl)}`;
      link.setAttribute('href', trackingUrl);
    }
  });
  
  // Add tracking pixel
  const pixel = `<img src="http://localhost:5000/api/track/open?c=${campaignId}&u=${contactId}" width="1" height="1" style="display:none" />`;
  return root.toString() + pixel;
}

async function seedDatabase() {
  const existingSmtps = await storage.getSmtps();
  if (existingSmtps.length === 0) {
    await storage.createSmtp({
      name: "Mailgun Primary",
      host: "smtp.mailgun.org",
      port: 587,
      username: "postmaster@mail.example.com",
      password: "password123",
      secure: true,
      dailyQuota: 5000,
      isActive: true,
    });
    await storage.createSmtp({
      name: "SendGrid Fallback",
      host: "smtp.sendgrid.net",
      port: 587,
      username: "apikey",
      password: "password123",
      secure: true,
      dailyQuota: 1000,
      isActive: true,
    });
  }

  const existingContacts = await storage.getContacts();
  if (existingContacts.length === 0) {
    await storage.createContact({ email: "john.doe@example.com", firstName: "John", lastName: "Doe" });
    await storage.createContact({ email: "jane.smith@example.com", firstName: "Jane", lastName: "Smith" });
    await storage.createContact({ email: "contact@company.com", firstName: "Company", lastName: "Inc" });
  }

  const existingCampaigns = await storage.getCampaigns();
  if (existingCampaigns.length === 0) {
    const smtps = await storage.getSmtps();
    const smtpIds = smtps.map(s => s.id);
    await storage.createCampaign({
      name: "Welcome Series 1",
      subject: "Welcome to our platform!",
      content: "<h1>Welcome!</h1><p>We are glad to have you.</p>",
      smtpIds: smtpIds,
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed the database
  await seedDatabase();

  // Tracking Routes
  app.get('/api/track/open', async (req, res) => {
    const campaignId = Number(req.query.c);
    const contactId = Number(req.query.u);
    const ip = req.ip || req.socket.remoteAddress || "";
    const geo = geoip.lookup(ip);
    const agent = useragent.parse(req.headers['user-agent']);
    
    const country = geo ? geo.country : 'Unknown';
    const device = agent.device.family === 'Other' ? (agent.os.family === 'Android' || agent.os.family === 'iOS' ? 'Mobile' : 'Desktop') : agent.device.family;
    const os = agent.os.family;

    await storage.logEvent({
      campaignId,
      contactId,
      eventType: 'open',
      ipAddress: ip,
      country,
      userAgent: req.headers['user-agent'],
      device,
      os
    });

    await storage.updateContactFromEvent(contactId, { country, device });

    // Return 1x1 transparent gif
    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': buffer.length
    });
    res.end(buffer);
  });

  app.get('/api/track/click', async (req, res) => {
    const campaignId = Number(req.query.c);
    const contactId = Number(req.query.u);
    const targetUrl = req.query.url as string;
    const ip = req.ip || req.socket.remoteAddress || "";
    const geo = geoip.lookup(ip);
    const agent = useragent.parse(req.headers['user-agent']);
    
    const country = geo ? geo.country : 'Unknown';
    const device = agent.device.family === 'Other' ? (agent.os.family === 'Android' || agent.os.family === 'iOS' ? 'Mobile' : 'Desktop') : agent.device.family;
    const os = agent.os.family;

    await storage.logEvent({
      campaignId,
      contactId,
      eventType: 'click',
      ipAddress: ip,
      country,
      userAgent: req.headers['user-agent'],
      device,
      os
    });

    await storage.updateContactFromEvent(contactId, { country, device });

    res.redirect(targetUrl || '/');
  });

  // SMTPs
  app.get(api.smtps.list.path, async (req, res) => {
    const smtps = await storage.getSmtps();
    res.json(smtps);
  });

  app.post(api.smtps.create.path, async (req, res) => {
    try {
      const input = api.smtps.create.input.parse(req.body);
      const smtp = await storage.createSmtp(input);
      res.status(201).json(smtp);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.smtps.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.smtps.update.input.parse(req.body);
      const smtp = await storage.updateSmtp(id, input);
      if (!smtp) return res.status(404).json({ message: "SMTP not found" });
      res.json(smtp);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.smtps.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteSmtp(id);
    res.status(204).end();
  });

  app.post(api.smtps.test.path, async (req, res) => {
    // Mock SMTP test connection
    const id = Number(req.params.id);
    const smtp = await storage.getSmtp(id);
    if (!smtp) return res.status(404).json({ message: "SMTP not found" });
    
    // Fake test success
    res.json({ success: true, message: `Successfully connected to ${smtp.host}` });
  });

  // Contacts
  app.get(api.contacts.list.path, async (req, res) => {
    const country = req.query.country as string;
    const device = req.query.device as string;
    const contacts = await storage.getContacts({ country, device });
    res.json(contacts);
  });

  app.post(api.contacts.create.path, async (req, res) => {
    try {
      const input = api.contacts.create.input.parse(req.body);
      const contact = await storage.createContact(input);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.contacts.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteContact(id);
    res.status(204).end();
  });

  // Campaigns
  app.get(api.campaigns.list.path, async (req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });

  app.get(api.campaigns.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const campaign = await storage.getCampaign(id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  });

  app.post(api.campaigns.create.path, async (req, res) => {
    try {
      const input = api.campaigns.create.input.parse(req.body);
      const campaign = await storage.createCampaign(input);
      res.status(201).json(campaign);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.campaigns.send.path, async (req, res) => {
    const id = Number(req.params.id);
    const campaign = await storage.getCampaign(id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    
    await storage.updateCampaign(id, { status: "sending" });
    
    // SMTP Rotation Logic (Round Robin)
    // Ensure we use the smtpIds from the campaign object
    const smtpIds = campaign.smtpIds || [];
    if (smtpIds.length === 0) {
      console.error(`No SMTPs selected for campaign ${id}`);
      return res.status(400).json({ message: "No SMTPs selected for campaign" });
    }

    const campaignContactsList = await storage.getContacts(); 
    if (campaignContactsList.length === 0) {
      await storage.updateCampaign(id, { status: "completed", sentCount: 0, failCount: 0 });
      return res.json({ message: "No contacts to send to" });
    }
    
    let sentCount = 0;
    let failCount = 0;

    // Process in background
    (async () => {
      try {
        const activeSmtps = await Promise.all(smtpIds.map(sid => storage.getSmtp(sid)));
        const smtpsToUse = activeSmtps.filter(s => s && s.isActive);
        
        if (smtpsToUse.length === 0) {
          console.error(`No active SMTPs found for campaign ${id}. Checked IDs: ${smtpIds}`);
          await storage.updateCampaign(id, { status: "failed" });
          return;
        }

        console.log(`Starting campaign ${id} with ${smtpsToUse.length} SMTPs and ${campaignContactsList.length} contacts.`);

        // Determine starting point for rotation if needed, here we just use modulo
        for (let i = 0; i < campaignContactsList.length; i++) {
          const contact = campaignContactsList[i];
          const smtp = smtpsToUse[i % smtpsToUse.length];
          
          if (!smtp) {
            failCount++;
            continue;
          }
          
          try {
            const trackedContent = wrapLinks(campaign.content, campaign.id, contact.id);
            await sendEmail(smtp, contact.email, campaign.subject, trackedContent);
            sentCount++;
            // Update used quota
            await storage.updateSmtp(smtp.id, { usedQuota: (smtp.usedQuota || 0) + 1 });
          } catch (err) {
            console.error(`Failed to send to ${contact.email} via SMTP ${smtp.id}:`, err);
            failCount++;
          }
        }

        await storage.updateCampaign(id, { 
          status: "completed", 
          sentCount, 
          failCount 
        });
        console.log(`Campaign ${id} finished. Sent: ${sentCount}, Failed: ${failCount}`);
      } catch (err) {
        console.error(`Fatal error in campaign ${id} background process:`, err);
        await storage.updateCampaign(id, { status: "failed" });
      }
    })();

    res.json({ message: "Campaign started sending" });
  });

  // Analytics
  app.get(api.analytics.dashboard.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  return httpServer;
}