var quintusSaveState = function(Quintus) {
"use strict";
Quintus.ServerSaveState = function(Q) {
//This holds all enemies and allies
Q.Sprite.extend("ServerAI",{
    init:function(p){
        this._super(p,{});
        var data = this.p.data;
        //Fill the p with the levelData data
        var keys = Object.keys(data);
        for(var i_ai=0;i_ai<keys.length;i_ai++){
            this.p[keys[i_ai]]=data[keys[i_ai]];
        }
        var classData = this.p.classData;
        //Fill the p with the classData data
        var keys = Object.keys(classData);
        for(var i_ai=0;i_ai<keys.length;i_ai++){
            this.p[keys[i_ai]]=classData[keys[i_ai]];
        }
        delete(this.p.data);
        delete(this.p.classData);
        //Generate some random iv's
        this.p.iv = this.generateIvs();
        //Now that we have the base stats and ivs, generate the stats
        var p = this.p;
        p.stats = {
            max_hp:(p.base.max_hp*p.level*50)+p.iv.max_hp,
            cur_hp:(p.base.max_hp*p.level*50)+p.iv.max_hp,
            phys_ofn:((p.base.phys_ofn)/2)*p.level*p.iv.phys_ofn*2,
            phys_dfn:((p.base.phys_dfn)/2)*p.level*p.iv.phys_dfn*2,
            spec_ofn:((p.base.spec_ofn)/2)*p.level*p.iv.spec_ofn*2,
            spec_dfn:((p.base.spec_dfn)/2)*p.level*p.iv.spec_dfn*2,
            agility:((p.base.agility)/2)*p.level*p.iv.agility*2,

            strength:((p.base.strength)/2)*p.level*p.iv.strength*2,
            intellect:((p.base.intellect)/2)*p.level*p.iv.intellect*2,
            awareness:((p.base.awareness)/2)*p.level*p.iv.awareness*2,
            willpower:((p.base.willpower)/2)*p.level*p.iv.willpower*2,
            persuasion:((p.base.persuasion)/2)*p.level*p.iv.persuasion*2,
            fate:((p.base.fate)/2)*p.level*p.iv.fate*2
        };
    },
    generateIvs:function(){
        return {
            max_hp:Math.ceil(Math.random()*10),
            phys_ofn:Math.ceil(Math.random()*10),
            phys_dfn:Math.ceil(Math.random()*10),
            spec_ofn:Math.ceil(Math.random()*10),
            spec_dfn:Math.ceil(Math.random()*10),
            agility:Math.ceil(Math.random()*10),

            strength:Math.ceil(Math.random()*10),
            intellect:Math.ceil(Math.random()*10),
            awareness:Math.ceil(Math.random()*10),
            willpower:Math.ceil(Math.random()*10),
            persuasion:Math.ceil(Math.random()*10),
            fate:Math.ceil(Math.random()*10)
        };
    }
});
//This sprite holds all of the current state of a file
//One is created when the first player in a file logs in.
Q.Evented.extend("SaveState",{
    init:function(p){
        this.file = p.file;
        this.players = [];
        this.allies = [];
        this.enemies = [];
        this.playersStartAt = [];
    },
    setScene:function(scene,classes){
        //Populate the enemies and allies for this scene
        var allies = scene.allies;
        var num = 0;
        for(var i=0;i<allies.length;i++){
            for(var j=0;j<allies[i].length;j++){
                allies[i][j].playerId = 'a'+num;
                this.allies.push(this.createNewCharacter(allies[i][j],classes[allies[i][j].className]));
                num++;
            }
        }
        var num = 0;
        var enemies = scene.enemies;
        for(var i=0;i<enemies.length;i++){
            for(var j=0;j<enemies[i].length;j++){
                enemies[i][j].playerId = 'e'+num;
                this.enemies.push(this.createNewCharacter(enemies[i][j],classes[enemies[i][j].className]));
                num++;
            }
        }
        //Need to set up the pickups as well TODO
        this.scene = {
            levelMap:scene.levelMap,
            onStart:scene.onStart,
            onCompleted:scene.onCompleted,
            battle:scene.battle
        };
    },
    //Called when creating AI characters
    createNewCharacter:function(data,classData){
        return new Q.ServerAI({data:data,classData:classData});
    },
    //Generates the turn order at the start of the battle
    generateTurnOrder:function(objects){
        var turnOrder = [];
        var sortForSpeed = function(){
            var topSpeed = objects[0];
            var idx = 0;
            for(var i=0;i<objects.length;i++){
                if(objects[i].p.agility>topSpeed.p.agility){
                    topSpeed=objects[i];
                    idx = i;
                }
            }
            turnOrder.push(topSpeed.p.playerId);
            objects.splice(idx,1);
            if(objects.length){
                return sortForSpeed();
            } else {
                return turnOrder;
            }
        };
        var tO = sortForSpeed();
        return tO;
    },
    //Checks if all of the players are ready to procede to the next step (next turn, startBattle, etc...)
    checkAllReady:function(){
        var waiting = this.players.filter(function(obj){
            return !obj.ready;
        })[0];
        if(!waiting){
            this.allNotReady();
            return true;
        } else {
            return false;
        }
    },
    //Make all players not ready (run after they are all ready for something)
    allNotReady:function(){
        this.players.forEach(function(item){
            item.ready=false;
        });
    },
    //When all players are ready for the next turn in a battle
    readyForNextTurn:function(playerId){
        var player = this.players.filter(function(obj){
            return obj.playerId===playerId;
        })[0];
        player.ready=true;
        return this.checkAllReady();
    }
});
return Q;
};
};
module.exports = quintusSaveState;