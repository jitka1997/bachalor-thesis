import { Database } from "sqlite-async";
import { createOpaque } from "./opaque.js";

const db = await Database.open("tokens.db");

await db.run(
  "CREATE TABLE tokens (token TEXT, username TEXT, audience TEXT, issuer TEXT, time NUMBER)",
  [],
  (err) => {
    console.log(err);
  }
);

for (let i = 0; i < 10000; i++) {
  const token = createOpaque();
  await db.run(`INSERT INTO tokens VALUES(?, ?, ?, ?, ?)`, [
    token,
    "user" + i,
    "client",
    "localhost/8000",
    Date.now() / 1000 + 300,
  ]);
}

let sql = `SELECT username, audience, issuer, time, token
           FROM tokens
           WHERE username = ?`;
let username = "user1";

const rows = await db.get(sql, [username]);
console.log(rows);

db.close();
