var quintusSaveState = function(Quintus) {
"use strict";
Quintus.ServerSaveState = function(Q) {

//This sprite holds all of the current state of a file
//One is created when the first player in a file logs in.
Q.Evented.extend("SaveState",{
    init:function(p){
        this.file = p.file;
        this.users = [];
        this.playersPlacedAt = [];
    },
    cycleTurnOrder:function(turnOrder){
        var lastTurn = turnOrder.shift();
        var turnOrder = turnOrder;
        turnOrder.push(lastTurn);
    },
    //Generates the turn order at the start of the battle
    generateTurnOrder:function(objects){
        var turnOrder = [];
        var sortForSpeed = function(){
            var topSpeed = objects[0];
            var idx = 0;
            for(var i=0;i<objects.length;i++){
                if(objects[i].p.stats.agility>topSpeed.p.stats.agility){
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
        var waiting = this.users.filter(function(obj){
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
        this.users.forEach(function(item){
            item.ready=false;
        });
    },
    //When all players are ready for the next turn in a battle
    readyForNextTurn:function(playerId){
        var player = this.users.filter(function(obj){
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