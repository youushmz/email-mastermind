import { db } from "./db";
import { 
  smtps, contacts, campaigns, campaignContacts, trackingLogs,
  type Smtp, type InsertSmtp, type UpdateSmtpRequest,
  type Contact, type InsertContact,
  type Campaign, type InsertCampaign, type UpdateCampaignRequest,
  type CampaignContact, type TrackingLog
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // SMTP
  getSmtps(): Promise<Smtp[]>;
  getSmtp(id: number): Promise<Smtp | undefined>;
  createSmtp(smtp: InsertSmtp): Promise<Smtp>;
  updateSmtp(id: number, updates: UpdateSmtpRequest): Promise<Smtp>;
  deleteSmtp(id: number): Promise<void>;

  // Contacts
  getContacts(filters?: { country?: string; device?: string }): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, updates: Partial<Contact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: UpdateCampaignRequest): Promise<Campaign>;

  // Tracking
  logEvent(log: any): Promise<void>;
  updateContactFromEvent(contactId: number, data: { country?: string; device?: string }): Promise<void>;

  // Analytics
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getSmtps(): Promise<Smtp[]> {
    return await db.select().from(smtps);
  }

  async getSmtp(id: number): Promise<Smtp | undefined> {
    const [smtp] = await db.select().from(smtps).where(eq(smtps.id, id));
    return smtp;
  }

  async createSmtp(smtp: InsertSmtp): Promise<Smtp> {
    const [newSmtp] = await db.insert(smtps).values(smtp).returning();
    return newSmtp;
  }

  async updateSmtp(id: number, updates: UpdateSmtpRequest): Promise<Smtp> {
    const [updated] = await db.update(smtps).set(updates).where(eq(smtps.id, id)).returning();
    return updated;
  }

  async deleteSmtp(id: number): Promise<void> {
    await db.delete(smtps).where(eq(smtps.id, id));
  }

  async getContacts(filters?: { country?: string; device?: string }): Promise<Contact[]> {
    let query = db.select().from(contacts);
    if (filters?.country || filters?.device) {
      // Basic filtering logic
      const all = await query;
      return all.filter(c => {
        let match = true;
        if (filters.country && c.country !== filters.country) match = false;
        if (filters.device && c.device !== filters.device) match = false;
        return match;
      });
    }
    return await query;
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const [updated] = await db.update(contacts).set(updates).where(eq(contacts.id, id)).returning();
    return updated;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async logEvent(log: any): Promise<void> {
    await db.insert(trackingLogs).values(log);
    // Update campaign stats
    const campaign = await this.getCampaign(log.campaignId);
    if (campaign) {
      if (log.eventType === 'open') {
        await this.updateCampaign(log.campaignId, { openCount: (campaign.openCount || 0) + 1 });
      } else if (log.eventType === 'click') {
        await this.updateCampaign(log.campaignId, { clickCount: (campaign.clickCount || 0) + 1 });
      }
    }
  }

  async updateContactFromEvent(contactId: number, data: { country?: string; device?: string }): Promise<void> {
    const updates: any = {};
    if (data.country) {
      updates.country = data.country;
      updates.lastLocation = data.country;
    }
    if (data.device) {
      updates.device = data.device;
      updates.primaryDevice = data.device;
    }
    await this.updateContact(contactId, updates);
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: number, updates: UpdateCampaignRequest): Promise<Campaign> {
    const [updated] = await db.update(campaigns).set(updates).where(eq(campaigns.id, id)).returning();
    return updated;
  }

  async getDashboardStats(): Promise<any> {
    // Stub stats for the dashboard
    return {
      totalSent: 15420,
      openRate: 42.5,
      clickRate: 12.3,
      failed: 15,
      deviceStats: [
        { name: "Mobile", value: 65 },
        { name: "Desktop", value: 35 }
      ],
      countryStats: [
        { name: "United States", value: 4500 },
        { name: "United Kingdom", value: 3200 },
        { name: "Canada", value: 2100 },
        { name: "Germany", value: 1500 },
        { name: "Australia", value: 900 }
      ]
    };
  }
}

export const storage = new DatabaseStorage();