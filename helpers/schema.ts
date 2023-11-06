import { z } from 'zod';

export const PROJECT_REGEX = /([^/]+)\/([^/]+)/;

export const repoRequestSchema = z.object({
  owner: z.string(),
  repo: z.string(),
});

export const workflowRequestSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  branch: z.string(),
});

export type RepoRequest = z.infer<typeof repoRequestSchema>;
export type WorkflowRequest = z.infer<typeof workflowRequestSchema>;

export const gistContentSchema = z.object({
  projects: z.array(z.string().regex(PROJECT_REGEX)),
  threshold: z
    .object({
      pulls: z.number().optional(),
      issues: z.number().optional(),
    })
    .optional(),
});

export type GistContent = z.infer<typeof gistContentSchema>;
