import { Octokit } from '@octokit/rest';
import { OctokitOptions } from '@octokit/core/dist-types/types';
import { StatusCodes } from 'http-status-codes';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { RepoRequest, repoRequestSchema } from '../../../helpers/schema';
import { authOptions } from '../auth/[...nextauth]';

export type Repository = Awaited<ReturnType<typeof getRepositoryInfo>>;

export const getRepositoryInfo = async (
  options: OctokitOptions,
  request: RepoRequest,
) => {
  const octokit = new Octokit(options);

  const { data: repo } = await octokit.repos.get(request);

  return repo;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Please log in first' });
  }

  try {
    const result = repoRequestSchema.safeParse(req.query);

    if (!result.success) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Please provide author and repo values' });
    }

    const content = await getRepositoryInfo(
      { auth: session.accessToken },
      result.data,
    );
    return res.status(StatusCodes.OK).send(JSON.stringify(content, null, 2));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to fetch data', error });
  }
}
