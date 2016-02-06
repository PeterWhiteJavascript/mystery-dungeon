Quintus.Animations = function(Q){
Q.setUpAnimations=function(){
    var toSheet = [
        ['sprites','sprites.png',96,96],
        ['berries','berries.png',83,101],
        ['objects','objects.png',64,64],
        
        ['Professor','Aipom60x60.png',60,60],
        ['Totodile','Totodile60x60.png',60,60],
        ['Chimchar','Aipom60x60.png',60,60],
        ['Deino','Deino60x60.png',60,60],
        ['Dratini','Dratini.png',70,70],
        ['Spinarak','Aipom60x60.png',60,60],
        ['Grimer','Aipom60x60.png',60,60],
        
        ["fireball","bullets.png",32,32]
    ];
    for(j=0;j<toSheet.length;j++){
        Q.sheet(toSheet[j][0],
        "/images/"+toSheet[j][1],
        {
           tilew:toSheet[j][2],
           tileh:toSheet[j][3],
           sx:0,
           sy:0
        });
    };

    var standRate = 1/3;
    var walkRate = 1/6;
    Q.animations("player", {
        standingdown:{ frames: [0,1], rate:standRate},
        walkingdown:{ frames: [0,1,2], rate:walkRate,loop:false,trigger:"playStand"},
        attackingdown:{ frames: [0,1,2], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingup:{ frames: [3,4], rate:standRate},
        walkingup:{ frames: [3,4,5], rate:walkRate,loop:false,trigger:"playStand"},
        attackingup:{ frames: [3,4,5], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingleft:{ frames: [6,7], rate:standRate},
        walkingleft:{ frames: [6,7,8], rate:walkRate,loop:false,trigger:"playStand"},
        attackingleft:{ frames: [6,7,8], rate:walkRate,loop:false,trigger:"playStand"},
        breathefireleft:{ frames: [6,7,8],rate:walkRate,loop:false,trigger:"launchFireball"},
        
        standingright:{ frames: [9,10], rate:standRate},
        walkingright:{ frames: [9,10,11], rate:walkRate,loop:false,trigger:"playStand"},
        attackingright:{ frames: [9,10,11], rate:walkRate,loop:false,trigger:"playStand"},
        breathefireright:{ frames: [11,11,10],rate:walkRate,loop:false,trigger:"launchFireball"},
        
        fainting:{ frames: [0,3,6,9,12,15,18,21,0], rate:walkRate,loop:false,trigger:"fainted"}
    });
    Q.animations("fireball",{
        burning:{frames:[0],rate:standRate},
        engulf:{frames:[1,2,1,2],rate:walkRate,loop:false,trigger:"burned"}
    });
};
};