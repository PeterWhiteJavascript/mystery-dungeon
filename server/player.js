var quintusServerPlayer = function(Quintus) {
"use strict";
Quintus.ServerPlayer = function(Q) {
//This will be taken from the database
var users = {
    Saito:{
        name:"Saito",
        className:"Fighter",
        sheet:"Professor",
        level:1,
        exp:0,
        curHp:20,
        gender:"M",
        stats:{
            max_hp:5,
            phys_ofn:4,
            phys_dfn:4,
            spec_ofn:1,
            spec_dfn:2,
            agility:2,

            strength:4,
            intellect:1,
            awareness:3,
            willpower:2,
            persuasion:1,
            fate:1
        },
        abilities:{
            swimmer:1
        },
        attacks:[
            ["Scratch",1],
            ["Leer",1],
            ["DumpsterDunk",1]
        ],
        items:[
            ["Potion",1]
        ],
        text:[
            "Hello, I'm Saito!"
        ],
        file:"BigGame"
    },
    Estevan:{
        name:"Estevan",
        className:"Fighter",
        sheet:"Professor",
        level:1,
        exp:0,
        curHp:20,
        gender:"M",
        stats:{
            max_hp:5,
            phys_ofn:4,
            phys_dfn:4,
            spec_ofn:1,
            spec_dfn:2,
            agility:2,

            strength:4,
            intellect:1,
            awareness:3,
            willpower:2,
            persuasion:1,
            fate:1
        },
        abilities:{
            swimmer:1
        },
        attacks:[
            ["Scratch",1],
            ["Leer",1],
            ["DumpsterDunk",1]
        ],
        items:[
            ["Potion",1]
        ],
        text:[
            "Hello, I'm Estevan!"
        ],
        file:"BigGame"
    }
};
//Create this only once; when the user logs in and the data is taken from the database
Q.Sprite.extend("ServerPlayer",{
    init:function(p){
        this._super(p,{});
        var data = users[this.p.name];
        var player = this;
        var keys = Object.keys(data);
        //Populate the p property with the data from the database
        for(var i=0;i<keys.length;i++){
            player.p[keys[i]]=data[keys[i]];
        }
    },
});

return Q;
};
};
module.exports = quintusServerPlayer;