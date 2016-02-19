var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Quintus = require("./public/lib/quintus.js");

require("./public/lib/quintus_sprites.js")(Quintus);
require("./public/lib/quintus_scenes.js")(Quintus);
require("./server/player.js")(Quintus);
require("./server/level_data.js")(Quintus);
require("./server/save_state.js")(Quintus);

var Q = Quintus().include("Sprites, Scenes, ServerLevelData, ServerSaveState, ServerPlayer");
Q.gameLoop(Q.stageStepLoop);

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
//The level data that all files reference. Nothing should be changed in it
var levelData = new Q.LevelData();
io.on('connection', function (socket) {
    id++;
    //The current user's id
    var userId,
    //Holds all of the levelData, players, and filename
    saveData,
    //Checks every second to make sure the user gets connected properly
    loginInterval;
    setTimeout(function () {
        socket.join('login');
        userId = id;
        //Make sure to give a unique id
        if(_users.length>0&&_users[_users.length-1].playerId===id){id++;userId++;};
        _users.push({playerId:userId});
        loginInterval = setInterval(function(){
            socket.emit('connected', { playerId: userId});
        },1000);
        io.emit('count', { playerCount: io.engine.clientsCount});
    }, 100);
    //This is recieved when the client confirms that it has connected
    socket.on('confirmConnect',function(){
        clearInterval(loginInterval);
    });

    socket.on('disconnect', function () {
        io.emit('count', { playerCount: io.engine.clientsCount});
        if(saveData){
            for(i=0;i<saveData.players.length;i++){
                if(saveData.players[i].playerId===userId){
                    saveData.players.splice(i,1);
                }
            }
            io.emit('disconnected', {players:saveData.players,id:userId});
        }
    });
    
    //User logged in, now get the data from the database if they are the first ones here, else get the data from the server
    socket.on('toLobby', function (data) {
        function setPlayer(id,pl){
            //Check if the player is already in the array
            for(var j=0;j<saveData.players.length;j++){
                if(saveData.players[j].p.playerId===id){
                    return;
                }
            }
            for(var i=0;i<_users.length;i++){
                if(_users[i].playerId===id){
                    saveData.players.push(pl);
                    return;
                }
            }
        }
        //Get the saveData
        var file = data['file'];
        saveData = _activeFiles.filter(function(obj){
            return obj.file.name===file.name;
        })[0];
        //If there is no save data, we need to pull it from the database
        //For now, just create a new save file (just like starting a new game)
        if(!saveData){
            saveData = new Q.SaveState({file:file});
            //Push the saveData into the active files
            _activeFiles.push(saveData);
        }
        //Create a new server player
        //the passed 'data' should be gotten from the database here
        //That data will fill the 'p' property in player
        var player = new Q.ServerPlayer({name:data['name'],playerId:data['playerId']});
        //Set the socket id
        //player.p.socketId=socket.id;
        //Add the player to the saveData
        setPlayer(data['playerId'],player);
        //Leave the lobby as we are going to the main game now
        socket.leave('login');
        //Join the file
        socket.join(saveData.file.name);
        //Join the lobby
        socket.join('lobby');
        //This socket should send the user to the lobby
        //It also sends all players in this file
        socket.emit(saveData.file.name).emit("goToLobby",{player:player,players:saveData.players});
        //Tell all other connected clients in this file that I have joined the lobby
        socket.broadcast.to(saveData.file.name).emit('playerJoinedLobby',{player:player});
    });
    
    //This runs after the first player in the lobby presses start
    socket.on("startGame",function(){
        //Get and set up all of this scene's data
        saveData.sceneData =  saveData.setScene(levelData.getSceneData(saveData.file.scene),levelData.getClasses());
        //Create the scene on the server
        io.sockets.in(saveData.file.name).emit('startedScene',{saveData:saveData});
    });
    socket.on("checkPlayerPlacement",function(data){
        var playersPlacedAt = saveData.playersPlacedAt;
        if(!playersPlacedAt.length){saveData.levelData[saveData.scene].battle.playersStartAt=playersPlacedAt;};
        var found = false;
        for(i=0;i<playersPlacedAt.length;i++){
            //Can't
            if(data['loc'][0]===playersPlacedAt[i][0]&&data['loc'][1]===playersPlacedAt[i][1]){
                found = true;
            }
        }
        
        if(!found){
            var info = [data['loc'][0],data['loc'][1],data['playerId'],data['dir']];
            playersPlacedAt.push(info);
            io.sockets.in(saveData.file).emit("checkedPlayerPlacement",{found:found,loc:data['loc'],dir:data['dir'],playerId:data['playerId']});
        } else {
            socket.emit("checkedPlayerPlacement",{found:found});
        }
    });
    socket.on("confirmPlayerPlacement",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.playerId===data['playerId'];
        })[0];
        player.ready=true;
        var waiting = saveData.players.filter(function(obj){
            return !obj.ready;
        })[0];
        //This will be false when all players are ready
        if(!waiting){
            saveData.allNotReady();
            //Start the battle now that all players are placed
            io.sockets.in(saveData.file).emit("confirmedPlayerPlacement",{playerId:data['playerId'],loc:data['loc'],dir:data['dir'],startBattle:true});
        } else {
            io.sockets.in(saveData.file).emit("confirmedPlayerPlacement",{playerId:data['playerId'],loc:data['loc'],dir:data['dir']});
        }
    });
    socket.on("endTurn",function(data){
        var lastTurn = data['turnOrder'].shift();
        var turnOrder = data['turnOrder'];
        turnOrder.push(lastTurn);
        saveData.turnOrder = turnOrder;
        if(saveData.readyForNextTurn(data['playerId'])){
            io.sockets.in(saveData.file).emit("startedTurn",{turnOrder:saveData.turnOrder});
        };
    });
    socket.on("removePlayerPlacement",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.playerId===data['playerId'];
        })[0];
        player.ready=false;
        var playersPlacedAt = saveData.playersPlacedAt;
        for(i=0;i<playersPlacedAt.length;i++){
            if(data['loc'][0]===playersPlacedAt[i][0]&&data['loc'][1]===playersPlacedAt[i][1]){
                playersPlacedAt.splice(i,1);
            }
        }
        io.sockets.in(saveData.file).emit("removedPlayerPlacement",{playerId:data['playerId'],loc:data['loc']});
    });
    socket.on("readyForBattle",function(data){
        saveData.turnOrder = saveData.generateTurnOrder(saveData.players.concat(saveData.allies).concat(saveData.enemies));
        socket.emit("startedBattle",{turnOrder:saveData.turnOrder,placed:saveData.playersStartAt,playerLocs:levelData.getSceneData(saveData.file.scene).battle.playerLocs});
    });
    socket.on("setDirection",function(data){
        socket.broadcast.to(saveData.file).emit('setDirection',data);
    });
    socket.on("readyForNextTurn",function(data){
        if(saveData.readyForNextTurn(data['playerId'])){
            io.sockets.in(saveData.file).emit("startedTurn",{turnOrder:saveData.turnOrder});
        };
    });
    //When an AI or player moves
    socket.on("battleMove",function(data){
        socket.broadcast.to(saveData.file).emit('battleMoved',data);
    });
    //When a player selects 'redo'
    socket.on("resetMovement",function(data){
        socket.broadcast.to(saveData.file).emit('resetMove',data);
    });
    
    socket.on('endBattle',function(){
        io.sockets.in(saveData.file).emit("endedBattle");
    });
    socket.on("readyForNextScene",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.playerId===data['playerId'];
        })[0];
        player.ready=true;
        var waiting = saveData.players.filter(function(obj){
            return !obj.ready;
        })[0];
        //This will be false when all players are ready
        if(!waiting){
            saveData.allNotReady();
            saveData.scene = data['nextScene'];
            io.sockets.in(saveData.file).emit('startedScene',{players:saveData.players,levelData:saveData.getLevelData(saveData.scene)});
        }
    });
    
    socket.on('attack',function(data){
        //Need to figure out the information that needs to be saved on the server (such as stat changes/exp boosts/ location changes etc)
       //
       //  console.log(data['text'])
        socket.broadcast.to(saveData.file).emit('attacked',data);
    });
    socket.on("levelUp",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.playerId===data['playerId'];
        })[0];
        player.levelUp(data['levelsGained']);
    })
});

server.listen(process.env.PORT || 5000);
console.log("Multiplayer app listening on port 5000");
