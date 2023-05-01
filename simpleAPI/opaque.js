import crypto from "crypto";

const key = crypto.randomBytes(32);

export const createOpaque = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const signature = crypto.Hmac("sha256", key).update(token).digest("hex");
  return `${token}.${signature}`;
};

export const verifyOpaque = (token) => {
  const [t, s] = token.split(".");
  const signature = crypto.Hmac("sha256", key).update(t).digest("hex");
  if (s !== signature) throw new Error("Invalid token");
  return t;
};
