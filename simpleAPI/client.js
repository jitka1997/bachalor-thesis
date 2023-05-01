import fetch from "node-fetch";

const singinUrl = "http://localhost:8000/signin";
const requestUrl = "http://localhost:8000/welcome";
const username = "jitka";
const password = "hesielko";
const requestsMade = 10000;

const signinTimes = [];
let response;
for (let i = 0; i < requestsMade; i++) {
  const start = performance.now();
  response = await fetch(singinUrl, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(username + ":" + password).toString("base64"),
    },
  });
  const end = performance.now();
  signinTimes.push(end - start);
}

if (response.status !== 200) {
  console.log("error", response.status);
  process.exit(1);
}
const data = await response.json();

console.log(data.text, "Retrieved:", data.usingToken, "token");
const { token } = data;

const responseTimes = [];

for (let i = 0; i < requestsMade; i++) {
  const start = performance.now();
  const response2 = await fetch(requestUrl, {
    method: "GET",
    headers: { Authorization: "Bearer " + token },
  });
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  const end = performance.now();
  if (response2.status == 200) responseTimes.push(end - start);
}

const averageResponseTime = (
  responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
).toFixed(3);
const averageSigninTime = (
  signinTimes.reduce((a, b) => a + b, 0) / signinTimes.length
).toFixed(3);
const medianResponseTime = responseTimes
  .sort()
  [Math.floor(responseTimes.length / 2)].toFixed(3);
const medianSigninTime = signinTimes
  .sort()
  [Math.floor(signinTimes.length / 2)].toFixed(3);

console.log(
  `Request time - AVERAGE: ${averageResponseTime} ms MEDIAN: ${medianResponseTime} ms\nSign in time - AVERAGE: ${averageSigninTime} ms MEDIAN: ${medianSigninTime} ms\nSuccessful requests: ${responseTimes.length}/${requestsMade}\n`
);

// console.log((await response2.json()).data)
