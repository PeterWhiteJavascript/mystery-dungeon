Quintus.Objects = function(Q){

Q.Sprite.extend("Barrel",{
    init:function(p){
        this._super(p,{
            sheet:"objects",
            frame:0,
            w:64,h:64,
            type:Q.SPRITE_DEFAULT,
            sensor:true
        });
        this.add("2d");
        var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
        this.p.x = pos[0];
        this.p.y = pos[1];
        this.p.z = this.p.y;
    }
});
Q.Sprite.extend("Fireball",{
    init:function(p){
        this._super(p,{
            sprite:"fireball",
            sheet:"fireball",
            w:32,h:32,
            type:Q.SPRITE_NONE,
            stepDelay:0.2,
            sensor:true
        });
        this.add("2d,animation");
        var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
        this.p.x = pos[0];
        this.p.y = pos[1];
        this.p.z = this.p.y+Q.tileH;
        this.play("burning");
        this.on("sensor");
        this.on("burned");
        this.add("basicMover");
    },
    burned:function(){
        this.p.col.destroy();
        this.destroy();
    },
    burn:function(){
        this.play("engulf");
        Q.playSound("explosion_2.mp3");
    },
    sensor:function(col){
       if(col.isA("Barrel")&&!this.p.col&&this.p.animation==="burning"){
           this.burn();
           this.p.col = col;
           this.p.x=col.p.x;
           this.p.y=col.p.y;
           this.p.diffX=0;
           this.p.diffY=0;
       }
    }
});
//Used for fireball
Q.component("basicMover",{
    added:function(){
        var p = this.entity.p;
        if(!p.stepDistance) { p.stepDistance = Q.tileH; }
        if(!p.stepDelay) { p.stepDelay = 0.3; }
        p.stepWait = 0;
        p.diffX = 0;
        p.diffY = 0;
        switch(p.dir){
            case "up":
                p.diffY=-Q.tileH;
                break;
            case "right":
                p.diffX=+Q.tileH;
                break;
            case "down":
                p.diffY=+Q.tileH;
                break;
            case "left":
                p.diffX=-Q.tileH;
                break;
        }
        this.entity.on("step",this,"step");
    },
    step:function(dt){
        var p = this.entity.p;
        p.stepWait -= dt;
        p.x += p.diffX * dt / p.stepDelay;
        p.y += p.diffY * dt / p.stepDelay;
        //If it goes offscreen, destroy it
        if(p.x<0||p.y<0||p.x>Q.TL.p.w||p.y>Q.TL.p.h){
            this.entity.destroy();
        }
    }
});
    
Q.component("autoMove", {
    added: function() {
        var p = this.entity.p;
        if(!p.stepDistance) { p.stepDistance = Q.tileH; }
        if(!p.stepDelay) { p.stepDelay = 0.3; }
        p.stepWait = 0;
        p.stepping=false;
        this.entity.on("step",this,"step");
        p.walkPath = this.moveAlong(p.calcMenuPath);
        p.calcMenuPath=false;
    },
    

    atDest:function(){
        var p = this.entity.p;
        p.loc=[(p.x-p.w/2)/Q.tileH,(p.y-p.h/2)/Q.tileH];
        //this.entity.getTileLocation();
        
        p.stepped=false;
        p.stepping=false;
        
        //If this is not the protagonist
        if(!this.entity.has("protagonist")){
            
        } 
        //If this is the player-controlled object
        else {
            this.entity.clearGuide();
            this.entity.createMenu();
            p.graphWithWeight = new Graph(this.entity.getWalkMatrix());
        }
        this.entity.del("autoMove");
        this.entity.trigger("doneAutoMove");
        
        this.entity.trigger("atDest");
    },
    moveAlong:function(to){
        if(!to){this.atDest();return;};
        var p = this.entity.p;
        var walkPath=[];
        p.costPath=[];
        var curLoc = {x:p.loc[0],y:p.loc[1]};
        var going = to.length;
        if(going>p.myTurnTiles){ 
            going=p.myTurnTiles;
        }
        var going = to.length;
        var cost = 0;
        for(i=0;i<going;i++){
            cost+=to[i].weight;
            if(cost>p.myTurnTiles){
                if(walkPath.length===0||(walkPath[0][0]===false&&walkPath[0][1]===false&&walkPath.length===1)){this.atDest();return;};
                return walkPath;
            };
            var path = [];
            //Going right
            if(to[i].x>curLoc.x){
                path.push("right");
            //Going left
            } else if(to[i].x<curLoc.x){
                path.push("left");
            //Stay same
            } else {
                path.push(false);
            }
            //Going down
            if(to[i].y>curLoc.y){
                path.push("down");

            //Going up
            } else if(to[i].y<curLoc.y){
                path.push("up");
            //Stay same
            } else {
                path.push(false);
            }
            walkPath.push(path);
            
            p.costPath.push(to[i].weight);
            curLoc=to[i];
            
        }
        if(walkPath.length===0||(walkPath[0][0]===false&&walkPath[0][1]===false&&walkPath.length===1)){this.atDest();return;};
        return walkPath;
    },
    
    step: function(dt) {
        var p = this.entity.p,
            moved = false;
        p.stepWait -= dt;
        if(p.stepping) {
            p.x += p.diffX * dt / p.stepDelay;
            p.y += p.diffY * dt / p.stepDelay;
        }

        if(p.stepWait > 0) {return; }
        //At destination
        if(p.stepping) {
            p.x = p.destX;
            p.y = p.destY;
            p.walkPath.shift();
            p.costPath.shift();
            this.entity.trigger("atDest");
            if(p.walkPath.length===0||p.myTurnTiles<=0){
                this.atDest();
                return;
            }
        }
        p.stepping = false;

        p.diffX = 0;
        p.diffY = 0;
        //p.walkPath = [["left","up"],["left",false],[false,"up"],["right","down"]]
        
        if(p.walkPath[0][0]==="left") {
            p.diffX = -p.stepDistance;
        } else if(p.walkPath[0][0]==="right") {
            p.diffX = p.stepDistance;
        } else if(p.walkPath[0][1]==="up") {
            p.diffY = -p.stepDistance;
        } else if(p.walkPath[0][1]==="down"){
            p.diffY = p.stepDistance;
        }
        //Run the first time
        if((p.diffX || p.diffY )&&p.myTurnTiles>0){
            p.destX = p.x + p.diffX;
            p.destY = p.y + p.diffY;
            p.stepping = true;
            p.origX = p.x;
            p.origY = p.y;
            
            p.stepWait = p.stepDelay;
            p.stepped=true;
            
            //If we have passed all of the checks and are moving
            if(p.stepping){
                p.dir="";
                switch(p.walkPath[0][1]){
                    case "up":
                        p.dir="up";
                        break;
                    case "down":
                        p.dir="down";
                        break;
                }
                if(p.dir.length===0){
                    switch(p.walkPath[0][0]){
                        case "right":
                            p.dir+="right";
                            break;
                        case "left":
                            p.dir+="left";
                            break;
                    }
                }
                //Play the correct direction walking animation
                this.entity.playWalk(p.dir);
                p.myTurnTiles-=p.costPath[0];
            };
        }
    }
});


//Protagonist component is added to the controllable character
//This component handles inputs that need to be sent to the server
Q.component('protagonist', {
    added: function (p) {
        this.entity.add("battleControls");
    }
    
});
//Added to other player controlled characters
Q.component('actor', {
    added: function (p) {
        this.entity.p.update=true;
    } 
});



Q.Sprite.extend("dirTri",{
    init: function(p) {
        this._super(p, {
            w:35,h:35,
            type:Q.SPRITE_NONE
        });
        //Triangle points
        this.p.p1=[-this.p.w/2,this.p.h/2];
        this.p.p2=[0,-this.p.h/2];
        this.p.p3=[this.p.w/2,this.p.h/2];
        this.p.z = this.p.y+Q.tileH*2;
    },
    changePos:function(dir,char){
        switch(dir){
            case "left":
                this.p.x=char.p.x-char.p.w/2-this.p.w/2;
                this.p.y=char.p.y;
                this.p.angle=270;
                break;
            case "up":
                this.p.x=char.p.x;
                this.p.y=char.p.y-char.p.h/2-this.p.h/2;
                this.p.angle=0;
                break;
            case "right":
                this.p.x=char.p.x+char.p.w/2+this.p.w/2;
                this.p.y=char.p.y;
                this.p.angle=90;
                break;
            case "down":
                this.p.x=char.p.x;
                this.p.y=char.p.y+char.p.w/2+this.p.w/2;
                this.p.angle=180;
                break;
        }
        char.p.canMove=true;
        char.p.stepping=false;
        this.p.z = this.p.y+Q.tileH*2;
    },
    draw:function(ctx){
        ctx.beginPath();
        ctx.lineWidth="6";
        ctx.fillStyle="red";
        ctx.moveTo(this.p.p1[0],this.p.p1[1]);
        ctx.lineTo(this.p.p2[0],this.p.p2[1]);
        ctx.lineTo(this.p.p3[0],this.p.p3[1]);
        ctx.closePath();
        ctx.fill();
    }
});

Q.component("directionControls", {
    added: function() {
        this.entity.on("step",this,"step");
    },
    checkEnemyAnim:function(){
        var enemy = Q("Enemy",1).items.filter(function(obj){
            return obj.p.animation === "dying";
        })[0];
        if(enemy){return true;};
        return false;
    },
    step:function(dt){
        var p = this.entity.p;
        if(p.canMove){
            if(Q.inputs['left']) {
                p.dir='left';
            } else if(Q.inputs['right']) {;
                p.dir='right';
            } else if(Q.inputs['up']) {
                p.dir='up';
            } else if(Q.inputs['down']) {
                p.dir='down';
            }
            this.entity.playStand(p.dir);
            if(p.dirTri&&p.lastDir!==p.dir){
                this.entity.moveTri();
            }
            if(Q.inputs['interact']&&!p.stepping&!this.checkEnemyAnim()){
                if(this.entity.p.dirTri){
                    this.entity.p.dirTri.destroy();
                    this.entity.p.dirTri=false;
                    this.entity.disableControls();
                    this.entity.doneDirection();
                }
            }
            p.lastDir=p.dir;
        }
    },
    extend:{
        addTri:function(){
            this.p.dirTri = this.stage.insert(new Q.dirTri({x:this.p.x,y:this.p.y}));
            this.p.dirTri.changePos(this.p.dir,this);
        },
        moveTri:function(){
            this.p.dirTri.changePos(this.p.dir,this);
        },
        askDirection:function(){
            Q.inputs['interact']=false;
            this.addTri();
            this.addControls();
        },
        doneDirection:function(){
            if(this.p.noAction){
                this.p.noAction=false;
                Q.state.get("playerConnection").socket.emit("setDirection",{playerId:Q.state.get("playerConnection").id,dir:this.p.dir});
            }
            Q.afterDir();
        }
    }
});

Q.component("animations", {
    added:function(){
        this.entity.on("playStand");
    },
    extend:{
        checkPlayDir:function(dir){
            if(!dir){return this.p.dir;}else{return dir||"down";}
        },
        playStand:function(dir){
            this.p.dir = this.checkPlayDir(dir);
            this.play("standing"+this.p.dir);
        },
        playWalk:function(dir){
            this.p.dir = this.checkPlayDir(dir);
            this.play("walking"+this.p.dir);
        },
        playAttack:function(dir){
            this.p.dir = this.checkPlayDir(dir);
            this.play("attacking"+this.p.dir);
        },
        playBreatheFire:function(dir){
            this.p.dir = this.checkPlayDir(dir);
            this.play("breathefire"+this.p.dir);
        }
    }
});

Q.component("attacker",{
    added:function(){
        //Fill this with attacks during this battle
        this.entity.p.attackHistory=[];
    },
    extend:{
        getAttackArea:function(atk){
            var attack = RP.moves[atk[0]];
            var area = (attack.area-1)*2+1;
            var targets = [];
            for(i=0;i<area;i++){
                for(j=0;j<area;j++){
                    targets.push([j-attack.area+1,i-attack.area+1]);
                }
            }
            return targets;
        },
        getTargets:function(center,attack){
            //If the center is the only possible target
            if(attack.area===1){
                return [center];
            } else if(attack.area===2){
                var targets = [];
                for(i=-attack.area-1;i<attack.area-1;i++){
                    for(j=-attack.area-1;j<attack.area-1;j++){
                        var obj = Q.stage(1).locate(center.p.x+(i*Q.tileH),center.p.y+(j*Q.tileH),Q.SPRITE_INTERACTABLE);
                        
                        if(obj&&obj.has("attacker")){
                            targets.push(obj);
                        }
                    }
                }
                return targets;
            }
        },

        getAttackRange:function(attack){
            var checkX = function(num){
                if(num>=0&&num<maxTileRow){
                    return num;
                } else {
                    return false;
                }
            };
            var checkY = function(num){
                if(num>=0&&num<maxTileCol){
                    return num;
                } else {
                    return false;
                }
            };
            var mov = attack.range;
            var loc = this.p.loc;
            this.clearGuide();

            var minTile = 0;
            var tileLayer = Q.TL;
            var maxTileRow = tileLayer.p.tiles[0].length;
            var maxTileCol = tileLayer.p.tiles.length;
            var rows=mov*2+1,
                cols=mov*2+1,
                tileStartX=loc[0],
                tileStartY=loc[1];
            var dif=0;

            if(loc[0]-mov<minTile){
                dif = cols-(mov+1+loc[0]);
                cols-=dif;
                //tileStartX=mov+1-cols+loc[0];
            }
            if(loc[0]+mov>=maxTileRow){
                dif = cols-(maxTileRow-loc[0]+mov);
                cols-=dif;
            }
            if(loc[1]-mov<minTile){
                dif = rows-(mov+1+loc[1]);
                rows-=dif;
                //tileStartY=mov+1-rows+loc[1];

            }
            if(loc[1]+mov>=maxTileCol){
                dif = rows-(maxTileCol-loc[1]+mov);
                rows-=dif;
            }
            if(rows>maxTileRow){rows=maxTileRow;};
            if(cols>maxTileCol){cols=maxTileCol;};
            var attackTiles=[];
            var possibleTargets = [];
            //Get all possible attack locations that are within the bounds
            var graph = this.p.graphWithWeight;
            //UpLeft, Up, UpRight, Left, Right, DownLeft, Down, DownRight, Center
            //I took out diagonal
            var canCheck = [true,true,true,true,true];
            
            for(i=0;i<attack.range+1;i++){
                var checking = i*2+1;
                for(j=0;j<checking;j++){
                    for(k=0;k<checking;k++){
                        var startY = -i+j;
                        var startX = -i+k;
                        if((Math.abs(startX)===Math.abs(startY)||(startX===0||startY===0))&&(j===0||j===checking-1||k===0||k===checking-1)){
                            //Check to see if there was an object in the previous spot
                            //Used so that you can't shoot through or over walls
                            var check = -1;
                            if(startY<0&&startX===0){
                                if(canCheck[0]){check=0;};

                            } else if(startY===0&&startX<0){
                                if(canCheck[1]){check=1;};

                            }  else if(startY===0&&startX>0){
                                if(canCheck[2]){check=2;};

                            } else if(startY>0&&startX===0){
                                if(canCheck[3]){check=3;};

                            } else if(startY===0&&startX===0){
                                if(canCheck[4]){check=4;};
                            }
                            var x = checkX(tileStartX+startX);
                            var y = checkY(tileStartY+startY);
                            if((Q._isNumber(x)&&Q._isNumber(y))&&graph.grid[x][y]&&check>=0){
                                //If the tile is an object or a wall
                                if(graph.grid[tileStartX+startX][tileStartY+startY].weight>=10000){
                                    //Mark this direction as finished
                                    canCheck[check]=false;
                                    //Find if there's an object
                                    var obj = Q.stage(1).locate(graph.grid[tileStartX+startX][tileStartY+startY].x*Q.tileH+Q.tileH/2,graph.grid[tileStartX + startX][tileStartY + startY].y*Q.tileH+Q.tileH/2,Q.SPRITE_INTERACTABLE);
                                    
                                    //If there's an object, add it to the possible targets array
                                    //Also make sure to not add this object
                                    if(obj){
                                        var ally = obj.p.ally;
                                        switch(attack.target){
                                            case "self":
                                                if(obj.p.playerId===this.p.playerId){
                                                    possibleTargets.push(obj);
                                                    attackTiles.push(graph.grid[tileStartX+startX][tileStartY+startY]);
                                                }
                                                break;
                                            case "enemy":
                                                if(ally!==this.p.ally){
                                                    possibleTargets.push(obj);
                                                    attackTiles.push(graph.grid[tileStartX+startX][tileStartY+startY]);
                                                }
                                                break;
                                            case "ally":
                                                if(ally===this.p.ally){
                                                    possibleTargets.push(obj);
                                                    attackTiles.push(graph.grid[tileStartX+startX][tileStartY+startY]);
                                                }
                                                break;
                                            case "all":
                                                possibleTargets.push(obj);
                                                attackTiles.push(graph.grid[tileStartX+startX][tileStartY+startY]);
                                                break;
                                        }
                                    }

                                } else {
                                    attackTiles.push(graph.grid[tileStartX+startX][tileStartY+startY]);
                                }
                            }
                        
                        }
                    }
                }
            }
            
            //If there is at least one place to move
            if(attackTiles.length){
                //Loop through the possible tiles
                for(i=0;i<attackTiles.length;i++){
                    this.p.guide.push(Q.stage(1).insert(new Q.PathBox({x:attackTiles[i].x*Q.tileH+Q.tileH/2,y:attackTiles[i].y*Q.tileH+Q.tileH/2}),false,true));
                }
            }
            this.p.attackTiles = attackTiles;
            this.p.possTargets=possibleTargets;
        },
        faceTarget:function(pos){
            var tLoc = [(pos.x-Q.tileH/2)/Q.tileH,(pos.y-Q.tileH/2)/Q.tileH];
            var pLoc = this.p.loc;
            var xDif = tLoc[0]-pLoc[0];
            var yDif = tLoc[1]-pLoc[1];
            if(xDif===0&&yDif===0){return this.p.dir;};
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
            this.p.dir = newDir;
        },
        compareDirection:function(user,target){
            var getDirection = function(dir,dirs){
                for(i=0;i<dirs.length;i++){
                    if(dir===dirs[i]){
                        return i;
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
            for(j=0;j<values.length;j++){
                //Make sure we are in bounds, else loop around to the start of the array
                if(checkBounds(userDir+j)===targetDir){
                    //If we've found the proper value, return it
                    return values[j];
                }
            }
        },
        getAllPlayers:function(){
            return Q(".commonPlayer",1).items;
        },
        useAttack:function(targetIds,attackInfo){
            var allPlayers = this.getAllPlayers();
            var targets = [];
            for(i=0;i<targetIds.length;i++){
                var target = allPlayers.filter(function(obj){
                    return obj.p.playerId===targetIds[i];
                })[0];
                if(target){targets.push(target);};
            }
            var attack = RP.moves[attackInfo[0]];
            //Set the direction we need to be facing
            this.faceTarget({x:targets[0].p.x,y:targets[0].p.y});
            //Play the attack animation
            this.playAttack(this.p.dir);
            
            var interaction = [
                {text:[
                    {obj:this.p.playerId,func:"faceTarget",props:{x:targets[0].p.x,y:targets[0].p.y}},
                    {obj:this.p.playerId,func:"playAttack",props:this.p.dir},
                    this.p.name+" used "+attack.name+". "
                ]}
                
            ];
            var endFuncs =[ 
                {text:[{obj:"Q",func:"addViewport",props:this.p.playerId}]},
                {text:[{obj:this.p.playerId,func:"endTurn"}]}
            ];
            //Do this for all targets
            for(i_targ=0;i_targ<targets.length;i_targ++){
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
                        var damageCalc = RP.attackFuncs.calculateDamage(this,target,attack,facingValue);
                        //Show the attack text
                        interaction.push(damageCalc.modText);
                        //We hit!
                        if(damageCalc.damage>0){
                            interaction.push({text:[{obj:"Q",func:"playSound",props:"attack.mp3"},{obj:target.p.playerId,func:"lowerHp",props:damageCalc.damage},"Hit "+target.p.name+" for "+damageCalc.damage+" damage!"]})

                            if(target.p.curHp-damageCalc.damage<=0){
                                interaction.push({text:[{obj:target.p.playerId,func:"dead"},target.p.name+" died."]});
                                target.p.defeated=true;
                                target.removeFromTurnOrder(target.p.playerId);
                                target.checkDrop(this);
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
                            var effectText = RP.attackFuncs.effects[effect[2]](effect[3],effectTarget,effectUser);

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
            
            //Send off what happened so it can be replicated in the other player
            //Note that these calculations are always done on the 'host' machine
            //This will be broadcast to all other clients
            //Finish up with the functions that are called after the text is done
            interaction.push(endFuncs[0],endFuncs[1]);
            var p = this.p;
            Q.state.get("playerConnection").socket.emit('attack',{
                text:interaction
            });
            
            Q.stageScene("interaction",10,{interaction:interaction});
        },
        //Compares the attack target to the target's ally
        //Returns a bool if this target is valid
        checkValidTarget:function(target,attack){
            var ally = this.p.ally;
            switch(attack.target){
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
        clearPossTargets:function(){
            if(this.p.possTargets.length){
                for(i=0;i<this.p.possTargets.length;i++){
                    this.p.possTargets[i].stopFlash();
                }
            }
            this.p.possTargets=[];
        }
    }
});

Q.component("mover",{
    added:function(p){
        //this.entity.on("acceptInput",this,"acceptInputted");  
        var p = this.entity.p;
        if(!p.stepDistance) { p.stepDistance = Q.tileH; }
        if(!p.stepDelay) { p.stepDelay = 0.3; }
        p.stepWait = 0;
        p.diffX = 0;
        p.diffY = 0;
        p.inputted={
            up:false,
            right:false,
            down:false,
            left:false
        };
        //this.entity.on("step",this,"step");
    },
    //When at the tile that you were moving to
    atDest:function(){
        var p = this.entity.p;
        p.diffX = 0;
        p.diffY = 0;
        p.stepped=false;
        p.stepping=false;
        p.canInput=true;
        p.loc = Q.getLoc(p.x,p.y);
        //Check for triggers
        this.entity.trigger("atDest");
        //Run this function to see if we keep moving
        this.trigger("acceptInput");
        
    },
    
    acceptInputted:function(){
        var p = this.entity.p;
        var inputted=p.inputted;
        if(p.canInput){
            if(inputted.left) {
                p.diffX = -p.stepDistance;
                p.dir="left";
            } else if(inputted.right) {
                p.diffX = p.stepDistance;
                p.dir="right";
            } else if(inputted.up) {
                p.diffY = -p.stepDistance;
                p.dir="up";
            } else if(inputted.down) {
                p.diffY = p.stepDistance;
                p.dir="down";
            }
            p.canInput=false;
            //Set the destination positions
            p.destX = p.x + p.diffX;
            p.destY = p.y + p.diffY;
            //Set the destination location
            var locTo=p.locTo;
            //Get the tile type that this player is going to
            p.tileTo = Q.getTileType(locTo[0],locTo[1]);
            //Calculate how fast the player moves on this tile
            p.stepDelay = Q.getMoveSpeed(p.tileTo,this.entity);
            //Now that we're sure that we can go to that tile, actually move there.
            //Setting these properties enables certain feautres in this step function
            p.stepping = true;
            p.origX = p.x;
            p.origY = p.y;
            p.stepWait = p.stepDelay;
            p.stepped=true;
            //Play the walking animation
            this.entity.playWalk(p.dir);
        }
    },
    
    step:function(dt){
        var p = this.entity.p;
        p.stepWait -= dt;
        if(p.stepping) {
            p.x += p.diffX * dt / p.stepDelay;
            p.y += p.diffY * dt / p.stepDelay;
        }

        if(p.stepWait > 0) {return; }
        //At destination
        if(p.stepping) {
            p.x = p.destX;
            p.y = p.destY;
            this.atDest();
        }
        p.stepping = false;
    },
    extend:{
       getTileLocation:function(){
            var loc = this.setLocation();
            return Q.getTileType(loc[0],loc[1]);
        },
        getWalkMatrix:function(){
            function getWalkable(){
                return Q.getTileCost(Q.getTileType(i_walk,j_walk));
            }
            
            var tiles=Q.TL.p.tiles;
            var cM=[];
            if(tiles){
                for(i_walk=0;i_walk<tiles[0].length;i_walk++){
                    var costRow = [];
                    for(j_walk=0;j_walk<tiles.length;j_walk++){
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
       clearGuide:function(){
            var p = this.p;
            if(p.guide&&p.guide.length>0){
                for(i=0;i<p.guide.length;i++){
                    p.guide[i].destroy();
                }
            }
            this.p.guide=[];
        },
        getSightRange:function(){
            var sight = this.p.sightRange;
            var loc = this.p.loc;
            this.p.sightTiles=[];

            var minTile = 0;
            var tileLayer = Q.TL;
            var maxTileRow = tileLayer.p.tiles[0].length;
            var maxTileCol = tileLayer.p.tiles.length;
            var rows=sight*2+1,
                cols=sight*2+1,
                tileStartX=loc[0]-sight,
                tileStartY=loc[1]-sight;
            var dif=0;

            if(loc[0]-sight<minTile){
                dif = cols-(sight+1+loc[0]);
                cols-=dif;
                tileStartX=sight+1-cols+loc[0];
            }
            if(loc[0]+sight>=maxTileRow){
                dif = cols-(maxTileRow-loc[0]+sight);
                cols-=dif;
            }
            if(loc[1]-sight<minTile){
                dif = rows-(sight+1+loc[1]);
                rows-=dif;
                tileStartY=sight+1-rows+loc[1];

            }
            if(loc[1]+sight>=maxTileCol){
                dif = rows-(maxTileCol-loc[1]+sight);
                rows-=dif;
            }
            if(rows>maxTileRow){rows=maxTileRow;};
            if(cols>maxTileCol){cols=maxTileCol;};
            this.p.sightTiles=[];
            var graph = new Graph(this.getWalkMatrix());
            for(i=0;i<sight+1;i++){
                var checking = i*2+1;
                for(j=0;j<checking;j++){
                    for(k=0;k<checking;k++){
                        var startY = -i+j;
                        var startX = -i+k;
                        if((Math.abs(startX)+Math.abs(startY)<=sight||(startX===0||startY===0))&&(j===0||j===checking-1||k===0||k===checking-1)){
                            this.p.sightTiles.push(graph.grid[sight+tileStartX+startX][sight+tileStartY+startY]);
                        }
                    }
                }
            }
        },

        getRange:function(){
            var mov = this.p.myTurnTiles;
            var loc = this.p.loc;
            this.p.movTiles=[];
            this.clearGuide();

            var minTile = 0;
            var tileLayer = Q.TL;
            var maxTileRow = tileLayer.p.tiles.length;//25
            var maxTileCol = tileLayer.p.tiles[0].length;//15
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
            var graph = this.p.graphWithWeight;
            for(i=tileStartX;i<tileStartX+cols;i++){
                for(j=tileStartY;j<tileStartY+rows;j++){
                    if(graph.grid[i][j].weight<10000){
                        movTiles.push(graph.grid[i][j]);
                    }
                }
            }
            //If there is at least one place to move
            if(movTiles.length){
                //Loop through the possible tiles
                for(i=0;i<movTiles.length;i++){
                    var path = this.getPath([movTiles[i].x,movTiles[i].y],this.p.graphWithWeight,"maxScore",mov);
                    var pathCost = 0;
                    for(j=0;j<path.length;j++){
                        pathCost+=path[j].weight;
                    }
                    if(path.length>0&&path.length<=mov&&pathCost<=this.p.myTurnTiles){
                        this.p.guide.push(Q.stage(1).insert(new Q.PathBox({x:movTiles[i].x*Q.tileH+Q.tileH/2,y:movTiles[i].y*Q.tileH+Q.tileH/2}),false,true));
                        this.p.movTiles.push(movTiles[i]);
                    }
                }
            //If there's nowhere to move
            } else {

            }
        },
        moveTo:function(to){
            this.p.calcMenuPath = this.getPath(to,this.p.graphWithWeight);
            this.clearGuide();
            if(this.p.calcMenuPath.length){
                for(i=0;i<this.p.calcMenuPath.length;i++){
                    this.p.guide.push(this.stage.insert(new Q.PathBox({x:this.p.calcMenuPath[i].x*Q.tileH+Q.tileH/2,y:this.p.calcMenuPath[i].y*Q.tileH+Q.tileH/2}),false,true));
                }
            }
            Q.state.get("playerConnection").socket.emit('battleMove',{playerId:this.p.playerId,walkPath:this.p.calcMenuPath,myTurnTiles:this.p.myTurnTiles});
            Q.addViewport(this);
            this.add("autoMove");
        },

        getPath:function(toLoc,graph,prop,score,loc){
            var start;
            if(loc){
                start = graph.grid[loc[0]][loc[1]];
            } else {
                loc = this.p.loc;
                start = graph.grid[loc[0]][loc[1]];
            }
            var end = graph.grid[toLoc[0]][toLoc[1]];
            var result;
            if(prop==="maxScore"){
                result = astar.search(graph, start, end,{maxScore:score});
            } else {
                result = astar.search(graph, start, end);
            }
            return result;
        },
        
        setLocation:function(){
            return [Math.round((this.p.x-Q.tileH/2)/Q.tileH),Math.round((this.p.y-Q.tileH/2)/Q.tileH)];
        }
   } 
});
Q.Sprite.extend("DeathAnimation",{
    init: function(p) {
        this._super(p, {
            type:Q.SPRITE_NONE,
            collisionMask:Q.SPRITE_NONE
        });
        this.add("animation,tween");
        this.play("dying");
        this.on("dead");
    },
    
    dead: function(){
        //If we want to have dead things on the ground, do that here
        Q.stage(1).remove(this);
    }
});

Q.component("commonPlayer", {
    extend:{
        confirmLocation:function(loc){
            while(Q.stage(1).locate(loc[0]*Q.tileH+Q.tileH/2,loc[1]*Q.tileH+Q.tileH/2,Q.SPRITE_INTERACTABLE)){
                var newLoc = [loc[0]+Math.floor(Math.random()*3)-1,loc[1]+Math.floor(Math.random()*3)-1];
                loc=newLoc;
            }
            return loc;
        },
        dead:function(){
            Q.stage(1).insert(new Q.DeathAnimation({x:this.p.x,y:this.p.y,sprite:this.p.sprite,sheet:this.p.sheet,dir:this.p.dir}));
            this.destroy();
        },
        removeFromTurnOrder:function(id){
            //Remove from the turn order right away so that it won't be this's turn
            var turnOrder = Q.state.get("turnOrder");
            for(i=0;i<turnOrder.length;i++){
                if(turnOrder[i]===id){
                    turnOrder.splice(i,1);
                }
            }
        },
        checkDrop:function(obj){
            if(this.p.drop){
                //obj.getItem(this.p.drop);
            }
        },
        giveExp:function(){
            var leveledUp = {text:[]};
            var lastLv = 0+this.p.level;
            if(this.p.Class==="Enemy"){
                var exp=Math.round((this.p.expGiven*this.p.level)/Q("Player",1).items.length);
                Q("Player",1).each(function(){
                    var up = this.checkExp(exp);
                    if(up){
                        leveledUp.text.push({obj:"Q",func:"playSound",props:"level_up.mp3"},this.p.name+" grew to level "+this.p.level+"!",
                        {obj:this.p.playerId,func:"gainExp",props:exp});
                    } else {
                        leveledUp.text.push({obj:this.p.playerId,func:"gainExp",props:exp});
                    };
                });
            }/* else if(this.p.Class==="Player"){
                var exp = Math.round((this.p.expGiven*this.p.level)/Q("Enemy",1).items.length)||50;
                Q("Enemy",1).each(function(){
                    var up = this.checkExp(exp);
                    if(up){
                        leveledUp.text.push({playSound:"level_up.mp3"},this.p.name+" grew to level "+this.p.level+"!",
                        {gainExp:[{Class:this.p.Class,id:this.p.playerId},Math.round(exp)]});
                    } else {
                        leveledUp.text.push({gainExp:[{Class:this.p.Class,id:this.p.playerId},exp]});
                    };
                });
            }*/
            console.log(lastLv,this.p.level)
            if(lastLv!==this.p.level){
                Q.state.get("playerConnection").socket.emit("levelUp",{playerId:Q.state.get("playerConnection").id,levelsGained:this.p.level-lastLv});
            }
            return leveledUp;
        },
        checkExp:function(exp){
            var newExp = this.p.exp+exp;
            //Check for level up
            //If we leveled up
            if(this.checkLevelUp(this.p.level,newExp)){
                return true;
            };
        },
        gainExp:function(exp){
            this.p.exp+=exp;
            //Check for level up
            //If we leveled up
            if(this.checkLevelUp(this.p.level,this.p.exp)){
                return true;
            };
        },
        checkLevelUp:function(level,exp){
            var expNeeded=RP.expNeeded[level];
            if(exp>=expNeeded){
                var newLevel = this.levelUp();
                //Check again (maybe we leveled up twice)
                this.checkLevelUp(newLevel,exp);
                return true;
            }
        },
        levelUp:function(){
            var newLevel = this.p.level+1;
            this.p.level=newLevel;
            if(this.p.playerId===Q.state.get("playerConnection").id){
                //Increase stats here
                var ofnInc = Math.ceil(Math.random()*3);
                var dfnInc = Math.ceil(Math.random()*3);
                var spdInc = Math.ceil(Math.random()*3);
                this.p.ofn+=ofnInc;
                this.p.mod_ofn+=ofnInc;
                this.p.dfn+=dfnInc;
                this.p.mod_dfn+=dfnInc;
                this.p.spd+=spdInc;
                this.p.mod_spd+=spdInc;

                var hpInc = Math.ceil(Math.random()*5);
                this.p.curHp+=hpInc;
                this.p.maxHp+=hpInc;
                var player = this;
                Q.state.get("playerConnection").socket.emit('updateStats',{
                    stats:{
                        level:player.p.level,
                        ofn:player.p.ofn,
                        dfn:player.p.dfn,
                        spd:player.p.spd,
                        mod_ofn:player.p.mod_ofn,
                        mod_dfn:player.p.mod_dfn,
                        mod_spd:player.p.mod_spd,
                        curHp:player.p.curHp,
                        maxHp:player.p.maxHp,
                        exp:player.p.exp
                    },
                    playerId:player.p.playerId
                });
            }
            return newLevel;
        },
        //Used when this is a possible target for attack
        flash:function(){
            this.chain({opacity:0.3},0.5,Q.Easing.Quadratic.Linear)
                .chain({opacity:0.8},0.5, Q.Easing.Quadratic.Linear,{callback:function(){this.flash();}});
        },
        stopFlash:function(){
            this.stop();
            this.p.opacity=1;
        },
        
        /*
        tempChangeStat:function(props){
            var player = this;
            var text =  [player.p.name+" raised "+props.p.stat+" by "+props.p.amount+" temporarily.",{endTurn:[{Class:player.p.Class,id:player.p.playerId}]}];
            Q.stageScene("bottomhud",3,{text:text,player:player,obj:player});
            this.p.statsModified[props.p.stat]+=props.p.amount;
        },*/
        lowerHp:function(amount){
            this.p.curHp-=amount;
        },
        useItem:function(item){
            var itm = item;
            var player = this;
            //Decrease the inventory (obviously skip this if the item is not consumable)
            if(itm.kind==="Consumable"){
                for(i=0;i<player.p.items.length;i++){
                    if(player.p.items[i][0]===itm.id){
                        player.p.items[i][1]--;
                        if(player.p.items[i][1]===0){
                            player.p.items.splice(i,1);
                        }
                    }
                }
            }
            var text = RP.itemFuncs[itm.effect[0]](itm,player);
            Q.state.get("playerConnection").socket.emit('updateItems',{item:itm.name,amount:-1,playerId:player.p.playerId,text:text});
            
            return text;
        },
        //Used when giving an item to an NPC
        loseItem:function(item,amount){
            var itm = item;
            var player = this;
            for(i=0;i<player.p.items.length;i++){
                if(player.p.items[i].p.name===itm){
                    player.p.items[i].amount-=amount;
                    if(player.p.items[i].amount===0){
                        player.p.items.splice(i,1);
                    }
                }
            }
        },
        
        interact:function(player){
            //Show Player Text
            Q.stageScene("bottomhud",3,{text:[player.p.text[0]+" Id #"+player.p.playerId],player:player,obj:this});
            Q.inputs['interact']=false;
        },
        addViewport:function(){
            Q.addViewport(this);
        },
        step:function(dt){
            if(this.p.initialize){
                this.initialize();
                this.playStand(this.p.dir);
            }
            this.p.z=this.p.y;
        }
    }
});
//Friendly AI
Q.Sprite.extend("Ally",{
    init: function(p) {
        this._super(p, {
            frame:0,
            sprite:"player",
            Class:"Ally",
            
            dir:"down",
            
            objInFront:false,
            initialize:true,
            guide:[],
            possTargets:[],
            
            type:Q.SPRITE_INTERACTABLE,
            tileSize:Q.tileH,
            w:Q.tileH,h:Q.tileH,
            
            buffs:[],
            debuffs:[],
            defeated:false,
            ally:"Player"
        });
        //Library
        this.add("2d, animation, tween");
        //My components
        this.add("commonPlayer,animations,attacker,mover");
    },
    initialize:function(){
        var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
        this.p.x=pos[0];
        this.p.y=pos[1];
        //These properties are use in the damage calculation and are changed by stat modifiers (leer, etc...)
        this.p.mod_ofn = this.p.ofn;
        this.p.mod_dfn = this.p.dfn;
        this.p.mod_spd = this.p.spd;
        
        this.p.expGiven = this.p.level*this.p.exp;
        this.p.sheet = this.p.sheet ? this.p.sheet : this.p.className;
        this.p.name = this.p.name ? this.p.name : this.p.className+" "+this.p.playerId;
        this.p.graphWithWeight = new Graph(this.getWalkMatrix());
        
        this.playStand(this.p.dir);
        this.p.initialize = false;
    },
    
    turnStart:function(){
        Q.addViewport(this);
        this.p.myTurn=true;
        this.p.myTurnTiles=this.p.stats.sp.stamina;
        this.p.startLocation=this.p.loc;
        this.add("AI");
        
    },
    turnOver:function(){
        this.playStand(this.p.dir);
        this.p.loc = this.setLocation();
        this.p.myTurn=false;
        this.del("AI");
        Q.afterDir();
    },
    endTurn:function(){
        this.turnOver();
        Q.clearStage(3);
    }
});
Q.Sprite.extend("Enemy",{
    init: function(p) {
        this._super(p, {
            frame:0,
            sprite:"player",
            Class:"Enemy",
            
            dir:"down",
            
            objInFront:false,
            initialize:true,
            guide:[],
            possTargets:[],
            
            type:Q.SPRITE_INTERACTABLE,
            tileSize:Q.tileH,
            w:Q.tileH,h:Q.tileH,
            
            buffs:[],
            debuffs:[],
            defeated:false,
            ally:"Enemy"
        });
        //Library
        this.add("2d, animation, tween");
        //My components
        this.add("commonPlayer,animations,attacker,mover");
    },
    initialize:function(){
        var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
        this.p.x=pos[0];
        this.p.y=pos[1];
        //These properties are use in the damage calculation and are changed by stat modifiers (leer, etc...)
        this.p.mod_ofn = this.p.ofn;
        this.p.mod_dfn = this.p.dfn;
        this.p.mod_spd = this.p.spd;
        
        this.p.expGiven = this.p.level*this.p.exp;
        this.p.sheet = this.p.sheet ? this.p.sheet : this.p.className;
        this.p.name = this.p.name ? this.p.name :  this.p.className+" "+this.p.playerId;
        
        this.p.graphWithWeight = new Graph(this.getWalkMatrix());
        this.playStand(this.p.dir);
        this.p.initialize = false;
    },
    
    turnStart:function(){
        Q.addViewport(this);
        this.p.myTurn=true;
        this.p.myTurnTiles=this.p.stats.sp.stamina;
        this.p.startLocation=this.setLocation();
         
        this.add("AI");
    },
    turnOver:function(){
        this.playStand(this.p.dir);
        this.p.loc = this.setLocation();
        this.p.myTurn=false;
        this.del("AI");
        Q.afterDir();
    },
    endTurn:function(){
        this.turnOver();
        Q.clearStage(3);
    }
});

Q.Sprite.extend("Player",{
    init: function(p) {
        this._super(p, {
            Class:"Player",
            frame:0,
            sprite:"player",
            
            dir:"down",
            
            objInFront:false,
            initialize:true,
            guide:[],
            possTargets:[],
            
            type:Q.SPRITE_INTERACTABLE,
            tileSize:Q.tileH,
            w:Q.tileH,h:Q.tileH,
            
            buffs:[],
            debuffs:[],
            defeated:false,
            types:["Normal"],
            ally:"Player"
        });
        //Library
        this.add("2d, animation, tween");
        //My components
        this.add("commonPlayer,animations,attacker,mover");
        this.on("step",this,"checkMenu");
        this.p.num=0;
        this.p.dir ? this.p.dir : "down";
        this.p.sheet ? this.p.sheet : this.p.className;
        var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
        this.p.x = pos[0];
        this.p.y = pos[1];
    },
    initialize:function(){
        //These properties are use in the damage calculation and are changed by stat modifiers (leer, etc...)
        this.p.mod_ofn = this.p.ofn;
        this.p.mod_dfn = this.p.dfn;
        this.p.mod_spd = this.p.spd;
        
        this.p.graphWithWeight = new Graph(this.getWalkMatrix());
        
        this.playStand(this.p.dir);
        this.p.initialize = false;
    },
    //Displays the 'ready' animation
    showReady:function(){
        var stage = Q.stage(1);
        this.p.ready =stage.insert(new Q.Sprite({
            x:this.p.x,
            y:this.p.y-Q.tileH,
            sheet:"objects",
            sprite:"ready",
            type:Q.SPRITE_NONE,
            z:200
        }));
        this.p.ready.add("animation");
        this.p.ready.play("displaying");
    },
    destroyReady:function(){
        if(this.p.ready){
            this.p.ready.destroy();
        }
    },
    addControls:function(){
        this.p.canMove=true;
        this.p.canInput=true;
        
    },
    disableControls:function(){
        this.p.canMove=false;
        this.p.canInput=false;
    },
    
    createPointer:function(attack){
        var player = this;
        //If we're attacking
        if(attack){
            var atk = RP.moves[attack[0]];
            this.getAttackRange(atk);
            var pointer = this.stage.insert(new Q.Pointer({loc:[this.p.loc[0],this.p.loc[1]],attack:atk}));      
            pointer.createAttackArea(player.getAttackArea(attack));
            pointer.p.player = player;
            pointer.p.attack = atk;
            pointer.on("interact",function(){
                var targets = [];
                var attackTiles = player.p.attackTiles;
                //Loop through the possible attackTiles to make sure that this spot is in that area
                var found = false;
                for(i_tiles=0;i_tiles<attackTiles.length;i_tiles++){
                    if(attackTiles[i_tiles].x===pointer.p.loc[0]&&attackTiles[i_tiles].y===pointer.p.loc[1]){
                        found = true;
                    }
                }
                //If it's within the range
                if(found){
                    //Check if we've got at least one target
                    for(i_point=0;i_point<pointer.p.attackAreas.length;i_point++){
                        var square = [pointer.p.loc[0]+pointer.p.attackAreas[i_point][0],pointer.p.loc[1]+pointer.p.attackAreas[i_point][1]];
                        //Check this spot
                        var target = Q(".commonPlayer",1).items.filter(function(obj){
                            return obj.p.loc[0]===square[0]&&obj.p.loc[1]===square[1];
                        })[0];
                        if(target&&player.checkValidTarget(target,atk)){targets.push(target.p.playerId);}
                    }
                    if(targets.length){
                        pointer.finished();
                        player.clearGuide();
                        player.useAttack(targets,attack);
                    }
                }
            });
            pointer.on("back",function(){
                pointer.finished();
                player.clearGuide();
                player.createMenu();
            });
        } 
        //If we're moving
        else {
            //Get the player's range tiles
            //Also sets up the guide and movTiles
            this.getRange();
            var pointer = this.stage.insert(new Q.Pointer({loc:[this.p.loc[0],this.p.loc[1]]}));      
            pointer.on("interact",function(){
                if(!pointer.p.stepping&&pointer.p.diffX===0&&pointer.p.diffY===0){
                    var obj = Q.getObjectAt(pointer.p.x,pointer.p.y);
                    if(obj&&obj.isA("PathBox")){
                        var moveTo = [pointer.p.loc[0],pointer.p.loc[1]];
                        player.moveTo(moveTo);
                        pointer.finished();
                        return;
                    }
                }
            });
            pointer.on("back",function(){
                pointer.finished();
                player.clearGuide();
                player.createMenu();
            });
        }
    },
    turnStart:function(){
        Q.addViewport(this);
        this.p.myTurn=true;
        this.p.myTurnTiles=this.p.stats.sp.stamina;
        this.setStartLoc();
        this.p.canRedo=true;
        this.p.canInput=false;
        //Create a new graph since objects will have move since last time (this might not be necessary since the tile map won't have changed)
        this.p.graphWithWeight = new Graph(this.getWalkMatrix());
        //Force the player to stand
        this.playStand(this.p.dir);
        //Create the menu that allows the user to select an action
        this.createMenu();
    },
    turnOver:function(){
        this.p.myTurn=false;
        this.add("directionControls")
        this.addControls();
        this.askDirection();
    },
    endTurn:function(){
        if(Q.state.get("playerConnection").id===Q.state.get("turnOrder")[0]){
            this.turnOver();
            Q.clearStage(3);
        } else {
            Q.state.get("playerConnection").socket.emit("readyForNextTurn",{playerId:Q.state.get("playerConnection").id});
        }
    },
    setStartLoc:function(){
        this.p.startLocation=[this.p.loc[0],this.p.loc[1]];
    },
    resetMove:function(){
        this.p.x=this.p.w/2+this.p.startLocation[0]*Q.tileH;
        this.p.y=this.p.h/2+this.p.startLocation[1]*Q.tileH;
        this.p.loc = [(this.p.x-this.p.w/2)/Q.tileH,(this.p.y-this.p.h/2)/Q.tileH];
        this.p.myTurnTiles=this.p.stats.sp.stamina;
        this.setStartLoc();
        this.p.canRedo=true;
        this.p.graphWithWeight = new Graph(this.getWalkMatrix());
        Q.viewFollow(this,this.stage);
        
    },
    getItem:function(item){
        var itm = item;
        var player = this;
        
        var found = false;
        for(i=0;i<player.p.items.length;i++){
            if(player.p.items[i].p.id===itm.p.item){
                player.p.items[i].amount+=itm.p.amount;
                found = true;
            }
        }
        if(!found){
            player.p.items.push({p:RP.items[itm.p.item],amount:itm.p.amount});
        }
        
        //Update the player's items for all players
        Q.state.get("playerConnection").socket.emit('updateItems',{playerId:Q.state.get("playerConnection").id,items:player.p.items});
        
        Q.stageScene("customAnimate",4,{anim:"getItem",item:item.p});
        var text =  [player.p.name+" obtained "+itm.p.amount+" "+RP.items[itm.p.item].name,{endTurn:[{Class:player.p.Class,id:player.p.playerId}]}];
        Q.stageScene("bottomhud",3,{text:text,player:player});
        if(itm.p.type===Q.SPRITE_NPC){
            itm.destroy();
        }
    },
    foundNothing:function(){
        var player = this;
        var text =  [player.p.name+" checked the ground and found nothing...",{endTurn:[{Class:player.p.Class,id:player.p.playerId}]}];
        Q.stageScene("bottomhud",3,{text:text,player:player});
    },
    createMenu:function(){
        var player = this;
        Q.stageScene("playerMenu",3,{player:player});
    },
    checkMenu:function(){
        var p = this.p;
        if(Q.inputs['menu']&&!p.stepping&&p.myTurn){
            //Play the standing animation
            this.p.freeSelecting=false;
            this.clearGuide();
            this.playStand(p.dir);
            Q.addViewport(this);
            this.disableControls();
            this.createMenu();
        }  
    }
});

Q.Sprite.extend("NPC",{
    init: function(p) {
        this._super(p, {
            sheet:"objects",
            type:Q.SPRITE_NPC|Q.SPRITE_INTERACTABLE,
            w:Q.tileH,h:Q.tileH,
            myTurnTiles:100000,
            types:["Grass","Fire"],
            afterFuncs:[]
        });
        this.add("2d,animation,animations");
        this.p.frame = this.getFrame(this.p.npcType);
        this.setXY(this.p.loc);
        this.getText(this.p.text,this.p.textNum);
        this.p.sheet="Deino";
        this.p.sprite="player";
        this.playStand(this.p.dir);
        this.on("runAfterFuncs");
    },
    runAfterFuncs:function(){
        var funcs = this.p.afterFuncs;
        while(funcs.length){
            funcs[0](funcs[1]);
            funcs.splice(0,2);
        }
    },
    setXY:function(loc){
        this.p.x=loc[0]*Q.tileH+Q.tileH/2;
        this.p.y=loc[1]*Q.tileH+Q.tileH/2;
    },
    getFrame:function(type){
        var frame = 0;
        switch(type){
            case "StickMan":
                frame = 1;
                break;
            case "Professor":
                this.p.sheet="Deino";
                frame=1;
        }
        return frame;
    },
    getText:function(data,num){
        this.p.curText=data[num];
    },
    changeText:function(num){
        this.p.textNum=num;
        this.getText(this.p.text,this.p.textNum);
        Q.state.get("playerConnection").socket.emit('setTextNum',{stageName:Q.stage(1).scene.name,npcId:this.p.npcId,textNum:num});
    },
    checkItem:function(props){
        var check = props.item;
        var amount = props.amount;
        var trigger = props.trigger;
        var incomplete = props.incomplete;
        var items = this.p.player.p.items;
        var found = false;
        for(j=0;j<items.length;j++){
            if(items[j].p.id===check){
                this.p.player.loseItem(check,amount);
                var tKeys = Object.keys(trigger);
                for(k=0;k<tKeys.length;k++){
                    this[tKeys[k]](trigger[tKeys[k]]);
                }
                found = true;
            } 
        }
        if(!found){
            var iKeys = Object.keys(incomplete);
            for(k=0;k<iKeys.length;k++){
                this[iKeys](incomplete[iKeys[k]]);
            }
        }
    },
    checkLevel:function(props){
        var check = props.amount;
        var player = this.p.player;
        var trigger = props.trigger;
        var incomplete = props.incomplete;
        if(check<=player.p.level){
            var tKeys = Object.keys(trigger);
            for(k=0;k<tKeys.length;k++){
                this[tKeys[k]](trigger[tKeys[k]]);
            }
        } else {
           var iKeys = Object.keys(incomplete);
            for(k=0;k<iKeys.length;k++){
                this[iKeys](incomplete[iKeys[k]]);
            } 
        }
        
    },
    atDest:function(){
        this.p.dir=this.p.dirOnDest;
        this.playStand(this.p.dir);
    },
    moveNPC:function(props){
        Q.state.get("playerConnection").socket.emit('moveNPC',{stageName:Q.stage(1).scene.name,npcId:this.p.npcId,moveTo:props,playerId:Q.state.get("playerConnection").id});
    },
    moveTo:function(props){
        var path = [props[0],props[1]];
        this.p.dirOnDest=props[2];
        this.add("mover");
        this.p.calcMenuPath = this.getPath(path,new Graph(this.getWalkMatrix()));
        
        this.on("atDest");
        this.add("autoMove");
    },
    getDir:function(pl){
        switch(pl.p.dir){
            case "left":
                return "right";
                break;
            case "up":
                return "down";
                break;
            case "right":
                return "left";
                break;
            case "down":
                return "up";
                break;
        }
    },
    interact:function(player){
        if(player){
            this.p.player = player;
        }
        this.p.dir = this.getDir(this.p.player);
        this.playStand(this.p.dir);
        //Get the textnum from the server
        Q.state.get("playerConnection").socket.emit('getTextNum',{stageName:Q.stage(1).scene.name,npcId:this.p.npcId});
    },
    checkedServer:function(textNum){
        this.changeText(textNum);
        var txt = [];
        for(i=0;i<this.p.curText.length;i++){
            txt.push(this.p.curText[i]);
        }
        var player = this.p.player;
        var startAt = 0;
        if(this.p.items){
            for(i=0;i<this.p.items.length;i++){
                if(this.p.items[i][0]===this.p.textNum){
                    this.p.item=this.p.items[i][1];
                    player.getItem({p:{amount:this.p.items[i][1].amount,item:this.p.items[i][1].item}});
                    this.p.afterFuncs.push(function(item){
                        Q.stageScene("customAnimate",4,{anim:"getItem",item:item});
                    },this.p.item);
                }
            }
        }
        //If the first item in the array is an object, do the function
        if(Q._isObject(txt[0])){
            var keys = Object.keys(txt[0]);
            for(i=0;i<keys.length;i++){
                this[keys[i]](txt[0][keys[i]]);
            }
        }
        
        //If the last item in the text array is an object, change the text to that
        if(Q._isObject(txt[txt.length-1])){
            var newTextNum = txt[txt.length-1].changeText;
            txt.splice(txt.length-1,1);
        }
        
        if(txt.length===0){this.interact(this.p.player);return;};
        txt.push({addControls:[{Class:player.p.Class,id:player.p.playerId}]});
        //Show NPC Text
        Q.stageScene("bottomhud",3,{text:txt,startAt:startAt,player:player,obj:player,npc:this});
        if(newTextNum){
            this.changeText(newTextNum);
        }
    }
});

Q.Sprite.extend("TrashCan",{
    init: function(p) {
        this._super(p, {
            sheet:"objects",
            frame:2,
            type:Q.SPRITE_NPC|Q.SPRITE_INTERACTABLE,
            w:Q.tileH,h:Q.tileH,
            amount:1
        });
        this.add("2d");
        this.getText();
    },
    getText:function(){
        if(this.p.item){
            this.p.text=["You found a "+this.p.item+"."];
        } else {
            this.p.text=["There was nothing there."];
        }
    },
    noItem:function(){
        this.p.text=["There was nothing there."];
        this.p.item=false;
    },
    interact:function(player){
        //Pick up item, else say there's nothing there.
        if(this.p.item){
            player.getItem(this);
            this.noItem();
        } else {
            Q.stageScene("bottomhud",3,{text:this.p.text,player:player,obj:player});
        }
        Q.inputs['interact']=false;
    }
});

Q.Sprite.extend("Pickup",{
    init: function(p) {
        this._super(p, {
            sheet:"berries",
            type:Q.SPRITE_NPC,
            w:Q.tileH,h:Q.tileH
        });
        this.add("2d");
        if(!this.p.amount){this.p.amount=1;};
        this.p.frame = this.getFrame();
        this.setXY(this.p.loc);
    },
    interact:function(player){
        this.p.player = player;
        player.getItem(this);
        //Send status off to the server and destroy the pickup on all other clients in this area.
        var id = this.p.pickupId;
        Q.state.get("playerConnection").socket.emit('pickUpItem',{pickupId:id,playerId:Q.state.get("playerConnection").id});
    },
    setXY:function(loc){
        this.p.x=loc[0]*Q.tileH+Q.tileH/2;
        this.p.y=loc[1]*Q.tileH+Q.tileH/2;
    },
    //Get the proper frame from the spritesheet
    getFrame:function(){
        var frames = [
            "CheriBerry",
            "ChestoBerry",
            "PechaBerry",
            "RawstBerry",
            "AspearBerry",
            "LeppaBerry",
            "OranBerry",
            "PersimBerry"
        ];
        for(i=0;i<frames.length;i++){
            if(this.p.item===frames[i]){
                return i;
            }
        }
    }
});
    
};