Quintus.MenuScenes=function(Q){  
    

Q.scene('title',function(stage){
    //The main container that holds the title menu. The gradient is attached to it
    var mainCont = stage.insert(new Q.UI.Container({x:Q.width/2,y:0,w:Q.width/2,h:Q.height,fill:true,cy:0}));
    var headerImage = stage.insert(new Q.Sprite({asset:"Pokemon_Mystery_Dungeon_Logo.png",x:Q.width/2,y:20,cy:0}));
    var menu = makeMainMenu(mainCont);
});

Q.scene('card',function(stage){
    //The box that holds the HUD
    stage.insert(new Q.Card({
        user:stage.options.user
    }));
    
});

Q.scene('bottomhud',function(stage){
   // stage.options.player.disableControls();
    var box = stage.insert(new Q.BottomTextBox());
    box.p.textNum=stage.options.startAt ? stage.options.startAt : 0;
    
    box.cycleText();
    Q.inputs['interact']=false;
});

Q.scene('playerMenu',function(stage){
    //stage.options.player.disableControls();
    var menu = stage.insert(new Q.PlayerMenu({h:330}));
    menu.p.player = stage.options.player;
    menu.p.user = stage.options.user;
    menu.p.user.p.obj = menu;
    menu.initializeMenu();
    Q.inputs['interact']=false;
});

Q.scene('attackPrediction',function(stage){
    var cont = stage.insert(new Q.UI.Container({x:0,y:0,h:0,w:0,color:'green'}));
    cont.processInputs=function(input){
        if(input['interact']){
            //Confirm that we want to attack
            Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{interact:true,time:input.time}});
        } else if(input['back']){
            //Go back to the attack pointer
        }
    };
    cont.p.user = stage.options.user;
    cont.p.user.p.obj = cont;
    var attacker = stage.options.attacker;
    var defender = stage.options.defender;
    var attack = stage.options.attack;
    var attackerCard = cont.insert(new Q.Card({user:attacker,x:0,y:10}));
    var defenderCard = cont.insert(new Q.Card({user:defender,x:0,y:10}));
    attackerCard.p.x-=attackerCard.p.w+attackerCard.p.w/4;
    //The low for attack power
    var low = Math.floor((((2*attacker.p.level+10)/250)*(attacker.p.modStats[attack.category+"_ofn"]/defender.p.modStats[attack.category+"_dfn"])*parseInt(attack.power)+2)*.85);
    //The high for attack power
    var high = Math.floor((((2*attacker.p.level+10)/250)*(attacker.p.modStats[attack.category+"_ofn"]/defender.p.modStats[attack.category+"_dfn"])*parseInt(attack.power)+2));
    var facingValue = Q.attackFuncs.compareDirection(attacker,defender);
    var hitRate = attack.accuracy/facingValue;
    var prediction = stage.insert(new Q.UI.Container({x:Q.width/2,y:Q.height/2,w:300,h:100,fill:"blue"}));
    prediction.insert(new Q.UI.Text({color:"white",size:16,label:attack.name+" will do between "+low+" and "+high+" damage with a "+hitRate+"% hit rate."}));
    prediction.fit(10,10);
});

Q.scene('interactingMenu',function(stage){
    //stage.options.player.disableControls();
    var menu = stage.insert(new Q.Menu({h:130}));
    menu.p.player=stage.options.player;
    menu.p.target=stage.options.target;
    menu.p.menuOpts={
        talk:{
            text:"Talk",
            func:"showTalkOptions"
        },
        status:{
            text:"Status",
            func:"showTargetStatus"
        },
        exit:{
            text:"Exit Menu",
            func:"exitMenu"
        }
    };
    menu.add("interactingMenu");
    menu.setUpMenu();
    Q.inputs['interact']=false;
});
    
    
Q.scene('soundControls',function(stage){
    var soundCont = stage.insert(new Q.UI.Container({x:Q.width-100,y:5}));
    var pos = Q.state.get("options").playerMenuPos;
    //If the menu is on the right, this needs to be on the left
    if(pos==="right"){soundCont.p.x=100;}
    //Disable/enable music
    soundCont.insert(new Q.UI.Button({
        label:"Music",
        radius:8,
        border:0,
        
        fill:Q.state.get("options").musicEnabled ? "#345894" : "#447ba4",
        y:20,
        w:150,
        h:30

    },function(){
        var music=Q.state.get("options").musicEnabled;
        if(!music){
            this.p.fill="#345894";
            Q.state.p.options.musicEnabled=true;
            var mus = Q.state.get("currentMusic");
            Q.state.set("currentMusic",false);
            Q.playMusic(mus);
        } else {
            this.p.fill="#447ba4";
            Q.state.p.options.musicEnabled=false;
            Q.stopMusic(Q.state.get("currentMusic"));
        }
    }));
    
    //Disable/enable sounds
    soundCont.insert(new Q.UI.Button({
        label:"Sound",
        radius:8,
        border:0,
        stroke:"black",
        fill:Q.state.get("options").soundEnabled ? "#345894" : "#447ba4",
        y:60,
        w:150,
        h:30

    },function(){
        var sound=Q.state.get("options").soundEnabled;
        if(!sound){
            this.p.fill="#345894";
            Q.state.p.options.soundEnabled=true;
        } else {
            this.p.fill="#447ba4";
            Q.state.p.options.soundEnabled=false;
        }
        
    }));
    
    //Disable/enable autoScroll
    soundCont.insert(new Q.UI.Button({
        label:"AutoScroll",
        radius:8,
        border:0,
        stroke:"black",
        fill:Q.state.get("options").autoScroll ? "#345894" : "#447ba4",
        y:100,
        w:150,
        h:30

    },function(){
        var scroll=Q.state.get("options").autoScroll;
        if(!scroll){
            this.p.fill="#345894";
            Q.state.p.options.autoScroll=true;
            var box = Q.interactionBox;
            if(box){
                box.setAutoScroll();
            }
        } else {
            this.p.fill="#447ba4";
            Q.state.p.options.autoScroll=false;
            if(box){
                box.stopAutoScroll();
            }
        }
        
    }));
});
    
    
    

//The custom animations
Q.sceneAnimations = {
    doneBattle:function(stage){
        var box = stage.insert(new Q.Sprite({
            x:200,y:200,
            w:200,h:150,
            asset:"/images/battle_complete.png",
            type:Q.SPRITE_NONE,
            scale:0.1
        }));
        box.add('tween');
        box.animate({ x: 500, y:  400, scale:1 }, 1, Q.Easing.Quadratic.InOut)
            .chain({ angle: 360 },0.25)
            .chain({ angle: 720 },0.25) 
            .chain({ angle: 0 },0.25) 
            .chain({  x: 800, y:  200, scale:0.1  }, 1, Q.Easing.Quadratic.InOut,{callback:function(){Q.clearStage(4);}});
    },
    waitingBattle:function(stage){
        var box = stage.insert(new Q.Sprite({
            x:200,y:200,
            w:200,h:150,
            asset:"/images/battle_waiting.png",
            type:Q.SPRITE_NONE,
            scale:0.1
        }));
        box.add('tween');
        function animateBox(b){
            b.animate({ x: 500, y:  400, scale:1 }, 1, Q.Easing.Quadratic.InOut)
                .chain({ angle: 360 },0.25)
                .chain({ angle: 720 },0.25) 
                .chain({ angle: 0 },0.25) 
                .chain({  x: 800, y:  200, scale:0.1  }, 1, Q.Easing.Quadratic.InOut,{callback:function(){animateBox(b);}});
        }
        animateBox(box);
    },
    fadeIn:function(stage){
        var fader = stage.insert(new Q.UI.Container({
            x:0,y:0,
            cx:0,cy:0,
            w:Q.width,h:Q.height,
            fill:"black",
            type:Q.SPRITE_NONE
        }));
        fader.add("tween");
        //speed is a number in seconds for how long the fade in lasts
        fader.animate({opacity:0},stage.options.speed||1,Q.Easing.Out,{callback:function(){Q.clearStage(4);}});
    },
    fadeOut:function(stage){
        var fader = stage.insert(new Q.UI.Container({
            x:0,y:0,
            cx:0,cy:0,
            w:Q.width,h:Q.height,
            fill:"black",
            type:Q.SPRITE_NONE,
            opacity:0
        }));
        fader.add("tween");
        //speed is a number in seconds for how long the fade in lasts
        fader.animate({opacity:0},stage.options.speed||1,Q.Easing.Out);
    },
    dimToNight:function(stage){
        var fader = stage.insert(new Q.UI.Container({
            x:0,y:0,
            cx:0,cy:0,
            w:Q.width,h:Q.height,
            fill:"black",
            type:Q.SPRITE_NONE,
            opacity:0
        }));
        fader.add("tween");
        //speed is a number in seconds for how long the fade in lasts
        fader.animate({opacity:0.3},stage.options.speed||1,Q.Easing.Out);
    },
    getItem:function(stage){
        var box = stage.insert(new Q.UI.Container({
            x:Q.width/2,y:Q.height/2,
            w:200,h:150,
            fill:"#234073",
            type:Q.SPRITE_NONE,
            scale:0.1
        }));
        box.insert(new Q.UI.Text({
            x:0,
            y:0,
            type:Q.SPRITE_NONE,
            color:"white",
            size:30,
            outlineWidth:3,
            label:stage.options.item.item+" x"+stage.options.item.amount
        }));
        box.add('tween');
        box.fit(10,10);
        box.animate({scale:1 }, 1, Q.Easing.Quadratic.InOut)
            .chain({ angle: 360 },1)
            .chain({opacity:0.1}, 0.5, Q.Easing.Quadratic.InOut,{callback:function(){Q.clearStage(4);}});
    },
    battleStart:function(stage){
        //Flasher
        var fader = stage.insert(new Q.UI.Container({
            x:0,y:0,
            cx:0,cy:0,
            w:Q.width,h:Q.height,
            fill:"yellow",
            type:Q.SPRITE_NONE
        }));
        fader.add("tween");

        var box = stage.insert(new Q.Sprite({
            x:Q.width/2,y:Q.height/2,
            asset:"/images/battle_start.png",
            type:Q.SPRITE_NONE
        }));
        box.add("tween")
        var gradient = fader.insert(new Q.UI.Container({
            col1:"yellow",
            col2:"orange",
            x:0,y:0,
            w:0, h:0,
            cx:0, cy:0, radius:10
        }));
        gradient.draw=function(ctx) {
            var grd=ctx.createLinearGradient(0,0,fader.p.w/2,fader.p.h/2);
            grd.addColorStop(0,this.p.col1);
            grd.addColorStop(1,this.p.col2);
            ctx.fillStyle=grd;
            ctx.fill();
        };
        gradient.add("tween");
        setTimeout(function(){
            fader.animate({opacity:0},1,Q.Easing.Out,{callback:function(){Q.clearStage(4);}});
            box.animate({opacity:0},1,Q.Easing.Out,{callback:function(){Q.clearStage(4);}});
            gradient.animate({opacity:0},1,Q.Easing.Out,{callback:function(){Q.clearStage(4);}});
        },500);
    }
};
//The scene that handles all little animations that happen
Q.scene('customAnimate',function(stage){
    var anims = Q.sceneAnimations;
    switch(stage.options.anim){
        case "doneBattle":
            anims.doneBattle(stage);
            break;
        case "waitingBattle":
            anims.waitingBattle(stage);
            break;
        case "getItem":
            anims.getItem(stage);
            break;
        case "fadeIn":
            anims.fadeIn(stage);
            break;
        //Goes completely black
        case "fadeOut":
            anims.fadeOut(stage);
            break;
        case "dimToNight":
            anims.dimToNight(stage);
            break;
        case "battleStart":
            anims.battleStart(stage);
            break;
    }
});
//The lobby where the user goes after logging in
Q.scene("lobby",function(stage){
    var box = stage.insert(new Q.UI.Container({
        x:Q.width/2,y:Q.height/4,
        w:200,h:0,
        fill:"#234073",
        type:Q.SPRITE_NONE
    }));
    box.insertPlayerText = function(name){
        box.insert(new Q.UI.Text({
            x:0,
            y:30+(box.children.length*28),
            cy:0,
            type:Q.SPRITE_NONE,
            color:"white",
            size:22,
            outlineWidth:3,
            label:name
        }));
        box.p.h=50+(box.children.length*28);
    };
    box.insert(new Q.UI.Text({
        x:0,
        y:box.p.h/2+10,
        type:Q.SPRITE_NONE,
        color:"white",
        size:30,
        outlineWidth:3,
        label:"Player List"
    }));
    var players = Q.state.get("players");
    for(i=0;i<players.length;i++){
        box.insertPlayerText(players[i].name,i);
    }
    if(stage.options.host){
        var startButton = stage.insert(new Q.UI.Button({
            x:Q.width/2,y:Q.height/4-60,
            w:120,h:50,
            fill:"#234073"
        },function(){
            Q.state.get("playerConnection").socket.emit("startGame");
        }));
        startButton.insert(new Q.UI.Text({
            x:0,
            y:-startButton.p.h/2+11,
            type:Q.SPRITE_NONE,
            color:"white",
            size:22,
            outlineWidth:3,
            label:"Start!"
        }));
    } else {
        var waitingCont = stage.insert(new Q.UI.Container({
            x:Q.width/2,y:Q.height/4-60,
            w:120,h:50,
            fill:"#234073",
            type:Q.SPRITE_NONE
        }));
        waitingCont.insert(new Q.UI.Text({
            x:0,
            y:-waitingCont.p.h/2+11,
            type:Q.SPRITE_NONE,
            color:"white",
            size:22,
            outlineWidth:3,
            label:"Waiting"
        }));
    }
    Q.state.on("change.players",function(){
        box.insertPlayerText(Q.state.get("players")[Q.state.get("players").length-1].name);
    });
});
};