import { Octokit } from '@octokit/core';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '../pages/api/auth/[...nextauth]';

export const getServerOctokitAuth = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: 'Please log in first' });
    throw new Error('Please log in first');
  }

  const octokit = new Octokit({ auth: session.accessToken });
  return octokit;
};
