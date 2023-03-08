import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/layout';
import AccessDenied from '../components/access-denied';
import { useQuery } from 'react-query';
import axios from 'axios';
import { notReachable } from '../helpers/notReachable';

export default function ProtectedPage() {
  const session = useSession();
  const query = useQuery('gist', () => axios.get('/api/examples/gist'), {
    enabled: session.status === 'authenticated',
  });

  switch (query.status) {
    case 'idle':
      return (
        <Layout>
          <AccessDenied />
        </Layout>
      );

    case 'error':
      return (
        <Layout>
          <h1>Ouups!</h1>
          <h2>Something happened ...</h2>

          <code>
            <pre>{JSON.stringify(query.error, null, 2)}</pre>
          </code>
        </Layout>
      );

    case 'loading':
      return (
        <Layout>
          <h1>Loading your results ...</h1>
        </Layout>
      );

    case 'success':
      return (
        <Layout>
          <h1>Protected Page</h1>
          <code>
            <pre>{JSON.stringify(query.data.data, null, 2)}</pre>
          </code>
        </Layout>
      );

    /* istanbul ignore next */
    default:
      return notReachable(query)
  }
}
