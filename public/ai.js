Quintus.AI=function(Q){  
Q.component("AI", {
    added: function() {
        var p = this.entity.p;
        //Get the AI's opponents
        p.opponents = p.Class==="Ally" ? Q("Enemy",1).items : Q("Player",1).items.concat(Q("Ally",1).items);
        //The AI's traits
        var traits = p.traits;
        //Need to choose a trait to use this turn
        if(!traits){console.log(p);traits=["aggressive"];};
        var trait = traits[Math.floor(Math.random()*traits.length)];
        delete(p.AI);
        //If we're wanting to strike with a melee attack, we need to get the possible targets that we can reach to do that
        //Get all of the information on what possible interactions we can have this turn
        p.targetsInfo = this.getTargetsInfo(p.opponents);
        //p.rangedTargets = [];
        p.AI = this[trait](p.targetsInfo);
        //console.log(p.AI)
        p.calcMenuPath = p.AI.path;
        //Send off the AI to the other clients
        //Make the enemy move on other clients and then send the attacking action after the move
        this.entity.on("doneAutoMove",function(){
            //If there's an action
            if(p.AI.action){
                this[p.AI.action[0]](p.AI.action[1]);
            } 
            //End the turn if there's no action after the attack
            else {
                this['endTurn'];
            }
        });
        //If we are moving
        //Make sure there's a path and that path has at least one spot to move to
        if(p.AI.path&&p.AI.path.length){
            Q.state.get("playerConnection").socket.emit('battleMove',{playerId:p.playerId,walkPath:p.AI.path});
            this.entity.add("autoMove");
        }
        //If we cannot move, but can attack
        else if(p.AI.action[0]==="attackTarget"){
            this.entity[p.AI.action[0]](p.AI.action[1]);
        }
        //If we're not moving or attacking, do the action
        else {
            //If there's an action
            if(p.AI.action){
                this.entity[p.AI.action[0]](p.AI.action[1]);
            } 
            //If there's no action, end the turn
            else {
                Q.state.get("playerConnection").socket.emit("setDirection",{playerId:Q.state.get("playerConnection").id,dir:this.p.dir});
                this['endTurn'];
            }
        }
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
            AI.action = ["attackTarget",[AI.playerId,attack]];
            return AI;
        } 
        //Next best is to attack the closest from the side
        //Get the closest side path
        info.closestSide = this.getClosestSideTarget(info.meleeTargets);
        if(info.closestSide){
            AI = info.closestSide;
            AI.action = ["attackTarget",[AI.playerId,attack]];
            return AI;
        }
        //Determine if there are any opponents that can be attacked without moving
        info.outlineTargets = this.getOutlineTargets(p.opponents);
        if(info.outlineTargets.length){
            var target;
            //Need to determine which target is better to attack
            //TODO
            for(i=0;i<info.outlineTargets.length;i++){
                var t = info.outlineTargets[i];
                if(!target){target=t;};
            }
            AI = {};
            AI.action = ["attackTarget",[target.p.playerId,attack]];
            return AI;
        }
        
        //If we can't get behind and can't get to the side, just go to the closest
        //Get the absolute closest path
        info.closestPath = this.getClosestPath(info.meleeTargets);
        if(info.closestPath){
            AI = info.closestPath;
            AI.action = ["attackTarget",[AI.playerId,attack]];
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
    
    
    //Trims the end of the path so that the object doesn't land on another object
    checkPathForObjs:function(path){
        var objs = Q(".commonPlayer",1).items;
        var ok = false;
        //While there's a player in the way
        while(!ok&&path.length){
            ok=true;
            //loop through the players
            for(ob=0;ob<objs.length;ob++){
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
        for(ii=0;ii<path.length;ii++){
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
        var path = this.entity.getPath(closest.p.loc,p.graphWithWeight);
        //If the path is 1 long and the square is weight 10000 (enemy)
        if(path.length===1&&path[0].weight===10000){console.log("this shouldn't happen because the outline should've been dealt with at the start");
            var op = ops.filter(function(obj){
                return obj.p.loc[0]===path[0].x&&obj.p.loc[1]===path[0].y;
            })[0];
            return {path:path,action:["attackTarget",[op.p.playerId,p.attacks[0]]]};
        }
        //If we're moving somewhere, trim the ends that land on top of friendlies
        var path = this.cutPath(path,p.myTurnTiles);
        //Do some AI that determines if we can do a buff or heal (or some other self/ally target move)
        return {path:path,action:["endTurn"]};
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
        for(i=0;i<outline.length;i++){
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
        for(i=0;i<targets.length;i++){
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
        for(i=0;i<targets.length;i++){
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
        for(i=0;i<targets.length;i++){
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
            for(iiii=0;iiii<dirs.length;iiii++){
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
        for(jjjj=0;jjjj<values.length;jjjj++){
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
        for(o=0;o<objs.length;o++){
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
        for(tarLen=0;tarLen<ops.length;tarLen++){
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
        p.graphWithWeight = new Graph(this.entity.getWalkMatrix());
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
        for(ii=0;ii<check.length;ii++){
            //Need to check if there's already an object or wall
            //This function will return false if there is no object or wall
            //If there is an obj, it will return the obj (not used here)
            if(!this.checkLocForObjOrWall(check[ii])){
                var hitsFrom = this.compareDirection(userDirs[ii],target.p.dir);
                var path = this.entity.getPath(check[ii],p.graphWithWeight);
                var cost = this.getPathCost(path);
                //Make sure there is a path that's not empty and that path is able to be gone to
                if(cost<=p.myTurnTiles){
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
        for(j=0;j<path.length;j++){
            curCost+=path[j].weight;
        }
        return curCost;
    },
    extend:{
        attackTarget:function(props){
            //For now, just create single element array for target.
            this.useAttack([props[0]],props[1]);
        }
    }
});
    
};