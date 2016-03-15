var quintusServerAI = function(Quintus,io) {
"use strict";
Quintus.ServerAI = function(Q) {
Q.getTileType=function(x,y){
    var tiles = Q.topTiles.p.tiles;
    if(tiles[y]){
        return tiles[y][x];
    } else {
        return "SPRITE_STANDARD";
    }
};
    
Q.component("AI", {
    added: function() {
        var p = this.entity.p;
        //Get the AI's opponents
        switch(p.ally){
            case "Player":
                p.opponents = Q(".commonPlayer",1).items.filter(function(obj){
                    return obj.p.ally==="Enemy";
                });
                break;
            case "Enemy":
                p.opponents = Q(".commonPlayer",1).items.filter(function(obj){
                    return obj.p.ally==="Player";
                });
        }
        //The AI's traits
        var traits = p.traits;
        //Need to choose a trait to use this turn
        if(!traits){traits=["aggressive"];};
        var trait = 'aggressive';//traits[Math.floor(Math.random()*traits.length)];
        delete(p.AI);
        //If we're wanting to strike with a melee attack, we need to get the possible targets that we can reach to do that
        //Get all of the information on what possible interactions we can have this turn
        p.targetsInfo = this.getTargetsInfo(p.opponents);
        //p.rangedTargets = [];
        p.AI = this[trait](p.targetsInfo);
        p.calcMenuPath = p.AI.path;
        //If we are moving
        //Make sure there's a path and that path has at least one spot to move to
        if(p.AI.path&&p.AI.path.length){
            //Set the server AI to the destination
            p.loc=[p.AI.path[p.AI.path.length-1].x,p.AI.path[p.AI.path.length-1].y];
            //Get the interaction
            var result = this.entity[p.AI.action[0]](p.AI.action[1]);
            //Push the result of the action (usually attack)
            p.AI.action.push(result);
            
        };
        //Calculate what happens at the location
        io.sockets.in(p.fileName).emit('AIAction',{AI:p.AI,playerId:p.playerId});
    },
    
    //START TRAITS
    //Attacks with highest damage attack and positioning.
    aggressive:function(targetsInfo){
        var p = this.entity.p;
        var AI;
        var info = targetsInfo;
        //TODO
        //We will need to figure out what type of attack we use
        var attack = p.attacks[0];
        
        //Get the closest behind path
        //If we can reach the closest behind, target it
        info.closestBehind = this.getClosestBehindTarget(info.meleeTargets);
        if(info.closestBehind){
            AI = info.closestBehind;
            AI.action = ["attackTarget",{targetId:AI.playerId,attack:attack,endDir:this.getBestDir([AI.path[AI.path.length-1].x,AI.path[AI.path.length-1].y])}];
            return AI;
        } 
        //Next best is to attack the closest from the side
        //Get the closest side path
        info.closestSide = this.getClosestSideTarget(info.meleeTargets);
        if(info.closestSide){
            AI = info.closestSide;
            AI.action = ["attackTarget",{targetId:AI.playerId,attack:attack,endDir:this.getBestDir([AI.path[AI.path.length-1].x,AI.path[AI.path.length-1].y])}];
            return AI;
        }
        //Determine if there are any opponents that can be attacked without moving
        info.outlineTargets = this.getOutlineTargets(p.opponents);
        if(info.outlineTargets.length){
            var target;
            //Need to determine which target is better to attack
            //TODO
            for(var i=0;i<info.outlineTargets.length;i++){
                var t = info.outlineTargets[i];
                if(!target){target=t;};
            }
            AI = {};
            AI.action = ["attackTarget",{targetId:AI.playerId,attack:attack,endDir:this.getBestDir([AI.path[AI.path.length-1].x,AI.path[AI.path.length-1].y])}];
            return AI;
        }
        
        //If we can't get behind and can't get to the side, just go to the closest
        //Get the absolute closest path
        info.closestPath = this.getClosestPath(info.meleeTargets);
        if(info.closestPath){
            AI = info.closestPath;
            AI.action = ["attackTarget",{targetId:AI.playerId,attack:attack,endDir:this.getBestDir([AI.path[AI.path.length-1].x,AI.path[AI.path.length-1].y])}];
            return AI;
        }
        //If there's none of the above paths, try to move towards the enemies
        //This also sets the AI.action
        AI = this.getCloseToEnemies(p.opponents);
        return AI;
    },
    //Defends weaker allies by positioning itself in front of allies instead of attacking if necessary.
    defensive:function(){

    },
    //Prioritize highest number of targets when using an AOE attack
    genius:function(){

    },
    //END TRAITS
    getOrderOf:function(target,turnOrder){
        var order;
        switch(target){
            //Get order of players/allies
            case "Player":
                order = turnOrder.filter(function(obj){
                    return Q._isNumber(obj)||obj[0]==="a";
                });
                break;
            //Get order of enemies
            case "Enemy":
                order = turnOrder.filter(function(obj){
                    return obj[0]==="e";
                });
                break;
        }
        return order;
    },
    //Gets the ending direction for the end of turn
    getBestDir:function(endLoc){
        function getFirstEnemy(){
            //Loop through the opOrder and possible enemies and figure out which enemy goes earliest and can reach this object
            for(var i=0;i<opOrder.length;i++){
                var id = opOrder[i];
                for(var j=0;j<posEnemy.length;j++){
                    if(posEnemy[j].p.playerId===id){return posEnemy[j];};
                }
            }
        };
        var p = this.entity.p;
        //To determine the best end direction, we will get a path to each enemy. 
        //Whichever direction appears the most, we will take that as the most likely direction
        //We need to take into account the turn order and calculate where the enemies can move to
        //We also need the positions and directions of the allies if we want to do a defensive direction
        //For now, let's just do the offensive positioning (looking at the mode direction)
        //The first direction that needs to be faced along a path to an enemy
        var posEnemy = [];
        var posPaths = [];
        //Loop through each opponent to determine which opponents can reach this object
        for(var i=0;i<p.opponents.length;i++){
            //Get the path from the opponent to this object
            //We need to determine which enemy can reach this target on its next turn
            var path = p.opponents[i].getPath(endLoc,p.opponents[i].p.loc);
            var cost = this.getPathCost(path);
            //If this enemy can reach this player next turn
            if(cost<=p.opponents[i].p.stats.movement){
                //Push this enemy into the possible enemies that can attack this object
                posEnemy.push(p.opponents[i]);
                posPaths.push([p.opponents[i].p.playerId,path]);
            }
        }
        //If no enemy can reach this object, just set the dir to the current dir (obviously once there are ranged attacks, this will be based off of that as well.
        if(posPaths.length===0){return p.dir;};
        //Use the turn order to determine the first enemy that can move to attack this object
        var turnOrder = p.turnOrder;
        //Get the order of which the enemies do their turn
        var opOrder = this.getOrderOf(p.opponents[0].p.ally,turnOrder);
        //Get the first enemy that can move to this object
        var enemy = getFirstEnemy();
        //Filter the possibl paths to find this enemy's path to this object
        var path = posPaths.filter(function(obj){
            return obj[0]===enemy.p.playerId;
        })[0][1];
        var enemyPos = [path[path.length-1].x,path[path.length-1].y];
        var newDir = this.entity.compareTargetLoc(endLoc,enemyPos);
        return newDir;
    },
    //Trims the end of the path so that the object doesn't land on another object
    checkPathForObjs:function(path){
        var objs = Q(".commonPlayer",1).items;
        var ok = false;
        //While there's a player in the way
        while(!ok&&path.length){
            ok=true;
            //loop through the players
            for(var ob=0;ob<objs.length;ob++){
                if(path[path.length-1].x===objs[ob].p.loc[0]&&path[path.length-1].y===objs[ob].p.loc[1]){
                    ok=false;
                }
            }
            if(!ok){
                path.splice(path.length-1,1);
            }
        }
        return path;
    },
    cutPath:function(path,maxCost){
        var cost = 0;
        var newPath = [];
        //Loop through the path
        for(var ii=0;ii<path.length;ii++){
            //Increase the cost by the weight of the square
            cost+=path[ii].weight;
            //If the cost is less than its limit
            if(cost<=maxCost){
                newPath.push(path[ii]);
            } 
            //If the path is over its limit
            else {
                //Make sure the object does not land on another object since it can go through friendlies
                return this.checkPathForObjs(newPath);
            }
        }
        console.log("This should not happen as this object can make it to an enemy");
        console.log("This does happens when the AI goes 'into' the enemy when they are already surrounded")
        return newPath;
    },
    //Gets a close square to the enemies if this AI can't move to attack
    //This function also handles when the unit stands still to attack
    getCloseToEnemies:function(ops){
        var p = this.entity.p;
        //For now, just move to the first enemy
        var closest = ops[0];
        var path = this.entity.getPath(p.loc,closest.p.loc);
        //If the path is 1 long and the square is weight 10000 (enemy)
        if(path.length===1&&path[0].weight===10000){console.log("this shouldn't happen because the outline should've been dealt with at the start");
            var op = ops.filter(function(obj){
                return obj.p.loc[0]===path[0].x&&obj.p.loc[1]===path[0].y;
            })[0];
            return {path:path,action:["attackTarget",{targetId:op.p.playerId,attack:p.attacks[0],endDir:this.getBestDir([path[path.length-1].x,path[path.length-1].y])}]};
        }
        //If we're moving somewhere, trim the ends that land on top of friendlies
        var path = this.cutPath(path,p.stats.movement);
        //Do some AI that determines if we can do a buff or heal (or some other self/ally target move) TODO
        return {path:path,action:["endTurn",{endDir:this.getBestDir([path[path.length-1].x,path[path.length-1].y])}]};
    },
    getOutlineTargets:function(targets){
        var p = this.entity.p;
        var borderTargets = [];
        //The bordering squares of the user
        var outline = [
            [p.loc[0],p.loc[1]-1],//Above
            [p.loc[0]+1,p.loc[1]],//Right
            [p.loc[0],p.loc[1]+1],//Below
            [p.loc[0]-1,p.loc[1]]//Left
        ];
        for(var i=0;i<outline.length;i++){
            var target = targets.filter(function(obj){
                return obj.p.loc[0]===outline[i][0]&&obj.p.loc[1]===outline[i][1];
            })[0];
            if(target){
                borderTargets.push(target);
            }
        }
        return borderTargets;
    },
    getClosestBehindTarget:function(targets){
        var closestBehind=false;
        //Loop through all of the targets
        for(var i=0;i<targets.length;i++){
            //Make sure there is a behind for this target
            if(targets[i].behind){
                //Check to see if this behind path is better than the other one
                if(!closestBehind||(closestBehind&&targets[i].behind.cost<closestBehind.path.cost)){
                    //Make sure there's a path
                    if(targets[i].behind.path&&targets[i].behind.path.length){
                        closestBehind = {
                            path:targets[i].behind.path,
                            cost:targets[i].behind.cost,
                            playerId:targets[i].playerId
                        };
                    }
                }
            }
        }
        return closestBehind;
    },
    getClosestSideTarget:function(targets){
        var closestSide=false;
        //TODO add logic for determining a tie between left and right (right now, right wins)
        for(var i=0;i<targets.length;i++){
            //Check left
            if(targets[i].left){
                //Check to see if this left path is better than the other one
                if(!closestSide||(closestSide&&targets[i].left.cost<closestSide.path.cost)){
                    //Make sure there's a path
                    if(targets[i].left.path&&targets[i].left.path.length){
                        closestSide = {
                            path:targets[i].left.path,
                            cost:targets[i].left.cost,
                            playerId:targets[i].playerId
                        };
                    }
                }
            }
            //Check right
            if(targets[i].right){
                //Check to see if this left path is better than the other one
                if(!closestSide||(closestSide&&targets[i].right.cost<closestSide.path.cost)){
                    //Make sure there's a path
                    if(targets[i].right.path&&targets[i].right.path.length){
                        closestSide = {
                            path:targets[i].right.path,
                            cost:targets[i].right.cost,
                            playerId:targets[i].playerId
                        };
                    }
                }
            }
        }
        return closestSide;
    },
    getClosestPath:function(targets){
        var closestPath = false;
        for(var i=0;i<targets.length;i++){
            if(!closestPath||(closestPath&&targets[i].closest.cost<closestPath.cost)){
                
                //Make sure there's a path
                if(targets[i].closest.path&&targets[i].closest.path.length){
                    closestPath= {
                        path:targets[i].closest.path,
                        cost:targets[i].closest.cost,
                        playerId:targets[i].playerId
                    };
                }
            }
        }
        return closestPath;
    },
    
    //Compares two direction and returns the interaction
    compareDirection:function(dir1,dir2){
        var getDirection = function(dir,dirs){
            for(var iiii=0;iiii<dirs.length;iiii++){
                if(dir===dirs[iiii]){
                    return iiii;
                }
            }
            alert("Invalid direction!"+dir);
        };
        var checkBounds = function(num){
            if(num>=dirs.length){
                return num-dirs.length;
            }
            return num;
        };
        //Array of possible directions clockwise from 12 o'clock
        var dirs = ["up", "right", "down", "left"];
        //Get the number for the user dir
        var userDir = getDirection(dir1,dirs);
        //Get the number for the target dir
        var targetDir = getDirection(dir2,dirs);
        //An array of the values (also clockwise from 12 o'clock)
        //EX:
        //if both user and target are 'up', they will both be 0 and that will give the back value (since they are both facing up, the user has attacked from behind).
        var values = ["behind","right","front","left"];
        for(var jjjj=0;jjjj<values.length;jjjj++){
            //Make sure we are in bounds, else loop around to the start of the array
            if(checkBounds(userDir+jjjj)===targetDir){
                //If we've found the proper value, return it
                return values[jjjj];
            }
        }
    },
    checkLocForObjOrWall:function(loc){
        //Check for wall first
        if(Q.getTileType(loc[0],loc[1])==="SPRITE_DEFAULT"){
            return "Wall";
        };
        //If there's no wall, check if there's an object that is not itself
        var objs = Q(".commonPlayer",1).items;
        for(var o=0;o<objs.length;o++){
            //Don't care if this square is occupied by this object itself
            if(objs[o].p.playerId!==this.entity.p.playerId){
                //Check if there is an object on the square already
                if(objs[o].p.loc[0]===loc[0]&&objs[o].p.loc[1]===loc[1]){
                    //console.log("Obj At: "+loc[0]+","+loc[1]+".");
                    return objs[o];
                }
            }
        }
        return false;
    },
    //This is the main AI function that returns all of the possible targets that we can reach and information about them such as:
    getTargetsInfo:function(opponents){
        var ops = opponents;
        
        var targetsInfo = {
            closestBehind:false,
            closestSide:false,
            closestPath:false,
            meleeTargets:[],
            rangedTargets:[]
        };
        //Sample interaction where y is attacking x
        //Right side is closest
        //Behind is offensive, Right is defensive
        /*      x -->
         *      
         *      ^
         *      |
         *    y y y
         */
        
        //Sample targets data:
        /*  {
         *      playerId:playerId,
         *      offensive:behind,
         *      defensive:closestToAllies
         *      
         *      front:frontPath
         *      right:rightPath,
         *      behind:behindPath,
         *      left:path
         *  }
        */
       //Loop through all opponents in the scene and fill the targets array
        for(var tarLen=0;tarLen<ops.length;tarLen++){
            //Figure out if we can get to the top, right, bottom, or left of a target
            var target = this.getTargetPaths(ops[tarLen]);
            targetsInfo.meleeTargets.push(target);
            //Once we have the information on which squares we can reach,
            //use the AI's trait to determine what we do with this information
            
            
            
            //Determine how close we are to the other enemies in the stage
            //If we are close to lots of enemies, the score is higher,
            //Whereas further from enemies is lower score
            //This should return an object
            /*  score:{
             *      canBeAttackedByNextTurn:[],//An array that stores which enemies will be able to reach us at this location based off of their stamina
             * 
             * 
             */

            //var score = this.getScore(check[ii]);
            //if(!info.aggressive||(info.aggressive))
            //Check if this is the defensive path
        }
        return targetsInfo;
    },
    getTargetPaths:function(op){
        //The single target that we are checking its four sides for.
        var target = op;
        var targLoc = target.p.loc;
        var p = this.entity.p;
        var check = [
            [targLoc[0],targLoc[1]-1],//UP
            [targLoc[0]+1,targLoc[1]],//RIGHT
            [targLoc[0],targLoc[1]+1],//DOWN
            [targLoc[0]-1,targLoc[1]]//LEFT
        ];
        //Loop through all of the four areas around the target and get a path if if there's nothing in the way
        var info = {
            playerId:target.p.playerId,//The target's ID
            closest:false,//The closest path
            //TODO
            offensive:false,//The path that gets the user close to many enemies while still attacking
            //TODO
            defensive:false,//The path that gets the user furthest from many enemies while still attacking
            //TODO
            safe:false,//The path that gets the user the furthest from enemies without attacking
            //TODO
            ofnHeal:false,//The path that allows the user to heal, while walking towards enemies
            //TODO
            dfnHeal:false,//The path that allows the user to heal an ally or self and get furthest away from enemies
            
            front:false,//Attacking from front
            right:false,//Attacking from right side
            behind:false,//Attacking from behind
            left:false//Attacking from left side
        };
        //Start from attacking facing down
        var userDirs = ["down","left","up","right"];
        for(var ii=0;ii<check.length;ii++){
            //Need to check if there's already an object or wall
            //This function will return false if there is no object or wall
            //If there is an obj, it will return the obj (not used here)
            if(!this.checkLocForObjOrWall(check[ii])){
                var hitsFrom = this.compareDirection(userDirs[ii],target.p.dir);
                var path = this.entity.getPath(p.loc,check[ii]);
                var cost = this.getPathCost(path);
                //Make sure there is a path that's not empty and that path is able to be gone to
                if(cost<=p.stats.movement){
                    //Set the proper path
                    info[hitsFrom]={cost:cost,path:path};
                    //Check if this is the closest path
                    if(!info.closest||(info.closest.cost>info[hitsFrom].cost)){
                        info.closest = info[hitsFrom];
                    }
                }
            };
        }
        return info;
    },
    //Returns the total cost of a path
    getPathCost:function(path){
        var curCost = 0;
        for(var j=0;j<path.length;j++){
            curCost+=path[j].weight;
        }
        return curCost;
    },
    extend:{
        getEndFuncs:function(endDir){
            return [ 
                {text:[{obj:"Q",func:"addViewport",props:this.p.playerId}]},
                {text:[{obj:this.p.playerId,func:"faceDirection",props:endDir}]},
                {text:[{obj:this.p.playerId,func:"endTurn"}]}
            ];
        },
        endTurn:function(props){
            return this.getEndFuncs(props.endDir);
        },
        attackTarget:function(props){
            var targetIds = props.targetId;
            var attackInfo = props.attack;
            var endDir = props.endDir;
            var targets = [];
            var target = this.p.opponents.filter(function(obj){
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
            var endFuncs = this.getEndFuncs(endDir);
            interaction.push(endFuncs[0],endFuncs[1],endFuncs[2]);
            return interaction;
        }
    }
});

return Q;
};
};
module.exports = quintusServerAI;