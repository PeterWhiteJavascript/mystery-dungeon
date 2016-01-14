var users = {
    "Saito": {
        "name": "Saito",
        "species": "Aipom",
        "level": 8,
        "exp": 770,
        "curHp": 55,
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
                3
            ],
            [
                "CheriBerry",
                3
            ]
        ],
        "special": {
            "canSwim": false
        },
        "text": [
            "Hello, I'm Saito!"
        ],
        "loc":[17,9],
        "area":"first_demo1_1"
    },
    "Estevan": {
        "name": "Estevan",
        "species": "Totodile",
        "level": 83,
        "exp": 680,
        "curHp": 51,
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
            "stamina": 49
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
                3
            ],
            [
                "PechaBerry",
                3
            ],
        ],
        "special": {
            "canSwim": true
        },
        "text": [
            "Hello, I'm Estevan!"
        ],
        "loc":[14,1],
        "area":"first_demo1_1"
    },
    "Lan": {
        "name": "Lan",
        "species": "Chimchar",
        "level": 8,
        "exp": 708,
        "curHp": 26,
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
                3
            ]
        ],
        "special": {
            "canSwim": false
        },
        "text": [
            "Hello, I'm Lan!"
        ],
        "loc":[10,11],
        "area":"first_demo1_1"
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