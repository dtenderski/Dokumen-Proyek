import { z } from 'zod';
import { 
  insertContactMessageSchema, 
  contactMessages, 
  modules, 
  userRoles, 
  benefits, 
  heroContent, 
  ctaContent 
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  contact: {
    create: {
      method: 'POST' as const,
      path: '/api/contact',
      input: insertContactMessageSchema,
      responses: {
        201: z.custom<typeof contactMessages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  modules: {
    list: {
      method: 'GET' as const,
      path: '/api/modules',
      responses: {
        200: z.array(z.custom<typeof modules.$inferSelect>()),
      },
    },
  },
  userRoles: {
    list: {
      method: 'GET' as const,
      path: '/api/user-roles',
      responses: {
        200: z.array(z.custom<typeof userRoles.$inferSelect>()),
      },
    },
  },
  benefits: {
    list: {
      method: 'GET' as const,
      path: '/api/benefits',
      responses: {
        200: z.array(z.custom<typeof benefits.$inferSelect>()),
      },
    },
  },
  hero: {
    get: {
      method: 'GET' as const,
      path: '/api/hero',
      responses: {
        200: z.custom<typeof heroContent.$inferSelect>().nullable(),
      },
    },
  },
  cta: {
    get: {
      method: 'GET' as const,
      path: '/api/cta',
      responses: {
        200: z.custom<typeof ctaContent.$inferSelect>().nullable(),
      },
    },
  },
  landingContent: {
    get: {
      method: 'GET' as const,
      path: '/api/landing-content',
      responses: {
        200: z.object({
          hero: z.custom<typeof heroContent.$inferSelect>().nullable(),
          modules: z.array(z.custom<typeof modules.$inferSelect>()),
          userRoles: z.array(z.custom<typeof userRoles.$inferSelect>()),
          benefits: z.array(z.custom<typeof benefits.$inferSelect>()),
          cta: z.custom<typeof ctaContent.$inferSelect>().nullable(),
        }),
      },
    },
  },
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
