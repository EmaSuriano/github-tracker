import { Octokit } from '@octokit/core';
import { OctokitOptions } from '@octokit/core/dist-types/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { gistContentSchema } from '../../../helpers/schema';
import { authOptions } from '../auth/[...nextauth]';

const GIST_NAME = 'oss-projects.json';

export const getGistContent = async (options: OctokitOptions) => {
  const octokit = new Octokit(options);

  const { data: gists } = await octokit.request('GET /gists');
  const gistItemList = gists.find((gist) =>
    Object.keys(gist.files).includes(GIST_NAME),
  );

  if (!gistItemList) {
    throw new Error(`Gist of "${GIST_NAME}" not found`);
  }

  const { data: gist } = await octokit.request('GET /gists/{gist_id}', {
    gist_id: gistItemList.id,
  });

  if (!gist.files || !gist.files[GIST_NAME]) {
    throw new Error(`File Gist of "${GIST_NAME}" not found`);
  }

  const file = gist.files[GIST_NAME];

  if (!file.content) {
    throw new Error(`No content present in Gist`);
  }

  return gistContentSchema.parse(JSON.parse(file.content));
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
    const content = await getGistContent({ auth: session.accessToken });
    return res.send(JSON.stringify(content, null, 2));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch data', error });
  }
}
