var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var fs = require('fs');

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
    res.render('/index.html');
});
app.get('/', function(req, res){
    res.render('/create_account.html');
});
var Quintus = require("./public/lib/quintus.js");

require("./public/lib/quintus_sprites.js")(Quintus);
require("./public/lib/quintus_scenes.js")(Quintus);
require("./public/quintus_shared.js")(Quintus);


require("./server/player.js")(Quintus,io);
require("./server/player_objects.js")(Quintus);
require("./server/ai.js")(Quintus,io);
require("./server/level_data.js")(Quintus);
require("./server/save_state.js")(Quintus);

var Q = Quintus().include("Sprites, Scenes, ServerLevelData, ServerSaveState, ServerPlayer, ServerPlayerObjects, ServerAI, Shared");
Q.tileH = 70;
var star = require("./public/lib/astar.js");
Q.astar = star.astar;
Q.Graph = star.Graph;

Q.state.set("attacks",require("./public/data/_json/attacks.json"));
Q.state.set("classes",require("./public/data/_json/classes.json"));
Q.state.set("expNeeded",require("./public/data/_json/exp_needed.json"));
Q.state.set("items",require("./public/data/_json/items.json"));
Q.state.set("abilities",require("./public/data/_json/abilities.json"));
Q.state.set("userData",require("./public/data/_json/users.json"));

Q.state.set("menus",require("./public/data/_json/menus.json"));

Q.gameLoop(Q.stageStepLoop);

//Stores a list of all user id's that are connected
//Note: only stores the id's. The full object is stored in the user's saveData.users
Q.state.set("users",[]);
//Stores a list of all active saveData
Q.state.set("files",{});
//The level data that all files reference. Nothing should be changed in it
Q.state.set("levelData",new Q.LevelData());

//The variable that gives a unique id to a player when the joins
var id = 0;
Q.sendPlayerEvent=function(fileName,data){
    io.sockets.in(fileName).emit("playerEvent",data);
};
Q.sendMainEvent=function(fileName,name,data){
    io.sockets.in(fileName).emit(name,data);
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
        var users = Q.state.get("users");
        //Make sure to give a unique id
        if(users.length>0&&users[users.length-1].playerId===id){id++;userId++;};
        users.push(userId);
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
            var users = Q.state.get("users");
            for(var i=0;i<users.length;i++){
                if(users[i]===userId){
                    users.splice(i,1);
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
            var users = Q.state.get("users");
            for(var i=0;i<users.length;i++){
                if(users[i]===id){
                    saveData.users.push(pl);
                    Q.state.get("users").push(id);
                    return;
                }
            }
        }
        //Get the saveData
        var file = data['file'];
        saveData = Q.state.get("files")[file.name];
        //If there is no save data, we need to pull it from the database
        //For now, just create a new save file (just like starting a new game)
        if(!saveData){
            saveData = new Q.SaveState({file:file});
            //Push the saveData into the active files
            var files = Q.state.get("files");
            files[file.name]=saveData;
        }
        data.socket=socket;
        var userData = Q.state.get("userData").filter(function(us){
            return us.login===data['login'];
        })[0];
        //Create a new user which keeps a copy of the current saveData
        var user = new Q.User({file:file,playerId:userId,socket:socket,userData:userData,saveData:saveData});
        //Set the socket id
        //player.p.socketId=socket.id;
        //Add the player to the saveData
        setPlayer(userId,user);
        //Leave the lobby as we are going to the main game now
        socket.leave('login');
        //Join the file
        socket.join(saveData.file.name);
        //Join the lobby
        socket.join('lobby');
        //This socket should send the user to the lobby
        //It also sends all players in this file
        var levelData = Q.state.get("levelData");
        var users = levelData.getUsersToSend(saveData.users);
        var u = levelData.getUsersToSend([user])[0];
        socket.emit(saveData.file.name).emit("goToLobby",{user:u,users:users});
        //Tell all other connected clients in this file that I have joined the lobby
        socket.broadcast.to(saveData.file.name).emit('playerJoinedLobby',{user:u});
    });
    //This runs after the first player in the lobby presses start
    socket.on("startGame",function(){
        var levelData = Q.state.get("levelData");
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
            io.sockets.in(saveData.file.name).emit('startedScene',{scene:sc,userData:users,partsData:objectsData[0],pickupsData:objectsData[1],objectData:sceneData.objects});
        });
    });
    socket.on("readyForBattle",function(data){
        var levelData = Q.state.get("levelData");
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
        if(saveData.setAndCheckReady(data['playerId'])){
            Q.state.get("levelData").startNextTurn(saveData.file.name);
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
    socket.on("endTurnControls",function(data){
        var user = saveData.users.filter(function(obj){
            return obj.p.playerId===data['playerId'];
        })[0];
        user.endTurnControls();
    });

    socket.on('endBattle',function(){
        io.sockets.in(saveData.file.name).emit("endedBattle");
    });
    socket.on("readyForNextScene",function(data){
        if(saveData.setAndCheckReady(data['playerId'])){
            saveData.file.scene=saveData.scene.onCompleted.nextScene;
            var levelData = Q.state.get("levelData");
            //Create the scene on the server
            Q.startScene(levelData.getSceneData(saveData.file.scene),saveData.users,function(sceneData){
                var objectsData = levelData.getObjects();
                var sc = {
                    levelMap:sceneData.levelMap,
                    onStart:sceneData.onStart,
                    onCompleted:sceneData.onCompleted,
                    battle:sceneData.battle
                };
                saveData.playersPlacedAt = [];
                saveData.scene = sc;
                //Get the users data
                var users = levelData.getUsersToSend(saveData.users);
                //Note: objectsData[0] contains the playerData which is empty at this point
                io.sockets.in(saveData.file.name).emit('startedScene',{scene:sc,userData:users,partsData:objectsData[0],pickupsData:objectsData[1],objectData:sceneData.objects});
            });
        }
    });
    //create_account.html
    socket.on("createAccount",function(data){
       //Process the html form that was submitted
        var char = JSON.stringify(data['char']);
        fs.writeFile("server/users/"+data['id']+".json",char, function(err) {
            if(err) {
                return console.log(err);
            }
        });
        fs.readdir("server/users", function(err, items) {
            //arr stores all users data
            var arr = [];
            //The current file we're on
            var num = 0;
            //Loop through the files in the directory
            for (var i=0; i<items.length; i++) {
                //What should we do with the file?
                fs.readFile("server/users/"+items[i],function(err,dat){
                    if(err) throw err;
                    var user = JSON.parse(dat);
                    arr.push(user);
                    num++;
                    //This means that this is the last file.
                    //We can now write the data to the master file
                    if(num===items.length){
                        var d = JSON.stringify(arr);
                        fs.writeFile("public/data/_json/users.json",d, function(err) {
                            if(err) {
                                return console.log(err);
                            }
                        });
                    }
                });
            }
        });
    });
});

server.listen(process.env.PORT || 5000);
console.log("Multiplayer app listening on port 5000");
