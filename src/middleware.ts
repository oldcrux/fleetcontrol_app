import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { getSession } from 'next-auth/react';
 
export default NextAuth(authConfig).auth;
 

// export function middleware(request: NextRequest) {
  // const currentUser = getSession();
  // console.log(`this is being called with user: ${currentUser}`);
  // if (currentUser && !request.nextUrl.pathname.startsWith('/dashboard')) {
  //   return Response.redirect(new URL('/dashboard', request.url))
  // }
 
  // if (!currentUser && !request.nextUrl.pathname.startsWith('/login')) {
  //   return Response.redirect(new URL('/login', request.url))
  // }
// }

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};


