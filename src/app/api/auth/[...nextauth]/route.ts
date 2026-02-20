import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

declare module 'next-auth' {
  interface Session {
    access_token?: string;
    user?: any;
    error?: string;
  }
}

const BACKEND_ACCESS_TOKEN_LIFETIME = 55 * 60; // 55 minutes, slightly less than backend 60m
const BACKEND_REFRESH_TOKEN_LIFETIME = 6 * 24 * 60 * 60; // 6 days

const getCurrentEpochTime = () => {
  return Math.floor(new Date().getTime() / 1000);
};

const SIGN_IN_HANDLERS: Record<string, (user: any, account: any) => Promise<boolean>> = {
  credentials: async () => true,
  google: async (user, account) => {
    try {
      // Prefer access_token over id_token for allauth compatibility
      const token = (account && (account.access_token || account.id_token)) as string | undefined;
      if (!token) {
        console.error('Google sign-in: no token found in account', { account });
        return false;
      }
      const tokenType = account?.access_token ? 'access_token' : 'id_token';
      const baseUrl = process.env.DJANGO_BACKEND_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
      const googleUrl = `${baseUrl}/google/`;

      console.log('Google sign-in: sending token to backend', {
        url: googleUrl,
        tokenType,
        tokenLength: token.length,
      });
      const response = await axios.post(googleUrl, { access_token: token });
      console.log('Google sign-in: backend response', { status: response.status, data: response.data });
      account.meta = response.data;
      return true;
    } catch (error: any) {
      console.error('Google sign-in error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      return false;
    }
  },
};

const SIGN_IN_PROVIDERS = Object.keys(SIGN_IN_HANDLERS);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: BACKEND_REFRESH_TOKEN_LIFETIME,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const baseUrl = process.env.DJANGO_BACKEND_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
          const loginUrl = `${baseUrl}/auth/login/`;

          console.log('Credentials login: sending to', { url: loginUrl });
          const response = await axios({
            method: 'post',
            url: loginUrl,
            data: {
              email: credentials?.username,
              password: credentials?.password,
            },
          });
          const data = response.data;
          console.log('Credentials login: backend response', { status: response.status, data });
          if (data) return data;
        } catch (error: any) {
          console.error('Credentials login error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (!account || !SIGN_IN_PROVIDERS.includes(account.provider)) {
        console.error('signIn: unsupported account or missing account', { account });
        return '/login?error=unsupported_provider';
      }

      try {
        const ok = await SIGN_IN_HANDLERS[account.provider](null, account);
        if (ok) return true;
        console.error('signIn: provider handler returned false', { provider: account.provider, account });
        return '/login?error=provider_signin_failed';
      } catch (err) {
        console.error('signIn: handler threw', { provider: account.provider, err });
        return '/login?error=provider_exception';
      }
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        let backendResponse = account.provider === 'credentials' ? user : account.meta;
        const response = backendResponse as any;
        console.log('JWT Callback: processing backend response', { provider: account.provider, keys: Object.keys(response) });

        token.user = response.user;
        // Handle different token field names from backend
        token.access_token = response.access || response.access_token || response.token;
        token.refresh_token = response.refresh || response.refresh_token;

        token.ref = getCurrentEpochTime() + BACKEND_ACCESS_TOKEN_LIFETIME;
        return token;
      }

      // Refresh token if expired
      if (getCurrentEpochTime() > (token.ref as number)) {
        try {
          const baseUrl = process.env.DJANGO_BACKEND_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
          const refreshUrl = `${baseUrl}/auth/token/refresh/`;

          console.log('Token refresh: sending to', { url: refreshUrl });
          const response = await axios({
            method: 'post',
            url: refreshUrl,
            data: { refresh: token.refresh_token },
          });
          token.access_token = response.data.access || response.data.access_token || response.data.token;
          token.refresh_token = response.data.refresh || response.data.refresh_token || token.refresh_token;
          token.ref = getCurrentEpochTime() + BACKEND_ACCESS_TOKEN_LIFETIME;
          console.log('Token refresh: success');
          return token;
        } catch (error: any) {
          console.error('Error refreshing access token:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.error) {
        session.error = token.error as string;
      } else if (token) {
        session.user = token.user as any;
        session.access_token = token.access_token as string;
        // Optionally pass refresh_token if needed by the frontend
        // session.refresh_token = token.refresh_token as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
