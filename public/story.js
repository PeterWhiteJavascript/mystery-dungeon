Quintus.Story=function(Q){
Q.allToStorySprite=function(additional){
    Q("Participant",1).each(function(){
        this.del("storySprite,AI");
        this.p.action = null;
        this.off("atDest");
        this.off("doneAutoMove");
        this.add("storySprite");
        if(additional){
            additional(this);
        }
    });
};
//Run this to go to the next scene as set in save_data
Q.goToNextScene = function(){
    Q.state.get("playerConnection").socket.emit("readyForNextScene",{playerId:Q.state.get("playerConnection").id});
};
//Shows the object and also sets its loc
Q.showStoryObj=function(obj){
    obj.show();
};
//Run at the start of battle
Q.showAllStoryObjs=function(){
    Q("Participant",1).each(function(){
        //If it has a final (All AI have a final and players that have participated in the story scene may have one)
        if(this.p.final){
            this.p.loc = this.p.final[0]?this.p.final[0]:this.p.loc;
            this.p.dir = this.p.final[1]?this.p.final[1]:this.p.dir;
            this.setPos(this.p.loc);
            this.playStand(this.p.dir);
        }
        this.show();
    });
};
Q.component("storySprite",{
    added:function(){
        this.entity.on("doneAutoMove");
        Q.showStoryObj(this.entity);
        var p = this.entity.p;
        p.myTurnTiles=100000;
        p.stepDelay=0.4;
        p.stepDistance=64;
    },
    extend:{
        disappear:function(){
            this.add("tween");
            this.animate({opacity:0.01},1,Q.Easing.Linear,{callback:function(){
                this.trigger("disappeared");
            }});
            
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
                for(i=0;i<paths.length;i++){
                    var loc = t.p.loc;
                    if(i>0){loc=paths[i-1];}
                    var pa = t.getPath(loc,paths[i]);
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
            this.p.calcMenuPath = this.getPath(this.p.loc,this.p.moveTo);
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
        },
    }
});
};