var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//My modules
var Player = require("./server/player.js");
var levelData = require("./server/level_data.js");

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
        socket.join('lobby');
        userId = id;
        if(_users.length>0&&_users[_users.length-1].playerId===id){id++;userId++;};
        _users.push({playerId:userId});
        socket.emit('connected', { playerId: userId});
        io.emit('count', { playerCount: io.engine.clientsCount});
        
    }, 1500);

    socket.on('disconnect', function () {
        io.emit('count', { playerCount: io.engine.clientsCount});
        for(i=0;i<_players.length;i++){
            if(_players[i].p.playerId===userId){
                _players.splice(i,1);
            }
        }
        io.emit('disconnected', {players:_players,id:userId});
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
        player.p.socketId=socket.id;
        setPlayer(data['playerId'],player);
        socket.leave('lobby');
        socket.join(player.p.file+player.p.area);
        io.sockets.in(player.p.file+player.p.area).emit('startedGame',{player:player,players:_players,levelData:levelData.getLevelData(player.p.area)});
    });
    
    socket.on('updateItems',function(data){
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['playerId'];
        })[0];
        if(player){
            player.p.items=data['items'];
        }
        io.sockets.in(player.p.file+player.p.area).emit('updatePlayerItems',{items:player.p.items,playerId:data['playerId']});
    });
    
    socket.on('updateStats',function(data){
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['playerId'];
        })[0];
        if(player){
            //Takes an object in the form of:
            // stats:{
            //    curHp:40,
            //    ofn:12
            // }
            var stats = Object.keys(data['stats']);
            for(i=0;i<stats.length;i++){
                player.p[stats[i]]=data['stats'][stats[i]];
            }
        }
        io.sockets.in(player.p.file+player.p.area).emit('updatedStats',{playerId:data['playerId'],player:player});
    });
    
    socket.on('update', function (data) {
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['playerId'];
        })[0];
        if(player){
            var area = data['props']['area'];
            player.p.x=data['props']['x'];
            player.p.y=data['props']['y'];
            player.p.dir=data['props']['dir'];
            player.p.loc=data['props']['loc'];
            player.p.animation = data['props']['animation'];
            if(area!==player.p.area){
                socket.leave(player.p.file+player.p.area);
                socket.broadcast.to(player.p.file+player.p.area).emit('leftArea',{playerId:player.p.playerId,player:player});
                player.p.area=data['props']['area'];
                socket.emit('recievedLevelData',{levelData:levelData.getLevelData(player.p.area),player:player,players:_players});
                socket.broadcast.to(player.p.file+player.p.area).emit('changedArea',{player:player});
            } else {
                player.p.area=data['props']['area'];
                io.sockets.in(player.p.file+player.p.area).emit('updated',{inputted:data['inputs'],playerId:data['playerId'],player:player});
            }
        }
    });
    
    socket.on('joinRoom',function(data){
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['playerId'];
        })[0];
        if(data['battle']){
            socket.join(player.p.file+player.p.area+"battleWait");
        } else {
            socket.join(player.p.file+player.p.area);
        }
    });
    
    socket.on("pickUpItem",function(data){
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['playerId'];
        })[0];
        levelData.pickUpItem(player.p.area,data['pickupId']);
        io.sockets.in(player.p.file+player.p.area).emit('pickedUpItem',{pickupId:data['pickupId']});
    });
    
    socket.on("getTextNum",function(data){
        socket.emit("gotTextNum",{textNum:levelData.getTextNum(data),npcId:data['npcId']})
    });
    socket.on("setTextNum",function(data){
        levelData.setTextNum(data)
    });
    
    socket.on("startTurn",function(data){
        var evs = levelData.updateEvents(data);
        if(data['host']||typeof data['turnOrder'][0] === "string"){
            var player = _players.filter(function(obj){
                 return obj.p.playerId==data['host'];
             })[0];
            io.sockets.in(player.p.file+player.p.area).emit('startTurn',{turnOrder:data['turnOrder'],events:evs,host:data['host'],stageName:data['stageName']});
        } else {
            var player = _players.filter(function(obj){
                 return obj.p.playerId==data['turnOrder'][0];
            })[0];
            io.sockets.in(player.p.file+player.p.area).emit('startTurn',{turnOrder:data['turnOrder'],events:evs,stageName:data['stageName']});
        }
    });
    
    socket.on('triggerEvent',function(data){
        var ev = levelData.triggerEvent(data);
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        socket.broadcast.to(player.p.file+player.p.area).emit('triggeredEvent', {stageName:data['stageName'],event:ev,host:data['host']});
    });
    socket.on("updateEvent",function(data){
        levelData.updateEvent(data);
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        io.sockets.in(player.p.file+player.p.area).emit('updatedEvent', {stageName:data['stageName'],eventId:data['eventId']});
    });
    
    socket.on("partOfBattle",function(data){
        //The host will do all enemy calculations
        var host = data['host'];
        //Returns the 'p' of event
        var event = levelData.updateEvent(data);
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        io.sockets.in(player.p.file+player.p.area).emit("playersInBattle",{stageName:data['stageName'],turnOrder:event.p.turnOrder,host:host});
    });
    
    //For when a player comes into the battle after it has started
    socket.on("joinBattle",function(data){
        for(i=0;i<data['players'].length;i++){
            var pl = data['players'][i];
            var player = _players.filter(function(obj){
                return obj.p.playerId==pl.p.playerId;
            })[0];
            io.sockets.in(player.p.file+player.p.area+"battleWait").emit("joinedBattle",{host:data['battleHost'],player:player,stageName:data['stageName'],levelData:levelData.getLevelData(player.p.area),playerId:player.p.playerId});
            io.sockets.in(player.p.file+player.p.area).emit("joinedBattle",{host:data['battleHost'],player:player,stageName:data['stageName'],playerId:player.p.playerId});
        }
    });
    
    socket.on("battleMove",function(data){
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        io.sockets.in(player.p.file+player.p.area).emit('battleMoved',data);
    });
    socket.on('attack',function(data){
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        socket.broadcast.to(player.p.file+player.p.area).emit('attacked',data);
    });
    socket.on('eventComplete',function(data){
        var player = _players.filter(function(obj){
            return obj.p.playerId==data['playerId'];
        })[0];
        io.sockets.in(player.p.file+player.p.area).emit('completedEvent',{event:levelData.completeEvent(data['eventId'],data['stageName'])});
    });
});

server.listen(process.env.PORT || 5000);
console.log("Multiplayer app listening on port 5000");
