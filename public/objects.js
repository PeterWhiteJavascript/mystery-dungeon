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
        }
        this.entity.del("autoMove");
        this.entity.trigger("doneAutoMove");
        
        this.entity.trigger("atDest");
        var interaction = p.action[2];
        Q.stageScene("interaction",10,{interaction:interaction});
    },
    moveAlong:function(to){
        if(!to){this.atDest();return;};
        var p = this.entity.p;
        var walkPath=[];
        var curLoc = {x:p.loc[0],y:p.loc[1]};
        var going = to.length;
        for(var i=0;i<going;i++){
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
            this.entity.trigger("atDest");
            if(p.walkPath.length===0){
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
        if(p.diffX || p.diffY ){
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

Q.component('sendInputs',{
    added:function(p){
        this.entity.on("step",this,"step");
    },
    step:function(dt){
        //Set the current inputs
        var inputs = {};
        var keys = Object.keys(Q.inputs);
        //Send the input only if there is one
        var found = false;
        for(var i=0;i<keys.length;i++){
            if(Q.inputs[keys[i]]){
                inputs[keys[i]]=true;
                found = true;
            }
        }
        //If there was at least one input, send it to the server
        if(found){
            Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.entity.p.playerId,inputs:inputs,time:Date.now()});
        }
        
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
        faceDirection:function(dir){
            this.p.dir = dir;
            this.playStand(dir);
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
       clearGuide:function(){
            var p = this.p;
            if(p.guide&&p.guide.length>0){
                for(i=0;i<p.guide.length;i++){
                    p.guide[i].destroy();
                }
            }
            this.p.guide=[];
        },
        /*getSightRange:function(){
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
        },*/

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
        this.p.expGiven = this.p.level*10;
        this.p.sheet = this.p.sheet ? this.p.sheet : this.p.className;
        this.p.name = this.p.name ? this.p.name : this.p.className+" "+this.p.playerId;
        
        this.playStand(this.p.dir);
        this.p.initialize = false;
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
        this.p.expGiven = this.p.level*10;
        this.p.sheet = this.p.sheet ? this.p.sheet : this.p.className;
        this.p.name = this.p.name ? this.p.name :  this.p.className+" "+this.p.playerId;
        this.playStand(this.p.dir);
        this.p.initialize = false;
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
//For rotating the player when placing him
Q.component("dirControls",{
    added:function(p){
        this.entity.p.canInput = true;
    },
    extend:{
        processInputs:function(inputs){
            if(this.p.canInput){
                if(inputs['interact']){

                } else if(inputs['back']){

                } else if(inputs['up']){
                    this.playStand("up");
                    this.p.canInput=false;
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{up:true,time:inputs.time}});
                } else if(inputs['right']){
                    this.playStand("right");
                    this.p.canInput=false;
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{right:true,time:inputs.time}});
                } else if(inputs['down']){
                    this.playStand("down");
                    this.p.canInput=false;
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{down:true,time:inputs.time}});
                } else if(inputs['left']){
                    this.playStand("left");
                    this.p.canInput=false;
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{left:true,time:inputs.time}});
                }
                var p = this.p;
                if(!this.p.canInput){setTimeout(function(){p.canInput = true;},100)};
            }
        }
    }
});
//The User sprite sends inputs to the server
//This sprite is inserted to the stage, but it does not get rendered as it is not the player itself, but its controls (Sorta)
Q.Sprite.extend("User",{
    init: function(p) {
        this._super(p, {
            inputs:[]
        });
    },
    //Misc functions
    checkClearStage:function(stageNum){
        if(Q.stage(stageNum)){
            Q.clearStage(stageNum);
        }
    },
    loadFullMenu:function(target){
        console.log("TO DO: Load full menu")
       // Q.stageScene("fullMenu",3,{target:target});
        //Don't need to send inputs to server while navigating the menu.
        //When the user is done with the menu, just resume sending inputs to get back to the pointer
       // this.stopSendInputsToServer();
        
    },
    //end Misc functions
    checkDestroyObj:function(){
        if(this.p.obj){
            this.p.obj.trigger("finished");
        }
    },
    //Checks if this object is the user controlled one
    controlled:function(){
        if(this.p.playerId===Q.state.get("playerConnection").id){
            return true;
        }
        return false;
    },
    //Places a player thats position has been validated by the server
    //This is called when placing players at the start of a battle
    placePlayer:function(loc){
        this.checkDestroyObj();
        var playerId = this.p.playerId;
        this.p.obj = Q("Participant",1).items.filter(function(obj){
            return obj.p.playerId===playerId;
        })[0];
        this.p.obj.p.user = this;
        this.p.obj.setPos(loc);
        this.p.obj.playStand(this.p.obj.p.dir?this.p.obj.p.dir:"down");
        this.p.obj.add("dirControls");
        if(this.controlled()){
            Q.addViewport(this.p.obj);
        };
    },
    playStand:function(dir){
        this.p.obj.playStand(dir);
    },
    //Creates a pointer that can be moved
    createPointer:function(control,loc){
        this.checkDestroyObj();
        this.p.obj = Q.stage(1).insert(new Q.Pointer({user:this,loc:loc,control:control}));
        if(this.controlled()){
            Q.addViewport(this.p.obj);
        };
    },
    confirmPointerInput:function(props){
        var time = props['time'];
        var loc = props['loc'];
        //If this is the user that pressed the input
        if(this.p.playerId===Q.state.get("playerConnection").id){
            //Discards all inputs up to the current one that was passed
            var discardInputs = function(inputs,time){
                for(var i=inputs.length-1;i>=0;i--){
                    if(inputs[i]['time']===time){
                        //Splice the array up to this point
                        inputs.splice(0,i+1);
                        return;
                    }
                }
            };
            var inputs = this.p.inputs;
            discardInputs(inputs,time);
            //If there are still inputs, it just means that the pointer accepted inputs after it had already sent a different input
            if(inputs.length){
                if(this.p.obj.p.loc[0]!==loc[0]&&this.p.obj.p.loc[1]!==loc[1]){
                    //This probably won't happen with the current model because the pointer does not accept inputs all that fast.
                    //This kind of system should definitely be used if the server needs to accept a lot of inputs very frequently
                    console.log(this.p.obj.p.loc,loc)
                }
            }
        } 
        //If this is not the user who pressed the input
        //This function only takes the directional inputs
        else {
            this.p.obj.move(loc);
        }
    },
    //Creates the player menu that can be navigated
    createPlayerMenu:function(){
        
    },
    //Creates the bottom text box that can be cycled through
    createInfoTextBox:function(){
        
    },
    sendInputs:function(){
        //Set the current inputs
        var inputs = {};
        var keys = Object.keys(Q.inputs);
        //Send the input only if there is one
        var found = false;
        for(var i=0;i<keys.length;i++){
            if(Q.inputs[keys[i]]){
                inputs[keys[i]]=true;
                found = true;
            }
        }
        //If there was at least one input, send it to the server and store it on the client
        if(found){
            inputs.time = Date.now();
            this.p.inputs.push(inputs);
            this.p.obj.processInputs(inputs);
        }
    },
    sendInputsToServer:function(){
        this.on("step",this,"sendInputs");
    },
    stopSendInputsToServer:function(){
        this.off("step",this,"sendInputs");
    }
});
//This will put all of the code for Player, Ally, and Enemy
//Since all of the inputs will be handled by the Users object, every moving object can be here
Q.Sprite.extend("Participant",{
    init: function(p) {
        this._super(p, {
            sprite:"player",
            type:Q.SPRITE_INTERACTABLE,
            w:Q.tileH,h:Q.tileH
            
        });
        this.add("2d,animation,tween");
        //TODO, merge common player component here
        this.add("animations,attacker,mover");
        if(this.p.loc){
            var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
            this.p.x = pos[0];
            this.p.y = pos[1];
            this.p.z = pos[1];
        }
        
        //Default to hidden
        //All participants are shown when the battle starts
        this.hide();
    },
    setPos:function(loc){
        this.p.loc = loc;
        var pos = Q.setXY(loc[0],loc[1]);
        this.p.x = pos[0];
        this.p.y = pos[1];
        this.p.z = pos[1];
    },
    //Shows this participant's card
    showCard:function(){
        Q.stageScene('card',3,{user:this});
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
            ally:"Player",
            
            inputs:[]
        });
        //Library
        this.add("2d, animation, tween");
        //My components
        this.add("commonPlayer,animations,attacker,mover");
        
    },
    initialize:function(){
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
            z:100000
        }));
        this.p.ready.add("animation");
        this.p.ready.play("displaying");
        this.show();
    },
    //END FUNCTIONS SENT FROM PLAYER TURN ON SERVER
    destroyReady:function(){
        if(this.p.ready){
            this.p.ready.destroy();
        }
    },
    turnStart:function(){
        Q.addViewport(this);
        //Force the player to stand
        this.playStand(this.p.dir);
        this.setStartLoc();
        //Create the menu that allows the user to select an action
        this.createMenu();
        //If this is the client that controls this player
        if(this.p.playerId===Q.state.get("playerConnection").id){
            //This client gets to send inputs to the server
            this.sendInputsToServer();
        }

    },
    turnOver:function(){
        this.p.myTurn=false;
        this.add("directionControls");
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
        this.p.myTurnTiles=this.p.stats.agility;
        this.setStartLoc();
        this.p.canRedo=true;
        //this.p.graphWithWeight = new Graph(this.getWalkMatrix());
        Q.viewFollow(this,this.stage);
        
    },
    createMenu:function(){
        var player = this;
        Q.stageScene("playerMenu",3,{player:player});
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
        //this.p.sheet="Deino";
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
                //this.p.sheet="Deino";
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