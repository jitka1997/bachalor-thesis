import fetch from "node-fetch";

const singinUrl = "http://localhost:8000/signin";
const requestUrl = "http://localhost:8000/welcome";
const username = "jitka";
const password = "hesielko";
const requestsInGroup = 10; // pre zvýšenie presnosti meriame čas 100 iteráciách
const requestsRepetitions = 1000; // a celé to meriame 1000x

const id = process.argv[2];

const signinTimes = [];
let response;
const signinInit = {
  // aby sa to nepočítalo stále dokola
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
      console.log("error", response.status);
      process.exit(1);
    }
    data = await response.json(); // zahrnieme aj načítanie odpovede?
  }
  const end = performance.now();
  signinTimes.push(end - start);
  // if (i % 100 == 0) console.log(i);
}

const { token, text, usingToken } = data;
console.log(text, "Retrieved:", usingToken, "token");

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
      console.log("error", response2.status);
      process.exit(1);
    }
    const data = await response2.json(); // zahrnieme aj načítanie odpovede?
  }
  const end = performance.now();
  responseTimes.push(end - start);
  // if (i % 100 == 0) console.log(i);
}

// const averageResponseTime = (
//   responseTimes.reduce((a, b) => a + b, 0) /
//   requestsInGroup /
//   requestsRepetitions
// ).toFixed(6);
// const averageSigninTime = (
//   signinTimes.reduce((a, b) => a + b, 0) /
//   requestsInGroup /
//   requestsRepetitions
// ).toFixed(6);
// const medianResponseTime = (
//   responseTimes.sort()[Math.floor(requestsRepetitions / 2)] / requestsInGroup
// ).toFixed(6);
// const medianSigninTime = (
//   signinTimes.sort()[Math.floor(requestsRepetitions / 2)] / requestsInGroup
// ).toFixed(6);

// console.log(
//   `Request time - AVERAGE: ${averageResponseTime} ms MEDIAN: ${medianResponseTime} ms\n` +
//     `Sign in time - AVERAGE: ${averageSigninTime} ms MEDIAN: ${medianSigninTime} ms\n` +
//     `Successful requests groups: ${responseTimes.length}/${requestsRepetitions}\n`
// );

signinTimes.forEach((x) => console.log("Signin:", usingToken, id, x));
responseTimes.forEach((x) => console.log("Request:", usingToken, id, x));
