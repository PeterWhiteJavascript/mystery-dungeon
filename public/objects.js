Quintus.Objects = function(Q){
    
//Check Ground Possibilities
//For now, items will have 5% and events will have 5%, and rare will have 0.5%, else fail
//Eventually tie this into stat
Q.checkGroundPos={
    SPRITE_STANDARD:{
        items:[
            ["getItem",{p:{item:"OranBerry",amount:1}}]
        ],
        events:[
            ["lowerPP",{p:{amount:-1}}],
            ["tempChangeStat",{p:{amount:1,stat:"ofn"}}]
        ],
        rare:[
            ["getItem",{p:{item:"OranBerry",amount:3}}]
        ]
    },
    SPRITE_FOREST:{
        items:[
            ["getItem",{p:{item:"PechaBerry",amount:1}}]
        ],
        events:[
            ["tempChangeStat",{p:{amount:1,stat:"ofn"}}]
        ],
        rare:[
            ["getItem",{p:{item:"PechaBerry",amount:3}}]
        ]
    },
    SPRITE_MOUNTAIN:{
        items:[
            ["getItem",{p:{item:"SmallRock",amount:1}}]
        ],
        events:[
            ["tempChangeStat",{p:{amount:1,stat:"ofn"}}]
        ],
        rare:[
            ["getItem",{p:{item:"Rock",amount:1}}]
        ]
    },
    SPRITE_WATER:{
        items:[
            ["getItem",{p:{item:"CherriBerry",amount:1}}]
        ],
        events:[
            ["lowerPP",{p:{amount:-1}}],
            ["tempChangeStat",{p:{amount:1,stat:"ofn"}}]
        ],
        rare:[
            ["getItem",{p:{item:"CherriBerry",amount:3}}]
        ]
    }
};
    
Q.component("AI", {
    added: function() {
        var p = this.entity.p;
        this.moveToTarget(Q("Player",1).first());
    },
    moveToTarget:function(target){
        if(!target){alert("You lost :)"); return};
        var p = this.entity.p;
        p.AITo=target.p.location;
        p.target=target;
        p.AIAtDest="attackTarget";
    },
    extend:{
        checkOutline:function(){
            var p = this.p;
            //0 - Top
            //1 - TopRight
            //2 - Right
            //3 - BottomRight
            //4 - Bottom
            //5 - BottomLeft
            //6 - Left
            //7 - TopLeft
            var outline = [];
            outline.push(Q.stage(1).locate(p.x,p.y-70,Q.SPRITE_INTERACTABLE));
            outline.push(Q.stage(1).locate(p.x+70,p.y-70,Q.SPRITE_INTERACTABLE));
            outline.push(Q.stage(1).locate(p.x+70,p.y,Q.SPRITE_INTERACTABLE));
            outline.push(Q.stage(1).locate(p.x+70,p.y+70,Q.SPRITE_INTERACTABLE));
            outline.push(Q.stage(1).locate(p.x,p.y+70,Q.SPRITE_INTERACTABLE));
            outline.push(Q.stage(1).locate(p.x-70,p.y+70,Q.SPRITE_INTERACTABLE));
            outline.push(Q.stage(1).locate(p.x-70,p.y,Q.SPRITE_INTERACTABLE));
            outline.push(Q.stage(1).locate(p.x-70,p.y-70,Q.SPRITE_INTERACTABLE));

            for(i=0;i<outline.length;i++){
                if(outline[i]){
                    if(outline[i].p.character===p.target.p.character){
                        //Obviously we will want to run a function here to determine the best attack.
                        //Also, the first parameter is 'targets' so we still need to check the attack area to find more targets
                        this.useAttack([outline[i]],p.attacks[0],outline[i]);
                        return true;
                    }
                }
            }

        },  
        attackTarget:function(){
            var p = this.p;
            var attackedTarget = this.checkOutline();
            if(!attackedTarget){
                this.endTurn();
            }
        },
    }
    
});
    
Q.component("autoMove", {
    added: function() {
      var p = this.entity.p;
      if(!p.stepDistance) { p.stepDistance = 70; }
      if(!p.stepDelay) { p.stepDelay = 0.3; }

      p.stepWait = 0;
      p.stepping=false;
      this.entity.on("step",this,"step");
      p.walkPath = this.moveAlong(p.menuPath);
    },
    

    atDest:function(){
        var p = this.entity.p;
        p.location=[(p.x-p.w/2)/p.tileSize,(p.y-p.h/2)/p.tileSize];
        this.entity.getTileLocation();
        
        this.entity.clearGuide();
        p.stepped=false;
        p.stepping=false;
        if(!this.entity.has("AI")){
            this.entity.playStand(p.dir);
            //this.entity.createFreePointer();
            this.entity.createMenu();
        } else {
            this.entity[p.AIAtDest]();
        }
        this.entity.del("autoMove");
        //this.entity.trigger("atDest");
    },
    moveAlong:function(to){
        var p = this.entity.p;
        var phase = Q.state.get("phase");
        var walkPath=[];
        p.costPath=[];
        var curLoc = {x:p.location[0],y:p.location[1]};
        var going = to.length;
        if(going>p.myTurnTiles){ 
            going=p.myTurnTiles;
        }
        if(phase===1){going=to.length;};
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
        }
        if(p.walkPath[0][1]==="up") {
            p.diffY = -p.stepDistance;
        } else if(p.walkPath[0][1]==="down"){
            p.diffY = p.stepDistance;
        }
        
        //Run the first time
        if((p.diffX || p.diffY )&&p.myTurnTiles>0) {
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
                        p.dir="Up";
                        break;
                    case "down":
                        p.dir="Down";
                        break;
                }
                switch(p.walkPath[0][0]){
                    case "right":
                        p.dir+="Right";
                        break;
                    case "left":
                        p.dir+="Left";
                        break;
                }
                
                //Play the correct direction walking animation
                this.entity.playWalk(p.dir);
                if(Q.state.get("phase")===2){
                    p.myTurnTiles-=p.costPath[0];
                }
            };
        }
    }
});

//Used in adventuring phase (1)
Q.component("stepControls", {
    added: function() {
      var p = this.entity.p;
      if(!p.stepDistance) { p.stepDistance = 70; }
      if(!p.stepDelay) { p.stepDelay = 0.3; }
      p.stepWait = 0;
      p.canMove=true;
      this.entity.on("step",this,"step");
      p.maxXLocation = (Q.stage(1).width-35)/70;
      p.maxYLocation = (Q.stage(1).height-35)/70;
    },
    //When at the tile that you were moving to
    atDest:function(){
        var p = this.entity.p;
        p.location=[(p.x-p.w/2)/p.tileSize,(p.y-p.h/2)/p.tileSize];
        this.entity.getTileLocation();
        //Q.setFog(this.entity.stage);
        p.stepped=false;
        p.stepping=false;
        this.entity.trigger("atDest");
    },
    
    
    checkDiag:function(dir,x,y){
        var p = this.entity.p;
        var obj1 = Q.stage(1).locate(p.x+x,p.y,Q.SPRITE_INTERACTABLE);
        var obj2 = Q.stage(1).locate(p.x,p.y+y,Q.SPRITE_INTERACTABLE);
        var tiles = this.entity.stage.lists.TileLayer[1].p.tiles;
        var tile1 = true,
            tile2 = true;
        switch(dir){
            case "UpLeft":
                tile1 = Q.processTileTo(this.entity.stage.lists.TileLayer[1].tileCollisionObjects[tiles[p.location[1]-1][p.location[0]]].p.type,this.entity);
                tile2 = Q.processTileTo(this.entity.stage.lists.TileLayer[1].tileCollisionObjects[tiles[p.location[1]][p.location[0]-1]].p.type,this.entity);
                break;
            case "UpRight":
                tile1 = Q.processTileTo(this.entity.stage.lists.TileLayer[1].tileCollisionObjects[tiles[p.location[1]-1][p.location[0]]].p.type,this.entity);
                tile2 = Q.processTileTo(this.entity.stage.lists.TileLayer[1].tileCollisionObjects[tiles[p.location[1]][p.location[0]+1]].p.type,this.entity);
                break;
            case "DownRight":
                tile1 = Q.processTileTo(this.entity.stage.lists.TileLayer[1].tileCollisionObjects[tiles[p.location[1]+1][p.location[0]]].p.type,this.entity);
                tile2 = Q.processTileTo(this.entity.stage.lists.TileLayer[1].tileCollisionObjects[tiles[p.location[1]][p.location[0]+1]].p.type,this.entity);
                break;
            case "DownLeft":
                tile1 = Q.processTileTo(this.entity.stage.lists.TileLayer[1].tileCollisionObjects[tiles[p.location[1]+1][p.location[0]]].p.type,this.entity);
                tile2 = Q.processTileTo(this.entity.stage.lists.TileLayer[1].tileCollisionObjects[tiles[p.location[1]][p.location[0]-1]].p.type,this.entity);
                break;
            default:
                obj1=false;
                obj2=false;
            break;
        }
        if(obj1||obj2||!tile1||!tile2){return true;}
        else {return false;};
    },
    
    goOffscreen:function(x,y){
        var level = Q.stage(1).options.path;
        var pathNum = Q.stage(1).options.pathNum;
        var newPathNum = [pathNum[0]+x,pathNum[1]+y];
        var playerLoc=[];
        var p = this.entity.p;
        switch(true){
            //Player is going off the right side of this level
            case x>0:
                playerLoc[0]=0;
                break;
            //Player is going off from the top or bottom of this level
            case x===0:
                playerLoc[0]=(p.x+35)/70;
                break;
            case x<0:
                //This string means that we need to figure out the maxX of the tilelayer on the next stage.
                playerLoc[0]="x";
                break;
        }
        switch(true){
            //Player is going off the bottom of this level
            case y>0:
                playerLoc[1]=0;
                break;
            //Player is going off from the right or left of this level
            case y===0:
                playerLoc[1]=(p.y+35)/70;
                break;
            case y<0:
                //This string means that we need to figure out the maxY of the tilelayer on the next stage.
                playerLoc[1]="y";
                break;
        }
        var newArea = level+newPathNum[0]+"_"+newPathNum[1];
        Q.goToStage(0,newArea,playerLoc);
    },
    
    step: function(dt) {
        var p = this.entity.p,
            moved = false;
        p.socket.emit('update', { playerId: p.playerId, x: p.x, y: p.y, dir:p.dir, sheet:p.sheet, character:p.character});
        if(p.canMove){
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

            p.diffX = 0;
            p.diffY = 0;

            if(Q.inputs['left']) {
                p.diffX = -p.stepDistance;
                p.dir='Left';
                if(Q.inputs['diagMove']){
                    p.diffY = -p.stepDistance;
                    p.dir="UpLeft";
                }
            } else if(Q.inputs['right']) {
                p.diffX = p.stepDistance;
                p.dir='Right';
                if(Q.inputs['diagMove']){
                    p.diffY = p.stepDistance;
                    p.dir="DownRight";
                }
            }

            if(Q.inputs['up']) {
                p.diffY = -p.stepDistance;
                if(Q.inputs['left']){
                    p.dir="UpLeft";
                } else if(Q.inputs['right']){
                    p.dir="UpRight";
                } else {
                    p.dir='Up';
                    if(Q.inputs['diagMove']){
                        p.diffX = p.stepDistance;
                        p.dir="UpRight";
                    }
                }
            } else if(Q.inputs['down']) {
                p.diffY = p.stepDistance;
                if(Q.inputs['left']){
                    p.dir="DownLeft";
                } else if(Q.inputs['right']){
                    p.dir="DownRight";
                } else {
                    p.dir='Down';
                    if(Q.inputs['diagMove']){
                        p.diffX = -p.stepDistance;
                        p.dir="DownLeft";
                    }
                }
            }
            
            //Run the first time
            if(p.diffX || p.diffY ) {
                
                
                p.destX = p.x + p.diffX;
                p.destY = p.y + p.diffY;

                var locTo=[(p.destX-(p.h/2))/70,(p.destY-(p.w/2))/70];
                var tiles = this.entity.stage.lists.TileLayer[1].p.tiles;
                //Check to make sure locTo to is on this stage
                switch(true){
                    case locTo[0]<0:
                        this.goOffscreen(-1,0);
                        return;
                        break;
                    case locTo[0]>=tiles.length:
                        this.goOffscreen(1,0);
                        return;
                        break;
                    case locTo[1]<0:
                        this.goOffscreen(0,-1);
                        return;
                        break;
                    case locTo[1]>=tiles[0].length:
                        this.goOffscreen(0,1);
                        return;
                        break;
                }
                //Not allowed to move like this if it's not adventure phase
                if(this.checkDiag(p.dir,p.diffX,p.diffY)){
                    p.diffX=0;
                    p.diffY=0;
                }
                //Make sure we aren't going to crash into an interactable
                //Don't collide with players
                if(obj = Q.stage().locate(p.x+p.diffX,p.y+p.diffY,Q.SPRITE_INTERACTABLE)){
                    this.entity.playWalk(p.dir);
                    this.atDest();
                    return;

                }
                p.tileTo = this.entity.stage.lists.TileLayer[1].tileCollisionObjects[tiles[locTo[1]][locTo[0]]].p.type;
                //Calculate how fast the player moves on this tile
                p.stepDelay = Q.getMoveSpeed(p.tileTo,this.entity);

                //Make sure the player doesn't walk off of the map!
                if(locTo[0]<0||locTo[1]<0||locTo[0]>this.entity.stage.lists.TileLayer[1].p.tiles[0].length-1||locTo[1]>this.entity.stage.lists.TileLayer[1].p.tiles.length-1){
                    p.stepping = false;
                    this.atDest();
                    return;
                }
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;

                p.stepWait = p.stepDelay;
                p.stepped=true;

                //Check if we can't go to that tile and..
                //Make sure we can actually walk
                if(!Q.processTileTo(p.tileTo,this.entity)){
                    p.stepping=false;
                }
                //Add the viewport after one movement
                if(!Q.stage(1).viewport.following||Q.stage(1).viewport.following.p.name!==this.entity.p.name){
                    Q.addViewport(this.entity);
                }
                this.entity.playWalk(p.dir);
            //If not moving
            } else {
                this.entity.playStand(p.dir);
            }
            if(Q.inputs['interact']&&!p.stepping){
                var obj;
                switch(p.dir){
                    case "Left":
                        obj = Q.stage().locate(p.x-p.tileSize,p.y,Q.SPRITE_INTERACTABLE);
                        break;
                    case "UpLeft":
                        obj = Q.stage().locate(p.x-p.tileSize,p.y-p.tileSize,Q.SPRITE_INTERACTABLE);
                        break;
                    case "Up":
                        obj = Q.stage().locate(p.x,p.y-p.tileSize,Q.SPRITE_INTERACTABLE);
                        break;
                    case "UpRight":
                        obj = Q.stage().locate(p.x+p.tileSize,p.y-p.tileSize,Q.SPRITE_INTERACTABLE);
                        break;
                    case "Right":
                        obj = Q.stage().locate(p.x+p.tileSize,p.y,Q.SPRITE_INTERACTABLE);
                        break;
                    case "DownRight":
                        obj = Q.stage().locate(p.x+p.tileSize,p.y+p.tileSize,Q.SPRITE_INTERACTABLE);
                        break;
                    case "Down":
                        obj = Q.stage().locate(p.x,p.y+p.tileSize,Q.SPRITE_INTERACTABLE);
                        break;
                    case "DownLeft":
                        obj = Q.stage().locate(p.x-p.tileSize,p.y+p.tileSize,Q.SPRITE_INTERACTABLE);
                        break;
                }
                //If there's nothing in front, check below
                if(!obj){
                    obj = Q.stage().locate(p.x,p.y,Q.SPRITE_NPC);
                    if(!obj){
                        return;
                    }
                };
                //Call the interact function on the object
                if(obj.p.type===Q.SPRITE_INTERACTABLE){
                    //this.entity.interact(obj);
                    Q.stageScene("interactingMenu",3,{player:this.entity,target:obj});
                } else if(obj.p.type===Q.SPRITE_NPC|Q.SPRITE_INTERACTABLE){
                    obj.interact(this.entity);
                } 
                //Play the standing animation
                this.entity.playStand(p.dir);
                //Delete the step controls (added after the text is done);
                this.entity.disableControls();
                Q.inputs['interact']=false;

            }
        }
    }
});

//Added to other player controlled characters
Q.component('protagonist', {
    added: function (p) {
        var p = this.entity.p;
        p.socket.emit('update', { playerId: p.playerId, x: p.x, y: p.y, sheet: p.sheet,dir:p.dir, character:p.character});
    }
});

//Added to other player controlled characters
Q.component('actor', {
    added: function (p) {
        this.entity.p.update=true;

        var temp = this.entity;
        //Automatically destroys the actor if it has not moved in 10 seconds
        setInterval(function () {
            if (!temp.p.update) {
              temp.destroy();
            }
            temp.p.update = false;
        }, 3000);
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
    },
    changePos:function(dir,char){
        switch(dir){
            case "Left":
                this.p.x=char.p.x-char.p.w/2-this.p.w/2;
                this.p.y=char.p.y;
                this.p.angle=270;
                break;
            case "UpLeft":
                this.p.x=char.p.x-char.p.w/2-this.p.w/2;
                this.p.y=char.p.y-char.p.h/2-this.p.h/2;
                this.p.angle=315;
                break;
            case "Up":
                this.p.x=char.p.x;
                this.p.y=char.p.y-char.p.h/2-this.p.h/2;
                this.p.angle=0;
                break;
            case "UpRight":
                this.p.x=char.p.x+char.p.w/2+this.p.w/2;
                this.p.y=char.p.y-char.p.h/2-this.p.h/2;
                this.p.angle=45;
                break;
            case "Right":
                this.p.x=char.p.x+char.p.w/2+this.p.w/2;
                this.p.y=char.p.y;
                this.p.angle=90;
                break;
            case "DownRight":
                this.p.x=char.p.x+char.p.w/2+this.p.w/2;
                this.p.y=char.p.y+char.p.h/2+this.p.h/2;
                this.p.angle=135;
                break;
            case "Down":
                this.p.x=char.p.x;
                this.p.y=char.p.y+char.p.w/2+this.p.w/2;
                this.p.angle=180;
                break;
            case "DownLeft":
                this.p.x=char.p.x-char.p.w/2-this.p.w/2;
                this.p.y=char.p.y+char.p.h/2+this.p.h/2;
                this.p.angle=225;
                break;
        }
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
    
    step:function(dt){
        var p = this.entity.p;
        if(p.canMove){
            if(Q.inputs['left']) {
                p.dir='Left';
            } else if(Q.inputs['right']) {;
                p.dir='Right';
            }
            if(Q.inputs['up']) {
                if(Q.inputs['left']){
                    p.dir="UpLeft";
                } else if(Q.inputs['right']){
                    p.dir="UpRight";
                } else {
                    p.dir='Up';
                }
            } else if(Q.inputs['down']) {
                if(Q.inputs['left']){
                    p.dir="DownLeft";
                } else if(Q.inputs['right']){
                    p.dir="DownRight";
                } else {
                    p.dir='Down';
                }
            }
            this.entity.playStand(p.dir);
            if(p.dirTri&&p.lastDir!==p.dir){
                this.entity.moveTri();
            }
            
            if(Q.inputs['interact']&&!p.stepping){
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
            Q.afterDir();
        }
    }
});

Q.component("animations", {
    added:function(){
        this.entity.on("playStand");  
        this.entity.on("fainted")
    },
    extend:{
        checkPlayDir:function(dir){
            if(!dir){return this.p.dir;}else{return dir;}
        },
        playStand:function(dir){
            this.play("standing"+this.checkPlayDir(dir));
        },
        playWalk:function(dir){
            this.play("walking"+this.checkPlayDir(dir));
        },
        playAttack:function(dir){
            this.play("attacking"+this.checkPlayDir(dir));
        },
        playFainting:function(){
            this.play("fainting");
        }
    }
});

Q.component("attacker",{
    added:function(){
        //Fill this with attacks during this battle
        this.entity.p.attackHistory=[];
    },
    extend:{
        getAttackArea:function(attack){
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
                        var obj = Q.stage(1).locate(center.p.x+(i*70),center.p.y+(j*70),Q.SPRITE_INTERACTABLE);
                        
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
            var loc = this.p.location;
            this.clearGuide();

            var minTile = 0;
            var tileLayer = Q.stage(1).lists.TileLayer[1];
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
            var canCheck = [true,true,true,true,true,true,true,true,true];
            
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
                            if(startY<0&&startX<0){
                                if(canCheck[0]){check=0;};

                            } else if(startY<0&&startX===0){
                                if(canCheck[1]){check=1;};

                            } else if(startY<0&&startX>0){
                                if(canCheck[2]){check=2;};

                            } else if(startY===0&&startX<0){
                                if(canCheck[3]){check=3;};

                            }  else if(startY===0&&startX>0){
                                if(canCheck[4]){check=4;};

                            } else if(startY>0&&startX<0){
                                if(canCheck[5]){check=5;};

                            } else if(startY>0&&startX===0){
                                if(canCheck[6]){check=6;};

                            } else if(startY>0&&startX>0){
                                if(canCheck[7]){check=7;};
                                
                            } else if(startY===0&&startX===0){
                                if(canCheck[8]){check=8;};
                            }
                            var x = checkX(tileStartX+startX);
                            var y = checkY(tileStartY+startY);
                            if((Q._isNumber(x)&&Q._isNumber(y))&&graph.grid[x][y]&&check>=0){
                                //If the tile is an object or a wall
                                if(graph.grid[tileStartX+startX][tileStartY+startY].weight>=10000){
                                    //Mark this direction as finished
                                    canCheck[check]=false;
                                    //Find if there's an object
                                    var obj = Q.stage(1).locate(graph.grid[tileStartX+startX][tileStartY+startY].x*70+35,graph.grid[tileStartX + startX][tileStartY + startY].y*70+35,Q.SPRITE_INTERACTABLE);
                                    
                                    //If there's an object, add it to the possible targets array
                                    //Also make sure to not add this object
                                    if(obj){
                                        switch(attack.target){
                                            case "self":
                                                if(obj.p.id===this.p.id){
                                                    possibleTargets.push(obj);
                                                    attackTiles.push(graph.grid[tileStartX+startX][tileStartY+startY]);
                                                }
                                                break;
                                            case "enemy":
                                                if(obj.p.Class==="Enemy"){
                                                    possibleTargets.push(obj);
                                                    attackTiles.push(graph.grid[tileStartX+startX][tileStartY+startY]);
                                                }
                                                break;
                                            case "ally":
                                                if(obj.p.Class===this.p.Class){
                                                    possibleTargets.push(obj);
                                                    attackTiles.push(graph.grid[tileStartX+startX][tileStartY+startY]);
                                                }
                                                break;
                                            case "all":
                                                if(obj.p.Class==="Player"||obj.p.Class==="Player"){
                                                    possibleTargets.push(obj);
                                                    attackTiles.push(graph.grid[tileStartX+startX][tileStartY+startY]);
                                                }
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
                    this.p.guide.push(Q.stage(1).insert(new Q.PathBox({x:attackTiles[i].x*70+35,y:attackTiles[i].y*70+35}),false,true));
                }
            }
            this.p.possTargets=possibleTargets;
        },
        faceTarget:function(target){
            var tLoc = [(target.p.x-35)/70,(target.p.y-35)/70];
            var pLoc = this.p.location;
            var xDif = tLoc[0]-pLoc[0];
            var yDif = tLoc[1]-pLoc[1];
            if(xDif===0&&yDif===0){return this.p.dir;};
            var newDir = "";
            switch(true){
                case yDif<0:
                    newDir+="Up";
                    break
                case yDif>0:
                    newDir+="Down";
                    break;
            }
            switch(true){
                case xDif<0:
                    newDir+="Left";
                    break
                case xDif>0:
                    newDir+="Right";
                    break;
            }
            return newDir;
        },
        compareDirection:function(user,target){
            var getDirection = function(dir,dirs){
                for(i=0;i<dirs.length;i++){
                    if(dir===dirs[i]){
                        return i;
                    }
                }
                alert("Invalid direction!");
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
            var backSide = 0.75;
            var side = 1;
            var frontSide = 1.25;
            var front = 1.5;
            
            //Array of possible directions clockwise from 12 o'clock
            var dirs = ["Up", "UpRight", "Right", "DownRight", "Down", "DownLeft", "Left", "UpLeft"];
            //Get the number for the user dir
            var userDir = getDirection(user.p.dir,dirs);
            //Get the number for the target dir
            var targetDir = getDirection(target.p.dir,dirs);
            //An array of the values (also clockwise from 12 o'clock)
            //EX:
            //if both user and target are 'Up', they will both be 0 and that will give the back value (since they are both facing up, the user has attacked from behind).
            var values = [back,backSide,side,frontSide,front,frontSide,side,backSide];
            for(j=0;j<values.length;j++){
                //Make sure we are in bounds, else loop around to the start of the array
                if(checkBounds(userDir+j)===targetDir){
                    //If we've found the proper value, return it
                    return values[j];
                }
            }
        },
        useAttack:function(targets,attack,center){
            //Check to see if we have enough pp to use the move.
            for(i=0;i<this.p.attacks.length;i++){
                if(attack.id===this.p.attacks[i].id){
                    if(this.p.pp[i][0]>=1){
                        //Decrease PP for move
                        this.changePP([i,-1]);
                    } else {
                        var text = ["Not enough PP for "+attack.name+"."];
                        var endFuncs = {addViewport:[this],createMenu:[this]};
                        text.push(endFuncs);
                        Q.stageScene("bottomhud",3,{text:text,player:this});
                        return;
                    }
                }
            }
            //Set the direction we need to be facing
            this.p.dir = this.faceTarget(center);
            //Play the attack animation
            this.playAttack(this.p.dir);
            
            var text =  [this.p.name+" used "+attack.name+". "];
            var endFuncs = {addViewport:[this],endTurn:[this]};
            //Loop through the targets and generate the proper text
            for(a=0;a<targets.length;a++){
                var target = targets[a];
                text.push({addViewport:[target]});
                //Random number between 1 and 100 
                var rand = Math.floor(Math.random()*100)+1;
                var hit;
                var facingValue = this.compareDirection(this,targets[a]);
                rand*=facingValue;
                rand = Math.floor(rand);
                //If the attack hits
                if(rand<=attack.accuracy){
                    //If the attack does damage
                    if(attack.power>0){
                        //Figure out how much damage this attack does 
                        var damageCalc = RP.attackFuncs.calculateDamage(this,target,attack,facingValue);
                        //Show the attack text
                        if(damageCalc.modText.length>0){
                            for(j=0;j<damageCalc.modText.length;j++){
                                text.push(damageCalc.modText[j]);
                            }
                        }
                        //We hit!
                        if(damageCalc.damage>0){
                            text.push("Hit "+target.p.name+" for "+damageCalc.damage+" damage!");
                            target.p.curHp-=damageCalc.damage;
                            if(target.p.curHp<=0){
                                text.push({faint:[target]},target.p.name+" fainted!");
                                target.removeFromTurnOrder();
                                var expText = target.giveExp();
                                //If someone leveled up
                                if(expText&&expText.length>0){
                                    for(jjj=0;jjj<expText.length;jjj++){
                                        text.push(expText[jjj]);
                                    }
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
                                    text.push(effectText[kk]);
                                }
                            }
                        }
                    }
                    hit = true;
                }
                //Missed
                else {
                    text.push("Missed "+target.p.name+"...");
                    hit = false;
                }
            }
            //Finish up with the functions that are called after the text is done
            text.push(endFuncs);
            Q.stageScene("bottomhud",3,{text:text,player:this,obj:this,obj2:this,target:target});
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

Q.component("commonPlayer", {
    extend:{
        faint:function(){
            this.playFainting();
            if(this.p.Class==="Enemy"){
                this.removeFromEnemies();
            }
        },
        fainted:function(){
            this.stage.remove(this);
        },
        removeFromTurnOrder:function(){
            //Remove from the turn order right away so that it won't be this's turn
            var turnOrder = Q.state.get("turnOrder");
            for(i=0;i<turnOrder.length;i++){
                if(turnOrder[i].p.id===this.p.id){
                    turnOrder.splice(i,1);
                }
            }
            
        },
        giveExp:function(){
            var leveledUp = [];
            if(this.p.Class==="Enemy"){
                var exp=this.p.expGiven;
                Q("Player",1).each(function(){
                    var up = this.gainExp(exp);
                    if(up){leveledUp.push(this.p.name+" grew to level "+this.p.level+"!");};
                });
            } else if(this.p.Class==="Player"){
                var exp = this.p.expGiven||50;
                Q("Enemy",1).each(function(){
                    var up = this.gainExp(exp);
                    if(up){leveledUp.push(this.p.name+" grew to level "+this.p.level+"!");};
                });
            }
            return leveledUp;
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
        
        getTileLocation:function(){
            var loc = this.p.location;
            var tiles = this.stage.lists.TileLayer[1].p.tiles;
            return this.stage.lists.TileLayer[1].tileCollisionObjects[tiles[loc[1]][loc[0]]].p.type;
        },
        getWalkMatrix:function(){
            function getWalkable(tiles,obj){
                if(Q.stage(1).lists.TileLayer[1].tileCollisionObjects[tiles[j][i]]){
                    return Q.getTileCost(Q.stage(1).lists.TileLayer[1].tileCollisionObjects[tiles[j][i]].p.type,obj.p);
                }
                return 10000;
            }

            var tiles=Q.stage(1).lists.TileLayer[1].p.tiles;
            var cM=[];
            if(tiles){
                for(i=0;i<tiles.length;i++){
                    var costRow = [];
                    var colLoc = i*70+35;
                    for(j=0;j<tiles[i].length;j++){
                        var rowLoc=j*70+35;
                        var cost = getWalkable(tiles,this);
                        var objOn=false;
                        objOn = Q.stage(1).locate(colLoc,rowLoc,Q.SPRITE_INTERACTABLE);
                        //If this is AI going to, we need to stop one square before the player.
                        //Mark the square that the player is standing on as no object.
                        //In our auto move, if AITo is set, short by 1
                        if(objOn&&this.p.AITo){
                            if((objOn.p.x-35)/70===this.p.AITo.x&&(objOn.p.y-35)/70===this.p.AITo.y){
                                objOn=false;
                            }
                        }
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
        tempChangeStat:function(props){
            var player = this;
            var text =  [player.p.name+" raised "+props.p.stat+" by "+props.p.amount+" temporarily.",{endTurn:[player]}];
            Q.stageScene("bottomhud",3,{text:text,player:player,obj:player});
            this.p.statsModified[props.p.stat]+=props.p.amount;
        },
        changePP:function(props){
            this.p.pp[props[0]][0]+=props[1];
        },
        useItem:function(item){
            var itm = item;
            var player = this;
            //Decrease the inventory (obviously skip this if the item is not consumable)
            if(itm.p.kind==="Consumable"){
                for(i=0;i<player.p.items.length;i++){
                    if(player.p.items[i].p.name===itm.p.name){
                        player.p.items[i].amount--;
                        if(player.p.items[i].amount===0){
                            player.p.items.splice(i,1);
                        }
                    }
                }
            }
            var text = RP.itemFuncs[itm.p.effect[0]](itm.p,this);
            return text;
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
            var loc = this.p.location;
            this.p.sightTiles=[];

            var minTile = 0;
            var tileLayer = Q.stage(1).lists.TileLayer[1];
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
            var graph = new Graph(this.getWalkMatrix(true));
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
            var loc = this.p.location;
            this.p.movTiles=[];
            this.clearGuide();

            var minTile = 0;
            var tileLayer = Q.stage(1).lists.TileLayer[1];
            var maxTileRow = tileLayer.p.tiles[0].length;
            var maxTileCol = tileLayer.p.tiles.length;
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
            if(loc[0]+mov>=maxTileRow){
                dif = cols-(maxTileRow-loc[0]+mov);
                cols-=dif;
            }
            if(loc[1]-mov<minTile){
                dif = rows-(mov+1+loc[1]);
                rows-=dif;
                tileStartY=mov+1-rows+loc[1];

            }
            if(loc[1]+mov>=maxTileCol){
                dif = rows-(maxTileCol-loc[1]+mov);
                rows-=dif;
            }
            if(rows>maxTileRow){rows=maxTileRow;};
            if(cols>maxTileCol){cols=maxTileCol;};
            var movTiles=[];
            //Get all possible move locations that are within the bounds
            var graph = this.p.graphWithWeight;
            for(i=tileStartY;i<tileStartY+rows;i++){
                for(j=tileStartX;j<tileStartX+cols;j++){
                    if(graph.grid[j][i].weight<10000){
                        movTiles.push(graph.grid[j][i]);
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
                        this.p.guide.push(Q.stage(1).insert(new Q.PathBox({x:movTiles[i].x*70+35,y:movTiles[i].y*70+35}),false,true));
                        this.p.movTiles.push(movTiles[i]);
                    }
                }
            //If there's nowhere to move
            } else {

            }
        },
        menuMoveTo:function(to){
            this.p.menuPath = this.getPath(to,this.p.graphWithWeight);
            this.clearGuide();
            if(this.p.menuPath.length){
                for(i=0;i<this.p.menuPath.length;i++){
                    this.p.guide.push(this.stage.insert(new Q.PathBox({x:this.p.menuPath[i].x*70+35,y:this.p.menuPath[i].y*70+35}),false,true));
                }
            }
            Q.addViewport(this);
            this.add("autoMove");
        },

        getPath:function(toLoc,graph,prop,score){
            var loc = [(this.p.x-this.p.w/2)/this.p.tileSize,(this.p.y-this.p.h/2)/this.p.tileSize];
            var start = graph.grid[loc[0]][loc[1]];
            var end = graph.grid[toLoc[0]][toLoc[1]];
            var result;
            if(prop==="maxScore"){
                result = astar.search(graph, start, end,{maxScore:score});
            //Not in use (was using it for attacks but realized that is stupid)
            } else if(prop==="diagonal"){
                result = astar.search(graph, start, end,{heuristic: astar.heuristics.diagonal});
            } else {
                result = astar.search(graph, start, end);
            }
            return result;
        },
        interact:function(player){
            //Show Player Text
            Q.stageScene("bottomhud",3,{text:[player.p.text[0]+" Id #"+player.p.playerId],player:player,obj:this});
            Q.inputs['interact']=false;
        },
        setLocation:function(){
            return [(this.p.x-this.p.w/2)/this.p.tileSize,(this.p.y-this.p.h/2)/this.p.tileSize];
        },
        addViewport:function(){
            Q.addViewport(this);
        },
        step:function(dt){
            if(this.p.initialize){
                this.initialize();
                this.playStand(this.p.dir);
            }
        }
    }
});

Q.Sprite.extend("Enemy",{
    init: function(p) {
        this._super(p, {
            frame:0,
            sprite:"player",
            Class:"Enemy",
            
            dir:"Down",
            
            objInFront:false,
            initialize:true,
            guide:[],
            possTargets:[],
            
            type:Q.SPRITE_INTERACTABLE,
            tileSize:70,
            w:70,h:70,//ALL OBJECTS MUST BE 70x70 SO THAT THEY MOVE PROPERLY
            
            //Character stats
            statsModified:{
                ofn:0,
                dfn:0,
                spd:0
            },
            buffs:[],
            debuffs:[]
        });
        //Library
        this.add("2d, animation, tween");
        //My components
        this.add("commonPlayer,animations,attacker");
    },
    initialize:function(){
        //Make sure that there's nothing standing on the spawn point, else move this enemy
        this.p.location = this.confirmLocation(this.p.location);
        this.p.x=this.p.location[0]*70+35;
        this.p.y=this.p.location[1]*70+35;
        var data = RP.monsters[this.p.character];
        var opts = this.p.opts;
        this.p.name = this.p.character;
        this.p.expGiven = data.exp;
        
        this.p.level = opts.level;
        this.p.exp = RP.expNeeded[this.p.level-1];
        this.p.gender = opts.gender;
        
        this.p.ability = RP.abilities[data.abilities[Math.floor(Math.random()*data.abilities.length)]];
        var attacks = data.attacks;
        this.p.attacks = [];
        this.p.pp=[];
        for(i=0;i<attacks.length;i++){
            //Right now just push all possible attacks
            if(attacks[i][1]<=this.p.level){
                this.p.attacks.push(RP.moves[attacks[i][0]]);
                this.p.pp.push([RP.moves[attacks[i][0]].pp,RP.moves[attacks[i][0]].pp]);
            }
        }
        this.p.items = opts.items || [];
        this.p.special = opts.special || {};
        this.p.text = opts.text || ["..."];
        this.p.species = this.p.character;
        //Random IV's
        var iv = {
            hp:Math.ceil(Math.random()*10),
            ofn:Math.ceil(Math.random()*10),
            dfn:Math.ceil(Math.random()*10),
            spd:Math.ceil(Math.random()*10)
        };
        var other = {
            mind:data.otherSeed.mind,
            dexterity:data.otherSeed.dexterity,
            strength:data.otherSeed.strength,
            stamina:data.otherSeed.stamina
        };
        var keys = Object.keys(other);
        for(i=0;i<keys.length;i++){
            other[keys[i]]=Math.floor(Math.random()*other[keys[i]][1])+other[keys[i]][0]+1;
        }
        this.p.stats = {
            base:data.baseStats,
            iv:iv,
            other:other
        };
        var stats = Q.getStats(this.p.stats,this.p.level);
        this.p.maxHp = stats[0];
        this.p.ofn = stats[1];
        this.p.dfn = stats[2];
        this.p.spd = stats[3];
        
        //These properties are use in the damage calculation and are changed by stat modifiers (leer, etc...)
        this.p.mod_ofn = this.p.ofn;
        this.p.mod_dfn = this.p.dfn;
        this.p.mod_spd = this.p.spd;
        
        this.p.curHp = this.p.maxHp;
        
        this.p.dexNum = RP.monsters[this.p.species].dexNum;
        this.p.types = RP.monsters[this.p.species].types;
        
        this.p.sheet=this.p.species;
        
        this.p.graphWithWeight = new Graph(this.getWalkMatrix(true));
        
        this.p.initialize = false;
    },
    
    //This function will remove this enemy from the enmeis array and check if the array is empty so we can go back to phase 1
    removeFromEnemies:function(){
        var enm = Q.state.get("enemies");
        for(i=0;i<enm[this.p.eventId].length;i++){
            if(this.p.id===enm[this.p.eventId][i].p.id){
                enm[this.p.eventId].splice(i,1);
            }
        }
        if(enm[this.p.eventId].length===0){
            Q.eventCompleted(this.p.eventId,this.p.completed)
        }
    },
    confirmLocation:function(loc){
        while(Q.stage(1).locate(loc[0]*70+35,loc[1]*70+35,Q.SPRITE_INTERACTABLE)){
            var newLoc = [loc[0]+Math.floor(Math.random()*3)-1,loc[1]+Math.floor(Math.random()*3)-1];
            loc=newLoc;
        }
        return loc;
    },
    turnStart:function(){
        Q.addViewport(this);
        this.p.myTurn=true;
        this.p.myTurnTiles=this.p.stats.other.stamina;
        this.p.startLocation=this.p.location;
        
        this.add("AI");
        
        this.p.graphWithWeight = new Graph(this.getWalkMatrix(true));
        this.p.menuPath = this.getPath(this.p.AITo,this.p.graphWithWeight);
        this.add("autoMove");
        
    },
    turnOver:function(){
        this.playStand(this.p.dir);
        this.p.myTurn=false;
        this.del("AI");
        Q.afterDir();
    },
    endTurn:function(){
        this.turnOver();
        Q.clearStage(3);
    },
});

Q.Sprite.extend("Player",{
    init: function(p) {
        this._super(p, {
            frame:0,
            sprite:"player",
            
            dir:"Down",
            
            objInFront:false,
            initialize:true,
            guide:[],
            possTargets:[],
            
            type:Q.SPRITE_INTERACTABLE,
            tileSize:70,
            w:70,h:70,//ALL OBJECTS MUST BE 70x70 SO THAT THEY MOVE PROPERLY
            
            //Character stats
            statsModified:{
                ofn:0,
                dfn:0,
                spd:0
            },
            buffs:[],
            debuffs:[]
        });
        //Library
        this.add("2d, animation, tween");
        //My components
        this.add("commonPlayer,animations,attacker");
        this.on("step",this,"checkMenu");
        this.on("atDest",this,"checkTrigger");
        this.p.num=0;
    },
    checkTrigger:function(){
        Q("Trigger").invoke("checkLocation");
    },
    initialize:function(){
        //Get the user data
        var data = RP.users[this.p.character];
        
        this.p.species = data.species;
        var sData = RP.monsters[this.p.species];
        this.p.name = data.name;
        this.p.exp = data.exp;
        this.p.level= data.level;
        this.p.curHp = data.curHp;
        this.p.gender = data.gender;
        this.p.pp = data.pp;
        this.p.ability = RP.abilities[data.ability];
        var attacks = data.attacks;
        this.p.attacks=[];
        for(i=0;i<attacks.length;i++){
            this.p.attacks.push(RP.moves[attacks[i]]);
        }
        var itms = [];
        for(i=0;i<data.items.length;i++){
            itms.push({p:RP.items[data.items[i][0]],amount:data.items[i][1]});
        }
        this.p.items = itms;
        this.p.special = data.special;
        this.p.text = data.text;
        
        this.p.types = sData.types;
        this.p.stats = {
            base:sData.baseStats,
            iv:data.iv,
            other:data.other
        };
        var stats = Q.getStats(this.p.stats,this.p.level);
        this.p.maxHp = stats[0];
        this.p.ofn = stats[1];
        this.p.dfn = stats[2];
        this.p.spd = stats[3];
        
        //These properties are use in the damage calculation and are changed by stat modifiers (leer, etc...)
        this.p.mod_ofn = this.p.ofn;
        this.p.mod_dfn = this.p.dfn;
        this.p.mod_spd = this.p.spd;
        
        this.p.sightRange = this.p.stats.other.mind;
        this.p.dexNum = RP.monsters[this.p.species].dexNum;
        this.p.types = RP.monsters[this.p.species].types;
        
        this.p.sheet=this.p.species;
        
        this.p.graphWithWeight = new Graph(this.getWalkMatrix(true));
        
        var loc = Q.stage(1).options.playerLoc;
        if(loc){
            if(loc[0]==='x'){
                loc[0]=Q("TileLayer").items[0].p.tiles[0].length-1;
                this.p.x=loc[0]*70+35;
                this.p.y=loc[1]*70-35;
            } else if(loc[1]==='y'){
                loc[1]=Q("TileLayer").items[0].p.tiles.length-1;
                this.p.x=loc[0]*70-35;
                this.p.y=loc[1]*70+35;
            } else if(loc[0]===0){
                this.p.x=loc[0]*70+35;
                this.p.y=loc[1]*70-35;
            } else if(loc[1]===0){
                this.p.x=loc[0]*70-35;
                this.p.y=loc[1]*70+35;
            }
        }
        //[x,y]
        this.p.location = this.setLocation();
        var socket = Q.state.get("playerConnection").socket;
        socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, dir:this.p.dir, sheet:this.p.sheet, character:this.p.character});
        
        this.p.initialize = false;
    },
    addControls:function(){
        var phase = Q.state.get("phase");
        if(phase===1){
            if(!this.has("stepControls")){
                this.add("stepControls");
            }
        } else if(phase===2){
            if(!this.has("directionControls")){
                this.add("directionControls");
            }
        }
        this.p.canMove=true;
        
    },
    disableControls:function(){
        this.p.canMove=false;
    },
    changeControls:function(){
        if(this.has("stepControls")){
            this.del("stepControls");
        } else if(this.has("directionControls")){
            this.del("directionControls");
        }
    },
    createFreePointer:function(){
        var phase = Q.state.get("phase");
        if(phase===1){
            this.addControls();
        } else if(phase===2){
            this.stage.insert(new Q.Pointer({player:this.entity,freeSelecting:true}));      
        }
    },
    turnStart:function(){
        Q.addViewport(this);
        //this.createFreePointer();
        this.createMenu();
        this.p.myTurn=true;
        this.p.myTurnTiles=this.p.stats.other.stamina;
        this.p.startLocation=this.p.location;
        this.p.canRedo=true;
        
        this.p.graphWithWeight = new Graph(this.getWalkMatrix(true));
        
    },
    turnOver:function(){
        this.p.myTurn=false;
        this.addControls();
        this.askDirection();
    },
    endTurn:function(){
        if(Q.state.get("phase")===1){
            Q.clearStage(3);
            this.addControls();
        } else if(Q.state.get("phase")===2){
            this.turnOver();
            Q.clearStage(3);
        }
    },
    resetMovement:function(){
        //Only reset if the this can redo (he hasn't done anything that cannot be reversed just by moving back)
        if(this.p.canRedo){
            this.p.x=this.p.w/2+this.p.startLocation[0]*70;
            this.p.y=this.p.h/2+this.p.startLocation[1]*70;
            this.p.location = [(this.p.x-this.p.w/2)/70,(this.p.y-this.p.h/2)/70];
            this.resetMove();
        } else {
            //Play can't do that sound
        }
    },
    setMyTurn:function(){
        this.p.myTurn=true;  
    },
    resetMove:function(){
        this.setMyTurn();
        this.p.myTurnTiles=this.p.stats.other.stamina;
        this.p.startLocation=this.p.location;
        this.p.canRedo=true;
    },
    getItem:function(item){
        var itm = item;
        var player = this;
        var text =  [player.p.name+" obtained "+itm.p.amount+" "+RP.items[itm.p.item].name,{endTurn:[player]}];
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
        Q.stageScene("bottomhud",3,{text:text,player:player});
        if(itm.p.type===Q.SPRITE_NPC){
            itm.destroy();
        }  
    },
    lowerPP:function(itm){
        var player = this;
        var attacks = player.p.attacks;
        var rand = Math.floor(Math.random()*player.p.attacks.length);
        var attack = Q.getAttack(attacks[rand]);
        var text =  [player.p.name+" lost "+itm.p.amount+" PP on "+attack.name,{changePP:[player,[rand,itm.p.amount]],endTurn:[player]}];
        Q.stageScene("bottomhud",3,{text:text,player:player});
    },
    foundNothing:function(){
        var player = this;
        var text =  [player.p.name+" checked the ground and found nothing...",{endTurn:[player]}];
        Q.stageScene("bottomhud",3,{text:text,player:player});
    },
    createMenu:function(){
        Q.stageScene("playerMenu",3,{player:this});
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
    },
    checkGround:function(){
        var func;
        var props;
        var player = this;
        var itm = Q.stage(1).locate((player.p.location[0]*70)+player.p.w/2,(player.p.location[1]*70)+player.p.h/2,Q.SPRITE_NPC);
        if(itm){
            func="getItem";
            props=itm;
        } else {
            func="foundNothing";
            props=false;
        }
        //If there's no item that you can see, find a random item if we're in the battle phase
        if(func==="foundNothing"&&Q.state.get("phase")===2){
            var g = Q.checkGroundPos[player.getTileLocation()];
            var rand = Math.floor(Math.random()*1000)+1;
            switch(true){
                //If rand is 1-50 ITEMS
                case rand<=50:
                    var r = Math.floor(Math.random()*g.items.length);
                    func = g.items[r][0];
                    props = g.items[r][1];
                    break;
                //if rand is 51-100 EVENTS
                case rand<=100:
                    var r = Math.floor(Math.random()*g.events.length);
                    func = g.events[r][0];
                    props = g.events[r][1];
                    break;
                //If rand is 996,997,998,990,or 1000 RARE
                case rand>995:
                    var r = Math.floor(Math.random()*g.rare.length);
                    func = g.rare[r][0];
                    props = g.rare[r][1];
                    break;
                default:
                    break;
            }
        }
        this[func](props);
        Q.inputs['interact']=false;
    }
});

Q.Sprite.extend("NPC",{
    init: function(p) {
        this._super(p, {
            sheet:"objects",
            frame:1,
            type:Q.SPRITE_NPC|Q.SPRITE_INTERACTABLE,
            getInfo:true,
            w:70,h:70
        });
        this.add("2d");
    },
    getInfo:function(){
        var data = Q.intData[this.stage.scene.name][this.p.name];
        this.p.textNum=data.textNum;
        this.p.items=data.items;
        this.getText(data,this.p.textNum);
        
        this.p.getInfo=false;
    },
    getText:function(data,num){
        this.p.text=data.text[num];
    },
    changeText:function(num){
        this.p.textNum=num;
        this.getText(Q.intData[this.stage.scene.name][this.p.name],this.p.textNum);
    },
    interact:function(player){
        for(i=0;i<this.p.items.length;i++){
            if(this.p.items[i][0]===this.p.textNum){
                this.p.item=this.p.items[i][1];
                player.getItem({p:{amount:this.p.items[i][1].amount,item:this.p.items[i][1].item}});
            }
        }
        if(Q._isObject(this.p.text[this.p.text.length-1])){
            var newTextNum = this.p.text[this.p.text.length-1].changeText;
            this.p.text.splice(this.p.text.length-1,1);
        }
        //Show NPC Text
        Q.stageScene("bottomhud",3,{text:this.p.text,player:player,obj:player});
        if(newTextNum){
            this.changeText(newTextNum);
        }
        Q.inputs['interact']=false;
    },
    step:function(dt){
        if(this.p.getInfo){
            this.getInfo();
        }
    }
});

Q.Sprite.extend("TrashCan",{
    init: function(p) {
        this._super(p, {
            sheet:"objects",
            frame:2,
            type:Q.SPRITE_NPC|Q.SPRITE_INTERACTABLE,
            w:70,h:70,
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

Q.Sprite.extend("Berry",{
    init: function(p) {
        this._super(p, {
            sheet:"berries",
            type:Q.SPRITE_NPC,
            w:70,h:70
        });
        this.add("2d");
        if(!this.p.amount){this.p.amount=1;};
        this.p.frame = this.getFrame();
    },
    interact:function(player){
        this.p.player = player;
        player.getItem(this);
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