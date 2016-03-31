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
        this.turns=0;
    },
    cycleTurnOrder:function(turnOrder){
        var lastTurn = turnOrder.shift();
        var turnOrder = turnOrder;
        turnOrder.push(lastTurn);
        this.turns++;
        //console.log(this.turns);
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
            return !obj.p.ready;
        })[0];
        if(!waiting){
            this.allNotReady();
            return true;
        } else {
            return false;
        }
    },
    removePlacedPlayer:function(playerId){
        //Remove the player from the placed players array
        var placedPlayers = this.playersPlacedAt;
        for(var i=0;i<placedPlayers.length;i++){
            if(placedPlayers[i].playerId===playerId){
                placedPlayers.splice(i,1);
            }
        }
    },
    //Make all players not ready (run after they are all ready for something)
    allNotReady:function(){
        this.users.forEach(function(item){
            item.p.ready=false;
        });
    },
    battleStart:function(){
        this.users.forEach(function(item){
            item.checkDestroyObj();
            item.p.obj=null;
        });
        var t = this;
        Q("Participant",1).each(function(){
            this.p.turnOrder = t.turnOrder;
            this.p.modStats.movement=this.p.stats.movement;
            if(this.p.final){
                this.p.loc = this.p.final[0];
                this.p.dir = this.p.final[1];
            }
        });
    },
    setAllUsersPlayers:function(){
        this.users.forEach(function(item){
            item.p.player = Q("Participant",1).items.filter(function(obj){
                return item.p.playerId===obj.p.playerId;
            })[0];
        });
    },
    //Sets a user to be ready and checks if all users are ready
    setAndCheckReady:function(playerId){
        var user = this.users.filter(function(obj){
            return obj.p.playerId===playerId;
        })[0];
        user.p.ready=true;
        return this.checkAllReady();
    }
});
return Q;
};
};
module.exports = quintusSaveState;