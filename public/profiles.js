//When creating database tables
//THE ONLY THINGS THAT SHOULD BE IN THE DATABASE ARE DYNAMIC VARIABLES
//STATIC VARIABLES CAN STAY IN THE JS

//Users is a table
//Each individual user is a row


//Moves should just be a JS object
//Moves is a table
//Each move is a row

//Monsters should probably just be stored in a javascript object here and not in the database. This way we can cut back on server resources.
//If we were to put monsters in the database:
//Monsters is a table
//Each individual monster gets a row
//The player's will be taken out of this table at the start of the game.
//Every enemy that spawns will be taken out of here.
//EXP should be stored in the monsters object.

var RP = {};
RP.expNeeded = [
    0,
    25,
    50,
    100,
    150,
    200,
    400,
    600,
    800,
    1000,
    1500,
    2000,
    3000,
    4000,
    5000,
    6000,
    7000,
    8000,
    9000,
    10000,
    11500,
    13000,
    14500,
    16000,
    17500,
    19000,
    20500,
    22000,
    23500,
    25000,
    27500,
    30000,
    32500,
    35000,
    37500,
    40000,
    42500,
    45000,
    47500,
    50000,
    55000,
    60000,
    65000,
    70000,
    75000,
    80000,
    85000,
    90000,
    95000,
    100000,
    110000,
    120000,
    130000,
    140000,
    150000,
    160000,
    170000,
    180000,
    190000,
    200000,
    210000,
    220000,
    230000,
    240000,
    250000,
    260000,
    270000,
    280000,
    290000,
    300000,
    315000,
    330000,
    345000,
    360000,
    375000,
    390000,
    405000,
    420000,
    435000,
    450000,
    470000,
    490000,
    510000,
    530000,
    550000,
    570000,
    590000,
    610000,
    630000,
    650000,
    675000,
    700000,
    725000,
    750000,
    775000,
    800000,
    825000,
    850000,
    875000,
    900000
];

//Area is the area of effect when the attack hits the target.
//1 - x

//    o o o
//2 - o x o
//    o o o

//    o o o o o
//    o o o o o
//3 - o o x o o
//    o o o o o
//    o o o o o

//This case would mostly be used with a range of 0 (breath attack). 
//Anything more would be like Medusa's acid spray in Smite.
//        o
//4 - x o o
//        o

//Range is the farthest possible target from the user
//Range 0 is self
//0 - x

//    o o o
//1 - o x o
//    o o o

//    o o o o o
//    o o o o o
//2 - o o x o o
//    o o o o o
//    o o o o o

RP.moves = {
    "Scratch": {
        "id": "Scratch",
        "name": "Scratch",
        "power": 35,
        "effect":[],
        "pp": 35,
        "accuracy": 95,
        "type": "Normal",
        "cat": "PHYS",
        "area": 1,
        "range":1,
        "desc": "User ignores its own negative stat changes",
        "target": "enemy"
    },
    "TailWhip": {
        "id": "TailWhip",
        "name": "Tail Whip",
        "power": 0,
        "effect":["enemy",100,"stat",{dfn:-1}],
        "pp": 30,
        "accuracy": 75,
        "type": "Normal",
        "cat": "STAT",
        "area": 1,
        "range":1,
        "desc": "Lowers target's Defense",
        "target": "enemy"
    },
    "Leer": {
        "id": "Leer",
        "name": "Leer",
        "power": 0,
        "effect":["enemy",100,"stat",{dfn:-1}],
        "pp": 30,
        "accuracy": 75,
        "type": "Normal",
        "cat": "STAT",
        "area": 1,
        "range":1,
        "desc": "Lowers target's Defense",
        "target": "enemy"
    },
    "Wrap": {
        "id": "Wrap",
        "name": "Wrap",
        "power": 10,
        "effect":["both",100,"buff","bind"],
        "pp": 20,
        "accuracy": 90,
        "type": "Normal",
        "cat": "PHYS",
        "area": 1,
        "range":1,
        "desc": "Traps target for 5 turns, damaging them. While wrapped, target cannot move.",
        "target": "enemy"
    },
    "Tackle": {
        "id": "Tackle",
        "name": "Tackle",
        "power": 35,
        "effect":[],
        "pp": 35,
        "accuracy": 95,
        "type": "Normal",
        "cat": "PHYS",
        "area": 1,
        "range":1,
        "desc": "User ignores its own negative stat changes",
        "target": "enemy"
    },
    "DragonRage": {
        "id": "DragonRage",
        "name": "Dragon Rage",
        "power": 20,
        "effect":[],
        "pp": 10,
        "accuracy": 90,
        "type": "Dragon",
        "cat": "SPEC",
        "area": 1,
        "range":1,
        "desc": "Deals 20 damage",
        "target": "enemy"
    },
    "Foresight": {
        "id": "Foresight",
        "name": "Foresight",
        "power": 0,
        "effect":["enemy",100,"buff","foresight"],//Applies foresight debuff to enemy
        "pp": 40,
        "accuracy": 100,
        "type": "Normal",
        "cat": "STAT",
        "area": 1,
        "range":1,
        "desc": "Resets target's evasiveness. Can hit Ghost with Normal/Fighting moves and vice versa",
        "target": "enemy"
    },
    "QuickAttack": {
        "id": "QuickAttack",
        "name": "Quick Attack",
        "power": 35,
        "effect":[],
        "pp": 30,
        "accuracy": 95,
        "type": "Normal",
        "cat": "PHYS",
        "area": 1,
        "range":2,
        "desc": "Can hit enemies up to 2 tiles away.",
        "target": "enemy"
    },
    "Endure": {
        "id": "Endure",
        "name": "Endure",
        "power": 0,
        "effect":["self",100,"buff","endure"],
        "pp": 10,
        "accuracy": 90,
        "type": "Normal",
        "cat": "STAT",
        "area": 1,
        "range":0,
        "desc": "Leaves user with 1HP instead of KOing until next turn. 1/2 chance to succeed following turns",
        "target": "self"
    },
    "Pound": {
        "id": "Pound",
        "name": "Pound",
        "power": 35,
        "effect":[],
        "pp": 35,
        "accuracy": 95,
        "type": "Normal",
        "cat": "PHYS",
        "area": 1,
        "range": 1,
        "desc": "",
        "target": "enemy"
    },
    "PoisonSting": {
        "id": "PoisonSting",
        "name": "Poison Sting",
        "power": 10,
        "effect":["enemy",30,"buff","poisoned"],
        "pp": 35,
        "accuracy": 100,
        "type": "Poison",
        "cat": "PHYS",
        "area": 1,
        "range": 1,
        "desc": "Has a 30% chance to poison target",
        "target": "enemy"
    },
    "PoisonGas": {
        "id": "PoisonGas",
        "name": "Poison Gas",
        "power": 0,
        "effect":["enemy",100,"buff","poisoned"],
        "pp": 35,
        "accuracy": 90,
        "type": "Poison",
        "cat": "STAT",
        "area": 1,
        "range": 1,
        "desc": "Has a 90% chance to poison target",
        "target": "enemy"
    },
    "StringShot": {
        "id": "StringShot",
        "name": "String Shot",
        "power": 0,
        "effect":["enemy",100,"stat",{spd:-2}],
        "pp": 30,
        "accuracy": 45,
        "type": "Bug",
        "cat": "STAT",
        "area": 1,
        "range": 1,
        "desc": "Sharply lowers target's Speed",
        "target": "enemy"
    },
    "Bubble": {
        "id": "Bubble",
        "name": "Bubble",
        "power": 20,
        "effect":["enemy",10,"stat",{spd:-1}],
        "pp": 30,
        "accuracy": 95,
        "type": "Water",
        "cat": "SPEC",
        "area": 1,
        "range": 1,
        "desc": "Has a 10% chance of lowering target's speed",
        "target": "enemy"
    },
    "Harden": {
        "id": "Harden",
        "name": "Harden",
        "power": 0,
        "effect":["self",100,"stat",{dfn:1}],
        "pp": 30,
        "accuracy": 100,
        "type": "Normal",
        "cat": "STAT",
        "area": 1,
        "range": 0,
        "desc": "Raises user's defense",
        "target": "self"
    },
    "AcidSpray": {
        "id": "AcidSpray",
        "name": "Acid Spray",
        "power": 40,
        "effect":["enemy",100,"stat",{dfn:-2}],
        "pp": 20,
        "accuracy": 60,
        "type": "Poison",
        "cat": "PHYS",
        "area": 1,
        "range": 2,
        "desc": "Sharply lowers opponent's defense.",
        "target": "enemy"
    },
    "DumpsterDunk": {
        "id": "DumpsterDunk",
        "name": "Dumpster Dunk",
        "power": 999,
        "effect":[],
        "pp": 20,
        "accuracy": 100,
        "type": "Water",
        "cat": "PHYS",
        "area": 2,
        "range": 3,
        "desc": "Dumpster dunk all enemies in your way",
        "target": "enemy"
    }
};
RP.abilities={
    "RunAway":{
        "name":"Run Away",
        "desc":"Run away faster"
    },
    "Pickup":{
        "name":"Pickup",
        "desc":"Higher chance of finding items that are on the ground."
    },
    "Torrent":{
        "name":"Torrent",
        "desc":"Ups water type moves."
    },
    "IronFist":{
        "name":"Iron Fist",
        "desc":"Ups fist moves."
    },
    "Blaze":{
        "name":"Blaze",
        "desc":"Ups fire type moves."
    },
    "Swarm":{
        "name":"Swarm",
        "desc":"When a Pokémon with Swarm uses a Bug-type move, the power will increase by 1.5× if the user has less than or equal to ⅓ of its maximum HP remaining."
    },
    "Insomnia":{
        "name":"Insomnia",
        "desc":"Insomnia prevents the Pokémon from being afflicted by sleep and Yawn. Rest will fail when used by the Pokémon."
    },
    "Sniper":{
        "name":"Sniper",
        "desc":"Critical hits will do 1.5x the normal critical hit damage."
    },
    "Stench":{
        "name":"Stench",
        "desc":"Stench has a 10% chance of making the target flinch when hit by a damaging move. Stench does not stack with King's Rock or Razor Fang."
    },
    "StickyHold":{
        "name":"Sticky Hold",
        "desc":"This Ability prevents the user's held item from being taken by Covet or Thief, traded by Trick or Switcheroo, eaten by Bug Bite or Pluck, destroyed by Incinerate, or removed by Knock Off, unless the attacker has a variation of Mold Breaker."
    },
    "PoisonTouch":{
        "name":"Poison Touch",
        "desc":"If a Pokémon with this Ability uses a move that makes contact, there is a 30% chance the target will become poisoned."
    },
    "MarvelScale":{
        "name":"Marvel Scale",
        "desc":"At the end of each turn, Shed Skin has a 30% chance of curing the Pokémon of a non-volatile status condition. If the Pokémon is burned or poisoned, Shed Skin will cure the user before any burn or poison damage is dealt. "
    },
    "ShedSkin":{
        "name":"Shed Skin",
        "desc":"While the Pokémon with this Ability has a status condition, its Defense is increased by 50%. "
    }
};
RP.items={
    //Normal Items
    "Potion":{
        "id": "Potion",
        "name": "Potion",
        "effect":["stat",{curHp:20}],
        "desc": "Heals 20 hp.",
        "target": "all",
        "kind": "Consumable"
    },
    //Berries
    "OranBerry":{
        "id": "OranBerry",
        "name": "Oran Berry",
        "effect":["stat",{curHp:10}],
        "desc": "Heals 10 hp.",
        "target": "all",
        "kind": "Consumable"
    },
    "CheriBerry":{
        "id": "CheriBerry",
        "name": "Cheri Berry",
        "effect":["buff",{paralyzed:"heal"}],
        "desc": "Cures paralysis.",
        "target": "all",
        "kind": "Consumable"
    },
    "PechaBerry":{
        "id": "PechaBerry",
        "name": "Pecha Berry",
        "effect":["buff",{poisoned:"heal",toxic:"heal"}],
        "desc": "Cures poison.",
        "target": "all",
        "kind": "Consumable"
    },
    //Held items
    "Leftovers":{
        "id": "Leftovers",
        "name": "Leftovers",
        "effect":["statPercent",{curHp:10}],
        "desc": "Heals 10% of max hp each turn.",
        "target": "self",
        "kind": "Multiuse"
    },
    //Key Items
    "Diamond":{
        "id": "Diamond",
        "name": "Diamond",
        "effect":["showDesc",{text:"The diamond is very shiny."}],
        "desc": "A valuable gem",
        "target":"",
        "kind":"Key"
    }
}
RP.classes={
    "Professor":{
        "className":"Professor",
        
        "exp":14,
        "types": [
            "Dark",
            "Poison"
        ],
        "baseStats":{
            "hp":5.5,
            "atk":7,
            "def":5.5,
            "spatk":4,
            "spdef":5.5,
            "spd":8.5
        },
        "otherSeed": {
            "mind": [2,3],
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
            ["TailWhip",0]/*,
            ["SandAttack",4],
            ["Astonish",8],
            ["BatonPass",11],
            ["Tickle",15],
            ["FurySwipes",18],
            ["Swift",22],
            ["Screech",25],
            ["Agility",29],
            ["DoubleHit",32],
            ["Fling",36],
            ["NastyPlot",39],
            ["LastResort",43]*/
        ]
    }
};

/*
 
 case "Normal":

    break;
case "Fire":

    break;
case "Water":

    break;
case "Electric":

    break;
case "Grass":

    break;
case "Ice":

    break;
case "Fighting":

    break;
case "Poison":

    break;
case "Ground":

    break;
case "Flying":

    break;
case "Psychic":

    break;
case "Bug":

    break;
case "Rock":

    break;
case "Ghost":

    break;
case "Dragon":

    break;
case "Dark":

    break;
case "Steel":

    break;
case "Fairy":

    break;
 
 */