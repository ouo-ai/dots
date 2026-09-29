import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const COOKIE_NAME = "dots_session"
const COOKIE_AGE_SECONDS = 60 * 60 * 24 * 365

type BackendResult = {
  status: number
  body: Record<string, unknown>
  newCookie: string | null
}

function sessionSecret(): string | null {
  const secret = process.env.DOTS_SESSION_SECRET
  return secret && secret.length >= 32 ? secret : null
}

function sign(id: string, secret: string): string {
  return createHmac("sha256", secret).update("v1." + id).digest("base64url")
}

function readSession(raw: string | undefined, secret: string): string | null {
  if (!raw || raw.length > 150) return null
  const match = /^v1\.([0-9a-f-]{36})\.([A-Za-z0-9_-]{43})$/.exec(raw)
  if (!match) return null
  const [, id, signature] = match
  const expected = Buffer.from(sign(id, secret))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
  return id
}

function errorResponse(status: number, code: string, message: string): BackendResult {
  return { status, body: { code, message }, newCookie: null }
}

export async function callDotsBackend(path: string, method = "GET", body?: unknown): Promise<BackendResult> {
  const base = process.env.DOTS_BACKEND_URL
  const token = process.env.DOTS_INTERNAL_API_TOKEN
  const secret = sessionSecret()
  if (!base || !token || !secret) {
    return errorResponse(503, "NOT_CONFIGURED", "Dots is temporarily unavailable. Please try again later.")
  }

  const jar = await cookies()
  let id = readSession(jar.get(COOKIE_NAME)?.value, secret)
  let newCookie: string | null = null
  if (!id) {
    id = randomUUID()
    newCookie = "v1." + id + "." + sign(id, secret)
  }

  let upstream: Response
  try {
    upstream = await fetch(new URL(path, base), {
      method,
      headers: {
        Authorization: "Bearer " + token,
        "x-dots-user-id": id,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    return errorResponse(502, "NETWORK_ERROR", "Dots could not reach its assistant service. Please retry shortly.")
  }

  const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>
  if (!upstream.ok) {
    const code = upstream.status === 404 ? "NOT_FOUND" : upstream.status === 429 ? "RATE_LIMIT" : "SERVER_ERROR"
    const message = typeof data.error === "string" ? data.error : "Dots could not complete this request."
    return { status: upstream.status, body: { code, message }, newCookie }
  }
  return { status: upstream.status, body: data, newCookie }
}

export function dotsResponse(result: BackendResult, body: unknown = result.body): NextResponse {
  const response = result.status === 204
    ? new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } })
    : NextResponse.json(body, { status: result.status, headers: { "Cache-Control": "no-store" } })
  if (result.newCookie) {
    response.cookies.set(COOKIE_NAME, result.newCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_AGE_SECONDS,
    })
  }
  return response
}

export function forgetDotsSession(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
