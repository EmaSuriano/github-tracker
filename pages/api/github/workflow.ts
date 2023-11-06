import { Octokit } from '@octokit/rest';
import { OctokitOptions } from '@octokit/core/dist-types/types';
import { StatusCodes } from 'http-status-codes';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import {
  WorkflowRequest,
  workflowRequestSchema,
} from '../../../helpers/schema';
import { authOptions } from '../auth/[...nextauth]';

export const getWorkflowInfo = async (
  options: OctokitOptions,
  request: WorkflowRequest,
) => {
  const octokit = new Octokit(options);

  const { data: workflows } = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/workflows',
    request,
  );

  const workflow = workflows.workflows.find((x) => x.name === 'ci');

  if (!workflow) {
    throw new Error(`No CI setup`);
  }

  const { data: runs } = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs',
    { ...request, workflow_id: workflow?.id },
  );

  const masterRun = runs.workflow_runs.find(
    (x) => x.head_branch === request.branch,
  );

  if (!masterRun) {
    throw new Error(`No CI setup`);
  }

  return masterRun;
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
    const result = workflowRequestSchema.safeParse(req.query);

    if (!result.success) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Please provide author and repo values' });
    }

    const content = await getWorkflowInfo(
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
