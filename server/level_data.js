var tmx = require("tmx-parser");
var quintusServerLevelData = function(Quintus) {
"use strict";
Quintus.ServerLevelData = function(Q) {
    Q.component("placementControls",{
        added:function(){
            this.entity.on("inputsInteract",this,"interact");
            this.entity.on("inputsBack",this,"back");
        },
        //Check if the pointer is on top of a possible target
        interact:function(){
            var p = this.entity.p;
            //Get the location that the pointer has interacted with
            var pLoc = p.playerLocs.filter(function(loc){
                return loc[0]===p.loc[0]&&loc[1]===p.loc[1];
            })[0];
            if(pLoc){
                //If it's valid, check if there's a player already there
                var placedPlayers = p.user.p.saveData.playersPlacedAt;
                var placed = placedPlayers.filter(function(obj){
                    return obj.loc[0]===pLoc[0]&&obj.loc[1]===pLoc[1];
                })[0];
                //If there's no player at this position, place this player there
                if(!placed){
                    placedPlayers.push({playerId:p.user.p.playerId,loc:pLoc});
                    p.user.placePlayer(pLoc);
                    Q.sendPlayerEvent(p.user.p.file,{playerId:p.user.p.playerId,funcs:["placePlayer"],props:[pLoc]});
                }
            }
            
        },
        //Check if the player has been placed and remove it if he has been
        back:function(){
            
        }
    });
    Q.component("attackControls",{
        added:function(){
            this.entity.on("inputsInteract",this,"interact");
            this.entity.on("inputsBack",this,"back");
        },
        //Check if the pointer is on top of a possible target
        //If there's a target, load the battle prediction menu (shows percent to hit and both player cards(main target only))
        interact:function(){
            
        },
        //Load the player menu, delete the pointer, and center on the player
        back:function(){
            
        }
    });
    Q.component("movementControls",{
        added:function(){
            this.entity.on("inputsInteract",this,"interact");
            this.entity.on("inputsBack",this,"back");
        },
        //Check if the pointer is on top of a valid move location
        //If so, calculate the best path to that square and move the player to it
        //Also load the menu on arrival
        //Also grey out the move command
        interact:function(){
            
        },
        //Load the player menu, delete the pointer, and center on the player
        back:function(){
            
        }
    });
    Q.component("selectionControls",{
        added:function(){
            this.entity.on("inputsInteract",this,"interact");
            this.entity.on("inputsBack",this,"back");
        },
        //If an object is selected, allow for cycling on its player card
        interact:function(){
            
        },
        //Load the player menu, delete the pointer, and center on the player
        back:function(){
            
        }
    });
    //The server pointer updates the location instantly when it accepts a user input
    //It does not move via an x/y position as it only needs to track the location of itself
    Q.Sprite.extend("Pointer",{
        init:function(p){
            this._super(p,{
                stepDistance:Q.tileH,
                stepDelay:0.3,
                stepWait:0
            });
        },
        checkValidLoc:function(loc){
            if(loc[0]<0||loc[1]<0||loc[0]>=Q.state.get("mapWidth")||loc[1]>=Q.state.get("mapHeight")){
                return false;
            }
            return loc;
        },
        checkInputs:function(input){
            var p = this.p;
            var newLoc = [p.loc[0],p.loc[1]];
            if(input['up']){
                newLoc[1]--;
            } else if(input['down']){
                newLoc[1]++;
            }
            if(input['right']){
                newLoc[0]++;
            } else if(input['left']){
                newLoc[0]--;
            }
            var loc = this.checkValidLoc(newLoc);
            if(loc&&(newLoc[0]!==p.loc[0]||newLoc[1]!==p.loc[1])){
                p.loc = newLoc;
                //Set the target to be whatever the pointer is hovering
                p.target = Q.getTargetAt(p.loc[0],p.loc[1]);
                //Sends an event to move confirm that the pointer has moved
                //Also moves the pointer on all other clients
                Q.sendPlayerEvent(this.p.user.p.file,{playerId:this.p.user.p.playerId,funcs:["confirmPointerInput"],props:[{loc:p.loc,time:input.time}]});
            }
        },
        processInputs:function(inputs){
            var p = this.p;
            //Don't process the inputs while moving
            if(!this.p.stepping){
                if(inputs['interact']){
                    this.trigger("inputsInteract");
                    return;
                } else if(inputs['back']){
                    this.trigger("inputsBack");
                    return;
                }
                this.checkInputs(inputs);
                //console.log(this.p.loc)
            }
        },
        step:function(dt){
            var inputs = this.p.user.p.inputs;
            if(inputs.length){
                //Process the least recent input
                this.processInputs(inputs[0]);
                this.p.user.p.inputs.splice(0,1);
            }
        }
    });
    //The menu that allows the player to do things on his turn
    Q.Sprite.extend("Menu",{
        init:function(p){
            this._super(p,{
                attackSelected:null,
                itemSelected:null
            });
            this.p.selectorNum = 0;
            this.initializeMenu();
        },
        initializeMenu:function(){
            this.p.menu = {
                display:[
                    "Attack",
                    "Move",
                    "Items",
                    "Status",
                    "Check Ground",
                    "Re-do",
                    "End Turn",
                    "Exit"
                ],
                funcs:[
                    "getAttacks",
                    "move",
                    "getItems",
                    "showStatus",
                    "checkGround",
                    "redo",
                    "endTurn",
                    "exitMenu"
                ],
                backFunc:"exitMenu"
            };
        },
        //Gets the attacks for the menu
        getAttacks:function(){
            var attacks = this.p.player.p.attacks;
            var display = [];
            var funcs = [];
            for(var i=0;i<attacks.length;i++){
                display.push(attacks[i][0]);
                funcs.push("selectAttack");
            }
            this.p.menu = {display:display,funcs:funcs,backFunc:"initializeMenu"};
        },
        //When the user selects an attack, close the menu and show the attack pointer
        selectAttack:function(attack){
            this.p.player.createPointer(attack);
            this.p.player.p.menu=null;
            this.destroy();
        },
        //Shows the movement grid, hides the menu, and creates the movement pointer
        move:function(){
            this.p.player.createPointer(this.p.player.p.stats.movement);
            this.p.player.p.menu=null;
            this.destroy();
        },
        //Gets the items for the menu
        getItems:function(){
            var items = this.p.player.p.items;
            var display = [];
            var funcs = [];
            for(var i=0;i<items.length;i++){
                display.push(items[i][0]);
                funcs.push("selectItem");
            }
            this.p.menu = {display:display,funcs:funcs,backFunc:"initializeMenu"};
        },
        //Load the use item text in the menu
        selectItem:function(item){
            if(item){
                this.p.itemSelected=item;
            }
            this.p.menu =  {
                display:[
                    "Use",
                    "Move",
                    "Toss"
                ],
                funcs:[
                    "useItem",
                    "moveItem",
                    "askTossItem"
                ],
                backFunc:"getItems"
            };
        },
        //When the player selects use item, do the item effect and lower the item amount by 1
        useItem:function(item){
            
        },
        //Set movingItem to true which makes the next interact change the item location in the player's items property
        //Pressing back just sets movingItem to false
        moveItem:function(item){
            
        },
        //Load the yes/no menu for confirming if the user intends to toss this item
        askTossItem:function(item){
            this.p.menu =  {
                display:[
                    "No",
                    "Yes"
                ],
                funcs:[
                    "goBack",
                    "tossItem"
                ],
                backFunc:"selectItem"
            };
        },
        //Minus the inventory by one for this item and load the items screen
        tossItem:function(){
            
        },
        //Creates the status card and closes the menu
        showStatus:function(){
            
        },
        //Closes the menu and loads the interaction text for what happens when checking the ground
        checkGround:function(){
            
        },
        //Resets the player loc to the startLoc and closes then opens the menu again
        redo:function(){
            this.p.selectorNum=0;
            this.initializeMenu();
        },
        //Loads up the direction triangle that allows the player to select a direction before ending the turn
        endTurn:function(){
            
        },
        //Closes the menu and opens the selection pointer
        //The selection pointer hovers squares and provides information about that square
        exitMenu:function(){
            this.p.player.createPointer();
            this.p.player.p.menu=null;
            this.destroy();
        },
        goForward:function(){
            this[this.p.menu.funcs[this.p.selectorNum]](this.p.menu.display[this.p.selectorNum]);
            this.p.selectorNum = 0;
        },
        goBack:function(){
            this[this.p.menu.backFunc]();
            this.p.selectorNum = 0;
        },
        processInputs:function(inputs){
            if(inputs['up']){
                this.p.selectorNum--;
                if(this.p.selectorNum<0){
                    this.p.selectorNum=this.p.menu.funcs.length-1;
                }
            } else if(inputs['down']){
                this.p.selectorNum++;
                if(this.p.selectorNum>this.p.menu.funcs.length-1){
                    this.p.selectorNum=0;
                }
            } else if(inputs['interact']){
                this.goForward();
            } else if(inputs['back']){
                this.goBack();
            }
           // console.log(this.p.selectorNum,this.p.menu.display[this.p.selectorNum])
        },
        executeFunc:function(func,props){
            this[func](props);
        },
    });
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
            for(var y=0;y<width;y++){
                data[y] = [];
                for(var x=0;x<height;x++){
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
    Q.initializePlayerLocs=function(locs){
        Q("Participant",1).each(function(){
            for(var i=0;i<locs.length;i++){
                if(locs[i][2]===this.p.playerId){
                    this.p.loc = [locs[i][0],locs[i][1]];
                    this.p.dir = locs[i][3];
                }
            }
        });
    };
    Q.startTurn=function(turnOrder,fileName){
        var obj = Q("Participant",1).items.filter(function(ob){
            return ob.p.playerId === turnOrder[0];
        })[0];
        //If it's AI's turn
        if(Q._isString(turnOrder[0])){
            //Keep a record of the filename and current turn order in this object
            obj.p.fileName = fileName;
            obj.p.turnOrder = turnOrder;
            obj.add("AI");
        } 
        //If it's player's turn
        else {
            obj.createMenu();
            return turnOrder[0];
        }
    };
    Q.attackFuncs = {
        //Calculate extra damage from type advantage/disadvantage
        getTypeModifiers:function(target,attack){
            var modifier = 1;
            return modifier;
        },
        //See if the attack has STAB
        getSTAB:function(user,attack){
            var stab = 1;
            return stab;
            for(i=0;i<user.p.types.length;i++){
                //If the attack is the same type as one of the user's types
                if(attack.type===user.p.types[i]){
                    stab=1.3;
                }
            }
            return stab;
        },
        getOther:function(){
            
        },
        //Calculate total damage dealt with an attack
        calculateDamage:function(user,target,attack,facingValue){
            var offence = user.p.modStats[attack.category+"_ofn"];
            var defense = target.p.modStats[attack.category+"_dfn"];
            var baseDamage = parseInt(attack.power);
            var modifier = 1;
            var modText={text:[]};
            //TODO Need to include ability into STAB
            var stab = 1;//Q.attackFuncs.getSTAB(user,attack);
            var typeMod = 1;//Q.attackFuncs.getTypeModifiers(target,attack);
            switch(true){
                case typeMod===0:
                    //Doesn't affect
                    modText.text.push(attack.name+" doesn't affect "+target.p.name+"...");
                    var noEffect=true;
                    break;
                case typeMod<1:
                    //Not very effective
                    modText.text.push(attack.name+" is not very effective against "+target.p.name+"...");
                    break;
                case typeMod>1:
                    //Super effective
                    modText.text.push(attack.name+" is super effective against "+target.p.name+"!");
                    break;
                default:
                    //Normal effective
                    break;
            }
            //Check for crit
            var doCrit = Math.floor(Math.random()*20);
            //We crit!
            var crit=1;
            if(doCrit<=2){
                crit=1.5;
                modText.text.push("Critical hit!");
            }
            //other is Weather, Held items, Stat boosts, etc...
            var other = 1;
            //Q.attackFuncs.getOther();
            var rand = (85+Math.ceil(Math.random()*15))/100;
            modifier = stab*typeMod*crit*other*rand;
            var damage = (((2*user.p.level+10)/250)*(offence/defense)*baseDamage+2)*modifier;
            //Divide in the direction the participants are facing.
            damage/=facingValue;
            //Make sure we do at least 1 damage, unless it doesn't affect
            if(damage<1&&!noEffect){damage=1;};
            return {damage:Math.round(damage),modText:modText};
        },
        
        effects:{
            stat:function(props,target,user){
                var keys = Object.keys(props);
                var text=[];
                for(ii=0;ii<keys.length;ii++){
                    target.p.statsModified[keys[ii]]+=props[keys[ii]];
                    if(target.p.statsModified[keys[ii]]>0){
                        target.p.modStats[keys[ii]]=Math.round(target.p[keys[ii]]*((2+target.p.statsModified[keys[ii]])/2));
                    } else if(target.p.statsModified[keys[ii]]<0){
                        target.p.modStats[keys[ii]]=Math.round(target.p[keys[ii]]*(2/Math.abs(target.p.statsModified[keys[ii]]-2)));
                    }
                    text.push(target.p.name+"'s "+keys[ii]+" was decreased to "+target.p.modStats[keys[ii]]+".");
                }
                return text;
            },
            buff:function(buff,target,user){
                var text=[];
                //Add the buff to the target
                switch(buff){
                    //BUFFS
                    //covers endure, detect
                    case "braced":
                        target.p.buffs.push({name:buff,turns:1});
                        text.push(target.p.name+" braced for impact!");
                        break;
                    //DEBUFFS
                    //covers foresight, lock on
                    case "identified":
                        target.p.debuffs.push({name:buff,turns:5});
                        text.push(target.p.name+" was identified.");
                        break;
                    //covers bind, wrap, 
                    case "bind":
                        //Between 2 and 5
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand,boundBy:user});
                        user.p.buffs.push({name:"binding",turns:rand,target:target});
                        text.push(target.p.name+" was bound.");
                        break;
                    case "poisoned":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was poisoned.");
                        break;
                    //toxic
                    case "toxic":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was badly poisoned.");
                        break;
                    //Leech seed
                    case "seeded":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was seeded.");
                        break;
                    case "paralyzed":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was paralyzed.");
                        break;
                    case "burned":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was burned.");
                        break
                    case "confused":
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand});
                        text.push(target.p.name+" was confused.");
                        break;
                    case "frozen":
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand});
                        text.push(target.p.name+" was frozen.");
                        break;
                    case "attracted":
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand});
                        user.p.buffs.push({name:"attracting",turns:rand,target:target});
                        text.push(target.p.name+" was infatuated.");
                        break;
                    case "taunted":
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand});
                        text.push(target.p.name+" was taunted.");
                        break;
                }
                return text;
        
            }
        }
    };
    //This is the global leveldata object that all files will reference when getting game data
    //Nothing here should be altered
    Q.Evented.extend("LevelData",{
        init:function(){
            //Get all of the level data
            this.levelData=this.setAllLevelData();
            
        },
        createPlacementPointer:function(playerId,playerLocs){
            var user = Q("User",1).items.filter(function(obj){
                return obj.p.playerId===playerId;
            })[0];
            var pointer = user.createPointer("placement",playerLocs[0]);
            pointer.p.playerLocs = playerLocs;
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
                            {name:"Old Wizard",className:"Pyromancer",loc: [14,13],level: 100,dir: "left",traits:["aggressive","genius"],final:[[14,16],"up"]},
                            {name:"Young Wizard",className:"Pyromancer",loc: [13,13],level: 100,dir: "right",traits:["aggressive","genius"],final:[[13,16],"up"]},
                        ]
                    ],
                    enemies:[
                        [
                            {className: "Fighter",loc: [9,10],level: 1,dir: "right",final:[[9,10],"down"]},
                            {className: "Fighter",loc: [9,11],level: 1,dir: "right",final:[[9,11],"down"]},
                            {className: "Fighter",loc: [12,9],level: 1,dir: "down",final:[[12,9],"down"]},
                            {className: "Fighter",loc: [14,9],level: 1,dir: "down",final:[[14,9],"down"]},
                            {className: "Fighter",loc: [16,10],level: 1,dir: "left",final:[[16,10],"left"]}
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
                            {name:"Old Wizard",className:"Pyromancer",loc: [36,6],level: 100,dir: "left",traits:["aggressive","genius"],final:[[13,15],"left"]},
                            {name:"Young Wizard",className:"Pyromancer",loc: [36,7],level: 100,dir: "left",traits:["aggressive","genius"],final:[[13,16],"left"]}
                        ]
                    ],
                    enemies:[
                        [
                            {name:"Obama",className: "Fighter",loc: [15,6], level: 20, dir:"right",traits:["aggressive","genius"],final:[[17,14],"left"]}
                        ],
                        [
                            {className: "Fighter",loc: [10,17],level: 2,dir: "up",final:[[10,14],"right"]},
                            {className: "Fighter",loc: [10,17],level: 2,dir: "up",final:[[10,15],"right"]},
                            {className: "Fighter",loc: [10,17],level: 2,dir: "up",final:[[10,16],"right"]},
                            
                            {className: "Fighter",loc: [19,17],level: 2,dir: "up",final:[[18,15],"left"]},
                            {className: "Fighter",loc: [19,17],level: 2,dir: "up",final:[[18,16],"left"]},
                       
                            {className: "Fighter",loc: [19,13],level: 2,dir: "down",final:[[18,14],"left"]},
                        
                            {className: "Fighter",loc: [14,11],level: 2,dir: "right",final:[[15,13],"down"]},
                            {className: "Fighter",loc: [14,11],level: 2,dir: "right",final:[[16,13],"down"]},
                            {className: "Fighter",loc: [14,11],level: 2,dir: "right",final:[[17,13],"down"]}
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
                            //{name:"Old Wizard",className:"Pyromancer",loc: [14,16],level: 100,dir: "left",traits:["aggressive","genius"],final:[[14,16],"up"]},
                            {name:"Young Wizard",className:"Pyromancer",loc: [13,16],level: 100,dir: "left",traits:["aggressive","genius"],final:[[13,16],"up"]},
                        ]
                    ],
                    enemies:[
                        [/*
                            {className: "Fighter",loc: [11,9],level: 2,dir: "up",final:[[9,10],"down"]},
                            {className: "Fighter",loc: [12,9],level: 2,dir: "up",final:[[11,10],"down"]},
                            {className: "Fighter",loc: [13,9],level: 2,dir: "up",final:[[13,10],"down"]}*/
                            
                        ],
                        [
                            {name:"Obama",className: "Fighter",loc: [15,6],level: 20,dir:"right",final:[[13,12],"down"]}
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