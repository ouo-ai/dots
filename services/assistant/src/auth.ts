import { timingSafeEqual } from "node:crypto";

import type { FastifyRequest } from "fastify";

export const USER_HEADER = "x-dots-user-id";

function singleHeader(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function authorizedUserId(headers: FastifyRequest["headers"], token: string): string | null {
  if (!token) return null;

  const authorization = singleHeader(headers.authorization);
  if (!authorization?.startsWith("Bearer ")) return null;
  const supplied = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(token);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  const userId = singleHeader(headers[USER_HEADER])?.trim();
  if (!userId || !/^[A-Za-z0-9][A-Za-z0-9._:@-]{0,199}$/.test(userId)) return null;
  return userId;
}

declare module "fastify" {
  interface FastifyRequest {
    dotsUserId?: string;
  }
}
