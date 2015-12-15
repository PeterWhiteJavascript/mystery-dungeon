Quintus.Areas = function(Q){
//Right now this only works for one player. Modify when multiplayer is added
Q.givePlayerProperties=function(stage){
    //Set the players' properties
    var player;
    //If the level designer did not put a player in the level, create a new instance
    if(!Q("Player",1).first()){
        player = stage.insert(new Q.Player({num:0,Class:"Player"}));
    // else the player is the instance that was already created within the level.
    } else {
        player = Q("Player",1).first();
    }
};
Q.Sprite.extend("Trigger",{
    init: function(p) {
        this._super(p, {
            p:45
        });
    },
    checkLocation:function(){
        var obj = Q.stage(1).locate(this.p.location[0]*70+35,this.p.location[1]*70+35,Q.SPRITE_INTERACTABLE);
        if(obj&&obj.p.Class==="Player"){
            Q.eventFuncs[this.p.event](this);
            var triggers = Q("Trigger",1).items;
            
            for(j=0;j<triggers.length;j++){
                if(triggers[j].p.eventId===this.p.eventId&triggers[j].p.id!==this.p.id){
                    triggers[j].destroy();
                }
            }
            this.destroy();
        }
    }
});
Q.eventCompleted=function(eventId,onComplete){
    var completedEvents = Q.state.get("completedEvents");
    var stage = Q.stage(1);
    console.log("Event " +eventId + " completed! Running "+onComplete+" function.");
    if(completedEvents[stage.scene.name]){
        completedEvents[stage.scene.name].push(eventId);
    } else {
        completedEvents[stage.scene.name]=[];
        completedEvents[stage.scene.name].push(eventId);
    }
    
    var events = Q.state.get("events");
    var enm = Q.state.get("enemies");
    switch(onComplete){
        case "doneBattle":
            for(k=0;k<events.length;k++){
                if(events[k].eventId===eventId){
                    events.splice(k,1);
                } 
            }
            //First, make sure that there are no other battles going on
            var keys = Object.keys(enm);
            var battle = false;
            for(l=0;l<keys.length;l++){
                if(enm[keys[l]].length>0){
                    //Still a battle going on
                    battle = true;
                }
            }
            if(!battle){
                Q.state.set("battle",false);
            }
            break;
            
    }
    
};
Q.eventFuncs= {
    spawnEnemies:function(obj){
        var enemies = obj.p.enemies;
        var stage = obj.stage;
        var enm = Q.state.get("enemies");
        enm[obj.p.eventId]=[];
        for(j=0;j<enemies.length;j++){
            enm[obj.p.eventId].push(stage.insert(new Q.Enemy({eventId:obj.p.eventId,location:enemies[j].location,opts:{gender:enemies[j].opts.gender,level:enemies[j].opts.level},character:enemies[j].character,completed:obj.p.completed})));
        }
        if(Q.state.get("phase")!==2){
            Q.setPhase(2);
            Q.state.set("battle",true);
            Q.getPlayers();
        } else {
            Q.state.set("turnOrder",Q.generateTurnOrder(Q.state.get("turnOrder"),enm[obj.p.eventId]));
        }
    }
};
Q.setEvents=function(stage,events){
    for(iE=0;iE<events.length;iE++){
        var event = events[iE];
        switch(event.event){
            case "spawnEnemies":
                var enemies = event.enemies;
                break;
        }
        switch(event.trigger.type){
            case "enter":
                Q.eventFuncs[event.event]({p:{enemies:enemies,completed:event.completed,eventId:event.eventId},stage:stage});
                
                break;
            case "onLocation":
                for(iL=0;iL<event.locations.length;iL++){
                    stage.insert(new Q.Trigger({eventId:event.eventId,location:event.locations[iL],event:event.event,enemies:enemies,completed:event.completed}));
                }
                break;
            
        }
    }
};
Q.getEvents=function(whereTo){
    var events = Q.events[whereTo];
    return events;
};
Q.setPhase=function(phase){
    Q.state.set("phase",phase);
    Q("Player",1).invoke("changeControls");
    Q.state.get("turnOrder")[0].turnStart();
    Q.inputs['left']=false;
    Q.inputs['right']=false;
    Q.inputs['up']=false;
    Q.inputs['down']=false;
};
Q.endTurn=function(){
    Q.inputs['interact']=false;
    var cCT = Q.state.get("currentCharacterTurn");
    var tO = Q.state.get("turnOrder");
    tO[cCT].turnOver();
    Q.clearStage(2);
};
Q.afterDir=function(){
    Q.inputs['interact']=false;
    if(!Q.state.get("battle")){
        //There is on battle, give all players control now
        Q.state.set("phase",1);
        Q("Player",1).invoke("setMyTurn");
        Q("Player",1).invoke("changeControls");
        Q("Player",1).invoke("addControls");
        return;
    }
    var cCT = Q.state.get("currentCharacterTurn");
    var tO = Q.state.get("turnOrder");
    //var stage = Q.stage(1);
    cCT++;
    if(cCT>tO.length-1){
        cCT=0;//GENERATE RANDOM TURN ORDER HERE
        Q.state.set("currentCharacterTurn",0);
        Q.state.inc("turnNumber",1);
        console.log("Turn Number "+Q.state.get("turnNumber"));
    }
    
    setTimeout(function(){
        tO[cCT].turnStart();
        //Q("HUDCont",3).first().changeChar();
    },10);
    Q.state.set("currentCharacter",tO[cCT]);
    Q.state.set("currentCharacterTurn",cCT);
    
};

Q.generateTurnOrder=function(players,enemies){
    //For now, just put the order chronologically
    return players.concat(enemies);
};

Q.getPlayers=function(){
    var plC = Q.state.get("playersConnected");
    var playerObjs = Q("Player",1).items;
    var players = [];
    for(i=0;i<playerObjs.length;i++){
        //If we have this many players connected, push them into the array
        if(playerObjs[i].p.num<plC.length){
            //Set the character
            playerObjs[i].p.character=plC[playerObjs[i].p.num];
            players.push(playerObjs[i]);
        //If this player is not connected, destroy it
        } else {
            playerObjs[i].p.initialize=false;
            playerObjs[i].destroy();
        }
    }
    var enemies = Q("Enemy",1).items;
    Q.state.set("turnOrder",Q.generateTurnOrder(players,enemies));
    Q.state.set("playerObjs",players);
    Q.state.set("currentCharacter",Q.state.get("turnOrder")[0]);
    
};

Q.scene("fog",function(stage){
    stage.insert(new Q.Sprite({x:0,y:0,cx:0,cy:0,asset:"fog.png"}));
});
Q.addViewport=function(obj){
    if(Q.stage(1).viewport.following&&Q.stage(1).viewport.following.p.x===obj.p.x&&Q.stage(1).viewport.following.p.y===obj.p.y){
        return;
    } else {
        var stage = Q.stage(1);
        obj.p.stageMaxX=stage.lists.TileLayer[1].p.w;
        var minX=0;
        var maxX=stage.lists.TileLayer[1].p.w;
        var minY=0;
        var maxY=stage.lists.TileLayer[1].p.h;
        if(stage.lists.TileLayer[1].p.w<Q.width){minX=-(Q.width-stage.lists.TileLayer[1].p.w),maxX=Q.width;};
        if(stage.lists.TileLayer[1].p.h<Q.height){minY=-Q.height;maxY=stage.lists.TileLayer[1].p.h;};
        Q.stage(1).follow(obj,{x:true,y:true},{minX: minX, maxX: maxX, minY: minY,maxY:maxY});
    }
}
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

Q.goToStage = function(toDoor, whereTo, playerLoc){
    var levels = Q.state.get("levelData");
    var stageNum=1;
    //If the player is not actually going to a scene that is being staged
    //Stage it on num -100 which is behind the game and then clear it
    if(toDoor<0){
        stageNum=-100;
    }
    var currentPath = Q.getPath(whereTo);
    //Check if the player has been to a level before
    for(i=0;i<levels.length;i++){
        if(levels[i].id===whereTo){
            Q.stageScene(whereTo,stageNum,{toDoor:toDoor,path:currentPath[0],pathNum:currentPath[1],stageNum:stageNum,playerLoc:playerLoc});
            return;
        }
    }
    //CODE BELOW WON'T RUN IF THE PLAYER HAS BEEN TO THE STAGE BEFORE (FIRST TIME ONLY)
    //If the level hasn't been gone to yet
    Q.scene(""+whereTo,function(stage){
        //Q.stageScene("background",0,{path:stage.options.path});
        Q.stageTMX(""+stage.options.path+"/"+whereTo+".tmx",stage);
        Q.stage(1).add("viewport");
        if(stage.options.stageNum>=0){
            //Q.getMusic(stage.options.path);
            Q.givePlayerProperties(stage);
            Q.getPlayers();
            if(Q.state.get("phase")===1){
                setTimeout(function(){
                    Q.addViewport(Q.state.get("turnOrder")[0]);
                    Q.state.get("turnOrder")[0].addControls();
                    Q.state.get("turnOrder")[0].setMyTurn();
                    //Q.stageScene("tophud",3,{chars:Q.state.get("turnOrder")});
                    var events = Q.getEvents(whereTo);
                    Q.setEvents(stage,events);
                },10);
            } 
            else if(Q.state.get("phase")===2){
                setTimeout(function(){
                    Q.state.get("turnOrder")[0].turnStart();
                    //Q.stageScene("tophud",3,{chars:Q.state.get("turnOrder")});
                    var events = Q.getEvents(whereTo);
                    Q.setEvents(stage,events);
                },10);
            }
            
            /*if(THIS STAGE IS A CAVE LEVEL)
            Q.stageScene("fog",2);
            */
       }
    });
    Q.loadTMX(currentPath[0]+"/"+whereTo+".tmx",function(){
        Q.stageScene(whereTo,stageNum,{toDoor:toDoor,path:currentPath[0],pathNum:currentPath[1],stageNum:stageNum,playerLoc:playerLoc});
    });
    
};

};