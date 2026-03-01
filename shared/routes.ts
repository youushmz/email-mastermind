import { z } from 'zod';
import { insertSmtpSchema, smtps, insertContactSchema, contacts, insertCampaignSchema, campaigns } from './schema';

export { insertSmtpSchema, insertContactSchema, insertCampaignSchema };

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  smtps: {
    list: {
      method: 'GET' as const,
      path: '/api/smtps' as const,
      responses: { 200: z.array(z.custom<typeof smtps.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/smtps' as const,
      input: insertSmtpSchema,
      responses: { 201: z.custom<typeof smtps.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/smtps/:id' as const,
      input: insertSmtpSchema.partial(),
      responses: { 200: z.custom<typeof smtps.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/smtps/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
    test: {
      method: 'POST' as const,
      path: '/api/smtps/:id/test' as const,
      responses: { 200: z.object({ success: z.boolean(), message: z.string() }), 404: errorSchemas.notFound },
    }
  },
  contacts: {
    list: {
      method: 'GET' as const,
      path: '/api/contacts' as const,
      input: z.object({
        country: z.string().optional(),
        device: z.string().optional(),
      }).optional(),
      responses: { 200: z.array(z.custom<typeof contacts.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/contacts' as const,
      input: insertContactSchema,
      responses: { 201: z.custom<typeof contacts.$inferSelect>(), 400: errorSchemas.validation },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/contacts/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    }
  },
  campaigns: {
    list: {
      method: 'GET' as const,
      path: '/api/campaigns' as const,
      responses: { 200: z.array(z.custom<typeof campaigns.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/campaigns/:id' as const,
      responses: { 200: z.custom<typeof campaigns.$inferSelect>(), 404: errorSchemas.notFound },
    },
    create: {
      method: 'POST' as const,
      path: '/api/campaigns' as const,
      input: insertCampaignSchema,
      responses: { 201: z.custom<typeof campaigns.$inferSelect>(), 400: errorSchemas.validation },
    },
    send: {
      method: 'POST' as const,
      path: '/api/campaigns/:id/send' as const,
      responses: { 200: z.object({ message: z.string() }), 404: errorSchemas.notFound },
    }
  },
  analytics: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/analytics/dashboard' as const,
      responses: { 
        200: z.object({
          totalSent: z.number(),
          openRate: z.number(),
          clickRate: z.number(),
          failed: z.number(),
          deviceStats: z.array(z.object({ name: z.string(), value: z.number() })),
          countryStats: z.array(z.object({ name: z.string(), value: z.number() }))
        }) 
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
