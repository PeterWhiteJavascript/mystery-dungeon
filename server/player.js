var users = {
    "Saito": {
        "name": "Saito",
        "className":"Professor",
        "sheet":"Professor",
        "level": 1,
        "exp": 0,
        "curHp": 25,
        "gender": "M",
        "types": [
            "Normal"
        ],
        "iv": {
            "hp": 8,
            "ofn": 9,
            "dfn": 7,
            "spd":9
        },
        "other": {
            "mind": 3,
            "dexterity": 3,
            "strength": 4,
            "stamina": 9
        },
        "ability":"RunAway",
        "attacks": [
            "Scratch",
            "TailWhip"
        ],
        "items": [
            [
                "OranBerry",
                1
            ]
        ],
        "special": {
            "canSwim": false
        },
        "text": [
            "Hello, I'm Saito!"
        ],
        "file":"BigGame"
    },
    "Estevan": {
        "name": "Estevan",
        "className":"Professor",
        "sheet":"Professor",
        "level": 1,
        "exp": 0,
        "curHp": 23,
        "gender": "M",
        "types": [
            "Water"
        ],
        "iv": {
            "hp": 6,
            "ofn": 7,
            "dfn": 5,
            "spd": 8
        },
        "other": {
            "mind": 5,
            "dexterity": 3,
            "strength": 4,
            "stamina": 9
        },
        "ability":"Torrent",
        "attacks": [
            "Scratch",
            "Leer",
            "DumpsterDunk"
        ],
        "items": [
            [
                "OranBerry",
                1
            ]
        ],
        "special": {
            "canSwim": true
        },
        "text": [
            "Hello, I'm Estevan!"
        ],
        "file":"BigGame"
    },
    "Lan": {
        "name": "Lan",
        "className":"Professor",
        "sheet":"Professor",
        "level": 1,
        "exp": 0,
        "curHp": 20,
        "gender": "M",
        "types": [
            "Fire"
        ],
        "iv": {
            "hp": 5,
            "ofn": 10,
            "dfn": 5,
            "spd": 7
        },
        "other": {
            "mind": 3,
            "dexterity": 4,
            "strength": 4,
            "stamina": 7
        },
        "ability":"IronFist",
        "attacks": [
            "Scratch",
            "Leer"
        ],
        "items": [
            [
                "OranBerry",
                1
            ]
        ],
        "special": {
            "canSwim": false
        },
        "text": [
            "Hello, I'm Lan!"
        ],
        "file":"BigGame"
    }
};

var Player = function(data){
    var tileSize = 64;
    var playerId = data['playerId'];
    var p = users[data['character']];
    p.playerId = playerId;
    var getLoc = function(x,y){
        //Returns [locx,locy]
        return [x/tileSize+tileSize/2,y/tileSize+tileSize/2];
    };
    var getXFromLoc = function(loc){
        //Returns x
        return loc[0]*tileSize+tileSize/2;
    };
    var getYFromLoc = function(loc){
        //Returns y
        return loc[1]*tileSize+tileSize/2;
    };
    var getX = function() {
        return x;
    };

    var getY = function() {
        return y;
    };

    var setX = function(newX) {
        x = newX;
    };

    var setY = function(newY) {
        y = newY;
    };
    
    
    return  {
        getLoc: getLoc,
        getXFromLoc: getXFromLoc,
        getYFromLoc: getYFromLoc,
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        p:p
    };
};

module.exports = Player;