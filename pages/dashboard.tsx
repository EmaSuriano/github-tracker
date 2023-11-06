import { Octokit } from '@octokit/rest';
import { Rating, Table } from 'flowbite-react';
import type { GetServerSidePropsContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../components/layout';
import { getOverview } from './api/examples/overview';

import { Menu } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { formatDistanceStrict } from 'date-fns';
import { PullStatusIcon } from '../components/pull-status';
import { AsyncCell } from '../components/async-cell';

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSession(ctx);

  const overview = await getOverview({ auth: session!.accessToken });
  return { props: { overview } };
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>['props'];
type Repository = Props['overview'][number];

type DropdownProps<TData> = {
  items: TData[];
  renderItem: (item: TData) => JSX.Element;
};

const Dropdown = <T extends Object>({
  items,
  renderItem,
}: DropdownProps<T>) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <Menu.Button className="flex" disabled={!items.length}>
            {items.length}
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

          <Menu.Items className="absolute max-h-72 h-fit overflow-auto right-0 mt-2 w-72 origin-top-right divide-y z-10 divide-gray-100 rounded-md  bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {items.map(renderItem)}
          </Menu.Items>
        </>
      )}
    </Menu>
  );
};

type Column = {
  id: string;
  title?: string;
  Content: ({ repo }: { repo: Repository }) => JSX.Element;
};

export default function OverviewPage({ overview }: Props) {
  const session = useSession();
  if (!session.data?.accessToken) {
    return null;
  }

  const octokit = new Octokit({ auth: session.data.accessToken });

  const COLUMNS: Column[] = [
    {
      id: 'name',
      Content: ({ repo }) => (
        <Link
          className="whitespace-nowrap text-primary-600 dark:text-primary-400 hover:text-primary-500"
          href={repo.html_url}
        >
          {repo.name}
        </Link>
      ),
    },
    {
      id: 'issues',
      Content: ({ repo }: { repo: Repository }) => {
        const queryFn = () =>
          octokit
            .request('GET /repos/{owner}/{repo}/issues', {
              owner: repo.owner.login,
              repo: repo.name,
            })
            .then((res) => {
              res.data = res.data.filter((x) => !x.pull_request);
              return res;
            });

        type Response = Awaited<ReturnType<typeof queryFn>>;

        return (
          <AsyncCell<Response>
            queryKey={[
              'GET /repos/{owner}/{repo}/issues',
              repo.owner.login,
              repo.name,
            ]}
            queryFn={queryFn}
            onLoad={({ data }) => (
              <Dropdown
                items={data}
                renderItem={(issue) => (
                  <Menu.Item key={issue.id}>
                    <Link
                      href={issue.html_url}
                      className="hover:bg-primary-500 hover:text-white group flex space-x-2 items-center rounded-md px-2 py-2 text-sm"
                    >
                      <span className="truncate">{issue.title}</span>
                    </Link>
                  </Menu.Item>
                )}
              />
            )}
          />
        );
      },
    },
    {
      id: 'pulls',
      Content: ({ repo }: { repo: Repository }) => {
        const queryFn = () =>
          octokit.request('GET /repos/{owner}/{repo}/pulls', {
            owner: repo.owner.login,
            repo: repo.name,
          });

        type Response = Awaited<ReturnType<typeof queryFn>>;

        return (
          <AsyncCell<Response>
            queryKey={[
              'GET /repos/{owner}/{repo}/pulls',
              repo.owner.login,
              repo.name,
            ]}
            queryFn={queryFn}
            onLoad={({ data }) => (
              <Dropdown
                items={data}
                renderItem={(pull) => (
                  <Menu.Item key={pull.id}>
                    <Link
                      href={pull.html_url}
                      className="hover:bg-violet-500 bg-white hover:text-white text-gray-900 group flex space-x-2 items-center rounded-md px-2 py-2 text-sm"
                    >
                      <span>
                        <PullStatusIcon repo={repo} pull_number={pull.number} />
                      </span>
                      <span className="truncate">{pull.title}</span>
                    </Link>
                  </Menu.Item>
                )}
              />
            )}
          />
        );
      },
    },
    {
      id: 'stars',
      Content: ({ repo }: { repo: Repository }) => (
        <Rating>
          <Rating.Star />
          <p className="ml-2 text-sm text-gray-900 dark:text-white">
            {repo.stargazers_count}
          </p>
        </Rating>
      ),
    },
    {
      id: 'lastCommit',
      title: 'Last Commit',
      Content: ({ repo }) => {
        const queryFn = () =>
          octokit.request('GET /repos/{owner}/{repo}/commits', {
            owner: repo.owner.login,
            repo: repo.name,
          });

        type Response = Awaited<ReturnType<typeof queryFn>>;

        return (
          <AsyncCell<Response>
            queryKey={[
              'GET /repos/{owner}/{repo}/commits',
              repo.owner.login,
              repo.name,
            ]}
            queryFn={queryFn}
            onLoad={({ data }) => {
              const lastCommitDate = data[0].commit.author?.date;
              if (!lastCommitDate) {
                return <p>'-'</p>;
              }

              return (
                <p className="whitespace-nowrap">
                  {formatDistanceStrict(new Date(lastCommitDate), new Date(), {
                    addSuffix: true,
                  })}
                </p>
              );
            }}
          />
        );
      },
    },
  ];

  const sections = [
    { title: 'Projects', value: overview.length },
    {
      title: 'Open Issues',
      value: overview.reduce((acc, curr) => acc + curr.open_issues_count, 0),
    },
    {
      title: 'Oldest commit',
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
              <div className="flex flex-col items-start justify-center">
                <dt
                  key={title}
                  className="mb-2 text-3xl md:text-4xl font-extrabold"
                >
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

      <Table>
        <Table.Head>
          {COLUMNS.map(({ id, title }) => (
            <Table.HeadCell key={id}>{title || id}</Table.HeadCell>
          ))}
        </Table.Head>
        <Table.Body className="divide-y">
          {overview.map((repo) => (
            <Table.Row
              key={repo.id}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              {COLUMNS.map(({ id, Content }) => (
                <Table.Cell key={id}>
                  <Content repo={repo} />
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Layout>
  );
}
