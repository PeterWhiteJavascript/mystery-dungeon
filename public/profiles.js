//This file is useless now*************
//
////When creating database tables
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
        "effect":["stat",{"curHp":20}],
        "desc": "Heals 20 hp.",
        "target": "single",
        "kind": "Consumable"
    },
    //Berries
    "OranBerry":{
        "id": "OranBerry",
        "name": "Oran Berry",
        "effect":["stat",{"curHp":10}],
        "desc": "Heals 10 hp.",
        "target": "single",
        "kind": "Consumable"
    },
    "CheriBerry":{
        "id": "CheriBerry",
        "name": "Cheri Berry",
        "effect":["buff",{"paralyzed":"heal"}],
        "desc": "Cures paralysis.",
        "target": "single",
        "kind": "Consumable"
    },
    "PechaBerry":{
        "id": "PechaBerry",
        "name": "Pecha Berry",
        "effect":["buff",{"poisoned":"heal","toxic":"heal"}],
        "desc": "Cures poison.",
        "target": "single",
        "kind": "Consumable"
    },
    //Held items
    "Leftovers":{
        "id": "Leftovers",
        "name": "Leftovers",
        "effect":["statPercent",{"curHp":10}],
        "desc": "Heals 10% of max hp each turn.",
        "target": "self",
        "kind": "Multiuse"
    },
    //Key Items
    "Diamond":{
        "id": "Diamond",
        "name": "Diamond",
        "effect":["showDesc",{"text":"The diamond is very shiny."}],
        "desc": "A valuable gem",
        "target":"",
        "kind":"Key"
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