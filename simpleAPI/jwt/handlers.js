import jwt from 'jsonwebtoken'

const jwtKey = "my_secret_key"
const jwtExpirySeconds = 300

const users = {
	jitka: "hesielko",
}

export const signIn = (req, res) => {
	// Get credentials from authorization header
    const authheader = req.headers.authorization
    const auth = Buffer.from(authheader.split(' ')[1],
        'base64').toString().split(':')
    const username = auth[0]
    const password = auth[1]

    console.log("signing in ", username, "with password",  password)
	if (!username || !password || users[username] !== password) {
		// return 401 error is username or password doesn't exist, or if password does not match the password in our records
		return res.status(401).end()
	}

	// Create a new token with the username in the payload
	// and which expires <jwtExpirySeconds> seconds after issue
	const token = jwt.sign({ username }, jwtKey, {
		algorithm: "HS256",
		expiresIn: jwtExpirySeconds,
	})
	console.log("token:", token)

    const response = {
        nieco: "fun",
        token
    }
	res.status(201).json(response)
}

export const welcome = (req, res) => {
	// We can obtain token from authorization header
	const token = req.headers["authorization"].split(" ")[1];

    console.log("token v get", token)

	// if the token is not present, return an unauthorized error
	if (!token) {
		return res.status(401).end()
	}

	let payload
	try {
		// Parse the JWT string and store the result in `payload`.
		// Note that we are passing the key in this method as well. This method will throw an error
		// if the token is invalid (if it has expired according to the expiry time we set on sign in),
		// or if the signature does not match
		payload = jwt.verify(token, jwtKey)
	} catch (e) {
		if (e instanceof jwt.JsonWebTokenError) {
			// if the error thrown is because the JWT is unauthorized, return a 401 error
            console.log("token expired")
			return res.status(401).end()
		}
		// otherwise, return a bad request error
		return res.status(400).end()
	}

	// Finally, return the welcome message to the user, along with their
	// username given in the token
	res.send({data: `Welcome ${payload.username}!`}).end()
}