Quintus.Areas = function(Q){
Q.givePlayerProperties=function(stage,loc){
    var setPosition = function(loc){
        if(loc[0]==='x'){
            loc[0]=Q("TileLayer").items[0].p.tiles[0].length-1;
            player.p.x=loc[0]*70+35;
            player.p.y=loc[1]*70-35;
        } else if(loc[1]==='y'){
            loc[1]=Q("TileLayer").items[0].p.tiles.length-1;
            player.p.x=loc[0]*70-35;
            player.p.y=loc[1]*70+35;
        } else if(loc[0]===0){
            player.p.x=loc[0]*70+35;
            player.p.y=loc[1]*70-35;
        } else if(loc[1]===0){
            player.p.x=loc[0]*70-35;
            player.p.y=loc[1]*70+35;
        //This is a special case on spawning from not the side of the map
        } else {
            player.p.x=loc[0];
            player.p.y=loc[1];
            loc = [(loc[0]-35)/70,[loc[1]-35]/70];
        }
    };
    var conn = Q.state.get("playerConnection");
    //Set the players' properties
    var player = stage.insert(new Q.Player({num:0,Class:"Player",playerId:conn.id,socket:conn.socket,character:Q.state.get("character")}));
    if(loc){
        setPosition(loc);
    }
    
    player.p.location=player.confirmLocation(loc);
    if(loc&&loc!==player.p.location){
        setPosition([player.p.location[0]*70+35,player.p.location[1]*70+35]);
    }
    player.p.currentStage=stage.scene.name;
    player.add("protagonist");
    player.addControls();
    return player;
};
Q.Sprite.extend("Trigger",{
    init: function(p) {
        this._super(p, {
            p:45
        });
    },
    checkLocation:function(){
        var obj = Q.stage(1).locate(this.p.location[0]*70+35,this.p.location[1]*70+35,Q.SPRITE_INTERACTABLE);
        if(obj&&obj.has('protagonist')){
            //Tell all players that this event is running now
            Q.state.get("playerConnection").socket.emit('triggerEvent', {event:this.p.eventObj,stageName:Q.stage(1).scene.name});
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
        var enemies = obj.enemies;
        var stage = Q.stage(1);
        var enm = Q.state.get("enemies");
        enm[obj.eventId]=[];
        for(j=0;j<enemies.length;j++){
            enm[obj.eventId].push(stage.insert(new Q.Enemy({eventId:obj.eventId,location:enemies[j].location,opts:{gender:enemies[j].opts.gender,level:enemies[j].opts.level},character:enemies[j].character,onCompleted:obj.onCompleted})));
        }
        if(Q.state.get("phase")!==2){
            Q.state.set("battle",true);
            Q.setPhase(2);
            Q.getPlayers();
        } else {
            Q.state.set("turnOrder",Q.generateTurnOrder(Q.state.get("turnOrder"),enm[obj.eventId]));
        }
    }
};
Q.setEvents=function(stage,events){
    console.log(events)
    var keys = Object.keys(events)
    for(iE=0;iE<keys.length;iE++){
        var event = events[keys[iE]];
        event.eventId = keys[iE];
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
                    stage.insert(new Q.Trigger({eventObj:event,eventId:event.eventId,location:event.locations[iL],event:event.event,enemies:enemies,completed:event.completed}));
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
    var enemies = Q("Enemy",1).items;
    var player = Q.state.get("player");
   // var connPlayers = 
    Q.state.set("turnOrder",Q.generateTurnOrder());
    Q.state.set("currentCharacter",Q.state.get("turnOrder")[0]);
    Q.state.get("turnOrder")[0].turnStart()
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
};
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

};