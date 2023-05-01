import { V3 } from "paseto";

const secret = await V3.generateKey("local");

export const createPASETO = async (username) => {
  return await V3.encrypt({ username }, secret, {
    audience: "client",
    issuer: "localhost/8000",
    expiresIn: "5 m",
  });
};

export const verifyPASETO = async (token) => {
  return await V3.decrypt(token, secret, {
    audience: "client",
    issuer: "localhost/8000",
    clockTolerance: "1 min",
  });
};
