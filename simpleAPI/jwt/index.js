import express from "express"
import { signIn, welcome } from "./handlers.js"

const app = express()

app.post("/signin", signIn)
app.get("/welcome", welcome)

app.listen(8000)
