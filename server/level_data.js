var quintusServerLevelData = function(Quintus) {
"use strict";
Quintus.ServerLevelData = function(Q) {
    //This is the global leveldata object that all files will reference when getting game data
    //Nothing here should be altered
    Q.Evented.extend("LevelData",{
        init:function(){
            //Get all of the classes
            this.classes=this.setClasses();
            //Get all of the level data
            this.levelData=this.setAllLevelData();
        },
        //Gets a specific scene's data
        //Called every time the scene changes
        getSceneData:function(scene){
            return this.levelData[scene];
        },
        //Returns all of the classes
        getClasses:function(){
            return this.classes;
        },
        setClasses:function(){
            return {
                Fighter:{
                    className:"Fighter",
                    base:{
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
                    attacks:[
                        {name:"Regular",level:1},
                        {name:"Push",level:1},
                        {name:"Pull",level:1},
                        {name:"HighDMG",level:1},
                        {name:"AOE",level:1}
                    ]
                },
                Pyromancer:{
                    className:"Pyromancer",
                    base:{
                        max_hp:2,
                        phys_ofn:4,
                        phys_dfn:2,
                        spec_ofn:4,
                        spec_dfn:2,
                        agility:1,

                        strength:2,
                        intellect:1,
                        awareness:3,
                        willpower:2,
                        persuasion:4,
                        fate:3
                    },
                    attacks:[
                        {name:"Fire",level:1},
                        {name:"Fireball",level:1},
                        {name:"CHNGTileToFire",level:1},
                        {name:"AOEFire",level:1},
                        {name:"Firebreath",level:1}
                    ]
                }
            };
        },
        setAllLevelData:function(){
            var levelData = {
                Prologue_00:{
                    levelMap:{name:"first_demo1_2"},
                    onStart:{name:"Prologue_00",music:"talking1"},
                    onCompleted:{scene:"Prologue_00_end",music:"talking1",nextScene:"Prologue_01"},
                    battle:{
                        music:"battle3",
                        playerLocs:[
                            [13,17],[14,17],
                            [13,18],[14,18],
                            [13,19],[14,19]
                        ]
                    },
                    allies:[
                        [
                            {name:"Old Wizard",className:"Pyromancer",loc: [14,13],level: 100,dir: "left",traits:["aggressive","genius"]},
                            {name:"Young Wizard",className:"Pyromancer",loc: [13,13],level: 100,dir: "right",traits:["aggressive","genius"]},
                        ]
                    ],
                    enemies:[
                        [
                            {className: "Fighter",loc: [9,10],level: 1,dir: "right"},
                            {className: "Fighter",loc: [9,11],level: 1,dir: "right"},
                            {className: "Fighter",loc: [12,9],level: 1,dir: "down"},
                            {className: "Fighter",loc: [14,9],level: 1,dir: "down"},
                            {className: "Fighter",loc: [16,10],level: 1,dir: "left"}
                        ]
                    ],
                    pickups:[
                        {item: "Potion",amount: 1,loc: [20,11]}
                    ]
                },
                Prologue_01:{
                    levelMap:{name:"first_demo0_0"},
                    onStart:{name:"Prologue_01",music:"talking1"},
                    onCompleted:{scene:"Prologue_01_end",music:"talking1",nextScene:"Prologue_02"},
                    battle:{
                        music:"battle4",
                        playerLocs:[
                            [7,14],[8,14],
                            [7,15],[8,15],
                            [7,16],[8,16]
                        ]
                    },
                    allies:[
                        [
                            {name:"Old Wizard",className:"Pyromancer",loc: [36,6],level: 100,dir: "left",traits:["aggressive","genius"]},
                            {name:"Young Wizard",className:"Pyromancer",loc: [36,7],level: 100,dir: "left",traits:["aggressive","genius"]},
                        ]
                    ],
                    enemies:[
                        [
                            {className: "Fighter",loc: [10,17],moveTo:[10,14],onArrival:[{func:"playStand",props:"right"}],level: 2,dir: "up"},
                            {className: "Fighter",loc: [10,17],moveTo:[10,15],onArrival:[{func:"playStand",props:"right"}],level: 2,dir: "up"},
                            {className: "Fighter",loc: [10,17],moveTo:[10,16],onArrival:[{func:"playStand",props:"right"}],level: 2,dir: "up"},
                            
                            {className: "Fighter",loc: [19,17],moveTo:[19,15],onArrival:[{func:"playStand",props:"left"}],moveForward:[18,15],level: 2,dir: "up"},
                            {className: "Fighter",loc: [19,17],moveTo:[19,16],onArrival:[{func:"playStand",props:"left"}],moveForward:[18,16],level: 2,dir: "up"},
                            {className: "Fighter",loc: [19,13],moveTo:[19,14],onArrival:[{func:"playStand",props:"left"}],moveForward:[18,14],level: 2,dir: "down"},
                            
                            {className: "Fighter",loc: [14,11],moveTo:[17,11],onArrival:[{func:"playStand",props:"down"}],moveForward:[17,13],level: 2,dir: "right"},
                            {className: "Fighter",loc: [14,11],moveTo:[16,11],onArrival:[{func:"playStand",props:"down"}],moveForward:[16,13],level: 2,dir: "right"},
                            {className: "Fighter",loc: [14,11],moveTo:[15,11],onArrival:[{func:"playStand",props:"down"}],moveForward:[15,13],level: 2,dir: "right"}
                        ],
                        [
                            {name:"Obama",className: "Fighter",loc: [15,6],moveTo:[16,13],onArrival:[{func:"playStand",props:"down"}],level: 20,dir:"right"}
                        ]
                    ],
                    pickups:[
                        {item: "Potion",amount: 1,loc: [20,11]}
                    ]
                },
                Prologue_02:{
                    levelMap:{name:"first_demo1_2"},
                    onStart:{name:"Prologue_02",music:"talking1"},
                    onCompleted:{scene:"Prologue_02_end",music:"talking1",nextScene:"Prologue_03"},
                    battle:{
                        music:"battle4",
                        playerLocs:[
                            [13,17],[14,17],
                            [13,18],[14,18],
                            [13,19],[14,19]
                        ]
                    },
                    allies:[
                        [
                            {name:"Old Wizard",className:"Pyromancer",loc: [13,16],level: 100,dir: "left",traits:["aggressive","genius"]},
                            {name:"Young Wizard",className:"Pyromancer",loc: [14,16],level: 100,dir: "left",traits:["aggressive","genius"]},
                        ]
                    ],
                    enemies:[
                        [
                            {className: "Fighter",loc: [11,9],level: 2,dir: "up"},
                            {className: "Fighter",loc: [12,9],level: 2,dir: "up"},
                            {className: "Fighter",loc: [13,9],level: 2,dir: "up"}
                            
                        ],
                        [
                            {name:"Obama",className: "Fighter",loc: [15,6],level: 20,dir:"right"}
                        ]
                    ],
                    pickups:[
                        {item: "Potion",amount: 1,loc: [20,11]}
                    ]
                }
                        
            };
            return levelData;
        }
    });
    
    return Q;
};
};

module.exports = quintusServerLevelData;