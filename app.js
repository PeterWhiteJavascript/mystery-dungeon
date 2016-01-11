var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//My modules
var Player = require("./server/player.js");
var events = require("./server/events.js");

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('/index.html');
});

var _players = [];
var _users = [];
var id = 0;
io.on('connection', function (socket) {
    id++;
    var userId;
    setTimeout(function () {
        userId = id;
        if(_users.length>0&&_users[_users.length-1].playerId===id){id++;userId++;};
        _users.push({playerId:userId});
        socket.emit('connected', { playerId: userId,events:events.events});
        io.emit('count', { playerCount: io.engine.clientsCount});
        
    }, 1500);

    socket.on('disconnect', function () {
        io.emit('count', { playerCount: io.engine.clientsCount});
        for(i=0;i<_players.length;i++){
            if(_players[i].p.playerId===userId){
                _players.splice(i,1);
            }
        }
        io.emit('disconnected', {players:_players});
    });
    
    socket.on('startGame', function (data) {
        function setPlayer(id,pl){
            //Check if the player is already in the array
            for(j=0;j<_players.length;j++){
                if(_players[j].p.playerId===id){
                    return;
                }
            }
            for(i=0;i<_users.length;i++){
                if(_users[i].playerId===id){
                    _players.push(pl);
                    return;
                }
            }
        }
        var player = new Player(data);
        setPlayer(data['playerId'],player);
        io.emit('startedGame',{player:player,players:_players,events:events.getEvents(player.p.area)});
    });
    
    socket.on('update', function (data) {
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['playerId'];
        })[0];
        if(player){
            var area = data['props']['area']
            player.p.x=data['props']['x'];
            player.p.y=data['props']['y'];
            player.p.dir=data['props']['dir'];
            
            player.p.loc=data['props']['loc'];
            player.p.animation = data['props']['animation'];
            if(area!==player.p.area){
                player.p.area=data['props']['area'];
                socket.emit('recievedEvents',{events:events.getEvents(player.p.area),player:player});
                socket.broadcast.emit('changedArea',{player:player});
            } else {
                player.p.area=data['props']['area'];
                io.emit('updated',{inputted:data['inputs'],playerId:data['playerId'],player:player});
            }
        }
    });
    
    socket.on('triggerEvent',function(data){
        io.emit('triggeredEvent', events.triggerEvent(data));
    });
    
    socket.on("partOfBattle",function(data){
        io.emit("playersInBattle",events.attachPlayerToEvent(data));
    });
    
    socket.on('completeEvent',function(data){
        io.emit('completedEvent',events.completeEvent(data['event']));
    });
});

server.listen(process.env.PORT || 5000);
console.log("Multiplayer app listening on port 5000");
