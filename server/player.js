var quintusServerPlayer = function(Quintus) {
"use strict";
Quintus.ServerPlayer = function(Q) {
//This will be taken from the database
var users = {
    Saito:{
        name:"Saito",
        className:"Fighter",
        sheet:"Fighter",
        level:1,
        exp:0,
        curHp:20,
        gender:"M",
        stats:{
            hp:5,
            phys_ofn:4,
            phys_dfn:4,
            spec_ofn:1,
            spec_dfn:2,
            agility:2,

            strength:4,
            intellect:1,
            awareness:3,
            willpower:2,
            persuasion:1,
            fate:1
        },
        iv:{
            max_hp:5,
            phys_ofn:4,
            phys_dfn:4,
            spec_ofn:1,
            spec_dfn:2,
            agility:2,

            strength:4,
            intellect:1,
            awareness:3,
            willpower:2,
            persuasion:1,
            fate:1 
        },
        abilities:{
            Swimmer:1
        },
        attacks:[
            ["Thrust",1],
            ["Onslaught",1],
            ["Perturb",1]
        ],
        items:[
            ["Potion",1]
        ],
        text:[
            "Hello, I'm Saito!"
        ],
        file:"BigGame"
    },
    Estevan:{
        name:"Estevan",
        className:"Fighter",
        sheet:"Fighter",
        level:1,
        exp:0,
        curHp:20,
        gender:"M",
        stats:{
            hp:20,
            phys_ofn:4,
            phys_dfn:4,
            spec_ofn:1,
            spec_dfn:2,
            agility:23485,

            strength:4,
            intellect:1,
            awareness:3,
            willpower:2,
            persuasion:1,
            fate:1
        },
        iv:{
            max_hp:5,
            phys_ofn:4,
            phys_dfn:4,
            spec_ofn:1,
            spec_dfn:2,
            agility:2,

            strength:4,
            intellect:1,
            awareness:3,
            willpower:2,
            persuasion:1,
            fate:1 
        },
        abilities:{
            Swimmer:1
        },
        attacks:[
            ["Thrust",1],
            ["Incinerate",1],
            ["Perturb",1]
        ],
        items:[
            ["Potion",1]
        ],
        text:[
            "Hello, I'm Estevan!"
        ],
        file:"BigGame"
    }
};
Q.component("dirControls",{
    extend:{
        processInputs:function(inputs){
            //If the user confirms that this is the correct location
            if(inputs['interact']){
                
            } 
            //If the user presses 'back', go back to the pointer phase
            else if(inputs['back']){
                
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
                    Q.sendPlayerEvent(this.p.user.p.file,{playerId:this.p.user.p.playerId,funcs:["playStand"],props:[this.p.dir]});
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
    },
    checkDestroyObj:function(){
        if(this.p.obj){
            this.p.obj.destroy();
        }
    },
    placePlayer:function(loc){
        this.checkDestroyObj();
        var playerId = this.p.playerId;
        this.p.obj = Q("Participant",1).items.filter(function(obj){
            return obj.p.playerId===playerId;
        })[0];
        this.p.obj.p.user = this;
        this.p.obj.setPos(loc);
        this.p.obj.add("dirControls");
    },
    //Creates a pointer that can be moved
    createPointer:function(control,loc){
        this.checkDestroyObj();
        this.p.obj = Q.stage(1).insert(new Q.Pointer({user:this,loc:loc,control:control}));
        return this.p.obj;
    },
    //Creates the player menu that can be navigated
    createPlayerMenu:function(){
        
    },
    //Creates the bottom text box that can be cycled through
    createInfoTextBox:function(){
        
    },
    //This step function is only active when the user is inserted into a stage
    /*step:function(dt){
        if(this.p.obj&&this.p.inputs.length>0){
            this.p.obj.processInputs(this.p.inputs);
            this.p.inputs.splice(0,1);
        }
    }*/
});

//Common player is shared between all ServerAI and ServerPlayer
//It gives functions for 
//using astar to find the closest path
//
Q.component("commonPlayer",{
    added:function(){

    },
    extend: {
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
            console.log(playerId)
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
            var data = users[this.p.user.p.name];
            var player = this;
            var keys = Object.keys(data);
            //Populate the p property with the data from the database
            for(var i=0;i<keys.length;i++){
                player.p[keys[i]]=data[keys[i]];
            }
            var p = player.p;
            p.modStats = {
                hp:p.curHp,
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
                fate:p.stats.fate
            };
            p.stats.movement=8;
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
            this.p.name = this.p.data.name?this.p.data.name:this.p.className+" "+this.p.playerId;
            delete(this.p.data);
            delete(this.p.classData);
            //Generate some random iv's
            this.p.iv = this.generateIvs();
            //Now that we have the base stats and ivs, generate the stats
            var p = this.p;
            p.stats = {
                hp:(p.base.max_hp*p.level*50)+p.iv.max_hp,
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
                fate:((p.base.fate)/2)*p.level*p.iv.fate*2
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
                fate:p.stats.fate
            };
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
                    info = attackData.filter(function(obj){return obj.name===attack;})[0];
                    //Figure out which is the bonus stat for this attack
                    var stat = info.stat_type;
                    //Calculate the AI's attcak level
                    atkLevel = Math.floor(Math.sqrt(level*stats[stat]));
                    attacks.push([info.id,atkLevel]);
                }
            }
            p.attacks=attacks;
            delete(this.p.attackData);
            p.stats.movement=8;
            p.loc = p.final[0];
            p.dir = p.final[1];
        }
    },
    generateIvs:function(){
        return {
            max_hp:Math.ceil(Math.random()*10),
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