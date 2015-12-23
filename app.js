var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('/index.html');
});

var id = 0;
io.on('connection', function (socket) {
    id++;
    var userId;
    setTimeout(function () {
        socket.emit('connected', { playerId: id});
        io.emit('count', { playerCount: io.engine.clientsCount});
        userId = id;
    }, 1500);

    socket.on('disconnect', function () {
        io.emit('count', { playerCount: io.engine.clientsCount});
        io.emit('disconnected', { playerId: userId});
    });

    socket.on('update', function (data) {
        socket.broadcast.emit('updated', data);
    });

    socket.on('changeArea',function(data){
        socket.broadcast.emit('changedArea', data);
    });
  
});

server.listen(process.env.PORT || 5000);
console.log("Multiplayer app listening on port 5000");
