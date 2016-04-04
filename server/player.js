var quintusServerPlayer = function(Quintus,io) {
"use strict";
Quintus.ServerPlayer = function(Q) {
Q.component("endTurnControls",{
    extend:{
        processInputs:function(inputs){
            if(inputs['interact']){
                this.p.user.confirmedEndTurn();
            } else {
                var found = false;
                if(inputs['up']){
                    this.p.dir = "up";
                    found = true;
                } else if(inputs['right']){
                    this.p.dir = "right";
                    found = true;
                } else if(inputs['down']){
                    this.p.dir = "down";
                    found = true;
                } else if(inputs['left']){
                    this.p.dir = "left";
                    found = true;
                }
                if(found){
                    Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["playStand"],props:[this.p.dir]});
                }
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
    }
});
//dirControls is the controls that are used when confirming the player location at the start of the battle.
Q.component("dirControls",{
    extend:{
        processInputs:function(inputs){
            //If the user confirms that this is the correct location
            if(inputs['interact']){
                //Set this user to be ready.
                this.p.user.p.ready=true;
                var notReady = Q.state.get("files")[this.p.user.p.file.name].users.filter(function(obj){
                    return !obj.p.ready;
                })[0];
                //If there's at least one user not ready
                if(notReady){
                    this.p.user.showReady();
                    Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["showReady"],props:[]});
                }
                //If all users are ready at this point
                else {
                    var saveData = Q.state.get("files")[this.p.user.p.file.name];
                    saveData.allNotReady();
                    saveData.battleStart();
                    saveData.setAllUsersPlayers();
                    //Start the battle now that all players are placed
                    //Q.initializePlayerLocs(saveData.playersPlacedAt);
                    //Will get AI, or respond that it's a player's turn
                    var response = Q.startTurn(saveData.turnOrder,saveData.file.name);
                    io.sockets.in(saveData.file.name).emit("firstTurn",{response:response,turnOrder:saveData.turnOrder});
                }
            } 
            //If the user presses 'back', go back to the pointer phase
            else if(inputs['back']){
                var levelData = Q.state.get("levelData");
                var loc = [this.p.loc[0],this.p.loc[1]];
                var p = this.p;
                var saveData = Q.state.get("files")[this.p.user.p.file.name];
                saveData.removePlacedPlayer(this.p.user.p.playerId);
                this.p.user.p.ready = false;
                levelData.createPlacementPointer(this.p.user.p.playerId,Q.state.get("files")[this.p.user.p.file.name].scene.battle.playerLocs,loc);
                Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["hidePlayer","createPointer"],props:[false,{loc:loc,name:this.p.user.p.name}]});
                
            } 
            //If the user presses a direction, change the direction of the player
            else {
                var found = false;
                if(inputs['up']){
                    this.p.dir = "up";
                    found = true;
                } else if(inputs['right']){
                    this.p.dir = "right";
                    found = true;
                } else if(inputs['down']){
                    this.p.dir = "down";
                    found = true;
                } else if(inputs['left']){
                    this.p.dir = "left";
                    found = true;
                }
                if(found){
                    Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["playStand"],props:[this.p.dir]});
                }
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
    }
});
//The user object that is created for every player on connection
Q.Sprite.extend("User",{
    init:function(p){
        this._super(p,{
            ready:false,
            //Obj is the current object that the user is interacting with
            //Pointer, PlayerMenu, InfoTextBox
            obj:null,
            inputs:[]
        });
        var data = this.p.userData;
        this.p.name = data.name;
        this.p.stats = data.stats;
        this.p.level = data.level;
        this.p.exp = data.exp;
        this.p.className = data.className;
        this.p.traits = data.traits;
        this.p.attacks = data.attacks;
        this.p.file = data.file;
        //The below code is for debugging. It will count up as long as the user exists(game is still running)
        /*
        var num=0;
        this.on("step",function(){
            console.log(num)
            num++;
        });*/
    },
    //After the player has been placed, if the user hits back while others are still placing
    removeReady:function(){
        this.p.placedPlayer = false;
        var loc = [this.p.obj.p.loc[0],this.p.obj.p.loc[1]];
        this.checkDestroyObj();
        var pointer = this.createPointer(loc,{name:this.p.name});
        pointer.p.playerLocs = this.p.playerLocs;
        pointer.add("placementControls");
    },
    //What happens when this player is ready and there are still other players that are not ready
    showReady:function(){
        var loc = [this.p.obj.p.loc[0],this.p.obj.p.loc[1]];
        this.checkDestroyObj();
        this.createPointer(loc,{name:this.p.name});
        this.p.obj.add("freeControls");
    },
    checkDestroyObj:function(){
        if(this.p.obj&&this.p.obj.isA("Participant")){
            //Only move player if he has not been placed
            if(!this.p.placedPlayer){
                this.p.obj.p.loc=[-1,-1];
                this.p.obj.setPos(this.p.obj.p.loc);
            }
            this.p.obj.del("dirControls");
        } 
        else if(this.p.obj){
            this.p.obj.destroy();
            this.p.obj = null;
        }
    },
    placePlayer:function(loc){
        this.checkDestroyObj();
        this.p.placedPlayer = true;
        var playerId = this.p.playerId;
        this.p.obj = Q("Participant",1).items.filter(function(obj){
            return obj.p.playerId===playerId;
        })[0];
        if(!this.p.obj.p.dir){this.p.obj.p.dir="down";};
        this.p.obj.p.user = this;
        this.p.obj.setPos(loc);
        this.p.obj.add("dirControls");
    },
    //Creates a pointer that can be moved
    createPointer:function(loc,props){
        this.checkDestroyObj();
        this.p.obj = Q.stage(1).insert(new Q.Pointer({user:this,loc:loc}));
        if(props){
            var keys = Object.keys(props);
            for(var i=0;i<keys.length;i++){
                this.p.obj.p[keys[i]]=props[keys[i]];
            }
        }
        this.p.obj.p.name = this.p.obj.p.name.length?this.p.obj.p.name:this.p.name;
        return this.p.obj;
    },
    //Creates the player menu that can be navigated
    createPlayerMenu:function(){
        this.checkDestroyObj();
        var id = this.p.playerId;
        var player = Q("Participant",1).items.filter(function(obj){
            return obj.p.playerId===id;
        })[0];
        this.p.obj = Q.stage(1).insert(new Q.PlayerMenu({user:this,player:player}));
    },
    //Creates the bottom text box that can be cycled through
    createInfoTextBox:function(){
        
    },
    createMoveGuide:function(loc,move){
        //Gets the guide paths by looping through the possible locations and testing the the path
        var movePaths = this.p.player.getMoveRange(loc,move);
        this.p.player.p.movePaths = movePaths;
    },
    loadAttackPrediction:function(attack,target){
        this.checkDestroyObj();
        this.p.obj = Q.stage(1).insert(new Q.AttackPrediction({user:this,attack:attack,target:target}));
    },
    //Calculate damage dealt etc.. and show the interaction on all clients
    useAttack:function(attack,target){
        this.checkDestroyObj();
        var interaction = this.p.player.attackTarget({targetId:target.p.playerId,attack:[attack.id]});
        interaction.push({text:[{obj:this.p.playerId,func:"endTurnControls",props:[]}]});
        Q.sendPlayerEvent(this.p.file.name,{playerId:this.p.playerId,funcs:["useAttack"],props:[interaction]});
    },
    endTurnControls:function(){
        this.checkDestroyObj();
        this.p.obj = this.p.player;
        this.p.obj.add("endTurnControls");
        Q.sendPlayerEvent(this.p.file.name,{playerId:this.p.playerId,funcs:["endTurn"],props:[]});
    },
    confirmedEndTurn:function(){
        this.p.inputs = [];
        this.p.obj.del("endTurnControls");
        this.checkDestroyObj();
        var t = this;
        setTimeout(function(){
            Q.sendPlayerEvent(t.p.file.name,{playerId:t.p.playerId,funcs:["confirmedEndTurn"],props:[]});
        },250);
    },
    //Run when it's this user's turn
    startTurn:function(){
        this.createPlayerMenu();
    }
});

//Common player is shared between all ServerAI and ServerPlayer
//It gives functions for 
//using astar to find the closest path
//
Q.component("commonPlayer",{
    added:function(){

    },
    extend: {
        endTurn:function(endDir){
            return {text:[{obj:"Q",func:"addViewport",props:this.p.playerId},{obj:this.p.playerId,func:"faceDirection",props:endDir},{obj:this.p.playerId,func:"endTurn"}]};
        },
        attackTarget:function(props){
            var targetIds = props.targetId;
            var attackInfo = props.attack;
            var endDir = props.endDir;
            var targets = [];
            var target = Q("Participant",1).items.filter(function(obj){
                return obj.p.playerId===targetIds;
            })[0];
            if(target){targets.push(target);};
            var attack = Q.state.get("attacks").filter(function(obj){
                return obj.id===attackInfo[0];
            })[0];
            //Set the direction we need to be facing
            this.faceTarget(targets[0].p.loc);
            var interaction = [
                {text:[
                    {obj:this.p.playerId,func:"faceTarget",props:{x:targets[0].p.x,y:targets[0].p.y}},
                    {obj:this.p.playerId,func:"playAttack",props:this.p.dir},
                    this.p.name+" used "+attack.name+". "
                ]}
                
            ];
            //Do this for all targets
            for(var i_targ=0;i_targ<targets.length;i_targ++){
                var target = targets[i_targ];
                //Random number between 1 and 100 
                var rand = Math.floor(Math.random()*100)+1;
                var hit;
                var t = this;
                var facingValue = this.compareDirection(t,target);
                rand*=facingValue;
                rand = Math.floor(rand);
                //If the attack hits
                if(rand<=attack.accuracy){
                    //If the attack does damage
                    if(attack.power>0){
                        //Figure out how much damage this attack does 
                        var damageCalc = Q.attackFuncs.calculateDamage(this,target,attack,facingValue);
                        //Show the attack text
                        interaction.push(damageCalc.modText);
                        //We hit!
                        if(damageCalc.damage>0){
                            interaction.push({text:[{obj:"Q",func:"playSound",props:"attack.mp3"},"Hit "+target.p.name+" for "+damageCalc.damage+" damage!"]});
                            target.lowerHp(damageCalc.damage);
                            //If the target was defeated
                            if(target.p.modStats.hp<=0){
                                interaction.push({text:[{obj:target.p.playerId,func:"dead"},target.p.name+" died."]});
                                target.p.defeated=true;
                                target.removeFromTurnOrder(target.p.playerId);
                                target.checkDrop();
                                var expText = target.giveExp();
                                if(expText&&expText.text.length>0){
                                    interaction.push(expText);
                                }
                                target.destroy();
                            }
                        }
                    }
                    
                    //If the power is 0, then it doesn't do damage so it is a stat
                    //Also check for the additional effect here
                    if(attack.effect.length>0){
                        var rand = Math.ceil(Math.random()*100);
                        //Check if we get this additional effect
                        if(rand<=attack.effect[1]){
                            var effect = attack.effect;
                            //Who are we targeting
                            var effectTarget,effectUser;
                            switch(effect[0]){
                                case "both":
                                    effectTarget=target;
                                    effectUser = this;
                                    break;
                                case "enemy":
                                    effectTarget=target;
                                    break;
                                case "self":
                                    effectTarget=target;//Maybe combine these since you will be 'targeting' yourself
                                    break;
                            }
                            var effectText = Q.attackFuncs.effects[effect[2]](effect[3],effectTarget,effectUser);

                            if(effectText.length>0){
                                for(kk=0;kk<effectText.length;kk++){
                                    //interaction.push({playSound:"attack.mp3"},effectText[kk]);
                                }
                            }
                        }
                    }
                    hit = true;
                }
                //Missed
                else {
                    interaction.push({text:[{obj:"Q",func:"playSound",props:"attack.mp3"},"Missed "+target.p.name+"..."]});
                    hit = false;
                }
            }
            
            //Finish up with the functions that are called after the text is done
            //endDir will be set for AI
            if(endDir){
                var endFuncs = this.endTurn(endDir);
                interaction.push(endFuncs);
            }
            return interaction;
        },
        //End Attacking
        compareDirection:function(user,target){
            var getDirection = function(dir,dirs){
                for(var i=0;i<dirs.length;i++){
                    if(dir===dirs[i]){
                        return i;
                    }
                }
            };
            var checkBounds = function(num){
                if(num>=dirs.length){
                    return num-dirs.length;
                }
                return num;
            };
            //0.50 is from behind
            //0.75 is from back-side
            //1.00 is side
            //1.25 is from front-side
            //1.50 is from front
            //Set values that we will multiply accuracy and power by later on
            var back = 0.5;
            var side = 1;
            var front = 1.5;
            
            //Array of possible directions clockwise from 12 o'clock
            var dirs = ["up", "right", "down", "left"];
            //Get the number for the user dir
            var userDir = getDirection(user.p.dir,dirs);
            //Get the number for the target dir
            var targetDir = getDirection(target.p.dir,dirs);
            //An array of the values (also clockwise from 12 o'clock)
            //EX:
            //if both user and target are 'Up', they will both be 0 and that will give the back value (since they are both facing up, the user has attacked from behind).
            var values = [back,side,front,side];
            for(var j=0;j<values.length;j++){
                //Make sure we are in bounds, else loop around to the start of the array
                if(checkBounds(userDir+j)===targetDir){
                    //If we've found the proper value, return it
                    return values[j];
                }
            }
        },
        getNewDir:function(xDif,yDif){
            var newDir = "";
            switch(true){
                case yDif<0:
                    newDir+="up";
                    break
                case yDif>0:
                    newDir+="down";
                    break;
            }
            if(newDir.length===0){
                switch(true){
                    case xDif<0:
                        newDir+="left";
                        break
                    case xDif>0:
                        newDir+="right";
                        break;
                }
            }
            return newDir;
        },
        compareTargetLoc:function(loc,tarLoc){
            return this.getNewDir(tarLoc[0]-loc[0],tarLoc[1]-loc[1]);
        },
        faceDirection:function(dir){
            this.p.dir = dir;
        },
        faceTarget:function(tarLoc){
            this.p.dir = this.getNewDir(tarLoc[0]-this.p.loc[0],tarLoc[1]-this.p.loc[1]);
        },
        lowerHp:function(dmg){
            this.p.modStats.hp-=dmg;
        },
        removeFromTurnOrder:function(playerId){
            var turnOrder = this.p.turnOrder;
            for(var i=0;i<turnOrder.length;i++){
                if(turnOrder[i]===playerId){
                    turnOrder.splice(i,1);
                    return;
                }
            }
        },
        //If this object was defeated, drop its items on the ground
        checkDrop:function(){
            if(this.p.items){
                //this.dropItems();
            }
        },
        //Give this object some exp
        giveExp:function(){
            
        },
        //Gets the movement locs when a user has selected 'move' from the menu
        getMoveRange:function(loc,mov){
            var minTile = 0;
            var maxTileRow = Q.state.get("mapHeight");
            var maxTileCol = Q.state.get("mapWidth");
            var rows=mov*2+1,
                cols=mov*2+1,
                tileStartX=loc[0]-mov,
                tileStartY=loc[1]-mov;
            var dif=0;

            if(loc[0]-mov<minTile){
                dif = cols-(mov+1+loc[0]);
                cols-=dif;
                tileStartX=mov+1-cols+loc[0];
            }
            if(loc[0]+mov>=maxTileCol){
                dif = cols-(maxTileCol-loc[0]+mov);
                cols-=dif;
            }
            if(loc[1]-mov<minTile){
                dif = rows-(mov+1+loc[1]);
                rows-=dif;
                tileStartY=mov+1-rows+loc[1];
            }
            if(loc[1]+mov>=maxTileRow){
                dif = rows-(maxTileRow-loc[1]+mov);
                rows-=dif;
            }

            if(rows+tileStartY>=maxTileRow){rows=maxTileRow-tileStartY;};
            if(cols+tileStartX>=maxTileCol){cols=maxTileCol-tileStartX;};
            var movTiles=[];
            //Get all possible move locations that are within the bounds
            var graph = new Q.Graph(this.getWalkMatrix());
            for(var i=tileStartX;i<tileStartX+cols;i++){
                for(var j=tileStartY;j<tileStartY+rows;j++){
                    if(graph.grid[i][j].weight<10000){
                        movTiles.push(graph.grid[i][j]);
                    }
                }
            }
            //If there is at least one place to move
            if(movTiles.length){
                var guidePaths = [];
                //Loop through the possible tiles
                for(var i=0;i<movTiles.length;i++){
                    var path = this.getPath(loc,[movTiles[i].x,movTiles[i].y],"maxScore",mov);
                    var pathCost = 0;
                    for(var j=0;j<path.length;j++){
                        pathCost+=path[j].weight;
                    }
                    if(path.length>0&&path.length<=mov&&pathCost<=mov){
                        guidePaths.push(path);
                    }
                }
                return guidePaths;
            //If there's nowhere to move
            } else {
                return [];
            }
        },
        //Gets the walkMatrix that is used in astar to determine the best possible walk path
        getWalkMatrix:function(){
            function getWalkable(){
                //If we want to add different costs for each tile, eventually run a function to get the cost from the tile type here.
                return Q.getTileCost(tiles[j_walk][i_walk]);
            }
            var tiles=Q.topTiles.p.tiles;
            var cM=[];
            if(tiles){
                for(var i_walk=0;i_walk<tiles[0].length;i_walk++){
                    var costRow = [];
                    for(var j_walk=0;j_walk<tiles.length;j_walk++){
                        var cost = getWalkable();
                        var objOn=false;
                        objOn = Q.getTargetAt(i_walk,j_walk);
                        //Allow walking over allies
                        if(objOn&&objOn.p.ally===this.p.ally){objOn=false;};
                        //If there's still no enemy on the sqaure, get the tileCost
                        if(!objOn){
                            costRow.push(cost);
                        } else {
                            costRow.push(10000);
                        }

                    }
                    cM.push(costRow);
                }
            }
            return cM;
         },
        //Gets the fastest path to a certain location
        //loc   - the current location of the object that is moving
        //toLoc - [x,y]
        //prop  - search using a maximum cost (movement uses maximum cost during battles)
        //score - if prop:'maxScore' is set, this the maxScore. 
        getPath:function(loc,toLoc,prop,score){
            //Set up a graph for this movement
            var graph = new Q.Graph(this.getWalkMatrix());
            var start = graph.grid[loc[0]][loc[1]];
            var end = graph.grid[toLoc[0]][toLoc[1]];
            var result;
            if(prop==="maxScore"){
                result = Q.astar.search(graph, start, end,{maxScore:score});
            } else {
                result = Q.astar.search(graph, start, end);
            }
            return result;
        },
    }
});
//Holds all players, enemies, and allies
Q.Sprite.extend("Participant",{
    init:function(p){
        this._super(p,{
            
        });
        //Give the participant any shared functions. 
        //Players, enemies, and allies do pretty much the same things since I moved all player controls to the User object.
        this.add("commonPlayer");
        //If this is a user controlled participant, we need to get the data from the user
        if(this.p.user){
            var u = this.p.user.p;
            this.p.name = u.name;
            this.p.stats = u.stats;
            this.p.level = u.level;
            this.p.exp = u.exp;
            this.p.className = u.className;
            this.p.traits = u.traits;
            
            var attacks = u.attacks;
            this.p.attacks = [];
            for(var i=0;i<attacks.length;i++){
                if(attacks[i].length===0){continue;};
                this.p.attacks.push([attacks[i],1]);
            }
            this.p.file = u.file;
            this.p.gender = u.gender;
            this.p.modStats = {
                hp:u.stats.hp,
                phys_ofn:u.stats.phys_ofn,
                phys_dfn:u.stats.phys_dfn,
                spec_ofn:u.stats.spec_ofn,
                spec_dfn:u.stats.spec_dfn,
                agility:u.stats.agility,

                strength:u.stats.strength,
                intellect:u.stats.intellect,
                awareness:u.stats.awareness,
                willpower:u.stats.willpower,
                persuasion:u.stats.persuasion,
                fate:u.stats.fate,
                
                movement:u.stats.movement
            };
            this.p.sheet = u.sheet?u.sheet:u.className;
            this.p.items = [];
            this.p.text = "Hello, I'm "+u.name+"!";
            
            this.p.stats.movement = 8;
            this.p.ally="Player";
        } 
        //If this is AI
        else {
            var data = this.p.data;
            //Fill the p with the levelData data
            var keys = Object.keys(data);
            for(var i_ai=0;i_ai<keys.length;i_ai++){
                this.p[keys[i_ai]]=data[keys[i_ai]];
            }
            var classData = this.p.classData;
            //Fill the p with the classData data
            var keys = Object.keys(classData);
            for(var i_ai=0;i_ai<keys.length;i_ai++){
                this.p[keys[i_ai]]=classData[keys[i_ai]];
            }
            this.p.name = this.p.data.name?this.p.data.name:classData.name+" "+this.p.playerId;
            delete(this.p.data);
            delete(this.p.classData);
            //Generate some random iv's
            this.p.iv = this.generateIvs();
            //Now that we have the base stats and ivs, generate the stats
            var p = this.p;
            p.stats = {
                hp:(p.base.hp*p.level*2)+p.iv.hp,
                phys_ofn:((p.base.phys_ofn)/2)*p.level*p.iv.phys_ofn*2,
                phys_dfn:((p.base.phys_dfn)/2)*p.level*p.iv.phys_dfn*2,
                spec_ofn:((p.base.spec_ofn)/2)*p.level*p.iv.spec_ofn*2,
                spec_dfn:((p.base.spec_dfn)/2)*p.level*p.iv.spec_dfn*2,
                agility:((p.base.agility)/2)*p.level*p.iv.agility*2,

                strength:((p.base.strength)/2)*p.level*p.iv.strength*2,
                intellect:((p.base.intellect)/2)*p.level*p.iv.intellect*2,
                awareness:((p.base.awareness)/2)*p.level*p.iv.awareness*2,
                willpower:((p.base.willpower)/2)*p.level*p.iv.willpower*2,
                persuasion:((p.base.persuasion)/2)*p.level*p.iv.persuasion*2,
                fate:((p.base.fate)/2)*p.level*p.iv.fate*2,
                
                movement:8
            };
            p.modStats = {
                hp:p.stats.hp,
                phys_ofn:p.stats.phys_ofn,
                phys_dfn:p.stats.phys_dfn,
                spec_ofn:p.stats.spec_ofn,
                spec_dfn:p.stats.spec_dfn,
                agility:p.stats.agility,

                strength:p.stats.strength,
                intellect:p.stats.intellect,
                awareness:p.stats.awareness,
                willpower:p.stats.willpower,
                persuasion:p.stats.persuasion,
                fate:p.stats.fate,
                
                movement:p.stats.movement
            };
            if(!p.traits){p.traits=["aggressive"];};
            //Need to generate attack levels
            var attacks = [];
            //Loop through the attacks to get the level and bonus stat type
            for(var i_at=0;i_at<p.attacks.length;i_at++){
                var attack = p.attacks[i_at];
                var stats = p.stats;
                var level = p.level;
                var attackData = p.attackData;
                var info,atkLevel;
                //If there's an attack in this slot
                if(attack.length>0){
                    //Get the attack info
                    info = attackData.filter(function(obj){return obj.id===attack;})[0];
                    //Figure out which is the bonus stat for this attack
                    var stat = info.stat_type;
                    //Calculate the AI's attcak level
                    atkLevel = Math.floor(Math.sqrt(level*stats[stat]));
                    attacks.push([info.id,atkLevel]);
                }
            }
            p.attacks=attacks;
            delete(this.p.attackData);
            //p.loc = p.final[0];
            //p.dir = p.final[1];
            this.add("AI");
        }
    },
    generateIvs:function(){
        return {
            hp:Math.ceil(Math.random()*10),
            phys_ofn:Math.ceil(Math.random()*10),
            phys_dfn:Math.ceil(Math.random()*10),
            spec_ofn:Math.ceil(Math.random()*10),
            spec_dfn:Math.ceil(Math.random()*10),
            agility:Math.ceil(Math.random()*10),

            strength:Math.ceil(Math.random()*10),
            intellect:Math.ceil(Math.random()*10),
            awareness:Math.ceil(Math.random()*10),
            willpower:Math.ceil(Math.random()*10),
            persuasion:Math.ceil(Math.random()*10),
            fate:Math.ceil(Math.random()*10)
        };
    },
    checkValidTarget:function(target,attack){
        var ally = this.p.ally;
        switch(attack.targets){
            case "self":
                if(this.p.playerId===target.p.playerId){return true;};
                break;
            case "enemy":
                if(ally!==target.p.ally){
                    return true;
                }
                break;
            case "ally":
                if(ally===target.p.ally){
                    return true;
                }
                break;
            case "all":
                return true;
                break;
        }
        return false;
    },
    setPos:function(loc){
        this.p.loc = loc;
        var pos = Q.setXY(loc[0],loc[1]);
        this.p.x = pos[0];
        this.p.y = pos[1];
    }
});

return Q;
};
};
module.exports = quintusServerPlayer;