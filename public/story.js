Quintus.Story=function(Q){

//Run this to go to the next scene as set in save_data
Q.goToNextScene = function(){
    var nextScene = Q.state.get("levelData").onCompleted.nextScene;
    var socket = Q.state.get("playerConnection").socket;
    socket.emit('readyForNextScene',{playerId:Q.state.get("playerConnection").id,nextScene:nextScene});
};
//createEnemies accepts an array of enemies taken from the server
Q.createEnemies = function(enemies,stage){
    var ens = [];
    for(i=0;i<enemies.length;i++){
        var en = enemies[i];
        var keys = Object.keys(en);
        var enemy = stage.insert(new Q.Enemy());
        for(j=0;j<keys.length;j++){
            enemy.p[keys[j]]= en[keys[j]];
        };
        ens.push(enemy);
    }
    return ens;
};
Q.createAllies=function(allies,stage){
    var als = [];
    for(i=0;i<allies.length;i++){
        var al = allies[i];
        var keys = Object.keys(al);
        var ally = stage.insert(new Q.Ally());
        for(j=0;j<keys.length;j++){
            ally.p[keys[j]]= al[keys[j]];
        };
        als.push(ally);
    }
    return als;
};

Q.component("storySprite",{
    added:function(){
        this.entity.on("doneAutoMove");
        var p = this.entity.p;
        p.myTurnTiles=100000;
        p.stepDelay=0.4;
        p.stepDistance=64;
        p.type=Q.SPRITE_NONE;
        p.z = p.y;
    },
    extend:{
        disappear:function(){
            this.add("tween");
            this.animate({opacity:0.01},1,Q.Easing.Linear,{callback:function(){this.trigger("disappeared");}});
            
        },
        disappeared:function(){
            this.destroy();
        },
        changeDir:function(dir){
            this.p.dir=dir;
            this.playStand(dir);
        },
        //If we have a path that we want to follow
        //This path is a series of moveTo's
        startPresetAutoMove:function(paths){
            var t = this;
            setTimeout(function(){
                var path = [];
                var graph = new Graph(t.getWalkMatrix());
                for(i=0;i<paths.length;i++){
                    var loc;
                    if(i>0){loc=paths[i-1];}
                    var pa = t.getPath(paths[i],graph,false,false,loc);
                    for(j=0;j<pa.length;j++){
                        path.push(pa[j]);
                    }
                }
                t.p.calcMenuPath = path;
                t.add("autoMove");
            },4);
        },
        //follow the fastest path to a location
        startAutoMove:function(moveTo){
            if(moveTo){this.p.moveTo = moveTo;};
            var graph = new Graph(this.getWalkMatrix());
            this.p.calcMenuPath = this.getPath(this.p.moveTo,graph);
            this.add("autoMove");
        },
        doneAutoMove:function(){
            for(i=0;i<this.p.onArrival.length;i++){
                if(Q._isFunction(this.p.onArrival[i].func)){
                    this.p.onArrival[i].func(this.p.onArrival[i].props);
                //Else if it's a string
                } else {
                    this[this.p.onArrival[i].func](this.p.onArrival[i].props);
                }
            }
        },
        setProp:function(props){
            this.p[props[0]]=props[1];
        }
    }
});
};