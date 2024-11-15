'use server';
import { signIn, signOut } from '@/auth';
import { logInfo } from './logger';

interface AuthParams {
  userId: string;
  password: string;
}

export async function authenticate({ userId, password }: AuthParams) {
  try {
    if (typeof userId !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid userId or password');
    }
    logInfo(`Authenticating user ${userId}`);
    const result = await signIn('credentials', {
      userId,
      password,
      redirect: false,
    });

    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function signOutAction() {
  await signOut();
}