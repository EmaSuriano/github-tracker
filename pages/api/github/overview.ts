import { OctokitOptions } from '@octokit/core/dist-types/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { PROJECT_REGEX } from '../../../helpers/schema';
import { authOptions } from '../auth/[...nextauth]';
import { getGistContent } from './gist';
import { getRepositoryInfo } from './repo';

export const getOverview = async (options: OctokitOptions) => {
  const gistContent = await getGistContent(options);

  const projects = await Promise.all(
    gistContent.projects.map((url) => {
      const match = url.match(PROJECT_REGEX)!;
      const [, owner, repo] = match;

      return getRepositoryInfo(options, { owner, repo });
    }),
  );

  return projects;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Please log in first' });
  }

  try {
    const content = await getOverview({ auth: session.accessToken });
    return res.send(JSON.stringify(content, null, 2));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch data', error });
  }
}
