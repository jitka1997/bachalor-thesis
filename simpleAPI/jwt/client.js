import fetch from 'node-fetch'

const url = 'http://localhost:8000/signin'
const username = 'jitka'
const password = 'hesielko'

const response = await fetch(url, {method:'POST',
        headers: {Authorization: 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
       })

if(response.status !== 201) {
        console.log("error", response.status)
        process.exit(1)
}
const data = await response.json()

console.log(data)
const {token} = data

const response2 = await fetch('http://localhost:8000/welcome', 
    {method:'GET', headers: {Authorization: 'Bearer ' + token}})

console.log((await response2.json()).data)