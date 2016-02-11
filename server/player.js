var users = {
    "Saito": {
        "name": "Saito",
        "className":"Professor",
        "sheet":"Professor",
        "level": 1,
        "exp": 0,
        "curHp": 25,
        "gender": "M",
        
        "iv": {
            "hp": 8,
            "ofn": 9,
            "dfn": 7,
            "spd":9
        },
        "sp": {
            "mind": 3,
            "dexterity": 3,
            "strength": 4,
            "stamina": 9
        },
        "abilities":["RunAway"],
        "attacks": [
            ["Scratch",1],
            ["Leer",1]
        ],
        "items": [
            [
                "OranBerry",
                1
            ]
        ],
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
        "curHp": 17,
        "gender": "M",
        
        "iv": {
            "hp": 6,
            "ofn": 7,
            "dfn": 5,
            "spd": 8
        },
        "sp": {
            "mind": 5,
            "dexterity": 3,
            "strength": 4,
            "stamina": 9
        },
        "abilities":["Torrent"],
        "attacks": [
            ["Scratch",1],
            ["Leer",1],
            ["DumpsterDunk",1]
        ],
        "items": [
            [
                "OranBerry",
                1
            ]
        ],
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
        "iv": {
            "hp": 5,
            "ofn": 10,
            "dfn": 5,
            "spd": 7
        },
        "sp": {
            "mind": 3,
            "dexterity": 4,
            "strength": 4,
            "stamina": 7
        },
        "abilities":["IronFist"],
        "attacks": [
            ["Scratch",1],
            ["Leer",1]
        ],
        "items": [
            [
                "OranBerry",
                1
            ]
        ],
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
    var name  = p.name;
    var className = p.className;
    var sheet = p.sheet;
    var level = p.level;
    var exp = p.exp;
    var curHp = p.curHp;
    var gender = p.gender;
    var stats = {};
    stats.base = {
        "hp":5.5,
        "ofn":6,
        "dfn":5.5,
        "spd":8.5
    };
    stats.iv = p.iv;
    stats.sp = p.sp;
    
    var abilities = p.abilities;
    var attacks = p.attacks;
    var items = p.items;
    var text = p.text;
    var file = p.file;
    
    var maxHp = Math.round(Math.sqrt((stats.base.hp*level*50)+stats.iv.hp));
    var ofn = Math.round(Math.sqrt(((stats.base.ofn)/2)*level*stats.iv.ofn*2));
    var dfn = Math.round(Math.sqrt(((stats.base.dfn)/2)*level*stats.iv.dfn*2));
    var spd = Math.round(Math.sqrt(stats.base.spd*level*stats.iv.spd));

    
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
        
        playerId:playerId,
        
        name:name,
        className:className,
        sheet:sheet,
        level:level,
        exp:exp,
        curHp:curHp,
        gender:gender,
        stats:stats,
        abilities:abilities,
        attacks:attacks,
        items:items,
        text:text,
        file:file,
        
        maxHp:maxHp,
        ofn:ofn,
        dfn:dfn,
        spd:spd
    };
};

module.exports = Player;