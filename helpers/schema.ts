import { z } from 'zod';

export const PROJECT_REGEX = /([^/]+)\/([^/]+)/;

export const repoRequestSchema = z.object({
  owner: z.string(),
  repo: z.string(),
});

export type RepoRequest = z.infer<typeof repoRequestSchema>;

export const gistContentSchema = z.object({
  projects: z.array(z.string().regex(PROJECT_REGEX)),
  threshold: z
    .object({
      pullRequests: z.number().optional(),
      issues: z.number().optional(),
      vulnerabilityAlerts: z.number().optional(),
    })
    .optional(),
});

export type GistContent = z.infer<typeof gistContentSchema>;
