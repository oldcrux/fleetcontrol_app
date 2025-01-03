
import NextAuth, { User } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { z } from 'zod';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;
const maxage =  Number(process.env.AUTH_MAX_AGE) || 14400;
const updateAge = Number(process.env.AUTH_UPDATE_AGE) || 36000;

async function getUser(userId: string) {
  try {
    // console.log(`fetching User with Id:`, userId);
    const response = await axios.get(`${nodeServerUrl}/node/api/user/search/active?userId=${userId}`);
    const user = response.data;
    if(user.isActive==false){
      throw new Error('User is not active.');
    }
    // console.log(`User Fetched.`, user);
    return user;
  } catch (error) {
     console.log('Failed to fetch user.', error);
    throw error;
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
    jwt({ token, user, account }) {
      // console.log(`auth.ts: user object:`, user);
      if (user) { // User is available during sign-in
        token.id = user.userId;
        token.userId = user.userId;
        token.primaryOrgId = user.primaryOrgId;
        token.secondaryOrgId = user.secondaryOrgId;
        token.role = user.role;
        token.user = user;
      }
      if(account){
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // console.log(`auth.ts: Session callback called`, session, token);
      session.token = token;
      if(session.token.idToken){  // idToken is fetched from google. Now load the user details
        // console.log(`auth.ts sesssion: is this being called *****`);
        const user = await getUser(session.user.email);
        
        const newIdToken = createIdToken(user, session.token.idToken);
        session.token.idToken = newIdToken;

        session.user.id = user.id as string;
        session.user.userId = user.userId as string;
        session.user.role = user.role as string;
        session.user.primaryOrgId= user.primaryOrgId as string;
        session.user.secondaryOrgId= user.secondaryOrgId as string;
        session.user.orgLatitude=user.latitude;
        session.user.orgLongitude=user.longitude;
        // console.log(`auth.ts sesssion: is this being called session here *****`, user);
      }
      else{ // DB based login
        session.user.id = token.id as string;
        session.user.userId = token.userId as string;
        session.user.role = token.role as string;
        session.user.primaryOrgId= token.primaryOrgId as string;
        session.user.secondaryOrgId= token.secondaryOrgId as string;

        // console.log(`printing session user:`,session.user);
        const idToken = createIdToken(session.user)
        session.token.idToken=idToken;
      }
      // console.log(`auth.ts: User fetched`, session.user);
     
      // session.user.orgLatitude = token.user.orgLatitude as string;
      // session.user.orgLongitude = token.user.orgLongitude as string;
      // session.user=token.user as User;
      // session.expires = token.exp;
      // console.log(`auth.ts: session object:`, session);
      return session;
    },
   },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
          // console.log(`auth.ts: making db call to check user ${userId}`);
          user = await getUser(userId);
          if (!user)
            return null;
          // if (!user.isActive) {
          //   return null;
          // }
          const dbPassword = user.password;
        
          const passwordsMatch = await bcrypt.compare(password, dbPassword);
          if (passwordsMatch){
            return user;
          }
        }
        // logError('auth.ts: Invalid credentials');
        return null;
      },
    })],
});


 function createIdToken(user: User, existingIdToken?: any){
    const payload = {
      id: user.id,
      email: user.email,
      user: user,
      iss: "db",
      typ: 'Bearer',
    };
    const idToken = jwt.sign(payload, process.env.AUTH_SECRET? process.env.AUTH_SECRET : '', {
      expiresIn: maxage,
    });
    return idToken;
}