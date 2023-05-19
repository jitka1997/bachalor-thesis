import fetch from "node-fetch";

const singinUrl = "http://localhost:8000/signin";
const requestUrl = "http://localhost:8000/welcome";
const username = "jitka";
const password = "hesielko";
const requestsInGroup = 100; // for better accuracy we measure time of 100 iterations
const requestsRepetitions = 1000; // we repeat the whole process 1000 times

const id = process.argv[2];

const signinTimes = [];
let response;
const signinInit = {
  method: "POST",
  headers: {
    Authorization:
      "Basic " + Buffer.from(username + ":" + password).toString("base64"),
  },
};
let data;
for (let i = 0; i < requestsRepetitions; i++) {
  const start = performance.now();
  for (let j = 0; j < requestsInGroup; j++) {
    response = await fetch(singinUrl, signinInit);
    if (response.status !== 200) {
      console.log("error signin", response.status);
      process.exit(1);
    }
    data = await response.json();
  }
  const end = performance.now();
  signinTimes.push(end - start);
}

const { token, usingToken } = data;

const responseTimes = [];
const welcomeInit = {
  method: "GET",
  headers: { Authorization: "Bearer " + token },
};
for (let i = 0; i < requestsRepetitions; i++) {
  const start = performance.now();
  for (let j = 0; j < requestsInGroup; j++) {
    const response2 = await fetch(requestUrl, welcomeInit);
    if (response2.status !== 200) {
      console.log("error request", response2.status);
      process.exit(1);
    }
    const data = await response2.json();
  }
  const end = performance.now();
  responseTimes.push(end - start);
}

signinTimes.forEach((x) => console.log("Signin:", usingToken, id, x));
responseTimes.forEach((x) => console.log("Request:", usingToken, id, x));
