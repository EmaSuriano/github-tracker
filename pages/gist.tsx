import type { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import Layout from '../components/layout';
import { getGistContent } from './api/examples/gist';

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSession(ctx);
  if (!session) {
    return { props: { gist: {} } };
  }

  const gist = await getGistContent({ auth: session.accessToken });
  return { props: { gist } };
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>['props'];

export default function GistPage({ gist }: Props) {
  return (
    <Layout>
      <h1>SSR</h1>
      <div className="data-previewer">
        <pre>{JSON.stringify(gist, null, 2)}</pre>
      </div>

      <h1>Client</h1>
      <iframe src="/api/examples/gist" />
    </Layout>
  );
}
