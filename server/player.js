var users = {
    "Saito": {
        "name": "Saito",
        "species": "Aipom",
        "level": 8,
        "exp": 770,
        "curHp": 55,
        "gender": "M",
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
        "loc":[12,12],
        "area":"first_plains2_0"
    },
    "Estevan": {
        "name": "Estevan",
        "species": "Totodile",
        "level": 83,
        "exp": 680,
        "curHp": 51,
        "gender": "M",
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
            ]
        ],
        "special": {
            "canSwim": true
        },
        "text": [
            "Hello, I'm Estevan!"
        ],
        "loc":[12,11],
        "area":"first_plains2_0"
    },
    "Lan": {
        "name": "Lan",
        "species": "Chimchar",
        "level": 8,
        "exp": 708,
        "curHp": 26,
        "gender": "M",
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
        ],
        "special": {
            "canSwim": false
        },
        "text": [
            "Hello, I'm Lan!"
        ]
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