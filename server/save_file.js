//This will be taken from a database later
//This holds all data that gets saved
//Obviously we don't want different savefiles to interact with each other, so this is when all 'local' variables live
//The only true global variables should be the _users in app.js that just stores a list of users that have connected and the list of all active files.
//saveFile is filled with the default data when the file is started.
//When resuming a save, create the saveFile, and then modify it with the data from the database
var saveFile = function(file,levelData){
    var classes ={
        "Professor":{
            "className":"Professor",
            "exp":14,
            
            "baseStats":{
                "hp":5.5,
                "ofn":6,
                "dfn":5.5,
                "spd":8.5
            },
            "spSeed": {
                "mind": [9,3],
                "dexterity": [3,6],
                "strength": [2,6],
                "stamina": [6,3]
            },
            "abilities": [
                "RunAway",
                "Pickup"
            ],
            "attacks": [
                ["Scratch",0],
                ["TailWhip",0]
            ],
            "traits":[
                "aggressive"//,
                //"defensive"
            ]
        }
    };
    //JSON Data from the database will be passed in for levelData unless it is a new game
    //If it's a new game
    var ld = levelData;
    if(!ld){
        ld = {
            "Prologue_00": {
                "levelMap":{"name":"first_demo1_2"},
                "onStart":{"name":"Prologue_00","music":"talking1"},
                "onCompleted":{"scene":"Prologue_00_end","music":"talking1",nextScene:"Prologue_01"},
                "battle": {
                    "music":"battle3",
                    "status": 0,
                    "playerMax": 2,
                    "playerLocs":[
                        [13,17],[14,17],
                        [13,18],[14,18],
                        [13,19],[14,19]
                    ],
                    "allies":[
                        [
                            {"name":"Old Wizard Guy","className":"Professor","sheet":"Deino","loc": [14,13],"level": 100,"dir": "left",traits:["aggressive","genius"]},
                            {"name":"Young Wizard Guy","className":"Professor","sheet":"Dratini","loc": [13,13],"level": 100,"dir": "right"},
                        ]
                    ],
                    "enemies": [
                        [
                            {"className": "Professor","loc": [9,10],"level": 1,"dir": "right"},
                            {"className": "Professor","loc": [9,11],"level": 1,"dir": "right","drop": {"item": "OranBerry","amount": 1}},
                            {"className": "Professor","loc": [12,9],"level": 1,"dir": "down"},
                            {"className": "Professor","loc": [14,9],"level": 1,"dir": "down"},
                            {"className": "Professor","loc": [16,10],"level": 1,"dir": "left"}
                        ]
                    ],
                    "pickups": [
                        {"item": "OranBerry","amount": 3,"loc": [20,11],"p": {"status": 0}}
                    ]
                }
            },
            "Prologue_01": {
                "levelMap":{"name":"first_demo0_0"},
                "onStart":{"name":"Prologue_01","music":"talking1"},
                "onCompleted":{"scene":"Prologue_01_end","music":"talking1",nextScene:"Prologue_02"},
                "battle": {
                    "music":"battle4",
                    "status": 0,
                    "playerMax": 2,
                    "playerLocs":[
                        [13,17],[14,17],
                        [13,18],[14,18],
                        [13,19],[14,19]
                    ],
                    "allies":[
                        [
                            {"name":"Old Wizard Guy","className":"Professor","sheet":"Deino","loc": [36,6],"level": 100,traits:["aggressive"]},
                            {"name":"Young Wizard Guy","className":"Professor","sheet":"Dratini","loc": [36,7],"level": 100},
                        ]
                    ],
                    "enemies": [
                        [
                            {"className": "Professor","loc": [10,17],"moveTo":[10,14],"onArrival":[{func:"playStand",props:"right"}],"level": 2,"dir": "up","hidden":true},
                            {"className": "Professor","loc": [10,17],"moveTo":[10,15],"onArrival":[{func:"playStand",props:"right"}],"level": 2,"dir": "up","hidden":true,"drop": {"item": "OranBerry","amount": 1}},
                            {"className": "Professor","loc": [10,17],"moveTo":[10,16],"onArrival":[{func:"playStand",props:"right"}],"level": 2,"dir": "up","hidden":true},

                            {"className": "Professor","loc": [19,17],"moveTo":[19,15],"onArrival":[{func:"playStand",props:"left"}],"level": 2,"dir": "up","hidden":true,"moveForward":[18,15]},
                            {"className": "Professor","loc": [19,17],"moveTo":[19,16],"onArrival":[{func:"playStand",props:"left"}],"level": 2,"dir": "up","hidden":true,"moveForward":[18,16]},
                            {"className": "Professor","loc": [19,13],"moveTo":[19,14],"onArrival":[{func:"playStand",props:"left"}],"level": 2,"dir": "up","hidden":true,"moveForward":[18,14]},

                            {"className": "Professor","loc": [14,11],"moveTo":[17,11],"onArrival":[{func:"playStand",props:"down"}],"level": 2,"dir": "right","hidden":true,"moveForward":[17,13]},
                            {"className": "Professor","loc": [14,11],"moveTo":[16,11],"onArrival":[{func:"playStand",props:"down"}],"level": 2,"dir": "right","hidden":true,"moveForward":[16,13]},
                            {"className": "Professor","loc": [14,11],"moveTo":[15,11],"onArrival":[{func:"playStand",props:"down"}],"level": 2,"dir": "right","hidden":true,"moveForward":[15,13]},
                        ],
                        [
                            {name:"Obama","className": "Professor","loc": [15,6],"moveTo":[16,13],"onArrival":[{func:"playStand",props:"down"}],"level": 20,"dir": "right"},
                        ]
                        
                    ],
                    "pickups": [
                        {"item": "OranBerry","amount": 3,"loc": [20,11],"p": {"status": 0}}
                    ]
                }
            },
            "Prologue_02": {
                "levelMap":{"name":"first_demo1_2"},
                "onStart":{"name":"Prologue_02","music":"talking1"},
                "onCompleted":{"scene":"Prologue_02_end","music":"talking1",nextScene:"Prologue_03"},
                "battle": {
                    "music":"battle1",
                    "status": 0,
                    "playerMax": 2,
                    "playerLocs":[
                        [13,17],[14,17],
                        [13,18],[14,18],
                        [13,19],[14,19]
                    ],
                    "allies":[
                        [
                            {"className":"Professor","loc": [13,19],"level": 1000,"dir": "left",traits:["aggressive"]},
                            {"className":"Professor","sheet":"Dratini","loc": [14,19],"level": 200,"dir": "down"},
                        ]
                    ],
                    "enemies": [
                        [
                            {"className": "Professor","loc": [12,11],"level": 1,"dir": "right"},
                            {"className": "Professor","loc": [12,10],"level": 1,"dir": "right","drop": {"item": "OranBerry","amount": 1}},
                            {"className": "Professor","loc": [14,11],"level": 1,"dir": "up"},
                            {"className": "Professor","loc": [14,9],"level": 1,"dir": "up"},
                            {"className": "Professor","loc": [16,10],"level": 1,"dir": "left"},
                            
                            {"className": "Professor","loc": [13,11],"level": 1,"dir": "right"},
                            {"className": "Professor","loc": [14,10],"level": 1,"dir": "right","drop": {"item": "OranBerry","amount": 1}},
                            {"className": "Professor","loc": [20,12],"level": 1,"dir": "up"},
                            {"className": "Professor","loc": [16,9],"level": 1,"dir": "up"},
                            {"className": "Professor","loc": [17,12],"level": 1,"dir": "left"},
                            
                            {"className": "Professor","loc": [15,11],"level": 1,"dir": "right"},
                            {"className": "Professor","loc": [17,10],"level": 1,"dir": "right","drop": {"item": "OranBerry","amount": 1}},
                            {"className": "Professor","loc": [20,11],"level": 1,"dir": "up"},
                            {"className": "Professor","loc": [15,9],"level": 1,"dir": "up"},
                            {"className": "Professor","loc": [14,12],"level": 1,"dir": "left"}
                            
                        ]
                    ],
                    "pickups": [
                        {"item": "OranBerry","amount": 3,"loc": [20,11],"p": {"status": 0}}
                    ]
                }
            }
        };
    }
    
    var players = [];
    
    //FUNCTIONS BELOW
    //Returns the level data for the scene
    //Sets up the enemies/pickups so that they are all synced as well
    var getLevelData=function(stageName){
        if(ld[stageName]){
            var lev =  ld[stageName];
            //If there's a battle, set up the enemies
            if(lev.battle){
                var enemies = [];
                var allEnemies = [];
                var id = 0;
                for(i=0;i<lev.battle.enemies.length;i++){
                    var group = [];
                    for(j=0;j<lev.battle.enemies[i].length;j++){
                        var enemy = setUpAI(lev.battle.enemies[i][j]);
                        enemy.playerId = "e"+id;
                        id++;
                        if(!enemy.gender){enemy.gender="M";};
                        group.push(enemy);
                        allEnemies.push(enemy);
                    }
                    enemies.push(group);
                }
                lev.allEnemies = allEnemies;
                lev.curEnemies = enemies;
                var allies = [];
                var allAllies = [];
                var id = 0;
                for(i=0;i<lev.battle.allies.length;i++){
                    var group = [];
                    for(j=0;j<lev.battle.allies[i].length;j++){
                        var ally = setUpAI(lev.battle.allies[i][j]);
                        ally.playerId = "a"+id;
                        id++;
                        if(!ally.gender){ally.gender="M";};
                        group.push(ally);
                        allAllies.push(ally);
                    }
                    allies.push(group);
                }
                lev.allAllies = allAllies;
                lev.curAllies = allies;
            }
            return lev;
        }
    };
    //Accepts the enemy data from the levelData and creates the enemy
    var setUpAI=function(enemy){
        var classData = classes[enemy.className];
        enemy.traits = classData.traits;
        enemy.stats = {
            base:classData.baseStats,
            iv:{
                hp:Math.ceil(Math.random()*10),
                ofn:Math.ceil(Math.random()*10),
                dfn:Math.ceil(Math.random()*10),
                spd:Math.ceil(Math.random()*10)
            },
            sp:{
                mind:Math.ceil(Math.random()*classData.spSeed.mind[1]+classData.spSeed.mind[0]),
                dexterity:Math.ceil(Math.random()*classData.spSeed.dexterity[1]+classData.spSeed.dexterity[0]),
                strength:Math.ceil(Math.random()*classData.spSeed.strength[1]+classData.spSeed.strength[0]),
                stamina:Math.ceil(Math.random()*classData.spSeed.stamina[1]+classData.spSeed.stamina[0])
            }
        };
        var level = enemy.level;
        var hp = (enemy.stats.base.hp*level*50)+enemy.stats.iv.hp;
        var ofn = ((enemy.stats.base.ofn)/2)*level*enemy.stats.iv.ofn*2;
        var dfn = ((enemy.stats.base.dfn)/2)*level*enemy.stats.iv.dfn*2;
        var spd = enemy.stats.base.spd*level*enemy.stats.iv.spd;
        
        enemy.maxHp = Math.round(Math.sqrt(hp));
        enemy.curHp = enemy.maxHp;
        enemy.ofn=Math.round(Math.sqrt(ofn));
        enemy.dfn=Math.round(Math.sqrt(dfn));
        enemy.spd=Math.round(Math.sqrt(spd));

        enemy.exp = classData.exp;
        enemy.abilities = classData.abilities;
        enemy.attacks = classData.attacks;
        return enemy;
    };
    var generateTurnOrder=function(stageName,players){
        //If we've already made the turn order
        if(ld.turnOrder){return;};
        //Create the turn order
        var lev =  ld[stageName];
        var turnOrder = [];
        //var players = players;
        
        var enemies = lev.allEnemies;
        var allies = lev.allAllies;
        //var objects = players.concat(allies).concat(enemies);
        var objects = allies.concat(enemies);
        var sortForSpeed = function(){
            var topSpeed = objects[0];
            var idx = 0;
            for(i=0;i<objects.length;i++){
                if(objects[i].spd>topSpeed.spd){
                    topSpeed=objects[i];
                    idx = i;
                }
            }
            turnOrder.push(topSpeed.playerId);
            objects.splice(idx,1);
            if(objects.length){
                return sortForSpeed();
            } else {
                return turnOrder;
            }
        };
        var tO = sortForSpeed();
        return tO;
    };
    var checkObjInWay=function(locTo,area){
        //check this level's active game objects (Players, NPC's, Enemies)
        var objInWay = ld[area].activeObjects.filter(function(obj){
            return obj.p.loc[0]===locTo[0]&&obj.p.loc[1]===locTo[1];
        })[0];
        return objInWay;
    };
    var scene = "Prologue_00";
    //Return the saveFile object
    return {
        //functions
        getLevelData:getLevelData,
        setUpAI:setUpAI,
        generateTurnOrder:generateTurnOrder,
        checkObjInWay:checkObjInWay,
        //props
        //Object containing events, npcs, and pickups
        levelData:ld,
        //Array of players (will be filled as players join)
        players:players,
        //String filename
        file:file,
        //The current scene
        scene:scene
        
    };
};
module.exports = saveFile;