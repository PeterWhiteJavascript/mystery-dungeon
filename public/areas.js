Quintus.Areas = function(Q){
Q.afterDir=function(){
    Q.state.get("playerConnection").socket.emit('readyForNextTurn',{
        playerId:Q.state.get("playerConnection").id
    });
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
};