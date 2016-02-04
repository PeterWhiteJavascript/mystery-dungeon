var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//My modules
var Player = require("./server/player.js");
var SaveData = require("./server/save_file.js");
var levelData = require("./server/level_data.js");

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('/index.html');
});
//Stores a list of all user id's that are connected
var _users = [];
//Stores a list of all active leveldata
var _activeFiles = [];
//The variable that gives a unique id to a player when the join
var id = 0;
io.on('connection', function (socket) {
    id++;
    //The current user's id
    var userId,
    //Holds all of the levelData, players, and filename
    saveData;
    
    setTimeout(function () {
        socket.join('lobby');
        userId = id;
        //Make sure to give a unique id
        if(_users.length>0&&_users[_users.length-1].playerId===id){id++;userId++;};
        _users.push({playerId:userId});
        socket.emit('connected', { playerId: userId});
        io.emit('count', { playerCount: io.engine.clientsCount});
    }, 1500);

    socket.on('disconnect', function () {
        
            io.emit('count', { playerCount: io.engine.clientsCount});
        if(saveData){
            for(i=0;i<saveData.players.length;i++){
                if(saveData.players[i].p.playerId===userId){
                    saveData.players.splice(i,1);
                }
            }
            io.emit('disconnected', {players:saveData.players,id:userId});
        }
    });
    
    //User logged in, now get the data from the database if they are the first ones here, else get the data from the server
    socket.on('startGame', function (data) {
        function setPlayer(id,pl){
            //Check if the player is already in the array
            for(j=0;j<saveData.players.length;j++){
                if(saveData.players[j].p.playerId===id){
                    return;
                }
            }
            for(i=0;i<_users.length;i++){
                if(_users[i].playerId===id){
                    saveData.players.push(pl);
                    return;
                }
            }
        }
        //Get the saveData
        var file = data['file'];
        saveData = _activeFiles.filter(function(obj){
            return obj.file===file;
        })[0];
        //If there is no save data, we need to pull it from the database
        //For now, just create a new save file (just like starting a new game)
        if(!saveData){
            saveData = new SaveData(file);
            //Push the saveData into the active files
            _activeFiles.push(saveData);
        }
        
        //Create a new server player
        //the passed 'data' should be gotten from the database here
        //That data will fill the 'p' property in player
        var player = new Player(data);
        //Set the socket id
        player.p.socketId=socket.id;
        //Add the player to the saveData
        setPlayer(data['playerId'],player);
        //Leave the lobby as we are going to the main game now
        socket.leave('lobby');
        //Join the file
        socket.join(saveData.file);
        //Join the file area
        socket.join(saveData.file+player.p.area);
        //Tell all connected clients in this file that I have connected
        io.sockets.in(saveData.file).emit('startedGame',{player:player,players:saveData.players,levelData:saveData.getLevelData(player.p.area)});
    });
    
    socket.on('updateItems',function(data){
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId==data['playerId'];
        })[0];
        if(player){
            player.p.items=data['items'];
        }
        socket.broadcast.to(saveData.file+player.p.area).emit('updatePlayerItems',{items:player.p.items,playerId:data['playerId'],text:data['text']});
    });
    
    socket.on('updateStats',function(data){
        var player = saveData.players.filter(function(obj){
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
        io.sockets.in(saveData.file+player.p.area).emit('updatedStats',{playerId:data['playerId'],player:player});
    });
    
    //When a client pressed a key, decide what to do.
    socket.on("input",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId===data['playerId'];
        })[0];
        
        //Adventuring phase
        if(data['phase']===1){
            
            if(data['input']==="interact"){
                //do interact code
                
                return;
            }
            //If there was a wall, no need to check if there's an interactable
            if(data['noMove']){
                io.sockets.in(saveData.file+player.p.area).emit('changeDir',{inputted:data['input'],playerId:data['playerId']});
                return;
            }
            var locTo;
            var loc = data['loc'];
            switch(data['input']){
                case "Up":
                    locTo = [loc[0],loc[1]-1];
                    break;
                case "Right":
                    locTo = [loc[0]+1,loc[1]];
                    break;
                case "Down":
                    locTo = [loc[0],loc[1]+1];
                    break;
                case "Left":
                    locTo = [loc[0]-1,loc[1]];
                    break;
            }
            //Returns the object if there's an object in the way
            if(!saveData.checkObjInWay(locTo,player.p.area)){
                //If there's no object in the way, respond broadcast that this player is moving to locTo
                //Set the server player's to the locTo
                player.p.loc=locTo;
                //play the walking animation and move the player to the correct square on the clients
                io.sockets.in(saveData.file+player.p.area).emit('inputted',{inputted:data['input'],playerId:data['playerId'],locTo:locTo});
            } 
            //If there is an object in the way, change direction only
            else {
                io.sockets.in(saveData.file+player.p.area).emit('changeDir',{inputted:data['input'],playerId:data['playerId']});
            }
            
        //Battle phase
        } else if(data['phase']===2){
            switch(data['input']){
                case "up":

                    break;
                case "right":

                    break;
                case "down":

                    break;
                case "left":

                    break;
                case "menu":

                    break;
                case "interact":

                    break;
                case "back":

                    break;
            }
        }
    });
    socket.on("changeArea",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId===data['playerId'];
        })[0];
        player.p.x=data['props']['x'];
        player.p.y=data['props']['y'];
        player.p.dir=data['props']['dir'];
        player.p.loc=data['props']['loc'];
        player.p.animation = data['props']['animation'];
        
        socket.leave(saveData.file+player.p.area);
        socket.broadcast.to(saveData.file+player.p.area).emit('leftArea',{playerId:player.p.playerId,player:player});
        player.p.area=data['props']['area'];
        socket.emit('recievedLevelData',{levelData:levelData.getLevelData(player.p.area),player:player});
        socket.broadcast.to(saveData.file).emit('changedArea',{player:player});
    });
    
    socket.on('joinRoom',function(data){
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId===data['playerId'];
        })[0];
        //If there's no one here yet, make the array and push the NPC's into it
        if(!saveData.levelData[player.p.area].activeObjects){
            saveData.levelData[player.p.area].activeObjects=[];
            for(i=0;i<saveData.levelData[player.p.area].npcs.length;i++){
                saveData.levelData[player.p.area].activeObjects.push(saveData.levelData[player.p.area].npcs[i]);
            }
        };
        //Push the player into the activeObjects
        saveData.levelData[player.p.area].activeObjects.push(player);
        socket.join(saveData.file+player.p.area);
        
    });
    
    socket.on("pickUpItem",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId===data['playerId'];
        })[0];
        levelData.pickUpItem(player.p.area,data['pickupId']);
        io.sockets.in(saveData.file+player.p.area).emit('pickedUpItem',{pickupId:data['pickupId']});
    });
    
    socket.on("getTextNum",function(data){
        socket.emit("gotTextNum",{textNum:levelData.getTextNum(data),npcId:data['npcId']});
    });
    socket.on("setTextNum",function(data){
        levelData.setTextNum(data);
    });
    socket.on("moveNPC",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId===data['playerId'];
        })[0];
        levelData.moveNPC(data);
        io.sockets.in(saveData.file+player.p.area).emit("movedNPC",{npcId:data['npcId'],moveTo:data['moveTo']});
    });
    
    socket.on("startTurn",function(data){
        var evs = levelData.updateEvents(data);
        if(data['host']||typeof data['turnOrder'][0] === "string"){
            var player = saveData.players.filter(function(obj){
                 return obj.p.playerId==data['host'];
             })[0];
            io.sockets.in(saveData.file+player.p.area).emit('startTurn',{turnOrder:data['turnOrder'],events:evs,host:data['host'],stageName:data['stageName']});
        } else {
            var player = saveData.players.filter(function(obj){
                 return obj.p.playerId==data['turnOrder'][0];
            })[0];
            io.sockets.in(saveData.file+player.p.area).emit('startTurn',{turnOrder:data['turnOrder'],events:evs,stageName:data['stageName']});
        }
    });
    //Gets the event data immediately after steeping on the event
    //This also sets the status to 1
    socket.on('setEvent',function(data){
        var event = levelData.setEvent(data);
        //If the status is 0
        if(event){
            socket.emit('setEvent', {stageName:data['stageName'],event:event,host:data['host']});
        }
    });
    
    socket.on('triggerEvent',function(data){
        var event = levelData.updateEvent(data);
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        socket.broadcast.to(saveData.file+player.p.area).emit('triggeredEvent', {stageName:data['stageName'],event:event,host:data['host']});
    });
    socket.on("updateEvent",function(data){
        levelData.updateEvent(data);
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        io.sockets.in(saveData.file+player.p.area).emit('updatedEvent', {stageName:data['stageName'],eventId:data['eventId']});
    });
    
    socket.on("partOfBattle",function(data){
        //The host will do all enemy calculations
        var host = data['host'];
        //Returns the 'p' of event
        var event = levelData.updateEvent(data);
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        io.sockets.in(saveData.file+player.p.area).emit("playersInBattle",{stageName:data['stageName'],turnOrder:event.p.turnOrder,host:host});
    });
    
    //For when a player comes into the battle after it has started
    socket.on("joinBattle",function(data){
        for(i=0;i<data['players'].length;i++){
            var pl = data['players'][i];
            var player = saveData.players.filter(function(obj){
                return obj.p.playerId==pl.p.playerId;
            })[0];
            io.sockets.in(saveData.file+player.p.area+"battleWait").emit("joinedBattle",{host:data['battleHost'],player:player,stageName:data['stageName'],levelData:levelData.getLevelData(player.p.area),playerId:player.p.playerId});
            io.sockets.in(saveData.file+player.p.area).emit("joinedBattle",{host:data['battleHost'],player:player,stageName:data['stageName'],playerId:player.p.playerId});
        }
    });
    
    socket.on("battleMove",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        io.sockets.in(saveData.file+player.p.area).emit('battleMoved',data);
    });
    socket.on('attack',function(data){
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId==data['host'];
        })[0];
        socket.broadcast.to(saveData.file+player.p.area).emit('attacked',data);
    });
    socket.on('eventComplete',function(data){
        var player = saveData.players.filter(function(obj){
            return obj.p.playerId==data['playerId'];
        })[0];
        io.sockets.in(saveData.file+player.p.area).emit('completedEvent',{event:levelData.completeEvent(data['eventId'],data['stageName'])});
    });
});

server.listen(process.env.PORT || 5000);
console.log("Multiplayer app listening on port 5000");
