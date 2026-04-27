import * as jose from "jose";
import * as cookie from "cookie";
import bcrypt from "bcrypt";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { env } from "./lib/env";
import { getSessionCookieOptions } from "./lib/cookies";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { findUserByEmail, findUserById, createUser } from "./queries/users";

// ── JWT helpers ──────────────────────────────────────────────────

function getSecret() {
  return new TextEncoder().encode(env.jwtSecret || "dev-secret-do-not-use-in-prod");
}

export async function signSessionToken(payload: { userId: number }): Promise<string> {
  return new jose.SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret());
    return { userId: payload.userId as number };
  } catch {
    return null;
  }
}

// ── Request authenticator (used by tRPC context) ─────────────────

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("No session cookie found.");
  }

  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid or expired session token.");
  }

  const user = await findUserById(claim.userId);
  if (!user) {
    throw Errors.forbidden("User not found. Please log in again.");
  }

  return user;
}

// ── Register ─────────────────────────────────────────────────────

export function createRegisterHandler() {
  return async (c: Context) => {
    let body: { email?: string; password?: string; name?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: "email and password are required" }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "invalid email address" }, 400);
    }
    if (password.length < 8) {
      return c.json({ error: "password must be at least 8 characters" }, 400);
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return c.json({ error: "an account with this email already exists" }, 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role: "admin" | "user" =
      env.ownerEmail && email === env.ownerEmail ? "admin" : "user";
    const displayName = name?.trim() || email.split("@")[0];

    const user = await createUser({
      unionId: email,
      email,
      name: displayName,
      passwordHash,
      role,
      lastSignInAt: new Date(),
    });

    const token = await signSessionToken({ userId: user.id });
    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, Session.cookieName, token, {
      ...cookieOpts,
      maxAge: Session.maxAgeMs / 1000,
    });

    return c.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, 201);
  };
}

// ── Login ────────────────────────────────────────────────────────

export function createLoginHandler() {
  return async (c: Context) => {
    let body: { email?: string; password?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "email and password are required" }, 400);
    }

    const user = await findUserByEmail(email);
    if (!user || !user.passwordHash) {
      // same message for both "not found" and "wrong password" to avoid enumeration
      return c.json({ error: "invalid email or password" }, 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return c.json({ error: "invalid email or password" }, 401);
    }

    const token = await signSessionToken({ userId: user.id });
    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, Session.cookieName, token, {
      ...cookieOpts,
      maxAge: Session.maxAgeMs / 1000,
    });

    return c.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  };
}

// ── Logout ───────────────────────────────────────────────────────

export function createLogoutHandler() {
  return async (c: Context) => {
    setCookie(c, Session.cookieName, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "Lax",
    });
    return c.json({ ok: true });
  };
}

// ── Get current user (optional convenience route) ────────────────

export function createMeHandler() {
  return async (c: Context) => {
    try {
      const user = await authenticateRequest(c.req.raw.headers);
      return c.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch {
      return c.json({ user: null }, 401);
    }
  };
}