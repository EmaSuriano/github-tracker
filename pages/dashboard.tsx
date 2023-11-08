import { Octokit } from '@octokit/rest';
import {
  Rating,
  Table,
  Dropdown,
  Avatar,
  Badge,
  FlowbiteColors,
} from 'flowbite-react';
import type { GetServerSidePropsContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../components/layout';
import { getOverview } from './api/github/overview';

import { formatDistanceStrict } from 'date-fns';
import { PullStatusIcon } from '../components/pull-status';
import { AsyncCell } from '../components/async-cell';
import { getWorkflowInfo } from './api/github/workflow';

// This page will always contains an existing session because it's defined inside middleware.ts
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSession(ctx);

  const overview = await getOverview({ auth: session!.accessToken });

  return { props: { overview } };
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>['props'];
type Repository = Props['overview'][number];

const useColumns = () => {
  const session = useSession();
  if (!session.data?.accessToken) {
    return [];
  }

  const octokit = new Octokit({ auth: session.data.accessToken });

  return [
    {
      id: 'Name',
      render: (repo: Repository) => (
        <Link
          className="whitespace-nowrap text-primary-600 dark:text-primary-400 hover:text-primary-500"
          href={repo.html_url}
        >
          {repo.name}
        </Link>
      ),
    },
    {
      id: 'homepage',
      render: (repo: Repository) =>
        repo.homepage ? (
          <Link
            className="whitespace-nowrap text-primary-600 dark:text-primary-400 hover:text-primary-500"
            href={repo.homepage}
          >
            {repo.homepage.replace('https://', '')}
          </Link>
        ) : (
          '-'
        ),
    },
    {
      id: 'workflow',
      render: (repo: Repository) => (
        <AsyncCell
          queryKey={[
            'GET /repos/{owner}/{repo}/actions/workflows',
            repo.owner.login,
            repo.name,
          ]}
          queryFn={() =>
            getWorkflowInfo(
              { auth: session.data.accessToken },
              {
                owner: repo.owner.login,
                repo: repo.name,
                branch: repo.default_branch,
              },
            )
          }
          onLoad={(workflow) => (
            <span className="flex flex-wrap">
              <Badge
                size="sm"
                href={workflow.html_url}
                color={workflow.conclusion as keyof FlowbiteColors}
              >
                {workflow.conclusion}
              </Badge>
            </span>
          )}
        />
      ),
    },
    {
      id: 'issues',
      render: (repo: Repository) => (
        <AsyncCell
          queryKey={[
            'GET /repos/{owner}/{repo}/issues',
            repo.owner.login,
            repo.name,
          ]}
          queryFn={() =>
            octokit
              .request('GET /repos/{owner}/{repo}/issues', {
                owner: repo.owner.login,
                repo: repo.name,
              })
              .then((res) => {
                res.data = res.data.filter((x) => !x.pull_request);
                return res;
              })
          }
          onLoad={({ data }) =>
            data.length && (
              <>
                <Dropdown inline label={data.length} dismissOnClick={false}>
                  {data.map((issue) => (
                    <Dropdown.Item
                      key={issue.id}
                      href={issue.html_url}
                      className="flex gap-x-2"
                    >
                      <Avatar
                        size="xs"
                        alt={issue.user?.name || 'User avatar'}
                        img={issue.user?.avatar_url}
                        rounded
                      />

                      {issue.title}
                    </Dropdown.Item>
                  ))}
                </Dropdown>
              </>
            )
          }
        />
      ),
    },
    {
      id: 'pulls',
      render: (repo: Repository) => (
        <AsyncCell
          queryKey={[
            'GET /repos/{owner}/{repo}/pulls',
            repo.owner.login,
            repo.name,
          ]}
          queryFn={() =>
            octokit.request('GET /repos/{owner}/{repo}/pulls', {
              owner: repo.owner.login,
              repo: repo.name,
            })
          }
          onLoad={({ data }) =>
            data.length && (
              <Dropdown inline label={data.length} dismissOnClick={false}>
                {data.map((pull) => (
                  <Dropdown.Item
                    key={pull.id}
                    href={pull.html_url}
                    className="flex gap-x-2"
                  >
                    <PullStatusIcon repo={repo} pull_number={pull.number} />
                    {pull.title}
                  </Dropdown.Item>
                ))}
              </Dropdown>
            )
          }
        />
      ),
    },
    {
      id: 'forks',
      render: (repo: Repository) => (
        <div className="flex space-x-1 items-center">
          <svg
            aria-hidden="true"
            height="16"
            viewBox="0 0 16 16"
            version="1.1"
            width="16"
            data-view-component="true"
          >
            <path
              fill="currentColor"
              d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"
            ></path>
          </svg>
          <p>{repo.forks_count}</p>
        </div>
      ),
    },
    {
      id: 'stars',
      render: (repo: Repository) => (
        <Rating className="space-x-1">
          <Rating.Star />
          <p>{repo.stargazers_count}</p>
        </Rating>
      ),
    },
    {
      id: 'Last Commit',
      render: (repo: Repository) => {
        const queryFn = () =>
          octokit.request('GET /repos/{owner}/{repo}/commits', {
            owner: repo.owner.login,
            repo: repo.name,
          });

        return (
          <AsyncCell
            queryKey={[
              'GET /repos/{owner}/{repo}/commits',
              repo.owner.login,
              repo.name,
            ]}
            queryFn={queryFn}
            onLoad={({ data }) => {
              const lastCommitDate = data[0].commit.author?.date;
              if (!lastCommitDate) {
                return 'No commits yet...';
              }

              return formatDistanceStrict(
                new Date(lastCommitDate),
                new Date(),
                { addSuffix: true },
              );
            }}
          />
        );
      },
    },
  ];
};

export default function OverviewPage({ overview }: Props) {
  const columns = useColumns();

  const sections = [
    { title: 'Projects', value: overview.length },
    {
      title: 'Open Issues',
      value: overview.reduce((acc, curr) => acc + curr.open_issues_count, 0),
    },
    {
      title: 'Oldest update',
      value: formatDistanceStrict(
        new Date(
          overview
            .map((x) => new Date(x.updated_at).getTime())
            .sort((a, b) => a - b)[0],
        ),
        new Date(),
        { addSuffix: true },
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="text-5xl my-4 font-extrabold dark:text-white">
        Dashboard
      </h1>

      <section>
        <div className="max-w-screen-xl px-4 py-8 lg:py-16 lg:px-6">
          <dl className="grid max-w-screen-md gap-8 text-gray-900 sm:grid-cols-3 dark:text-white">
            {sections.map(({ title, value }) => (
              <div
                key={title}
                className="flex flex-col items-start justify-center"
              >
                <dt className="mb-2 text-3xl md:text-4xl font-extrabold">
                  {value}
                </dt>
                <dd className="font-light text-gray-500 dark:text-gray-400">
                  {title}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Table striped>
        <Table.Head>
          {columns.map((col) => (
            <Table.HeadCell key={col.id}>{col.id}</Table.HeadCell>
          ))}
        </Table.Head>
        <Table.Body>
          {overview.map((repo) => (
            <Table.Row key={repo.id}>
              {columns.map((col) => (
                <Table.Cell key={col.id}>{col.render(repo)}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Layout>
  );
}
