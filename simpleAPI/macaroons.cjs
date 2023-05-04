const { newMacaroon, importMacaroon } = require("macaroon");
const crypto = require("crypto");

const rootKey = crypto.randomBytes(32);
const identifier = "we used our secret key";
const location = "localhost/8000";

const createMacaroon = (username) => {
  const params = {
    identifier,
    location,
    rootKey,
  };
  const token = newMacaroon(params);
  token.addFirstPartyCaveat(`username = ${username}`);
  token.addFirstPartyCaveat("audience=client");
  token.addFirstPartyCaveat("issuer=localhost/8000");
  token.addFirstPartyCaveat(`time=${new Date() / 1000 + 300}`);
  return Buffer.from(JSON.stringify(token.exportJSON())).toString("base64");
};

const verifyMacaroon = (token) => {
  const base64Decoded = Buffer.from(token, "base64").toString("utf-8");
  const macaroon = importMacaroon(JSON.parse(base64Decoded));
  const check = (cav) => {
    const [key, value] = cav.split("=");
    if (key === "audience" && value !== "client") {
      throw new Error("invalid audience");
    }
    if (key === "issuer" && value !== "localhost/8000") {
      throw new Error("invalid issuer");
    }
    if (key === "time" && new Date() / 1000 > value) {
      throw new Error("expired token");
    }
    return null;
  };
  try {
    macaroon.verify(rootKey, check);
  } catch (err) {
    throw new Error("Token invalid with error: " + err.message);
  }
  const payloadJSON = {};
  macaroon
    .exportJSON()
    .c.map((cav) => cav.i)
    .forEach((cav) => {
      const [key, value] = cav.split("=");
      payloadJSON[key] = value;
    });
  return payloadJSON;
};

module.exports = {
  createMacaroon,
  verifyMacaroon,
};
