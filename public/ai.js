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
        p.AI = this[trait]();
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
        if(p.AI.path.length){
            Q.state.get("playerConnection").socket.emit('battleMove',{playerId:p.playerId,walkPath:p.AI.path});
            this.entity.add("autoMove");
        } 
        //If we're not moving, do the action
        else {
            //If there's an action
            if(p.AI.action){
                this.entity[p.AI.action[0]](p.AI.action[1]);
            } 
            //If there's no action, end the turn
            else {
                this['endTurn'];
            }
        }
    },
    
    
    
    //START TRAITS
    //Attacks with highest damage attack and positioning.
    aggressive:function(){
        var p = this.entity.p;
        //Short for opponents
        var ops = p.opponents;
        //If we're wanting to strike with a melee attack, we need to get the possible targets that we can reach to do that
        //Get all of the information on what possible interactions we can have this turn
        //var targets = this.getTargetsInfo(ops);
        //Figure out which enemies can be reached this turn
        var targets = this.getMeleeTargets(ops);
        //Returns the closest path that puts the AI behind a target
        var closestBehind = this.getClosestBehindTarget(targets);
        //If we can't get behind, try the side
        if(!closestBehind){
            var closestSide = this.getClosestSideTarget(targets);
        } else {
            console.log(closestBehind)
        }
        
        //We will need to figure out what type of attack we use
        var attack = p.attacks[0];
        //If there's someone we can get behind, go there, else go to the closet spot
        var AI;
        //If we can get behind someone
        if(closestBehind){
            AI = closestBehind;
            //[function,target,attack]
            AI.action = ["attackTarget",[AI.target,attack]];
            console.log("BEHIND")
        } 
        //If we can go to the side of someone
        else if(closestSide){
            AI = closestSide;
            //[function,target,attack]
            AI.action = ["attackTarget",[AI.target,attack]];
            console.log("SIDE")
        }
        //Figure out the next best option for attack
        else if(targets.length){
            AI = targets[0].paths[targets[0].closest.id];
            AI.target = targets[0].target.p.playerId;
            //[function,target,attack]
            AI.action = ["attackTarget",[AI.target,attack]];
        } 
        //If we can't attack, just move somewhere
        else {
            //Need to figure out a square that is close to the enemies since this is aggressive
            AI = this.getCloseToEnemies(ops);
            //AI.action is what happens after the move
            AI.action = ["endTurn"];
        }
        //For now, let's attack the closest target, prioritizing the closest behind target
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
        console.log("This should not happen as this object can make it to an enemy")
        return newPath;
    },
    //Gets a close square to the enemies if this AI can't get within melee range.
    getCloseToEnemies:function(ops){
        var p = this.entity.p;
        //For now, just move to the first enemy
        var closest = ops[0];
        var path = this.entity.getPath(closest.p.loc,p.graphWithWeight);
        var path = this.cutPath(path,p.myTurnTiles);
        return {path:path};
    },
    getClosestSideTarget:function(targets){
        var closestSide;
        for(i=0;i<targets.length;i++){
            if(Q._isObject(targets[i].side)){
                if(!closestSide||(closestSide.side&&targets[i].side.cost<closestSide.side.cost)){
                    closestSide = targets[i].paths[targets[i].side.id];
                    closestSide.target = targets[i].target.p.playerId;
                }
            } 
            else if(Q._isArray(targets[i].side)){
                for(si=0;si<targets[i].side.length;si++){
                    if(!closestSide||(closestSide.side&&targets[i].side[si].cost<closestSide.side[si].cost)){
                        closestSide = targets[i].paths[targets[i].side[si].id];
                        closestSide.target = targets[i].target.p.playerId;
                    }
                }
            }
        }
        return closestSide;
    },
    getClosestBehindTarget:function(targets){
        var closestBehind;
        //Loop through all of the targets
        for(i=0;i<targets.length;i++){
            //Make sure there is a behind for this target
            if(targets[i].behind!==undefined){
                //Check to see if this behind path is better than the other one
                if(!closestBehind||(closestBehind.behind&&targets[i].behind.cost<closestBehind.behind.cost)){
                    //Make sure that the behind path is moveable
                    if(targets[i].behind.cost<=this.entity.p.myTurnTiles){
                        closestBehind = targets[i].paths[targets[i].behind.id];
                        closestBehind.target = targets[i].target.p.playerId;
                    }
                }
            }
        }
        return closestBehind;
    },
    //Returns the total cost of a path
    getPathCost:function(path){
        var curCost = 0;
        for(j=0;j<path.length;j++){
            curCost+=path[j].weight;
        }
        return curCost;
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
        //0.50 is from behind
        //1.00 is side
        //1.50 is from front
        //Set values that we will multiply accuracy and power by later on
        var back = 0.5;
        var side = 1;
        var front = 1.5;

        //Array of possible directions clockwise from 12 o'clock
        var dirs = ["up", "right", "down", "left"];
        //Get the number for the user dir
        var userDir = getDirection(dir1,dirs);
        //Get the number for the target dir
        var targetDir = getDirection(dir2,dirs);
        //An array of the values (also clockwise from 12 o'clock)
        //EX:
        //if both user and target are 'up', they will both be 0 and that will give the back value (since they are both facing up, the user has attacked from behind).
        var values = [back,side,front,side];
        for(jjjj=0;jjjj<values.length;jjjj++){
            //Make sure we are in bounds, else loop around to the start of the array
            if(checkBounds(userDir+jjjj)===targetDir){
                //If we've found the proper value, return it
                return values[jjjj];
            }
        }
    },
    checkLocForObj:function(loc){
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
    //Returns the closest side of an opponent that we are trying to reach
    getClosestSide:function(opLoc,opDir){
        var p = this.entity.p;
        var check = [
            [opLoc[0],opLoc[1]-1],//UP
            [opLoc[0]+1,opLoc[1]],//RIGHT
            [opLoc[0],opLoc[1]+1],//DOWN
            [opLoc[0]-1,opLoc[1]]//LEFT
        ];
        //Loop through all of the four areas around the target and get a path if if there's nothing in the way
        var paths = [];
        for(ii=0;ii<check.length;ii++){
            //Need to check if there's already an object
            //This function will return false if there is no object
            //If there is an obj, it will return the obj (not used here)
            if(!this.checkLocForObj(check[ii])){
                var path = this.entity.getPath(check[ii],p.graphWithWeight);
                //Make sure there is a path that's not empty and that path is able to be gone to
                if(this.getPathCost(path)<=p.myTurnTiles){
                    paths.push(path);
                }
            };
        }
        //Set the lowest cost to be myTurnTiles+1 so that any valid path will result in the lowestCost
        var lowestCost = p.myTurnTiles+1;
        var closestPath;
        var behindPath;
        var sidePath;
        //The AI is checking starting from above, so it is facing down
        var dirs = ["down", "left", "up", "right"];
        //Which locations are possible
        var possibleTargetLocations = [];
        for(ii=0;ii<paths.length;ii++){
            //If there was a path at that direction
            if(paths[ii].length){
                var cost = this.getPathCost(paths[ii]);
                //If we can move to one of the spots, store this as a possible target
                if(cost<=p.myTurnTiles){
                    var hitsFrom = 0;
                    //Figure out if this is the lowest cost direction
                    if(cost<lowestCost){
                        lowestCost=cost;
                        closestPath={id:possibleTargetLocations.length,cost:cost};
                    }
                    //Figure out which way we're hitting from here
                    hitsFrom = this.compareDirection(dirs[ii],opDir);
                    if(hitsFrom===0.5){
                        behindPath={id:possibleTargetLocations.length,cost:cost};
                    }
                    if(hitsFrom===1){
                        //If sidePath is set, this means we can get to both sides
                        if(sidePath){
                            //Converted to array with both elements
                            sidePath = [sidePath,{id:possibleTargetLocations.length,cost:cost}];
                        }
                        sidePath={id:possibleTargetLocations.length,cost:cost};
                    }
                    possibleTargetLocations.push({path:paths[ii],cost:cost,hitsFrom:hitsFrom});
                    
                    
                }
            } 
            //If we're not moving
            else {
                hitsFrom = this.compareDirection(dirs[ii],opDir);
                closestPath={id:possibleTargetLocations.length,cost:0};
                possibleTargetLocations.push({path:[],cost:0,hitsFrom:hitsFrom});
            }
        }
        //If we can reach the target
        if(possibleTargetLocations.length){
            //Here, we should return as much information as needed
            //Useful info is 
            //Closest path
            //Which path can be attacking from behind
            //Which path/s can we hit from the side
            return [possibleTargetLocations,closestPath,behindPath,sidePath];
            
        } 
        //If we can't reach the target
        else {
            return false;
        }
    },
    
    //Returns all opponents that can be reached and attacked from 1 square away
    getMeleeTargets:function(ops){
        var p = this.entity.p;
        var targets = [];
        //For each of the opponents, figure out which ones we can get within melee range of
        for(i=0;i<ops.length;i++){
            //Get some information about all possible melee areas that we can target the ops[i]
            var targetLocs = this.getClosestSide(ops[i].p.loc,ops[i].p.dir);
            //If there is a way to get into melee range of this target
            if(targetLocs[0]){
                targets.push({target:ops[i],paths:targetLocs[0],closest:targetLocs[1],behind:targetLocs[2],side:targetLocs[3]});
            }
        }
        return targets;
    },
    //This is the main AI function that returns all of the possible targets that we can reach and information about them such as:
    //GLOBAL
    //Closest target
    //Closest behind of target
    //
    //INDIVIDUAL
    //Can hit from behind?
    //Can hit from sides?
    //Closest side to allies
    //
    getTargetsInfo:function(opponents){
        var ops = opponents;
        //All possible targets that we can get within melee range
        var targets = [];
        for(i=0;i<ops.length;i++){
            //Figure out if we can get to the top, right, bottom, or left of a target
        }
    },
    getClosestTarget:function(ops){
        var setClosest = function(obj,path,cost){
            closest = obj;
            closestPath = path;
            closestPathCost = cost;
        };
        var p = this.entity.p;
        var closest = ops[0];
        var closestPath = this.entity.getPath(closest.p.loc,p.graphWithWeight);
        var closestPathCost = getPathCost(closestPath);
        for(i=1;i<ops.length;i++){
            var path = this.entity.getPath(ops[i].p.loc,p.graphWithWeight);
            var cost = getPathCost(path);
            if(cost<closestPathCost){
                setClosest(ops[i],path,cost);
            } 
            //If there are two that are just as close
            else if(cost===closestPathCost){
                //Random between 0 and 1
                if(Math.floor(Math.random()*2)){
                    setClosest(ops[i],path,cost);
                }
            }
        }
        return closest;
    },
    extend:{
        attackTarget:function(target,attack){//console.log(target,attack)
            this.useAttack(target,attack);
        }
    }
});
    
};