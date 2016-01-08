var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('/index.html');
});

var id = 0;

//Holds all events
//events:{
//  stageName:{
//      completed:bool,
//      eventId:String
//  }
//}
var events = {};
//The event class
function eventObj(data){
    this.complete = false;
    this.eventId = data['event']['eventId'];
    this.stageName = data['stageName'];
};
function addEvent(event){
    if(!events[event.stageName]){
        events[event.stageName]={};
    }
    if(!events[event.stageName][event.eventId]){
        events[event.stageName][event.eventId]={complete:false};
    }
}
function completeEvent(event){
    events[event.stageName][event.eventId].complete=true;
}
io.on('connection', function (socket) {
    id++;
    var userId;
    setTimeout(function () {
        userId = id;
        socket.emit('connected', { playerId: userId});
        io.emit('count', { playerCount: io.engine.clientsCount});
       
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
    
    socket.on('triggerEvent',function(data){
        var ev = new eventObj(data);
        addEvent(ev);
        io.emit('triggeredEvent', ev);
    });
    
    socket.on('completeEvent',function(data){
        completeEvent(data.event);
        io.emit('completedEvent',data.event);
    });
    
    
});

server.listen(process.env.PORT || 5000);
console.log("Multiplayer app listening on port 5000");
