Quintus.QFunctions=function(Q){
Q.startTurn=function(data){
    var response = data['response'];
    var turnOrder = data['turnOrder'];
    Q.state.set("turnOrder",turnOrder);
    var user = Q("User",1).items.filter(function(obj){
        return obj.p.playerId===response;
    })[0];
    //In turn start, it checks if this client is watching
    user.turnStart();
    var player = Q("Participant",1).items.filter(function(obj){
        return obj.p.playerId===response;
    })[0];
    Q.viewFollow(player);
    
};
//Gets the total cost for a movement path
Q.getPathCost=function(path){
    var curCost = 0;
    for(var j=0;j<path.length;j++){
        curCost+=path[j].weight;
    }
    return curCost;
};
//Gets the path to a scene by taking the level string
Q.getPath = function(to){
    var path = "";
    var pathNumX="";
    var pathNumY="";
    //var num = "0123456789-/?!@#$%^&*()";
    var num = "0123456789-/";
    var donePath = false;
    var doneX=false;
    for(i=0;i<to.length;i++){
        for(j=0;j<num.length;j++){
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
Q.stageBattleScene=function(data){
    var scene = data['scene'];
    var us = data.userData;
    var pa = data.partsData;
    var pi = data.pickupsData;
    var ob = data.objectData;
    var placed = data['placed'];
    //Get the path if we're staging a .tmx
    var currentPath = Q.getPath(scene.levelMap.name);
    //Load the .tmx
    Q.loadTMX(currentPath[0]+"/"+scene.levelMap.name+".tmx",function(){
        //Load the music
        Q.playMusic(scene.battle.music+".mp3",function(){ 
            //Create the scene
            Q.makeScene(scene.onStart.name,currentPath[0],scene.levelMap.name,us,pa,ob,function(stage){
                Q.showAllStoryObjs();
                //Place the playerLocs guide
                var playerLocs = Q.state.get("sceneData").battle.playerLocs;
                var user = Q("User",1).items.filter(function(obj){
                    return obj.p.playerId===Q.state.get("playerConnection").id;
                })[0];
                //Send inputs to the server so that we can move the pointer
                //The server checks for pointer logic
                user.sendInputsToServer();
                //Place the pointers for all users at the first spot
                Q("User",1).each(function(){
                    this.createPointer({loc:playerLocs[0]});
                });
            });
            //Stage the TMX tilemap
            Q.stageScene(scene.onStart.name,1,{path:currentPath[0],pathNum:currentPath[1],sort:true});
            
        });
    });
};
//Is triggered when the user has to chose where to place his character
Q.readyForBattle=function(){
    var socket = Q.state.get("playerConnection").socket;
    socket.emit("readyForBattle",{playerId:Q.state.get("playerConnection").id});
};
Q.addViewport=function(playerId){
    var part = Q("Participant",1).items.filter(function(obj){
        return obj.p.playerId===playerId;
    })[0];
    Q.viewFollow(part);
};
//Follows the specified sprite on the specified stage
Q.viewFollow=function(obj,stage){
    if(!stage){stage=Q.stage(1);};
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
    var obj = Q.stage(1).insert(new Q.Player({className:actor.className}));
    var ps = Object.keys(actor);
    for(i=0;i<ps.length;i++){
        obj.p[ps[i]]=actor[ps[i]];
    }
    obj.p.loc = loc;
    obj.p.dir = dir||"down";
    console.log("Placed "+obj.p.name+" at "+obj.p.loc[0]+","+obj.p.loc[1]);
    obj.add("actor");
    return obj;
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
    var target = Q("Participant",1).items.filter(function(obj){
        return obj.p.loc[0]===Math.round(x/Q.tileH-1)&&obj.p.loc[1]===Math.round(y/Q.tileH-1);
    })[0];
    
    return target;
};

Q.getTargetAt=function(x,y){
    var target = Q("Participant",1).items.filter(function(obj){
        return obj.p.loc&&obj.p.loc[0]===x&&obj.p.loc[1]===y;
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
    var exp = Q.state.get("expNeeded");
    if(exp[level]!==undefined){
        return exp[level];
    } 
    //The object's level is maxed
    else {
        return "-";
    }
};

Q.getAttack=function(atk){
    var attack = Q.state.get("attacks").filter(function(att){
        return att.id===atk;
    })[0];
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