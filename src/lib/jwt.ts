import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "appcenter_session";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

function getSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET || "app-center-pwa-super-secret-jwt-key-2026-fioreapps";
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      typeof payload.isAdmin === "boolean"
    ) {
      return {
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        isAdmin: payload.isAdmin,
      };
    }
    return null;
  } catch {
    return null;
  }
}

