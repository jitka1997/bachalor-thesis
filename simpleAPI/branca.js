import branca from "branca";
import crypto from "crypto";

const key = crypto.randomBytes(32);

const B = branca(key);

export const createBranca = (username) => {
  return B.encode(
    JSON.stringify({
      username,
      audience: "client",
      issuer: "localhost/8000",
    })
  );
};
const TTL = 300;
export const verifyBranca = (token) => {
  const message = JSON.parse(B.decode(token, TTL));
  if (message.audience !== "client" || message.issuer !== "localhost/8000")
    throw new Error("Invalid token");
  return message;
};
