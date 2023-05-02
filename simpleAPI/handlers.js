import * as fs from "fs";
import { Database } from "sqlite-async";

import { createJWT, verifyJWT } from "./jwt.js";
import { createPASETO, verifyPASETO } from "./paseto.js";
import { createFernet, verifyFernet } from "./fernet.js";
import { createBranca, verifyBranca } from "./branca.js";
import { createOpaque, verifyOpaque } from "./opaque.js";

import pkg from "./macaroons.cjs";
const { createMacaroon, verifyMacaroon } = pkg;

const users = JSON.parse(fs.readFileSync("./usersDB", "utf8"));

console.log("Users DB loaded successfully from file usersDB");
console.log(Object.keys(users).length, "users loaded");
// const USING_TOKEN = "JWT";
// const USING_TOKEN = "PASETO";
// const USING_TOKEN = "Fernet";
const USING_TOKEN = "Branca";
// const USING_TOKEN = "Macaroon";
// const USING_TOKEN = "Opaque";

let db;
if (USING_TOKEN === "Opaque") {
  db = await Database.open("tokens.db");
  await db.run(
    "CREATE TABLE tokens (token TEXT, username TEXT, audience TEXT, issuer TEXT, time NUMBER)",
    [],
    (err) => {
      console.log(err);
    }
  );
}

export const signIn = async (req, res) => {
  // Get credentials from authorization header
  const authheader = req.headers.authorization;
  const auth = Buffer.from(authheader.split(" ")[1], "base64")
    .toString()
    .split(":");
  const username = auth[0];
  const password = auth[1];

  if (!username || !password || users[username] !== password) {
    // return 401 error is username or password doesn't exist, or if password does not match the password in our records
    return res.status(401).end();
  }
  console.log("Signed in ", username, "with password", password);

  // Create a new token with the username in the payload
  const token = await createToken(username);
  const response = {
    text: "Successfully signed in.",
    usingToken: USING_TOKEN,
    token,
  };
  res.status(200).json(response);
};

export const welcome = async (req, res) => {
  // We can obtain token from authorization header
  const token = req.headers["authorization"].split(" ")[1];

  // if the token is not present, return an unauthorized error
  if (!token) {
    return res.status(401).end();
  }

  let payload;
  try {
    payload = await verifyToken(token);
  } catch (e) {
    return res.status(401).end();
  }

  // Finally, return the welcome message to the user, along with their
  // username given in the token
  res.send({ data: `Welcome ${payload.username}!` }).end();
};

const createToken = async (username) => {
  let token;
  switch (USING_TOKEN) {
    case "JWT":
      token = createJWT(username);
      break;
    case "PASETO":
      token = createPASETO(username);
      break;
    case "Fernet":
      token = createFernet(username);
      break;
    case "Branca":
      token = createBranca(username);
      break;
    case "Macaroon":
      token = createMacaroon(username);
      break;
    case "Opaque":
      token = createOpaque();
      await db.run(`INSERT INTO tokens VALUES(?, ?, ?, ?, ?)`, [
        token,
        username,
        "client",
        "localhost/8000",
        Date.now() / 1000 + 300,
      ]);
      break;
  }
  return token;
};

const verifyToken = async (token) => {
  let payload;
  switch (USING_TOKEN) {
    case "JWT":
      payload = verifyJWT(token);
      break;
    case "PASETO":
      payload = verifyPASETO(token);
      break;
    case "Fernet":
      payload = verifyFernet(token);
      break;
    case "Branca":
      payload = verifyBranca(token);
      break;
    case "Macaroon":
      payload = verifyMacaroon(token);
      break;
    case "Opaque":
      verifyOpaque(token);

      const sql = `SELECT username, audience, issuer, time, token
           FROM tokens
           WHERE token = ?`;
      payload = await db.get(sql, [token]);

      if (
        Date.now() / 1000 > payload.time ||
        payload.issuer !== "localhost/8000" ||
        payload.audience !== "client"
      ) {
        throw new Error("Invalid token");
      }
      break;
  }
  return payload;
};
