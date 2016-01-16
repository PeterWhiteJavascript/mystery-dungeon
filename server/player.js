var users = {
    "Saito": {
        "name": "Saito",
        "species": "Aipom",
        "level": 1,
        "exp": 0,
        "curHp": 25,
        "gender": "M",
        "types": [
            "Normal"
        ],
        "pp": [
            [
                35,
                35
            ],
            [
                30,
                30
            ],
            [
                0,
                0
            ],
            [
                0,
                0
            ]
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
        "loc":[7,10],
        "area":"first_demo1_2",
        "file":"BigGame"
    },
    "Estevan": {
        "name": "Estevan",
        "species": "Totodile",
        "level": 1,
        "exp": 0,
        "curHp": 22,
        "gender": "M",
        "types": [
            "Water"
        ],
        "pp": [
            [
                35,
                35
            ],
            [
                30,
                30
            ],
            [
                99,
                99
            ],
            [
                0,
                0
            ]
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
        "loc":[8,10],
        "area":"first_demo1_2",
        "file":"BigGame"
    },
    "Lan": {
        "name": "Lan",
        "species": "Chimchar",
        "level": 1,
        "exp": 0,
        "curHp": 20,
        "gender": "M",
        "types": [
            "Fire"
        ],
        "pp": [
            [
                35,
                35
            ],
            [
                30,
                30
            ],
            [
                0,
                0
            ],
            [
                0,
                0
            ]
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
        "loc":[8,11],
        "area":"first_demo1_2",
        "file":"BigGame"
    }
};


var Player = function(data){
    var playerId = data['playerId'];
    var character = data['character'];
    //Get data from database before this
    this.p = users[character];
    this.p.playerId = playerId;
};




module.exports = Player;