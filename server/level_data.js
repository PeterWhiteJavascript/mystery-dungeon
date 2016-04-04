var tmx = require("tmx-parser");
var quintusServerLevelData = function(Quintus) {
"use strict";
Quintus.ServerLevelData = function(Q) {
    Q.Sprite.extend("IntObj",{
        init:function(p){
            this._super(p,{});
        }
    });
    Q.Sprite.extend("Pickup",{
        init:function(p){
            this._super(p,{});
        }
    });
    Q.Sprite.extend("TopTileLayer",{
        init:function(p){
            this._super(p,{});
            var d = this.p.data;
            //Need to format the tiles in the proper way
            var tiles = d.tiles;
            var width = this.p.width;
            var height = this.p.height;
            var data = [], idx=0;
            //All that is pushed in is the sprite type.
            //This should be the only thing that needs to be known server side as it is not rendered here.
            for(var y=0;y<height;y++){
                data[y] = [];
                for(var x=0;x<width;x++){
                    data[y].push(tiles[idx].properties.type);
                    idx++;
                }
            }
            this.p.tiles = data;
        }
    });
    //Gets a target at the location
    Q.getTargetAt=function(x,y){
        var target = Q("Participant",1).items.filter(function(obj){
            return obj.p.loc&&obj.p.loc[0]===x&&obj.p.loc[1]===y;
        })[0];
        return target;
    };
    Q.getTileCost = function(tile){
        var cost = 2;
        switch(tile){
            case "SPRITE_DEFAULT":
                cost=200000;
                break;
        }
        return cost;
    };
    Q.setXY=function(x,y){
        return [x*Q.tileH+Q.tileH/2,y*Q.tileH+Q.tileH/2];
    };
    //Gets the total cost for a movement path
    Q.getPathCost=function(path){
        var curCost = 0;
        for(var j=0;j<path.length;j++){
            curCost+=path[j].weight;
        }
        return curCost;
    };
    //Same as client side
    Q.getScenePath = function(to){
        var path = "";
        var pathNumX="";
        var pathNumY="";
        var num = "0123456789-/";
        var donePath = false;
        var doneX=false;
        for(var i=0;i<to.length;i++){
            for(var j=0;j<num.length;j++){
                if(donePath&&to[i]==="_"){
                    doneX=true;
                    i++;
                }
                if(to[i]===num[j]){
                    donePath=true;
                }
            }
            if(!donePath){
                path+=to[i];
            } else if(!doneX){
                pathNumX+=to[i];
            } else {
                pathNumY+=to[i];
            }
        }
        pathNumX=parseInt(pathNumX);
        pathNumY=parseInt(pathNumY);
        return [path,[pathNumX,pathNumY]];
    };
    //Starting a scene
    //The scene needs to know the .tmx data map, all objects (interactable and not interactable), 
    Q.startScene=function(sceneData,users,callback){
        //Get the path if we're staging a .tmx
        var currentPath = Q.getScenePath(sceneData.levelMap.name);
        Q.scene(sceneData.onStart.name,function(stage){
            tmx.parseFile("./public/data/"+currentPath[0]+"/"+sceneData.levelMap.name+".tmx", function(err, map) {
                if (err) throw err;
                var top = map.layers[map.layers.length-1];
                Q.topTiles = stage.insert(new Q.TopTileLayer({width:map.width,height:map.height,data:top}));
                Q.state.set("mapWidth",map.width);
                Q.state.set("mapHeight",map.height);
                //Create all of the objects in the stage
                Q.createObjects(stage,users,sceneData);
                //Send all of the data to all of the clients
                callback(sceneData);
            });
        });
        Q.stageScene(sceneData.onStart.name,1,{path:currentPath[0],pathNum:currentPath[1]});
    };
    //createObjects adds the players, allies, and enemies to the stage, as well as any additional objects
    Q.createObjects=function(stage,users,sceneData){
        var classes = Q.state.get("classes");
        var attacks = Q.state.get("attacks");
        for(var i=0;i<users.length;i++){
            //Create the user
            var user = stage.insert(users[i]);
            //Create the player that the user controls
            stage.insert(new Q.Participant({user:user,ally:"Player",playerId:user.p.playerId}));
        }
        //Populate the enemies and allies for this scene
        var allies = sceneData.allies;
        var num = 0;
        for(var i=0;i<allies.length;i++){
            for(var j=0;j<allies[i].length;j++){
                allies[i][j].playerId = 'a'+num;
                var classData = classes.filter(function(obj){return obj.id===allies[i][j].className;})[0];
                stage.insert(new Q.Participant({data:allies[i][j],classData:classData,attackData:attacks,ally:"Player",group:i,groupNum:j,playerId:allies[i][j].playerId}));
                num++;
            }
        }
        var num = 0;
        var enemies = sceneData.enemies;
        for(var i=0;i<enemies.length;i++){
            for(var j=0;j<enemies[i].length;j++){
                enemies[i][j].playerId = 'e'+num;
                var classData = classes.filter(function(obj){return obj.id===enemies[i][j].className;})[0];
                stage.insert(new Q.Participant({data:enemies[i][j],classData:classData,attackData:attacks,ally:"Enemy",group:i,groupNum:j,playerId:enemies[i][j].playerId}));
                num++;
            }
        }
        var pickups = sceneData.pickups;
        for(var i=0;i<pickups.length;i++){
            stage.insert(new Q.Pickup({item:pickups[i].item,amount:pickups[i].amount,loc:pickups[i].loc}));
        }
        var objects = sceneData.finalObjects;
        if(objects){
            var keys = Object.keys(objects);
            //Loop through objects
            for(var i=0;i<keys.length;i++){
                //Loop through locations
                for(var j=0;j<objects[keys[i]].length;j++){
                    stage.insert(new Q.IntObj({loc:objects[keys[i]][j],className:keys[i],playerId:j}));
                }
            }
        }
    };
    /*
    Q.initializePlayerLocs=function(locs){
        Q("Participant",1).each(function(){
            for(var i=0;i<locs.length;i++){
                if(locs[i][2]===this.p.playerId){
                    this.p.loc = [locs[i][0],locs[i][1]];
                    this.p.dir = locs[i][3];
                }
            }
        });
    };*/
    Q.startTurn=function(turnOrder,fileName){
        var obj = Q("Participant",1).items.filter(function(ob){
            return ob.p.playerId === turnOrder[0];
        })[0];
        obj.p.modStats.movement = obj.p.stats.movement;
        //Keep a record of the filename and current turn order in this object
        obj.p.fileName = fileName;
        obj.p.startLoc = [obj.p.loc[0],obj.p.loc[1]];
        obj.p.turnOrder = turnOrder;
        //If it's AI's turn
        if(Q._isString(turnOrder[0])){
            obj.trigger("startAI");
        } 
        //If it's player's turn
        else {
            var user = Q("User",1).items.filter(function(ob){
                return ob.p.playerId === turnOrder[0];
            })[0];
            user.startTurn();
            return turnOrder[0];
        }
    };
    
    //This is the global leveldata object that all files will reference when getting game data
    //Nothing here should be altered
    Q.Evented.extend("LevelData",{
        init:function(){
            //Get all of the level data
            this.levelData=this.setAllLevelData();
            
        },
        startNextTurn:function(fileName){
            var saveData=Q.state.get("files")[fileName];
            saveData.allNotReady();
            var allies = Q("Participant",1).items.filter(function(obj){
                return obj.p.ally==="Player";
            });
            var enemies = Q("Participant",1).items.filter(function(obj){
                return obj.p.ally==="Enemy";
            });
            //If there are no enemies left
            if(enemies.length===0){
                Q.sendMainEvent(saveData.file.name,"endedBattle");
                return;
            }
            //End the turn with this direction
            saveData.cycleTurnOrder(saveData.turnOrder);
            //Will get AI, or respond that it's a player's turn
            var response = Q.startTurn(saveData.turnOrder,fileName);
            //If it's a player's turn
            if(response){
                Q.sendMainEvent(fileName,"startTurn",{response:response,turnOrder:saveData.turnOrder});
            }
        },
        createPlacementPointer:function(playerId,playerLocs,loc){
            var user = Q("User",1).items.filter(function(obj){
                return obj.p.playerId===playerId;
            })[0];
            if(!loc){loc = playerLocs[0];};
            var pointer = user.createPointer(loc,user.p.name);
            pointer.p.playerLocs = playerLocs;
            user.p.playerLocs = playerLocs;
            pointer.add("placementControls");
        },
        //Gets all relevant users data
        getUsersToSend:function(users){
            var us = [];
            for(var i=0;i<users.length;i++){
                us.push({
                    playerId:users[i].p.playerId,
                    file:users[i].p.file,
                    ready:users[i].p.ready,
                    name:users[i].p.name
                });
            }
            return us;
        },
        //Gets a snapshot of the current objects on the server
        //Used to get everything synced up at the start of the battle
        getObjects:function(){
            var parts = Q("Participant",1).items;
            var partData = [];
            for(var i=0;i<parts.length;i++){
                var al = {
                    playerId:parts[i].p.playerId,
                    className:parts[i].p.className,
                    loc:parts[i].p.loc,
                    level:parts[i].p.level,
                    dir:parts[i].p.dir,
                    iv:parts[i].p.iv,
                    base:parts[i].p.base,
                    stats:parts[i].p.stats,
                    modStats:parts[i].p.modStats,
                    attacks:parts[i].p.attacks,
                    items:parts[i].p.items,
                    abilities:parts[i].p.abilities,
                    exp:parts[i].p.exp,
                    curHp:parts[i].p.curHp,
                    gender:parts[i].p.gender,
                    name:parts[i].p.name,
                    traits:parts[i].p.traits,
                    text:parts[i].p.text,
                    sheet:parts[i].p.sheet,
                    
                    final:parts[i].p.final,
                    group:parts[i].p.group,
                    groupNum:parts[i].p.groupNum
                    
                };
                partData.push(al);
            }
            var pickups = Q("Pickup",1).items;
            var pickupsData = [];
            var objects = Q("IntObj",1).items;
            var objectData = [];
            //If there are any temporary objects
            if(objects){
                for(var i=0;i<objects.length;i++){
                    var obj = {
                        className:objects[i].p.className,
                        loc:objects[i].p.loc
                    };
                    objectData.push(obj);
                }
            }
            return [partData,pickupsData,objectData];
        },
        //Gets a specific scene's data
        //Called every time the scene changes
        getSceneData:function(scene){
            return this.levelData[scene];
        },
        setAllLevelData:function(){
            var levelData = {
                Prologue_00:{
                    levelMap:{name:"first_demo1_2"},
                    onStart:{name:"Prologue_00",music:"talking1"},
                    onCompleted:{scene:"Prologue_00_end",music:"talking1",nextScene:"Prologue_01"},
                    battle:{
                        music:"battle3",
                        playerLocs:[
                            [13,17],[14,17],
                            [13,18],[14,18],
                            [13,19],[14,19]
                        ]
                    },
                    allies:[
                        [
                            {name:"Old Wizard",className:"pyromancer",loc: [14,13],level: 10,dir: "left",traits:["aggressive","genius"],final:[[14,13],"up"]},
                            {name:"Young Wizard",className:"pyromancer",loc: [13,13],level: 10,dir: "right",traits:["aggressive","genius"],final:[[13,13],"up"]},
                        ]
                    ],
                    enemies:[
                        [
                            {className: "fighter",loc: [9,10],level: 1,dir: "right",final:[[9,10],"down"]},
                            {className: "fighter",loc: [9,11],level: 1,dir: "right",final:[[9,11],"down"]},
                            {className: "fighter",loc: [12,9],level: 1,dir: "down",final:[[12,9],"down"]},
                            {className: "fighter",loc: [14,9],level: 1,dir: "down",final:[[14,9],"down"]},
                            {className: "fighter",loc: [16,10],level: 1,dir: "left",final:[[16,10],"left"]}
                        ]
                    ],
                    pickups:[
                        {item: "Potion",amount: 1,loc: [20,11]}
                    ],
                    //This will contain all 'other' objects that should be inserted into the stage at runtime
                    objects:{
                        Barrel:[[6,19],[7,19],[8,19],[20,16],[21,16],[22,16],[20,17],[21,17],[22,17],[20,18],[21,18],[22,18],[23,18],[24,18],[20,19],[21,19],[22,19],[23,19],[24,19],[20,20],[21,20],[22,20],[23,20],[19,21],[13,22],[14,22]]
                    },
                    finalObjects:{
                        Barrel:[[6,19],[7,19],[20,16],[21,16],[22,16],[20,17],[21,17],[22,17],[23,18],[24,18],[23,19],[24,19],[20,20],[21,20],[22,20],[23,20],[19,21],[13,22],[14,22]]
                    }
                },
                Prologue_01:{
                    levelMap:{name:"first_demo0_0"},
                    onStart:{name:"Prologue_01",music:"talking1"},
                    onCompleted:{scene:"Prologue_01_end",music:"talking1",nextScene:"Prologue_02"},
                    battle:{
                        music:"battle4",
                        playerLocs:[
                            [7,14],[8,14],
                            [7,15],[8,15],
                            [7,16],[8,16]
                        ]
                    },
                    allies:[
                        [
                            {name:"Old Wizard",className:"pyromancer",loc: [36,6],level: 100,dir: "left",traits:["aggressive","genius"],final:[[13,15],"left"]},
                            {name:"Young Wizard",className:"pyromancer",loc: [36,7],level: 100,dir: "left",traits:["aggressive","genius"],final:[[13,16],"left"]}
                        ]
                    ],
                    enemies:[
                        [
                            {name:"Obama",className: "fighter",loc: [15,6], level: 20, dir:"right",traits:["aggressive","genius"],final:[[17,14],"left"]}
                        ],
                        [
                            {className: "fighter",loc: [10,17],level: 2,dir: "up",final:[[10,14],"right"]},
                            {className: "fighter",loc: [10,17],level: 2,dir: "up",final:[[10,15],"right"]},
                            {className: "fighter",loc: [10,17],level: 2,dir: "up",final:[[10,16],"right"]},
                            
                            {className: "fighter",loc: [19,17],level: 2,dir: "up",final:[[18,15],"left"]},
                            {className: "fighter",loc: [19,17],level: 2,dir: "up",final:[[18,16],"left"]},
                       
                            {className: "fighter",loc: [19,13],level: 2,dir: "down",final:[[18,14],"left"]},
                        
                            {className: "fighter",loc: [14,11],level: 2,dir: "right",final:[[15,13],"down"]},
                            {className: "fighter",loc: [14,11],level: 2,dir: "right",final:[[16,13],"down"]},
                            {className: "fighter",loc: [14,11],level: 2,dir: "right",final:[[17,13],"down"]}
                        ]
                    ],
                    pickups:[
                        {item: "Potion",amount: 1,loc: [20,11]}
                    ]
                },
                Prologue_02:{
                    levelMap:{name:"first_demo1_2"},
                    onStart:{name:"Prologue_02",music:"talking1"},
                    onCompleted:{scene:"Prologue_02_end",music:"talking1",nextScene:"Prologue_03"},
                    battle:{
                        music:"battle4",
                        playerLocs:[
                            [13,17],[14,17],
                            [13,18],[14,18],
                            [13,19],[14,19]
                        ]
                    },
                    allies:[
                        [
                            //{name:"Old Wizard",className:"pyromancer",loc: [14,16],level: 100,dir: "left",traits:["aggressive","genius"],final:[[14,16],"up"]},
                            {name:"Young Wizard",className:"pyromancer",loc: [13,16],level: 100,dir: "left",traits:["aggressive","genius"],final:[[13,16],"up"]},
                        ]
                    ],
                    enemies:[
                        [/*
                            {className: "fighter",loc: [11,9],level: 2,dir: "up",final:[[9,10],"down"]},
                            {className: "fighter",loc: [12,9],level: 2,dir: "up",final:[[11,10],"down"]},
                            {className: "fighter",loc: [13,9],level: 2,dir: "up",final:[[13,10],"down"]}*/
                            
                        ],
                        [
                            {name:"Obama",className: "fighter",loc: [15,6],level: 20,dir:"right",final:[[13,12],"down"]}
                        ]
                    ],
                    pickups:[
                        {item: "Potion",amount: 1,loc: [20,11]}
                    ]
                }
                        
            };
            return levelData;
        }
    });
    
    return Q;
};
};

module.exports = quintusServerLevelData;