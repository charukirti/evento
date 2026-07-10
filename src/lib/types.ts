export type RefreshTokenPayload = {
  sub: string; // userId
  jti: string;
};

export type AccessTokenPayload = {
  sub: string;
  role: string;
  permissions: string[];
  jti: string;
};