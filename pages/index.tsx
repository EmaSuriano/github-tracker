import { Alert } from 'flowbite-react';
import Layout from '../components/layout';

export default function IndexPage() {
  return (
    <Layout>
      <h1>NextAuth.js Example</h1>
      <Alert color="info">Alert!</Alert>
      <p>
        This is an example site to demonstrate how to use{' '}
        <a href="https://next-auth.js.org">NextAuth.js</a> for authentication.
      </p>
    </Layout>
  );
}
