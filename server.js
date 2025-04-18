let express = require('express');
const https = require('https');
let fs = require("fs")

let app = express();

app.use(express.static('static'));
app.use('/shichen', require('./shichen/server_shichen'));

//comment this for local testing
// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/tobylu-qd.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/tobylu-qd.com/fullchain.pem')
// };


app.get("/", (req,res)=>{

})

//use this for online server
// https.createServer(options, app).listen(443, ()=>{
//   console.log("http://127.0.0.1:443")
// });

//use this for local server
app.listen(80, ()=>{
  console.log("http://127.0.0.1:80")
})