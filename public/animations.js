Quintus.Animations = function(Q){
var a;
Q.setUpAnimations=function(){
    Q.sheet("sprites",
        "sprites.png",
        {
            tilew:96,
            tileh:96,
            sx:0,
            sy:0
        });
    Q.sheet("Aipom",
        "Aipom60x60.png",
        {
            tilew:60,
            tileh:60,
            sx:0,
            sy:0
        });
    
    Q.sheet("Totodile",
        "Totodile60x60.png",
        {
            tilew:60,
            tileh:60,
            sx:0,
            sy:0
        });
    
    Q.sheet("Chimchar",
        "Aipom60x60.png",
        {
            tilew:60,
            tileh:60,
            sx:0,
            sy:0
        });
    Q.sheet("Deino",
        "Deino60x60.png",
        {
            tilew:60,
            tileh:60,
            sx:0,
            sy:0
        });
    Q.sheet("Dratini",
        "Dratini.png",
        {
            tilew:70,
            tileh:70,
            sx:0,
            sy:0
        });
    Q.sheet("Riolu",
        "Aipom60x60.png",
        {
            tilew:60,
            tileh:60,
            sx:0,
            sy:0
        });
    Q.sheet("Piplup",
        "Aipom60x60.png",
        {
            tilew:60,
            tileh:60,
            sx:0,
            sy:0
        });
    Q.sheet("Spinarak",
        "Aipom60x60.png",
        {
            tilew:60,
            tileh:60,
            sx:0,
            sy:0
        });
    Q.sheet("Grimer",
        "Aipom60x60.png",
        {
            tilew:60,
            tileh:60,
            sx:0,
            sy:0
        });
    Q.sheet("berries",
        "berries.png",
        {
            tilew:83,
            tileh:101,
            sx:0,
            sy:0
        });


    var standRate = 1/3;
    var walkRate = 1/6;
    Q.animations("player", {
        standingDown:{ frames: [0,1], rate:standRate},
        walkingDown:{ frames: [0,1,2], rate:walkRate},
        attackingDown:{ frames: [0,1,2], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingUp:{ frames: [3,4], rate:standRate},
        walkingUp:{ frames: [3,4,5], rate:walkRate},
        attackingUp:{ frames: [3,4,5], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingLeft:{ frames: [6,7], rate:standRate},
        walkingLeft:{ frames: [6,7,8], rate:walkRate},
        attackingLeft:{ frames: [6,7,8], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingRight:{ frames: [9,10], rate:standRate},
        walkingRight:{ frames: [9,10,11], rate:walkRate},
        attackingRight:{ frames: [9,10,11], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingDownLeft:{ frames: [12,13], rate:standRate},
        walkingDownLeft:{ frames: [12,13,14], rate:walkRate},
        attackingDownLeft:{ frames: [12,13,14], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingDownRight:{ frames: [15,16], rate:standRate},
        walkingDownRight:{ frames: [15,16,17], rate:walkRate},
        attackingDownRight:{ frames: [15,16,17], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingUpLeft:{ frames: [18,19], rate:standRate},
        walkingUpLeft:{ frames: [18,19,20], rate:walkRate},
        attackingUpLeft:{ frames: [18,19,20], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingUpRight:{ frames: [21,22], rate:standRate},
        walkingUpRight:{ frames: [21,22,23], rate:walkRate},
        attackingUpRight:{ frames: [21,22,23], rate:walkRate,loop:false,trigger:"playStand"},
        
        fainting:{ frames: [0,3,6,9,12,15,18,21,0], rate:walkRate,loop:false,trigger:"fainted"}
    });
};
};