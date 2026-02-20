
import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/backend/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, data: { message: 'Déconnecté' } });

  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}