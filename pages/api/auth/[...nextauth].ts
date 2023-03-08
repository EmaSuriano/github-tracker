import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import GithubProvider from 'next-auth/providers/github';

declare module 'next-auth' {
  export interface Session extends DefaultSession {
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  export interface JWT extends DefaultJWT {
    accessToken: string;
  }
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

export default NextAuth(authOptions);
