import type { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';

import Layout from '../components/layout';

import { getRepositoryInfo } from './api/examples/repo';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSession(ctx);
  const repo = await getRepositoryInfo(
    { auth: session!.accessToken },
    { owner: 'EmaSuriano', repo: 'gatsby-starter-mate' },
  );

  return { props: { repo } };
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>['props'];

export default function RepoPage({ repo }: Props) {
  return (
    <Layout>
      <h1>SSR</h1>
      <div className="data-previewer">
        <pre>{JSON.stringify(repo, null, 2)}</pre>
      </div>

      <h1>Client</h1>
      <iframe src="/api/examples/repo?owner=EmaSuriano&repo=gatsby-starter-mate" />
    </Layout>
  );
}
