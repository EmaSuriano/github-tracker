import { Octokit } from '@octokit/rest';
import { useSession } from 'next-auth/react';
import { useQuery } from 'react-query';
import { notReachable } from '../helpers/notReachable';
import { Repository } from '../pages/api/github/repo';

type PullStatusIconProps = {
  repo: Repository;
  pull_number: number;
};

const STATUS = {
  LOADING: <span className="flex w-3 h-3 bg-gray-300 rounded-full" />,
  ERROR: <span className="flex w-3 h-3 bg-red-300 rounded-full" />,
  PENDING: <span className="flex w-3 h-3 bg-yellow-300 rounded-full" />,
  SUCCESS: <span className="flex w-3 h-3 bg-green-300 rounded-full" />,
  UNKNOWN: <span className="flex w-3 h-3 bg-gray-300 rounded-full" />,
};

export const PullStatusIcon = ({ repo, pull_number }: PullStatusIconProps) => {
  const session = useSession();
  const octokit = new Octokit({ auth: session.data?.accessToken });

  const query = useQuery(
    [
      octokit.repos.getCombinedStatusForRef.endpoint.DEFAULTS.url,
      repo.owner.login,
      repo.name,
    ],
    () =>
      octokit.repos.getCombinedStatusForRef({
        owner: repo.owner.login,
        repo: repo.name,
        ref: `refs/pull/${pull_number}/head`,
      }),
    { enabled: session.status === 'authenticated' },
  );

  switch (query.status) {
    case 'idle':
    case 'loading':
      return STATUS.LOADING;

    case 'error':
      return STATUS.ERROR;

    case 'success':
      switch (query.data.data.state) {
        case 'success':
          return STATUS.SUCCESS;

        case 'pending':
          return STATUS.PENDING;

        case 'failure':
          return STATUS.ERROR;

        default:
          return STATUS.UNKNOWN;
      }

    /* istanbul ignore next */
    default:
      return notReachable(query);
  }
};
