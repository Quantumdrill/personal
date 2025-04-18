let express = require('express')
const https = require('https')
let fs = require("fs")

let app = express()

app.use(express.static('static'))
app.use('/shichen', require('./shichen/server_shichen'))
app.set("view engine","ejs")

//-----comment this for local testing--------------------
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/tobylu-qd.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/tobylu-qd.com/fullchain.pem')
};
//-------------------------------------------------------


app.get("/", async (req,res)=>{
  //let result="1"
  let key1s = ["emotions","actions"]
  let kaomojis
  await fetch("https://raw.githubusercontent.com/codingstark-dev/kaomoji/refs/heads/main/kaomoji.json").then(r=>r.json()).then(r=>{kaomojis=r})
  //credit: https://github.com/codingstark-dev/kaomoji
  let key1 = key1s[Math.floor(Math.random()*2)]
  let key2 = Object.keys(kaomojis[key1])[Math.floor(Math.random()*Object.keys(kaomojis[key1]).length)]
  let result = kaomojis[key1][key2][Math.floor(Math.random()*kaomojis[key1][key2].length)]
  res.render("index.ejs",{title:result})
})

//-----use this for online server------------------------
https.createServer(options, app).listen(443, ()=>{
  console.log("http://127.0.0.1:443")
});
//-------------------------------------------------------

//-----use this for local server-------------------------
// app.listen(80, ()=>{
//   console.log("http://127.0.0.1:80")
// })
//-------------------------------------------------------