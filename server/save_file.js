//This will be taken from a database later
//This holds all data that gets saved
//Obviously we don't want different savefiles to interact with each other, so this is when all 'local' variables live
//The only true global variables should be the _users in app.js that just stores a list of users that have connected and the list of all active files.
//saveFile is filled with the default data when the file is started.
//When resuming a save, create the saveFile, and then modify it with the data from the database
var saveFile = function(file,levelData){
    //JSON Data from the database will be passed in for levelData unless it is a new game
    //If it's a new game
    var ld = levelData;
    if(!ld){
        ld = {
            "Prologue_00": {
                "levelMap":{"name":"first_demo1_2"},
                "onStart":{"name":"Prologue_00","music":"talking1"},
                "onCompleted":{"scene":"Prologue_00_end","music":"talking1"}
            },
            "Prologue_01": {
                "levelMap":{"name":"first_demo1_2"},
                "onStart":{"name":"Prologue_01","music":"talking1"},
                "onCompleted":{"scene":"Prologue_01_end","music":"talking1"},
                "battle": {
                    "music":"battle1",
                    "status": 0,
                    "playerMax": 2,
                    "playerLocs":[
                        [7,10],[8,10],[9,10],
                        [7,11],[8,11],[9,11]
                    ],
                    "enemies": [
                        {"className": "Professor","p": {"loc": [11,9],"level": 1,"dir": "right"}},
                        {"className": "Professor","p": {"loc": [11,10],"level": 1,"dir": "right","drop": {"p": {"item": "OranBerry","amount": 1}}}}
                    ],
                    "pickups": [
                        {"item": "OranBerry","amount": 3,"loc": [10,2],"p": {"status": 0}}
                    ]
                }
            }
        };
    }
    
    var players = [];
    
    //FUNCTIONS BELOW
    var getLevelData=function(stageName){
        if(ld[stageName]){
            return ld[stageName];
        }
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