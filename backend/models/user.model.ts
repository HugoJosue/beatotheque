
export interface UserPublic {
  id: string;
  email: string;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}