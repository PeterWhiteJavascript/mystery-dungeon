Quintus.QFunctions=function(Q){
//Is triggered when the user choses where to place his character
Q.readyForBattle=function(){
    var socket = Q.state.get("playerConnection").socket;
    socket.emit("readyForBattle",{playerId:Q.state.get("playerConnection").id});
};
//Follows the specified sprite on the specified stage
Q.viewFollow=function(obj,stage){
    var tl = stage.lists.TileLayer[0];
    obj.p.stageMaxX=tl.p.w;
    var minX=0;
    var maxX=tl.p.w;
    var minY=0;
    var maxY=tl.p.h;
    if(tl.p.w<Q.width){minX=-(Q.width-tl.p.w),maxX=Q.width;};
    if(tl.p.h<Q.height){minY=-Q.height;maxY=tl.p.h;};
    stage.follow(obj,{x:true,y:true},{minX: minX, maxX: maxX, minY: minY,maxY:maxY});
};
//Adds an actor to mirror what other players do
Q.addActor=function(actor,loc,dir){
    var obj = Q.stage(1).insert(new Q.Player({className:actor.className,loc:loc,dir:dir||"down"}));
    var ps = Object.keys(actor);
    for(i=0;i<ps.length;i++){
        obj.p[ps[i]]=actor[ps[i]];
    }
    console.log("Placed "+obj.p.name+" at "+obj.p.loc[0]+","+obj.p.loc[1]);
    obj.add("actor");
    return obj;
};
//Add the viewport to whoever's turn it is
Q.addTurnOrderView=function(){
    var tO = Q.state.get("turnOrder");
    if(Q._isNumber(tO[0])){
        var playerTurn = Q("Player",1).items.filter(function(obj){
            return obj.p.playerId===tO[0];
        })[0];
        Q.addViewport(playerTurn);
    } 
    //If the current player is an enemy
    else if(Q._isString(tO[0])){
        var enemyTurn = Q("Enemy",1).items.filter(function(obj){
            return obj.p.playerId===tO[0];
        })[0];
        Q.addViewport(enemyTurn);
    }
};
//This loads when the music is loading at the start
Q.showWaiting=function(){
    Q.stageScene("customAnimate",4,{anim:"waitingBattle"});
};
//Get the tile location based on an object's x,y location
Q.getLoc=function(x,y){
    var tempPt = {
        x:Math.floor(x/Q.tileH),
        y:Math.floor(y/Q.tileH)
    };
    return [tempPt.x,tempPt.y];
};
//Get the x,y location based off an object's tile location
Q.setXY=function(x,y){
    return [x*Q.tileH+Q.tileH/2,y*Q.tileH+Q.tileH/2];
};
//Sort through all players, allies, and enemies to find a target at a tile location
Q.getTarget=function(x,y){
    var target = Q(".commonPlayer",1).items.filter(function(obj){
        return obj.p.loc[0]===Math.round(x/Q.tileH-1)&&obj.p.loc[1]===Math.round(y/Q.tileH-1);
    })[0];
    
    return target;
};

Q.getTargetAt=function(x,y){
    var target = Q(".commonPlayer",1).items.filter(function(obj){
        return obj.p.loc[0]===x&&obj.p.loc[1]===y;
    })[0];
    return target;
};

Q.getObjectAt=function(x,y){
    var target = Q.stage(1).locate(x,y,Q.SPRITE_INTERACTABLE);
    return target;
};

//Gets the tile type of a tile at a certain tile location
Q.getTileType=function(x,y){
    var tileLayer = Q.stage(1).lists.TileLayer[Q.stage(1).lists.TileLayer.length-1];
    if(tileLayer.p.tiles[y]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[y][x]]){
         return tileLayer.tileCollisionObjects[tileLayer.p.tiles[y][x]].p.type;
    } else {
        return "SPRITE_STANDARD";
    }
};

Q.getNextLevelEXP=function(level){
    if(RP.expNeeded[level]!==undefined){
        return RP.expNeeded[level];
    } else {
        return "-";
    }
};

Q.getAttack=function(atk){
    var attack = RP.moves[atk[0]];
    return attack;
};

Q.chopText=function(txt,cont){
    var text = "";
    var tNum = 0;
    var charW = 8.8;
    var maxChars = cont.p.w/charW;
    var line = 0;
    for(i=0;i<txt.length;i++){
        if(tNum<maxChars){
            text+=txt[i];
        } else {
            line++;
            tNum=0;
            text+=txt[i];
            text+="\n";
        }
        tNum++;
    }
    return text;
};
    
};