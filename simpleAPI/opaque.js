import crypto from "crypto";

export const createOpaque = () => {
  return crypto.randomBytes(32).toString("hex");
};
