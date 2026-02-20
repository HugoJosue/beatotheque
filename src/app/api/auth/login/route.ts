
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { loginUser } from '@/backend/controllers/auth.controller';
import { ok, err, validationError } from '@/backend/lib/api-response';
import { COOKIE_NAME } from '@/backend/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, token } = await loginUser(body);

    const response = ok(user);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (e) {
    if (e instanceof ZodError) {
      return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    }
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}