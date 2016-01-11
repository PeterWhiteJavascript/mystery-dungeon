Quintus.TileCosts = function(Q){
Q.getTileCost = function(tile,p){
    var cost = 2;
    var type1 = p.types[0];
    var type2 = p.types[1];
    if(!type1){return};
    switch(tile){
        case "SPRITE_DEFAULT":
            cost=200000;
            //Only ghosts can go through walls
            if(type2==="Ghost"){
                cost=15;
            }
            if(type1==="Ghost"){
                cost=10;
            }
            break;
        //Grass, plains, road, dirt
        case "SPRITE_STANDARD":
            if(type2==="Dragon"||type2==="Fairy"){
                cost=3;
            }
            if(type1==="Dragon"||type1==="Fairy"){
                cost=3;
            }
            break;
        case "SPRITE_FOREST":
            cost=3;
            if(type2==="Grass"||type2==="Bug"){
                cost=2;
            }
            if(type1==="Grass"){
                cost=2;
            } else
            if(type1==="Bug"){
                cost=1;
            }
            break;
        case "SPRITE_SWAMP":
            cost=3;
            if(type2==="Poison"||type2==="Water"){
                cost=2;
            }
            if(type1==="Water"){
                cost=2;
            } else
            if(type1==="Poison"){
                cost=1;
            }
            break;
        case "SPRITE_MOUNTAIN":
            cost=3;
            if(type2==="Fighting"||type2==="Ground"||type2==="Rock"){
                cost=2;
            }
            if(type1==="Fighting"||type1==="Ground"){
                cost=2;
            } else
            if(type1==="Rock"){
                cost=1;
            }
            break;
        case "SPRITE_WATER":
            cost=200000;
            if(p.special.canSwim){
                cost=5;
            }
            if(type1==="Ghost"||type2==="Ghost"){
                cost=3;
            }
            if(type2==="Water"){
                cost=2;
            }
            if(type1==="Water"){
                cost=1;
            }
            break;
        case "SPRITE_STORMYWATER":
            cost=200000;
            if(type1==="Ghost"||type2==="Ghost"){
                cost=6;
            }
            if(type2==="Water"){
                cost=5;
            }
            if(type1==="Water"){
                cost=3;
            }
            break;
        case "SPRITE_ICE":
            cost=3;
            if(type2==="Ice"){
                cost=2;
            }
            if(type1==="Ice"){
                cost=1;
            }
            break;
        case "SPRITE_SAND":
            cost=3;
            if(type2==="Ground"||type2==="Rock"){
                cost=2;
            }
            if(type1==="Rock"){
                cost=2;
            } else
            if(type1==="Ground"){
                cost=1;
            }
            break;
        case "SPRITE_VOLCANO":
            cost=3;
            if(type2==="Fire"||type2==="Rock"){
                cost=2;
            }
            if(type1==="Rock"){
                cost=2;
            } else
            if(type1==="Fire"){
                cost=1;
            }
            break;
        case "SPRITE_LAVA":
            cost=200000;
            if(type1==="Ghost"||type2==="Ghost"){
                cost=3;
            }
            if(type2==="Fire"){
                cost=2;
            }
            if(type1==="Fire"){
                cost=1;
            }
            break;
        case "SPRITE_RAILROAD":
            if(type2==="Steel"){
                cost=2;
            }
            if(type1==="Steel"){
                cost=1;
            }
            break;
        case "SPRITE_POWERLINES":
            cost=3;
            if(type2==="Electric"){
                cost=2;
            }
            if(type1==="Electric"){
                cost=1;
            }
            break;
    }

    if(type1==="Dragon"||type1==="Fairy"){
        if(tile!=="SPRITE_DEFAULT"){
            cost=2;
            if(tile==="SPRITE_STANDARD"){
                cost=3;
            }
        }
    }
    if(type1==="Flying"||type2==="Flying"){
        if(tile!=="SPRITE_DEFAULT"){
            cost=2;
        }
    }
    return cost;
};

//This follows the same rules as processTileTo
Q.getMoveSpeed=function(tile,obj){
    var stepDelay=0.3;
    var type1 = obj.p.types[0];
    var type2 = obj.p.types[1];
    
    switch(tile){
        case "SPRITE_DEFAULT":
            //Only ghosts can go through walls
            if(type2==="Ghost"){
                stepDelay=3;
            }
            if(type1==="Ghost"){
                stepDelay=2;
            }
            break;
        //Grass, plains, road, dirt
        case "SPRITE_STANDARD":
            if(type2==="Dragon"||type2==="Fairy"){
                stepDelay=0.5;
            }
            if(type1==="Dragon"||type1==="Fairy"){
                stepDelay=0.5;
            }
            break;
        case "SPRITE_FOREST":
            stepDelay=0.5;
            if(type2==="Grass"||type2==="Bug"){
                stepDelay=0.3;
            }
            if(type1==="Grass"){
                stepDelay=0.3;
            } else
            if(type1==="Bug"){
                stepDelay=0.2;
            }
            break;
        case "SPRITE_SWAMP":
            stepDelay=0.6;
            if(type2==="Poison"||type2==="Water"){
                stepDelay=0.3;
            }
            if(type1==="Water"){
                stepDelay=0.3;
            } else
            if(type1==="Poison"){
                stepDelay=0.2;
            }
            break;
        case "SPRITE_MOUNTAIN":
            stepDelay=0.75;
            if(type2==="Fighting"||type2==="Ground"||type2==="Rock"){
                stepDelay=0.5;
            }
            if(type1==="Fighting"||type1==="Ground"){
                stepDelay=0.3;
            } else
            if(type1==="Rock"){
                stepDelay=0.2;
            }
            break;
        case "SPRITE_WATER":
            if(obj.p.special.canSwim){
                stepDelay=0.6;
            }
            if(type1==="Ghost"||type2==="Ghost"){
                stepDelay=0.5;
            }
            if(type2==="Water"){
                stepDelay=0.3;
            }
            if(type1==="Water"){
                stepDelay=0.2;
            }
            break;
        case "SPRITE_STORMYWATER":
            if(type1==="Ghost"||type2==="Ghost"){
                stepDelay=0.5;
            }
            if(type2==="Water"){
                stepDelay=0.5;
            }
            if(type1==="Water"){
                stepDelay=0.4;
            }
            break;
        case "SPRITE_ICE":
            stepDelay=0.5;
            if(type2==="Ice"){
                stepDelay=0.3;
            }
            if(type1==="Ice"){
                stepDelay=0.2;
            }
            break;
        case "SPRITE_SAND":
            stepDelay=0.5;
            if(type2==="Ground"||type2==="Rock"){
                stepDelay=0.3;
            }
            if(type1==="Rock"){
                stepDelay=0.3;
            } else
            if(type1==="Ground"){
                stepDelay=0.2;
            }
            break;
        case "SPRITE_VOLCANO":
            stepDelay=0.75;
            if(type2==="Fire"||type2==="Rock"){
                stepDelay=0.3;
            }
            if(type1==="Rock"){
                stepDelay=0.3;
            } else
            if(type1==="Fire"){
                stepDelay=0.2;
            }
            break;
        case "SPRITE_LAVA":
            if(type1==="Ghost"||type2==="Ghost"){
                stepDelay=0.5;
            }
            if(type2==="Fire"){
                stepDelay=0.3;
            }
            if(type1==="Fire"){
                stepDelay=0.2;
            }
            break;
        case "SPRITE_RAILROAD":
            if(type2==="Steel"){
                stepDelay=0.2;
            }
            if(type1==="Steel"){
                stepDelay=0.1;
            }
            break;
        case "SPRITE_POWERLINES":
            stepDelay=0.5;
            if(type2==="Electric"){
                stepDelay=0.2;
            }
            if(type1==="Electric"){
                stepDelay=0.1;
            }
            break;
    }
    if(type1==="Dragon"||type1==="Fairy"){
        stepDelay=0.3;
        if(tile==="SPRITE_STANDARD"){
            stepDelay=0.5;
        }
    }
    if(type1==="Flying"||type2==="Flying"){
        stepDelay=0.3;
    }
    //Factor in weather last
    return stepDelay;
};
//Used only in adventuring phase (1)
Q.processTileTo=function(tile,obj){
    var canStep = false;
    var type1 = obj.p.types[0];
    var type2 = obj.p.types[1];
    switch(tile){
        case "SPRITE_DEFAULT":
            //Only ghosts can go through walls
            if(type1==="Ghost"||type2==="Ghost"){
                canStep=true;
            }
            break;
        //Grass, plains, road, dirt
        case "SPRITE_STANDARD":
            canStep = true;
            break;
        case "SPRITE_FOREST":
            canStep = true;
            break;
        case "SPRITE_SWAMP":
            canStep = true;
            break;
        case "SPRITE_MOUNTAIN":
            canStep = true;
            break;
        case "SPRITE_WATER":
            if(obj.p.special.canSwim){
                canStep=true;
            }
            if(type1==="Water"||type2==="Water"){
                canStep=true;
            }
            if(type1==="Ghost"||type2==="Ghost"){
                canStep=true;
            }
            if(type1==="Flying"||type2==="Flying"){
                canStep=true;
            }
            break;
        case "SPRITE_STORMYWATER":
            if(type1==="Water"||type2==="Water"){
                canStep=true;
            }
            if(type1==="Ghost"||type2==="Ghost"){
                canStep=true;
            }
            if(type1==="Flying"||type2==="Flying"){
                canStep=true;
            }
            break;
        case "SPRITE_ICE":
            canStep=true;
            break;
        case "SPRITE_SAND":
            canStep=true;
            break;
        case "SPRITE_VOLCANO":
            canStep=true;
            break;
        case "SPRITE_LAVA":
            if(type1==="Fire"||type2==="Fire"){
                canStep=true;
            }
            if(type1==="Ghost"||type2==="Ghost"){
                canStep=true;
            }
            if(type1==="Flying"||type2==="Flying"){
                canStep=true;
            }
            break;
        case "SPRITE_RAILROAD":
            canStep=true;
            break;
        case "SPRITE_POWERLINES":
            canStep=true;
            break;

    }
    return canStep;
};

};
