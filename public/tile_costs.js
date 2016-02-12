Quintus.TileCosts = function(Q){
Q.getTileCost = function(tile){
    var cost = 2;
    switch(tile){
        case "SPRITE_DEFAULT":
            cost=200000;
            break;
    }
    return cost;
};

Q.getMoveSpeed=function(tile,obj){
    var stepDelay=0.3;
    return stepDelay;
};

};
