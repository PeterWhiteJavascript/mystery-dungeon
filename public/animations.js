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
        ['Grimer','Aipom60x60.png',60,60]
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
        standingDown:{ frames: [0,1], rate:standRate},
        walkingDown:{ frames: [0,1,2], rate:walkRate,loop:false,trigger:"playStand"},
        attackingDown:{ frames: [0,1,2], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingUp:{ frames: [3,4], rate:standRate},
        walkingUp:{ frames: [3,4,5], rate:walkRate,loop:false,trigger:"playStand"},
        attackingUp:{ frames: [3,4,5], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingLeft:{ frames: [6,7], rate:standRate},
        walkingLeft:{ frames: [6,7,8], rate:walkRate,loop:false,trigger:"playStand"},
        attackingLeft:{ frames: [6,7,8], rate:walkRate,loop:false,trigger:"playStand"},
        
        standingRight:{ frames: [9,10], rate:standRate},
        walkingRight:{ frames: [9,10,11], rate:walkRate,loop:false,trigger:"playStand"},
        attackingRight:{ frames: [9,10,11], rate:walkRate,loop:false,trigger:"playStand"},
        
        fainting:{ frames: [0,3,6,9,12,15,18,21,0], rate:walkRate,loop:false,trigger:"fainted"}
    });
};
};