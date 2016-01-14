Quintus.Areas = function(Q){
Q.setPosition = function(player,loc){
    if(loc[0]==='x'){
        loc[0]=Q("TileLayer").items[0].p.tiles[0].length-1;
        player.p.x=loc[0]*70+35;
        player.p.y=loc[1]*70+35;
    } else if(loc[1]==='y'){
        loc[1]=Q("TileLayer").items[0].p.tiles.length-1;
        player.p.x=loc[0]*70+35;
        player.p.y=loc[1]*70+35;
    } else {
        player.p.x=loc[0]*70+35;
        player.p.y=loc[1]*70+35;
    }
    
    return player;
};
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
        player = Q.setPosition(player,[player.p.loc[0]*70+35,player.p.loc[1]*70+35]);
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
            Q.eventFuncs[this.p.event](this,this.p.host);
        }
    },
    checkLocation:function(){
        var obj = Q.stage(1).locate(this.p.loc[0]*70+35,this.p.loc[1]*70+35,Q.SPRITE_INTERACTABLE);
        if(obj&&obj.has('protagonist')&&this.p.status===0){
            this.p.status=1;
            Q.eventFuncs[this.p.eventObj.event](this.p.eventObj,Q.state.get("playerConnection").id);
        }
    }
});
Q.eventCompleted=function(eventId,onComplete){
    var trigger = Q("Trigger",1).items.filter(function(obj){
        return obj.p.eventId === eventId;
    })[0];
    trigger.p.status = 2;
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
            //if(!battle){
                Q.stageScene('customAnimate',4,{anim:onComplete});
                Q.toAdventuringPhase();
            //}
            break;
    }
    var events = Q.state.get("events");
    events[eventId].p.status=2;
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
            Q.state.set("battle",true);
            Q.setPhase(2);
            var phaseChange = true;
        }
        if(Q.state.get("playerConnection").id===hostId){
            var curEvent = Q.state.get("events")[event.eventId];
            curEvent.status = 1;
            var curBattles = Q.state.get("currentBattles");
            curBattles.push(event.eventId);
            var enemies = event.p.enemies;
            var stage = Q.stage(1);
            var enm = Q.state.get("enemies");
            enm[event.eventId]=[];
            for(jj=0;jj<enemies.length;jj++){
                var enemy = stage.insert(new Q.Enemy({eventId:event.eventId,loc:enemies[jj].loc,opts:{gender:enemies[jj].opts.gender,level:enemies[jj].opts.level},character:enemies[jj].character,playerId:jj+event.eventId,onCompleted:event.onCompleted,drop:enemies[jj].opts.drop}));
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
                    loc:e[i].p.loc,
                    eventId:e[i].p.eventId,
                    playerId:e[i].p.playerId,
                    character:e[i].p.character,
                    onCompleted:e[i].p.onCompleted,
                    drop:e[i].p.drop,
                    stats:{
                        ofn:e[i].p.ofn,
                        dfn:e[i].p.dfn,
                        spd:e[i].p.spd,
                        mod_ofn:e[i].p.mod_ofn,
                        mod_dfn:e[i].p.mod_dfn,
                        mod_spd:e[i].p.mod_spd,
                        curHp:e[i].p.curHp,
                        maxHp:e[i].p.maxHp,
                        defeated:false,
                        dir:e[i].p.dir
                    },
                    opts:{
                        level:e[i].p.opts.level,
                        gender:e[i].p.opts.gender,
                        
                        text:e[i].p.opts.text
                    }
                    
                };
                enems.push(enemy);
            }
            //Tell all players that this event is running now
            Q.state.get("playerConnection").socket.emit('triggerEvent', {eventId:event.eventId,stageName:Q.stage(1).scene.name,host:Q.state.get("playerConnection").id,enemies:enems});
        } else {
            var curEvent = Q.state.get("events")[event.p.eventId];
            curEvent.status = 1;
            var enemies = curEvent.p.enemies;
            var stage = Q.stage(1);
            var enm = Q.state.get("enemies");
            enm[curEvent.p.eventId]=[];
            for(jj=0;jj<enemies.length;jj++){
                if(!enemies[jj].stats.defeated){
                    var enemy = stage.insert(new Q.Enemy({
                        loc:enemies[jj].loc,
                        eventId:enemies[jj].eventId,
                        playerId:enemies[jj].playerId,
                        character:enemies[jj].character,
                        onCompleted:enemies[jj].onCompleted,
                        drop:enemies[jj].drop,
                        stats:{
                            ofn:enemies[jj].stats.ofn,
                            dfn:enemies[jj].stats.dfn,
                            spd:enemies[jj].stats.spd,
                            mod_ofn:enemies[jj].stats.mod_ofn,
                            mod_dfn:enemies[jj].stats.mod_dfn,
                            mod_spd:enemies[jj].stats.mod_spd,
                            curHp:enemies[jj].stats.curHp,
                            maxHp:enemies[jj].stats.maxHp,
                            defeated:enemies[jj].stats.defeated,
                            dir:enemies[jj].stats.dir
                        },
                        opts:{
                            level:enemies[jj].opts.level,
                            gender:enemies[jj].opts.gender,
                            text:enemies[jj].opts.text
                        }
                    }));
                    enm[curEvent.p.eventId].push(enemy);
                }
            }
            var battles = Q.state.get("currentBattles");
            battles.push(event.p.eventId);
            Q.state.set("battleHost",curEvent.p.host);
            //clearInterval(Q.updateInterval);
        }
    }
};
Q.setEvents=function(stage,events){
    var keys = Object.keys(events);
    for(iE=0;iE<keys.length;iE++){
        var event = events[keys[iE]];
        event.eventId = keys[iE];
        switch(event.event){
            case "spawnEnemies":
                var enemies = event.p.enemies;
                break;
        }
        switch(event.trigger.type){
            case "enter":
                Q.eventFuncs[event.event]({p:{enemies:enemies,status:event.p.status,eventId:event.eventId},stage:stage});
                
                break;
            case "onLocation":
                for(iL=0;iL<event.locations.length;iL++){
                    stage.insert(new Q.Trigger({eventObj:event,eventId:event.eventId,loc:event.locations[iL],event:event.event,enemies:enemies,status:event.p.status,host:event.p.host}));
                }
                break;
            
        }
    }
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
                loc:en.p.loc,
                eventId:en.p.eventId,
                playerId:en.p.playerId,
                character:en.p.character,
                onCompleted:en.p.onCompleted,
                drop:en.p.drop,
                defeated:en.p.defeated,
                stats:{
                    ofn:en.p.ofn,
                    dfn:en.p.dfn,
                    spd:en.p.spd,
                    mod_ofn:en.p.mod_ofn,
                    mod_dfn:en.p.mod_dfn,
                    mod_spd:en.p.mod_spd,
                    curHp:en.p.curHp,
                    maxHp:en.p.maxHp,
                    defeated:en.p.defeated,
                    dir:en.p.dir
                },
                opts:{
                    level:en.p.opts.level,
                    gender:en.p.opts.gender,
                    text:en.p.opts.text
                }
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
    
    
};

Q.generateTurnOrder=function(activePlayers,enemies){
    //For now, just put the order chronologically
    var turnOrder = [];
    for(i=0;i<activePlayers.length;i++){
        turnOrder.push(activePlayers[i].p.playerId);
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