
import bcrypt from 'bcryptjs';
import { prisma } from '@/backend/prisma/client';
import { signToken } from '@/backend/lib/jwt';
import { registerSchema, loginSchema } from '@/backend/lib/validations';
import type { UserPublic } from '@/backend/models/user.model';

export async function registerUser(body: unknown): Promise<{
  user: UserPublic;
  token: string;
}> {
  const data = registerSchema.parse(body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw Object.assign(new Error('Cet email est déjà utilisé'), { statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: { email: data.email, passwordHash },
    select: { id: true, email: true, createdAt: true },
  });

  const token = await signToken({ sub: user.id, email: user.email });

  return { user, token };
}

export async function loginUser(body: unknown): Promise<{
  user: UserPublic;
  token: string;
}> {
  const data = loginSchema.parse(body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });

  const INVALID_MSG = 'Email ou mot de passe incorrect';

  if (!user) throw Object.assign(new Error(INVALID_MSG), { statusCode: 401 });

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw Object.assign(new Error(INVALID_MSG), { statusCode: 401 });

  const token = await signToken({ sub: user.id, email: user.email });

  return {
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    token,
  };
}

export async function getMe(userId: string): Promise<UserPublic> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true },
  });
  return user;
}