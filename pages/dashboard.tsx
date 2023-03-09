import { Octokit } from '@octokit/rest';
import { Rating, Table } from 'flowbite-react';
import type { GetServerSidePropsContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import Layout from '../components/layout';
import { RepoRequest } from '../helpers/schema';
import { getOverview } from './api/examples/overview';

import { Menu } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { notReachable } from '../helpers/notReachable';

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSession(ctx);
  const overview = await getOverview({ auth: session!.accessToken });
  return { props: { overview } };
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>['props'];

export default function OverviewPage({ overview }: Props) {
  return (
    <Layout>
      <Table>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Pulls</Table.HeadCell>
          <Table.HeadCell>Issues</Table.HeadCell>
          <Table.HeadCell>Stars</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {overview.map((repo) => (
            <Table.Row
              key={repo.id}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <Link href={repo.html_url}>{repo.name}</Link>
              </Table.Cell>
              <Table.Cell>
                <PullsCell owner={repo.owner.login} repo={repo.name} />
              </Table.Cell>
              <Table.Cell>Nope</Table.Cell>
              <Table.Cell>
                <Rating>
                  <Rating.Star />
                  <p className="ml-2 text-sm text-gray-900 dark:text-white">
                    {repo.stargazers_count}
                  </p>
                </Rating>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Layout>
  );
}

const PullsCell = ({ owner, repo }: RepoRequest) => {
  const session = useSession();
  const octokit = new Octokit({ auth: session.data?.accessToken });

  const query = useQuery(
    ['GET /repos/{owner}/{repo}/pulls', owner, repo],
    () => octokit.request('GET /repos/{owner}/{repo}/pulls', { owner, repo }),
    { enabled: session.status === 'authenticated' },
  );

  switch (query.status) {
    case 'idle':
    case 'loading':
      return (
        <div role="status" className="max-w-sm animate-pulse">
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-10 mb-4" />
          <span className="sr-only">Loading...</span>
        </div>
      );

    case 'error':
      return <div>Failed to load</div>;

    case 'success':
      return (
        <Menu as="div" className="relative inline-block text-left">
          {({ open }) => (
            <>
              <Menu.Button className="flex">
                {query.data.data.length}
                {open ? (
                  <ChevronUpIcon
                    className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDownIcon
                    className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
                    aria-hidden="true"
                  />
                )}
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right divide-y z-10 divide-gray-100 rounded-md  bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {query.data.data.map((pull) => (
                  <Menu.Item key={pull.id}>
                    <Link
                      href={pull.html_url}
                      className="hover:bg-violet-500 bg-white hover:text-white text-gray-900 group flex items-center rounded-md px-2 py-2 text-sm"
                    >
                      <PullStatusIcon
                        owner={owner}
                        repo={repo}
                        pull_number={pull.number}
                      />
                      <span className="truncate">{pull.title}</span>
                    </Link>
                  </Menu.Item>
                ))}
              </Menu.Items>
            </>
          )}
        </Menu>
      );

    /* istanbul ignore next */
    default:
      return notReachable(query);
  }
};

const PullStatusIcon = ({
  owner,
  repo,
  pull_number,
}: RepoRequest & { pull_number: number }) => {
  const session = useSession();
  const octokit = new Octokit({ auth: session.data?.accessToken });

  const query = useQuery(
    [octokit.repos.getCombinedStatusForRef.endpoint.DEFAULTS.url, owner, repo],
    () =>
      octokit.repos.getCombinedStatusForRef({
        owner,
        repo,
        ref: `refs/pull/${pull_number}/head`,
      }),
    { enabled: session.status === 'authenticated' },
  );

  switch (query.status) {
    case 'idle':
    case 'loading':
      return <span className="w-4 h-4 mr-2 bg-gray-200 rounded-full"></span>;

    case 'error':
      return <span className="w-4 h-4 mr-2 bg-red-200 rounded-full"></span>;

    case 'success':
      console.log(query.data.data.state);
      switch (query.data.data.state) {
        case 'success':
          return (
            <span className="w-4 h-4 mr-2 bg-green-200 rounded-full"></span>
          );

        case 'pending':
          return (
            <span className="w-4 h-4 mr-2 bg-yellow-200 rounded-full"></span>
          );

        default:
          return <span className="w-4 h-4 mr-2 bg-red-200 rounded-full"></span>;
      }

    /* istanbul ignore next */
    default:
      return notReachable(query);
  }
};
