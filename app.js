var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
    res.render('/index.html');
});
var Quintus = require("./public/lib/quintus.js");

require("./public/lib/quintus_sprites.js")(Quintus);
require("./public/lib/quintus_scenes.js")(Quintus);


require("./server/player.js")(Quintus);
require("./server/ai.js")(Quintus,io);
require("./server/level_data.js")(Quintus);
require("./server/save_state.js")(Quintus);

var Q = Quintus().include("Sprites, Scenes, ServerLevelData, ServerSaveState, ServerPlayer, ServerAI");
Q.tileH = 70;
var star = require("./public/lib/astar.js");
Q.astar = star.astar;
Q.Graph = star.Graph;

Q.state.set("attacks",require("./public/data/_json/attacks.json"));
Q.state.set("classes",require("./public/data/_json/classes.json"));
Q.state.set("expNeeded",require("./public/data/_json/exp_needed.json"));
Q.state.set("items",require("./public/data/_json/items.json"));
Q.state.set("abilities",require("./public/data/_json/abilities.json"));

Q.gameLoop(Q.stageStepLoop);


//Stores a list of all user id's that are connected
//Note: only stores the id's. The full object is stored in the user's saveData.users
Q.users = [];
//Stores a list of all active leveldata
Q.activeFiles = [];
//The variable that gives a unique id to a player when the join
var id = 0;
//The level data that all files reference. Nothing should be changed in it
var levelData = new Q.LevelData();
Q.sendPlayerEvent=function(file,data){
    io.sockets.in(file.name).emit("playerEvent",data);
};
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
        if(Q.users.length>0&&Q.users[Q.users.length-1].playerId===id){id++;userId++;};
        Q.users.push(userId);
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
            for(var i=0;i<saveData.users.length;i++){
                if(saveData.users[i].playerId===userId){
                    saveData.users.splice(i,1);
                }
            }
            for(var i=0;i<Q.users.length;i++){
                if(Q.users[i]===userId){
                    Q.users.splice(i,1);
                }
            }
            io.emit('disconnected', {players:saveData.players,id:userId});
        }
    });

    //User logged in, now get the data from the database if they are the first ones here, else get the data from the server
    socket.on('toLobby', function (data) {
        function setPlayer(id,pl){
            //Check if the player is already in the array
            for(var j=0;j<saveData.users.length;j++){
                if(saveData.users[j].playerId===id){
                    return;
                }
            }
            for(var i=0;i<Q.users.length;i++){
                if(Q.users[i]===id){
                    saveData.users.push(pl);
                    return;
                }
            }
        }
        //Get the saveData
        var file = data['file'];
        saveData = Q.activeFiles.filter(function(obj){
            return obj.file.name===file.name;
        })[0];
        //If there is no save data, we need to pull it from the database
        //For now, just create a new save file (just like starting a new game)
        if(!saveData){
            saveData = new Q.SaveState({file:file});
            //Push the saveData into the active files
            Q.activeFiles.push(saveData);
        }
        data.socket=socket;
        //Create a new user which keeps a copy of the current saveData
        var user = new Q.User({playerId:data['playerId'],socket:socket,file:data['file'],name:data['name'],saveData:saveData});
        //Set the socket id
        //player.p.socketId=socket.id;
        //Add the player to the saveData
        setPlayer(data['playerId'],user);
        //Leave the lobby as we are going to the main game now
        socket.leave('login');
        //Join the file
        socket.join(saveData.file.name);
        //Join the lobby
        socket.join('lobby');
        //This socket should send the user to the lobby
        //It also sends all players in this file
        var users = levelData.getUsersToSend(saveData.users);
        var u = levelData.getUsersToSend([user])[0];
        socket.emit(saveData.file.name).emit("goToLobby",{player:u,players:users});
        //Tell all other connected clients in this file that I have joined the lobby
        socket.broadcast.to(saveData.file.name).emit('playerJoinedLobby',{player:u});
    });

    //This runs after the first player in the lobby presses start
    socket.on("startGame",function(){
        //Create the scene on the server
        Q.startScene(levelData.getSceneData(saveData.file.scene),saveData.users,function(sceneData){
            var objectsData = levelData.getObjects();
            var sc = {
                levelMap:sceneData.levelMap,
                onStart:sceneData.onStart,
                onCompleted:sceneData.onCompleted,
                battle:sceneData.battle
            };
            
            saveData.scene = sc;
            //Get the users data
            var users = levelData.getUsersToSend(saveData.users);
            //Note: objectsData[0] contains the playerData which is empty at this point
            io.sockets.in(saveData.file.name).emit('startedScene',{scene:sc,userData:users,partsData:objectsData[0],pickupsData:objectsData[1],objectData:objectsData[2]});
        });
    });
    socket.on("checkPlayerPlacement",function(data){
        var playersPlacedAt = saveData.playersPlacedAt;
        var found = false;
        for(var i=0;i<playersPlacedAt.length;i++){
            //Can't
            if(data['loc'][0]===playersPlacedAt[i][0]&&data['loc'][1]===playersPlacedAt[i][1]){
                found = true;
            }
        }
        if(!found){
            io.sockets.in(saveData.file.name).emit("checkedPlayerPlacement",{found:found,loc:data['loc'],dir:data['dir'],playerId:data['playerId']});
        } 
        //If someone placed a player there already
        else {
            socket.emit("checkedPlayerPlacement",{found:found});
        }
    });
    socket.on("confirmPlayerPlacement",function(data){
        var user = saveData.users.filter(function(obj){
            return obj.playerId===data['playerId'];
        })[0];
        user.ready=true;
        //Push the player placement info
        var info = [data['loc'][0],data['loc'][1],data['playerId'],data['dir']];
        saveData.playersPlacedAt.push(info);
        //See if there's at least on that's not ready
        var waiting = saveData.users.filter(function(obj){
            return !obj.ready;
        })[0];
        //This will be false when all players are ready
        if(!waiting){
            saveData.allNotReady();
            //Start the battle now that all players are placed
            Q.initializePlayerLocs(saveData.playersPlacedAt);
            //Will get AI, or respond that it's a player's turn
            var response = Q.startTurn(saveData.turnOrder,saveData.file.name);
            //Confirm the final player placement and send off the data for the first turn
            io.sockets.in(saveData.file.name).emit("confirmedPlayerPlacement",{playerId:data['playerId'],loc:data['loc'],dir:data['dir'],res:response,startBattle:true});
        } else {
            io.sockets.in(saveData.file.name).emit("confirmedPlayerPlacement",{playerId:data['playerId'],loc:data['loc'],dir:data['dir']});
        }
    });
    socket.on("endTurn",function(data){
        var lastTurn = data['turnOrder'].shift();
        var turnOrder = data['turnOrder'];
        turnOrder.push(lastTurn);
        saveData.turnOrder = turnOrder;
        if(saveData.readyForNextTurn(data['playerId'])){
            io.sockets.in(saveData.file.name).emit("startedTurn",{turnOrder:saveData.turnOrder});
        };
    });
    socket.on("removePlayerPlacement",function(data){
        var player = saveData.users.filter(function(obj){
            return obj.playerId===data['playerId'];
        })[0];
        player.ready=false;
        var playersPlacedAt = saveData.playersPlacedAt;
        for(i=0;i<playersPlacedAt.length;i++){
            if(data['loc'][0]===playersPlacedAt[i][0]&&data['loc'][1]===playersPlacedAt[i][1]){
                playersPlacedAt.splice(i,1);
            }
        }
        io.sockets.in(saveData.file.name).emit("removedPlayerPlacement",{playerId:data['playerId'],loc:data['loc']});
    });
    socket.on("readyForBattle",function(data){
        saveData.turnOrder = saveData.generateTurnOrder(Q("Participant",1).items.slice());
        //Create the placement pointers for the current player
        levelData.createPlacementPointer(data['playerId'],saveData.scene.battle.playerLocs);
        var objectsData = levelData.getObjects();
        var users = levelData.getUsersToSend(saveData.users);
        socket.emit("startedBattle",{scene:saveData.scene,turnOrder:saveData.turnOrder,userData:users,partsData:objectsData[0],pickupsData:objectsData[1],objectData:objectsData[2]});
    });
    socket.on("setDirection",function(data){
        socket.broadcast.to(saveData.file.name).emit('setDirection',data);
    });
    socket.on("readyForNextTurn",function(data){
        if(saveData.readyForNextTurn(data['playerId'])){
            saveData.allNotReady();
            saveData.cycleTurnOrder(saveData.turnOrder);
            //Will get AI, or respond that it's a player's turn
            var response = Q.startTurn(saveData.turnOrder,saveData.file.name);
            //If it's a player's turn
            if(response){
                io.sockets.in(saveData.file.name).emit("startNextTurn",response);
            }
        };
    });
    socket.on("playerInputs",function(data){
        var user = saveData.users.filter(function(obj){
            return obj.p.playerId===data['playerId'];
        })[0];
        user.p.inputs.push(data['inputs']);
        //Send the result of the input to all clients in the file
        io.sockets.in(saveData.file.name).emit("playerInputted",data);
        
    });
    //When an AI or player moves
    socket.on("battleMove",function(data){
        socket.broadcast.to(saveData.file.name).emit('battleMoved',data);
    });
    //When a player selects 'redo'
    socket.on("resetMovement",function(data){
        socket.broadcast.to(saveData.file.name).emit('resetMove',data);
    });

    socket.on('endBattle',function(){
        io.sockets.in(saveData.file.name).emit("endedBattle");
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
            io.sockets.in(saveData.file.name).emit('startedScene',{players:saveData.players,levelData:saveData.getLevelData(saveData.scene)});
        }
    });
    socket.on("levelUp",function(data){
        var player = saveData.players.filter(function(obj){
            return obj.playerId===data['playerId'];
        })[0];
        player.levelUp(data['levelsGained']);
    });
});




server.listen(process.env.PORT || 5000);
console.log("Multiplayer app listening on port 5000");
