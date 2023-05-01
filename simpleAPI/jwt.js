import * as jose from "jose";
import crypto from "crypto";

const secret = crypto.randomBytes(32);

export const createJWT = async (username) => {
  return await new jose.EncryptJWT({ username: username })
    .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
    .setIssuedAt()
    .setIssuer("localhost/8000")
    .setAudience("client")
    .setExpirationTime("5m")
    .encrypt(secret);
};

export const verifyJWT = async (token) => {
  return (
    await jose.jwtDecrypt(token, secret, {
      issuer: "localhost/8000",
      audience: "client",
    })
  ).payload;
};
