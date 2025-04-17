let express = require('express');

let app = express();

app.use(express.static('static'));
app.use('/shichen', require('./shichen/server_shichen'));

app.get("/", (req,res)=>{
  res.redirect("/shichen")
})

app.listen(80, function () {
  console.log("http://127.0.0.1:80")
});