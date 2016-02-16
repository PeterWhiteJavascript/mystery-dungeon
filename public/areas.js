Quintus.Areas = function(Q){

Q.givePlayerProperties=function(stage,data,loc,dir){
    var conn = Q.state.get("playerConnection");
    //Set the players' properties
    var player = stage.insert(new Q.Player({num:0,playerId:conn.id,socket:conn.socket,loc:loc,dir:dir}));
    var keys = Object.keys(data);
    for(i=0;i<keys.length;i++){
        player.p[keys[i]]=data[keys[i]];
    }
    player.add("protagonist");
    return player;
};
Q.afterDir=function(){
    setTimeout(function(){
        var turnOrder = Q.state.get("turnOrder");
        var allies = [];
        var enemies = [];
        var players = [];
        for(i=0;i<turnOrder.length;i++){
            if(turnOrder[i][0]==="e"){enemies.push(turnOrder[i]);}
            else if(turnOrder[i][0]==="a"){allies.push(turnOrder[i]);}
            else{players.push(turnOrder[i]);}
        }
        //If there are no more enemies
        if(enemies.length===0){
            //Emit that the battle is done
            setTimeout(function(){
                Q.state.get("playerConnection").socket.emit('endBattle');
            },200);
        } 
        //If there are no more friendlies
        else if(allies.length===0&&players.length===0){
            //Play the lose scene
            setTimeout(function(){
                Q.state.get("playerConnection").socket.emit('loseBattle');
            },200);
        } 
        //If we're still battling
        else {
            if(Q.state.get("playerConnection").id===Q.state.get("battleHost")||Q.state.get("playerConnection").id===turnOrder[0]){
                setTimeout(function(){
                    Q.state.get("playerConnection").socket.emit('endTurn',{
                        playerId:Q.state.get("playerConnection").id,
                        turnOrder:turnOrder
                    });
                },200);
            } else {
                Q.state.get("playerConnection").socket.emit("readyForNextTurn",{playerId:Q.state.get("playerConnection").id});
            }
        }
    },100);
};
Q.addViewport=function(obj){
    if(Q._isString(obj)){
        if(obj[0]==="e"){
            obj = Q("Enemy",1).items.filter(function(o){
                return o.p.playerId===obj;
            })[0];
        } else if(obj[0]==="a"){
            obj = Q("Ally",1).items.filter(function(o){
                return o.p.playerId===obj;
            })[0];
        } else {
            obj = Q("Player",1).items.filter(function(o){
                return o.p.playerId===obj;
            })[0];
        }
    }
    if(Q._isNumber(obj)){
        obj = Q("Player",1).items.filter(function(o){
            return o.p.playerId===obj;
        })[0];
    }
    if(obj){/*
        if(Q.stage(1).viewport.following&&Q.stage(1).viewport.following.p.x===obj.p.x&&Q.stage(1).viewport.following.p.y===obj.p.y){
            return;
        } else {*/
            obj.p.stageMaxX=Q.TL.p.w;
            var minX=0;
            var maxX=Q.TL.p.w;
            var minY=0;
            var maxY=Q.TL.p.h;
            if(Q.TL.p.w<Q.width){minX=-(Q.width-Q.TL.p.w),maxX=Q.width;};
            if(Q.TL.p.h<Q.height){minY=-Q.height;maxY=Q.TL.p.h;};
            Q.stage(1).follow(obj,{x:true,y:true},{minX: minX, maxX: maxX, minY: minY,maxY:maxY});
        //}
    }
};
Q.scene("fog",function(stage){
    stage.insert(new Q.Sprite({x:0,y:0,cx:0,cy:0,asset:"fog.png"}));
});
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