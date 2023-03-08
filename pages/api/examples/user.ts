import { Octokit } from '@octokit/core';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Please log in to submit' });
  }
  console.log(session);
  console.log('accessToken: ', session.accessToken);

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  try {
    const { data } = await octokit.request('GET /user');
    return res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch data', error });
  }
}
