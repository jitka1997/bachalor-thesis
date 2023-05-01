import { Fernet } from "fernet-nodejs";

const secret = Fernet.generateKey();

export const createFernet = (username) => {
  return Fernet.encrypt(
    JSON.stringify({
      username,
      audience: "client",
      issuer: "localhost/8000",
      validUntil: Date.now() / 1000 + 300,
    }),
    secret
  );
};

export const verifyFernet = (token) => {
  const message = JSON.parse(Fernet.decrypt(token, secret));
  if (
    message.audience !== "client" ||
    message.issuer !== "localhost/8000" ||
    Date.now() / 1000 > message.validUntil
  )
    throw new Error("Invalid token");
  return message;
};
