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
            "first_demo1_0": {
                "events": [
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                11,
                                1
                            ],
                            [
                                11,
                                2
                            ],
                            [
                                11,
                                3
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            9,
                                            1
                                        ],
                                        "level": 1,
                                        "dir": "Right"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            9,
                                            2
                                        ],
                                        "level": 1,
                                        "dir": "Right"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            9,
                                            3
                                        ],
                                        "level": 1,
                                        "dir": "Right",
                                        "drop": {
                                            "p": {
                                                "item": "OranBerry",
                                                "amount": 1
                                            }
                                        }
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    }
                ],
                "npcs": [
                    {
                        "npcType": "Professor",
                        "text": [
                            [
                                "Get me a cool Diamond!",
                                {
                                    "changeText": 1
                                }
                            ],
                            [
                                {
                                    "checkItem": {
                                        "item": "OranBerry",
                                        "amount": 1,
                                        "trigger": {
                                            "moveNPC": [
                                                3,
                                                6,
                                                "Down"
                                            ],
                                            "changeText": 3
                                        },
                                        "incomplete": {
                                            "changeText": 2
                                        }
                                    }
                                }
                            ],
                            [
                                "I'll let you through if you bring me a diamond!",
                                {
                                    "changeText": 1
                                }
                            ],
                            [
                                "Thanks for the diamond!"
                            ]
                        ],
                        "p": {
                            "textNum": 0,
                            "loc": [
                                4,
                                7
                            ],
                            "dir": "Right"
                        }
                    }
                ],
                "pickups": [
                    {
                        "item": "OranBerry",
                        "amount": 3,
                        "loc": [
                            10,
                            2
                        ],
                        "p": {
                            "status": 0
                        }
                    }
                ]
            },
            "first_demo1_1": {
                "events": [
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                14,
                                1
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            4,
                                            6
                                        ],
                                        "level": 1,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            4,
                                            5
                                        ],
                                        "level": 2,
                                        "dir": "Right",
                                        "drop": {
                                            "p": {
                                                "item": "OranBerry",
                                                "amount": 1
                                            }
                                        }
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            5,
                                            5
                                        ],
                                        "level": 1
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    },
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                16,
                                10
                            ],
                            [
                                16,
                                11
                            ],
                            [
                                18,
                                6
                            ],
                            [
                                18,
                                5
                            ],
                            [
                                18,
                                4
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            20,
                                            10
                                        ],
                                        "level": 1,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            18,
                                            11
                                        ],
                                        "level": 1,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            21,
                                            9
                                        ],
                                        "level": 1,
                                        "drop": {
                                            "p": {
                                                "item": "OranBerry",
                                                "amount": 1
                                            }
                                        }
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    }
                ],
                "npcs": [
                    {
                        "npcType": "Professor",
                        "text": [
                            [
                                "You're gonna need to be at least level 5 to make me move!",
                                {
                                    "changeText": 1
                                }
                            ],
                            [
                                {
                                    "checkLevel": {
                                        "amount": 5,
                                        "trigger": {
                                            "moveNPC": [
                                                23,
                                                9,
                                                "Down"
                                            ],
                                            "changeText": 3
                                        },
                                        "incomplete": {
                                            "changeText": 2
                                        }
                                    }
                                }
                            ],
                            [
                                "I'll let you through once you're level 5!",
                                {
                                    "changeText": 1
                                }
                            ],
                            [
                                "Don't get too rekt out there!"
                            ]
                        ],
                        "p": {
                            "textNum": 0,
                            "loc": [
                                22,
                                10
                            ],
                            "dir": "Left"
                        }
                    }
                ],
                "pickups": []
            },
            "first_demo1_2": {
                "events": [],
                "npcs": [
                    {
                        "items": [
                            [
                                0,
                                {
                                    "amount": 1,
                                    "item": "Potion"
                                }
                            ]
                        ],
                        "npcType": "Professor",
                        "text": [
                            [
                                "Hello!",
                                "You look like you could use this!",
                                {
                                    "changeText": 1
                                }
                            ],
                            [
                                "I've given away my potion already!"
                            ]
                        ],
                        "p": {
                            "textNum": 0,
                            "loc": [
                                12,
                                7
                            ],
                            "dir": "Right"
                        }
                    }
                ],
                "pickups": [
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            9,
                            4
                        ],
                        "p": {
                            "status": 0
                        }
                    },
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            20,
                            11
                        ],
                        "p": {
                            "status": 0
                        }
                    },
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            21,
                            2
                        ],
                        "p": {
                            "status": 0
                        }
                    }
                ]
            },
            "first_demo2_0": {
                "events": [
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                5,
                                10
                            ],
                            [
                                1,
                                13
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            3,
                                            12
                                        ],
                                        "level": 2,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            4,
                                            13
                                        ],
                                        "level": 2,
                                        "dir": "Left"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    },
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                13,
                                10
                            ],
                            [
                                13,
                                9
                            ],
                            [
                                13,
                                6
                            ],
                            [
                                14,
                                4
                            ],
                            [
                                15,
                                4
                            ],
                            [
                                16,
                                4
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            19,
                                            11
                                        ],
                                        "level": 2,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            17,
                                            9
                                        ],
                                        "level": 4,
                                        "dir": "Left",
                                        "drop": {
                                            "p": {
                                                "item": "Potion",
                                                "amount": 1
                                            }
                                        }
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            20,
                                            5
                                        ],
                                        "level": 4,
                                        "dir": "Left"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    }
                ],
                "npcs": [],
                "pickups": [
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            4,
                            12
                        ],
                        "p": {
                            "status": 0
                        }
                    },
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            13,
                            13
                        ],
                        "p": {
                            "status": 0
                        }
                    }
                ]
            },
            "first_demo2_1": {
                "events": [
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                7,
                                7
                            ],
                            [
                                7,
                                8
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            10,
                                            5
                                        ],
                                        "level": 7,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            11,
                                            6
                                        ],
                                        "level": 7,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            12,
                                            4
                                        ],
                                        "level": 7,
                                        "dir": "Down"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    }
                ],
                "npcs": [],
                "pickups": []
            },
            "first_demo2_2": {
                "events": [
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                7,
                                7
                            ]
                        ],
                        "eventType": "enterBuilding",
                        "enter": {
                            "name": "firstDemo2_2a",
                            "loc": [
                                3,
                                10
                            ],
                            "dir": "Up"
                        }
                    }
                ],
                "npcs": [
                    {
                        "npcType": "Professor",
                        "text": [
                            [
                                "Welcome to this awesome town!"
                            ]
                        ],
                        "p": {
                            "textNum": 0,
                            "loc": [
                                15,
                                4
                            ],
                            "dir": "Down"
                        }
                    },
                    {
                        "npcType": "Professor",
                        "text": [
                            [
                                "Take one of these!",
                                {
                                    "changeText": 1
                                }
                            ],
                            [
                                "I've given away my potion already!"
                            ]
                        ],
                        "p": {
                            "textNum": 0,
                            "loc": [
                                11,
                                4
                            ],
                            "dir": "Down"
                        }
                    }
                ],
                "pickups": []
            },
            "first_demo3_0": {
                "events": [
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                1,
                                9
                            ],
                            [
                                2,
                                9
                            ],
                            [
                                8,
                                9
                            ],
                            [
                                10,
                                12
                            ],
                            [
                                10,
                                13
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            2,
                                            13
                                        ],
                                        "level": 3,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            4,
                                            12
                                        ],
                                        "level": 3,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            6,
                                            10
                                        ],
                                        "level": 3,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            8,
                                            13
                                        ],
                                        "level": 3,
                                        "dir": "Right"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    },
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                4,
                                1
                            ],
                            [
                                4,
                                2
                            ],
                            [
                                11,
                                1
                            ],
                            [
                                11,
                                2
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            7,
                                            1
                                        ],
                                        "level": 4,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            8,
                                            2
                                        ],
                                        "level": 4,
                                        "dir": "Left",
                                        "drop": {
                                            "p": {
                                                "item": "Potion",
                                                "amount": 1
                                            }
                                        }
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    },
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                15,
                                3
                            ],
                            [
                                16,
                                3
                            ],
                            [
                                15,
                                7
                            ],
                            [
                                16,
                                7
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            15,
                                            5
                                        ],
                                        "level": 4,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            16,
                                            5
                                        ],
                                        "level": 4,
                                        "dir": "Down"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    },
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                22,
                                3
                            ],
                            [
                                23,
                                3
                            ],
                            [
                                18,
                                8
                            ],
                            [
                                18,
                                9
                            ],
                            [
                                18,
                                12
                            ],
                            [
                                18,
                                13
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            23,
                                            6
                                        ],
                                        "level": 3,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            19,
                                            5
                                        ],
                                        "level": 3,
                                        "dir": "Down"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            20,
                                            13
                                        ],
                                        "level": 3,
                                        "dir": "Right"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            20,
                                            8
                                        ],
                                        "level": 5,
                                        "dir": "Right",
                                        "drop": {
                                            "p": {
                                                "item": "Potion",
                                                "amount": 1
                                            }
                                        }
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            19,
                                            13
                                        ],
                                        "level": 3,
                                        "dir": "Right"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    }
                ],
                "npcs": [],
                "pickups": [
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            16,
                            5
                        ],
                        "p": {
                            "status": 0
                        }
                    }
                ]
            },
            "first_demo3_1": {
                "events": [
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                5,
                                10
                            ],
                            [
                                1,
                                13
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            3,
                                            12
                                        ],
                                        "level": 2,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            4,
                                            13
                                        ],
                                        "level": 2,
                                        "dir": "Left"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    },
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                11,
                                1
                            ],
                            [
                                12,
                                1
                            ],
                            [
                                13,
                                1
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            21,
                                            4
                                        ],
                                        "level": 4,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            10,
                                            2
                                        ],
                                        "level": 4,
                                        "dir": "Right"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            21,
                                            12
                                        ],
                                        "level": 5,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            4,
                                            12
                                        ],
                                        "level": 5,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            3,
                                            5
                                        ],
                                        "level": 2,
                                        "dir": "Right"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            22,
                                            7
                                        ],
                                        "level": 2,
                                        "dir": "Left"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    }
                ],
                "npcs": [],
                "pickups": [
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            2,
                            7
                        ],
                        "p": {
                            "status": 0
                        }
                    },
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            21,
                            4
                        ],
                        "p": {
                            "status": 0
                        }
                    },
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            1,
                            12
                        ],
                        "p": {
                            "status": 0
                        }
                    }
                ]
            },
            "first_demo3_2": {
                "events": [
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                11,
                                1
                            ],
                            [
                                12,
                                1
                            ],
                            [
                                13,
                                1
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            7,
                                            8
                                        ],
                                        "level": 4,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            17,
                                            8
                                        ],
                                        "level": 4,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            9,
                                            8
                                        ],
                                        "level": 5,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            15,
                                            8
                                        ],
                                        "level": 5,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            11,
                                            9
                                        ],
                                        "level": 6,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            13,
                                            9
                                        ],
                                        "level": 6,
                                        "dir": "Up"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    },
                    {
                        "trigger": {
                            "type": "onLocation"
                        },
                        "locations": [
                            [
                                11,
                                17
                            ],
                            [
                                12,
                                17
                            ],
                            [
                                13,
                                17
                            ]
                        ],
                        "eventType": "spawnEnemies",
                        "onCompleted": "doneBattle",
                        "p": {
                            "status": 0,
                            "enemies": [
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            4,
                                            22
                                        ],
                                        "level": 8,
                                        "dir": "Up",
                                        "drop": {
                                            "p": {
                                                "item": "Diamond",
                                                "amount": 1
                                            }
                                        }
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            11,
                                            19
                                        ],
                                        "level": 4,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            13,
                                            19
                                        ],
                                        "level": 4,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            10,
                                            21
                                        ],
                                        "level": 6,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            12,
                                            22
                                        ],
                                        "level": 6,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            14,
                                            21
                                        ],
                                        "level": 6,
                                        "dir": "Up"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            20,
                                            21
                                        ],
                                        "level": 4,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            20,
                                            22
                                        ],
                                        "level": 4,
                                        "dir": "Left"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            2,
                                            15
                                        ],
                                        "level": 5,
                                        "dir": "Down"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            3,
                                            15
                                        ],
                                        "level": 5,
                                        "dir": "Down"
                                    }
                                },
                                {
                                    "className": "Professor",
                                    "p": {
                                        "loc": [
                                            4,
                                            15
                                        ],
                                        "level": 5,
                                        "dir": "Down"
                                    }
                                }
                            ],
                            "turnOrder": []
                        }
                    }
                ],
                "npcs": [],
                "pickups": [
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            8,
                            23
                        ],
                        "p": {
                            "status": 0
                        }
                    },
                    {
                        "item": "OranBerry",
                        "amount": 1,
                        "loc": [
                            21,
                            27
                        ],
                        "p": {
                            "status": 0
                        }
                    }
                ]
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
        file:file
    };
};
module.exports = saveFile;