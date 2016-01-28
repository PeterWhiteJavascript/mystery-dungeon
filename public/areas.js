Quintus.Areas = function(Q){

Q.givePlayerProperties=function(stage,loc){
    var conn = Q.state.get("playerConnection");
    //Set the players' properties
    var player = stage.insert(new Q.Player({num:0,playerId:conn.id,socket:conn.socket,character:Q.state.get("character")}));
    var saved = Q.state.get("player");
    var keys = Object.keys(saved.p);
    for(i=0;i<keys.length;i++){
        player.p[keys[i]]=saved.p[keys[i]];
    }
    if(loc){
        player = Q.setPosition(player,loc);
    }
    player.p.loc=player.confirmLocation(loc);
    if(loc&&loc!==player.p.loc){
        player = Q.setPosition(player,[player.p.loc[0]*Q.tileH+Q.tileH/2,player.p.loc[1]*Q.tileH+Q.tileH/2]);
    }
    player.p.area=stage.scene.name;
    player.add("protagonist");
    player.addControls();
    return player;
};
Q.Sprite.extend("Trigger",{
    init: function(p) {
        this._super(p, {
            
        });
        if(this.p.status===1){
            this.eventId=this.p.eventId;
            Q.eventFuncs[this.p.eventType](this,this.p.host);
        }
    },
    checkLocation:function(){
        for(i=0;i<this.p.loc.length;i++){
            var loc = this.p.loc[i];
            var obj = Q.getTargetAt(loc[0],loc[1]);
            if(obj&&obj.has('protagonist')&&this.p.status===0){
                this.p.status=1;
                //Make sure the event hasn't been triggered
                Q.state.get("playerConnection").socket.emit('setEvent',{eventId:this.p.eventId,stageName:Q.stage(1).scene.name,host:Q.state.get("playerConnection").id});
            }
        }
    }
});
Q.eventCompleted=function(eventId,onComplete){
    var trigger = Q("Trigger",1).items.filter(function(obj){
        return obj.p.eventId === eventId;
    })[0];
    trigger.p.status = 2;
    var events = Q.state.get("events");
    var enm = Q("Enemy",1).items;
    switch(onComplete){
        case "doneBattle":
            for(k=0;k<events.length;k++){
                if(events[k].eventId===eventId){
                    events[k].p.status=2;
                } 
            }
            //First, make sure that there are no other battles going on
            var battle = false;
            if(enm.length>0){
                //Still a battle going on
                battle = true;
            }
            if(!battle){
                Q.stopMusic("scenes/"+Q.state.get("currentMusic"));
                Q.playSound("battle_complete.mp3",function(){
                    setTimeout(function(){
                        Q.getMusic(Q.state.get("currentStageName"));
                    },1300);
                });
                if(!Q.state.get("soundEnabled")){Q.getMusic(Q.state.get("currentStageName"));};
                Q.stageScene('customAnimate',4,{anim:onComplete});
                Q.state.set("battle",false);
                Q.toAdventuringPhase();
            }
            break;
    }
};
Q.toAdventuringPhase=function(){
    Q.state.set("phase",1);
    var player = Q.state.get("playerObj");
    Q.addViewport(player);
    player.setMyTurn();
    player.changeControls();
    player.addControls();
    Q.setPhaseOneUpdating();
};
Q.eventFuncs= {
    spawnEnemies:function(event,hostId){
        if(Q.state.get("phase")!==2){
            var phaseChange = true;
        }
        Q.state.set("battle",true);
        clearInterval(Q.updateInterval);
        Q.setPhase(2);
        if(event.music){
            Q.playMusic(event.music);
        } else {
            var rand = Math.ceil(Math.random()*2);
            Q.playMusic("battle"+rand+".mp3");
        }
        //Do this to set the enemies stats and other things that should be calculated once and then sent to the other clients
        if(Q.state.get("playerConnection").id===hostId){
            var curEvent = Q.state.get("levelData").events[event.eventId];
            curEvent.status = 1;
            var curBattles = Q.state.get("currentBattles");
            curBattles.push(event.eventId);
            var enemies = event.p.enemies;
            var stage = Q.stage(1);
            var enm = Q.state.get("enemies");
            enm[event.eventId]=[];
            for(jj=0;jj<enemies.length;jj++){
                var enemy = stage.insert(new Q.Enemy({
                    className:enemies[jj].className,
                    eventId:event.eventId,
                    loc:enemies[jj].p.loc,
                    gender:enemies[jj].gender||"M",
                    level:enemies[jj].p.level,
                    playerId:jj+"e",
                    onCompleted:event.onCompleted,
                    drop:enemies[jj].p.drop||false,
                    dir:enemies[jj].p.dir||"Down"
                }));
                enemy.initialize();
                enm[event.eventId].push(enemy);
            }
            //console.log("I'm the host of "+event.eventId)
            if(phaseChange){
                Q.getPlayers(event.eventId);
            } else {
                Q.state.set("turnOrder",Q.generateTurnOrder(Q.state.get("turnOrder"),enm[event.eventId]));
            }
            var enems = [];
            var e = enm[event.eventId];
            for(i=0;i<e.length;i++){
                var enemy = {
                    className:e[i].p.className,
                    eventId:e[i].p.eventId,
                    playerId:e[i].p.playerId,
                    onCompleted:e[i].p.onCompleted,
                    
                    gender:e[i].p.gender,
                    p:{
                        loc:e[i].p.loc,
                        text:e[i].p.text,
                        drop:e[i].p.drop,
                        
                        level:e[i].p.level,
                        ofn:e[i].p.ofn,
                        dfn:e[i].p.dfn,
                        spd:e[i].p.spd,
                        mod_ofn:e[i].p.mod_ofn,
                        mod_dfn:e[i].p.mod_dfn,
                        mod_spd:e[i].p.mod_spd,
                        curHp:e[i].p.curHp,
                        maxHp:e[i].p.maxHp,
                        defeated:false,
                        dir:e[i].p.dir,
                        exp:e[i].p.exp
                    }
                };
                enems.push(enemy);
            }
            //Tell all players that this event is running now
            Q.state.get("playerConnection").socket.emit('triggerEvent', {eventId:event.eventId,stageName:Q.stage(1).scene.name,host:Q.state.get("playerConnection").id,enemies:enems});
        } else {
            var curEvent = Q.state.get("levelData").events[event.p.eventId];
            curEvent.status = 1;
            Q.state.set("battleHost",curEvent.p.host);
            Q.state.set("turnOrder",curEvent.p.turnOrder);
            var enemies = curEvent.p.enemies;
            var stage = Q.stage(1);
            var enm = Q.state.get("enemies");
            enm[curEvent.p.eventId]=[];
            for(jj=0;jj<enemies.length;jj++){
                var enemy = stage.insert(new Q.Enemy({
                    className:enemies[jj].className,
                    eventId:enemies[jj].eventId,
                    playerId:enemies[jj].playerId,
                    onCompleted:enemies[jj].onCompleted,
                    loc:enemies[jj].p.loc,
                    
                    level:enemies[jj].p.level
                }));
                enemy.p.dir=enemies[jj].p.dir;
                enemy.p.gender=enemies[jj].gender||enemies[jj].p.gender||"S";
                enemy.initialize();
                
                enemy.p.ofn=enemies[jj].p.ofn;
                enemy.p.dfn=enemies[jj].p.dfn;
                enemy.p.spd=enemies[jj].p.spd;
                enemy.p.mod_ofn=enemies[jj].p.mod_ofn;
                enemy.p.mod_dfn=enemies[jj].p.mod_dfn;
                enemy.p.mod_spd=enemies[jj].p.mod_spd;
                enemy.p.curHp=enemies[jj].p.curHp;
                enemy.p.maxHp=enemies[jj].p.maxHp;
                
                enemy.p.exp=enemies[jj].p.exp;

                enemy.p.level=enemies[jj].p.level;
                
                enemy.p.text=enemies[jj].p.text;
                enemy.p.drop=enemies[jj].p.drop;
                enm[curEvent.p.eventId].push(enemy);
            }
            var battles = Q.state.get("currentBattles");
            battles.push(event.p.eventId);
        }
    }
};
//This is called in goToStage() to set up the level when a player goes to it.
Q.setLevelData=function(stage,levelData){
    var data = levelData;
    var events = data.events;
    Q.state.set("events",events);
    //Events
    for(ev=0;ev<events.length;ev++){
        var event = events[ev];
        event.stage = stage.scene.name;
        event.eventId = ev;
        switch(event.eventType){
            case "spawnEnemies":
                var enemies = event.p.enemies;
                break;
        }
        switch(event.trigger.type){
            case "enter":
                Q.eventFuncs[event.eventType](event);
                
                break;
            case "onLocation":
                stage.insert(new Q.Trigger({eventObj:event,eventId:event.eventId,loc:event.locations,eventType:event.eventType,enemies:enemies,status:event.p.status,host:event.p.host}));
                
                break;
            
        }
    }
    var npcs = data.npcs;
    //NPCS
    for(np=0;np<npcs.length;np++){
        var npc = npcs[np];
        npc.stage = stage.scene.name;
        stage.insert(new Q.NPC({items:npc.items,npcType:npc.npcType,text:npc.text,textNum:npc.p.textNum,loc:npc.p.loc,npcId:np}));
        
    };
    var pickups = data.pickups;
    //Pickups
    for(pi=0;pi<pickups.length;pi++){
        var pickup = pickups[pi];
        if(pickup.p.status===0){
            pickup.stage = stage.scene.name;
            stage.insert(new Q.Pickup({pickupId:pi,item:pickup.item,amount:pickup.amount,loc:pickup.loc,status:pickup.p.status}));
        }
    };
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
Q.afterDir=function(newHost){
    Q.inputs['interact']=false;
    var enemies = Q("Enemy",1).items;
    if(enemies.length<1){
        //Broadcast that this event is done
        var battles = Q.state.get("currentBattles");
        for(i=0;i<battles.length;i++){
            var event = Q.state.get("events")[battles[i]];
            Q.state.get("playerConnection").socket.emit('eventComplete',{playerId:Q.state.get("playerConnection").id,stageName:Q.stage(1).scene.name,eventId:event.eventId,onCompleted:event.onCompleted});
        }
        Q.state.set("battle",false);
    }
    if(!Q.state.get("battle")){
        //There is on battle, give all players control now
        //This will be done through socket
        Q.state.set("phase",1);
        var player = Q.state.get("playerObj");
        player.setMyTurn();
        player.changeControls();
        player.addControls();
        //Q.updateInterval = Q.setPhaseOneUpdating();
        return;
    }
    //var cCT = Q.state.get("currentCharacterTurn");
    var tO = Q.state.get("turnOrder");
    //tO.push(tO.shift());
    tO.shift();
    if(tO.length===0){
        Q.state.set("turnOrder",Q.generateTurnOrder(Q("Player",1).items,Q("Enemy",1).items));
        tO=Q.state.get("turnOrder");
    }
    var host = false;
    if(Q._isString(tO[0])||tO[0]===Q.state.get("battleHost")){host=Q.state.get("battleHost");};
    if(newHost){host=newHost;};
    var enems = [];
    var e = Q.state.get("enemies");
    var cb = Q.state.get("currentBattles");
    for(j=0;j<cb.length;j++){
        for(i=0;i<e[cb[j]].length;i++){
            var en = e[cb[j]][i];
            var enemy = {
                className:en.p.className,
                eventId:en.p.eventId,
                playerId:en.p.playerId,
                onCompleted:en.p.onCompleted,
                
                p:{
                    ofn:en.p.ofn,
                    dfn:en.p.dfn,
                    spd:en.p.spd,
                    mod_ofn:en.p.mod_ofn,
                    mod_dfn:en.p.mod_dfn,
                    mod_spd:en.p.mod_spd,
                    curHp:en.p.curHp,
                    maxHp:en.p.maxHp,
                    defeated:en.p.defeated,
                    dir:en.p.dir,
                    exp:en.p.exp,
                    
                    level:en.p.level,
                    gender:en.p.gender,
                    text:en.p.text,
                    loc:en.p.loc,
                    drop:en.p.drop
                },
            };
            enems.push(enemy);
        }
    }
    
    Q.state.get("playerConnection").socket.emit('startTurn',{
        turnOrder:tO,
        host:host,
        stageName:Q.stage(1).scene.name,
        eventIds:Q.state.get("currentBattles"),
        enemies:enems
    });
    var player = Q.state.get("playerObj");
    Q.state.get("playerConnection").socket.emit('update',{
        inputs:{
            left:Q.inputs['left'],
            right:Q.inputs['right'],
            up:Q.inputs['up'],
            down:Q.inputs['down']
        },
        playerId:Q.state.get("playerConnection").id,
        props:{
            x:player.p.x,
            y:player.p.y,
            dir:player.p.dir,
            loc:player.p.loc,
            animation:player.p.animation,
            area:Q.stage(1).scene.name
        }
    });
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
};

Q.generateTurnOrder=function(activePlayers,enemies){
    //For now, just put the order chronologically
    var turnOrder = [];
    
    for(i=0;i<activePlayers.length;i++){
        if(Q._isObject(activePlayers[i])){
            turnOrder.push(activePlayers[i].p.playerId);
        } else {
            turnOrder.push(activePlayers[i]);
        }
    }
    for(i=0;i<enemies.length;i++){
        turnOrder.push(enemies[i].p.playerId);
    }
    return turnOrder;
};

Q.getPlayers=function(eventId){
    var activePlayers = Q("Player",1).items;
    var enemies = Q("Enemy",1).items;
    Q.state.set("turnOrder",Q.generateTurnOrder(activePlayers,enemies));
    var tO = Q.state.get("turnOrder");
    Q.state.set("currentCharacter",tO[0]);
    Q.state.get("playerConnection").socket.emit('partOfBattle', {eventId:eventId,stageName:Q.stage(1).scene.name,host:Q.state.get("playerConnection").id,turnOrder:tO});
};

Q.scene("fog",function(stage){
    stage.insert(new Q.Sprite({x:0,y:0,cx:0,cy:0,asset:"fog.png"}));
});
Q.addViewport=function(obj){
    if(obj){
        if(Q.stage(1).viewport.following&&Q.stage(1).viewport.following.p.x===obj.p.x&&Q.stage(1).viewport.following.p.y===obj.p.y){
            return;
        } else {
            obj.p.stageMaxX=Q.TL.p.w;
            var minX=0;
            var maxX=Q.TL.p.w;
            var minY=0;
            var maxY=Q.TL.p.h;
            if(Q.TL.p.w<Q.width){minX=-(Q.width-Q.TL.p.w),maxX=Q.width;};
            if(Q.TL.p.h<Q.height){minY=-Q.height;maxY=Q.TL.p.h;};
            Q.stage(1).follow(obj,{x:true,y:true},{minX: minX, maxX: maxX, minY: minY,maxY:maxY});
        }
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