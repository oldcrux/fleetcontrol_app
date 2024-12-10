import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
// import { logDebug, logError, logInfo } from './app/lib/logger';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;
const maxage =  Number(process.env.AUTH_MAX_AGE) || 14400;
const updateAge = Number(process.env.AUTH_UPDATE_AGE) || 36000;

async function getUser(userId: string) {
  try {
    // console.log(`trying to fetch User.`);
    const response = await axios.get(`${nodeServerUrl}/node/api/user/search?userId=${userId}`);
    const user = response.data;
    // console.log(`User Fetched.`, user);
    return user;
  } catch (error) {
    // logError('auth.ts: getUser: Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

async function  getOrganization(orgId:string) {
  try {
    const response = await axios.get(`${nodeServerUrl}/node/api/organization/search?orgId=${orgId}`);
    const org = response.data;
    // console.log(`org fetched:`, org);
    return org[0];
  } catch (error) {
    // logError('auth.ts: getOrganization: Failed to fetch organization:', error);
    throw new Error('Failed to fetch getOrganization.');
  }
}

export const {handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { 
    strategy: "jwt",
    maxAge: maxage,
    updateAge: updateAge,
   },
   callbacks:{
    jwt({ token, user }) {
      // logInfo(`auth.ts: user object:`, user);
      if (user) { // User is available during sign-in
        token.id = user.userId;
        token.userId = user.userId;
        token.primaryOrgId = user.primaryOrgId;
        token.secondaryOrgId = user.secondaryOrgId;
        token.role = user.role;
        token.user = user;
      }
      // console.log(`auth.ts: token object:`, token);
      return token;
    },
    session({ session, token }) {
      // logInfo(`auth.ts: Session callback called`);
      session.user.id = token.id as string;
      session.user.userId = token.userId as string;
      session.user.role = token.role as string;
      session.user.primaryOrgId= token.primaryOrgId as string;
      session.user.secondaryOrgId= token.secondaryOrgId as string;
      // session.user.orgLatitude = token.user.orgLatitude as string;
      // session.user.orgLongitude = token.user.orgLongitude as string;
      // session.user=token.user as User;
      // session.expires = token.exp;
      // console.log(`auth.ts: session object:`, session);
      return session;
    },
   },
  providers: [
    Credentials({
      async authorize(credentials) {
        let user;
        // console.log(`call came to auth.ts.  Credentials with Cred: ${JSON.stringify(credentials)}`);
        const parsedCredentials = z
          .object({ userId: z.string(), password: z.string().min(5) })
          .safeParse(credentials);

          // logInfo(`auth.ts: call came to auth.ts.`);

        if (parsedCredentials.success) {
          const { userId, password } = parsedCredentials.data;
          // logInfo(`auth.ts: making db call to check user ${userId}`);
          user = await getUser(userId);
          if (!user)
            return null;

          // logDebug(`auth.ts: user fetched:`, user);
          const dbPassword = user.password;
        
          const passwordsMatch = await bcrypt.compare(password, dbPassword);
          if (passwordsMatch){
            // const org = await getOrganization(user.orgId);
            // user.orgLatitude = org.latitude;
            // user.orgLongitude = org.longitude;
            return user;
          }
        }
        // logError('auth.ts: Invalid credentials');
        return null;
      },
    })],
});
