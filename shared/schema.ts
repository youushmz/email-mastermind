import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const smtps = pgTable("smtps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  secure: boolean("secure").default(true),
  dailyQuota: integer("daily_quota").default(500),
  usedQuota: integer("used_quota").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  country: text("country"),
  device: text("device"),
  lastLocation: text("last_location"),
  primaryDevice: text("primary_device"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: text("status").default('draft'), // draft, sending, completed, failed
  sentCount: integer("sent_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  failCount: integer("fail_count").default(0),
  smtpIds: integer("smtp_ids").array(), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaignContacts = pgTable("campaign_contacts", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  contactId: integer("contact_id").notNull(),
  status: text("status").default('pending'), // pending, sent, opened, clicked, failed
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
});

export const trackingLogs = pgTable("tracking_logs", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  contactId: integer("contact_id").notNull(),
  eventType: text("event_type").notNull(), // open, click
  ipAddress: text("ip_address"),
  country: text("country"),
  userAgent: text("user_agent"),
  device: text("device"),
  os: text("os"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod schemas
export const insertSmtpSchema = createInsertSchema(smtps).omit({ id: true, usedQuota: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
// Override array to accept array of integers
export const insertCampaignSchema = createInsertSchema(campaigns, {
  smtpIds: z.array(z.number())
}).omit({ 
  id: true, status: true, sentCount: true, openCount: true, clickCount: true, failCount: true, createdAt: true 
});

export type Smtp = typeof smtps.$inferSelect;
export type InsertSmtp = z.infer<typeof insertSmtpSchema>;
export type UpdateSmtpRequest = Partial<InsertSmtp>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type UpdateCampaignRequest = Partial<InsertCampaign>;

export type CampaignContact = typeof campaignContacts.$inferSelect;
export type TrackingLog = typeof trackingLogs.$inferSelect;
