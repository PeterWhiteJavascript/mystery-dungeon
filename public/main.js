window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Gradient, Objects, Areas, Animations, InteractableData, HUD, TileCosts, AttackFuncs, ItemFuncs")
        .setup({ development: true})
        .touch().controls(true)
        .enableSound();

Q.SPRITE_NONE = 0;
Q.SPRITE_DEFAULT = 1;
Q.SPRITE_STANDARD = 2;
Q.SPRITE_TALLGRASS  = 4;
Q.SPRITE_SWAMP  = 8;
Q.SPRITE_MOUNTAIN  = 16;
Q.SPRITE_WATER  = 32;
Q.SPRITE_STORMYWATER  = 64;
Q.SPRITE_ICE  = 128;
Q.SPRITE_SAND  = 256;
Q.SPRITE_VOLCANO  = 512;
Q.SPRITE_LAVA  = 1024;
Q.SPRITE_RAILROAD  = 2048;
Q.SPRITE_POWERLINES  = 4096;

Q.SPRITE_INTERACTABLE = 8192;
Q.SPRITE_NPC= 16384;

Q.gravityY=0;

var colors = {
    Menu:"",
    MenuButton:'#AAFF33'
};
var makeMainMenu=function(cont){
    var buttons = Q.menuButtons.Main;
    var menu = cont.insert(new Q.MainMenu({x:0,y:200,w:cont.p.w/2,h:80+buttons.length*80,fill:'red',cx:cont.p.w/4,cy:0}));
    var colors = Q.getGradient(["Rock","Electric"]);
    menu.insert(new Q.Gradient({w:menu.p.w,h:menu.p.h,col0:colors[0],col1:colors[1]}));
    for(i=0;i<buttons.length;i++){
        menu.insert(new Q.UI.Button({
            x:0,y:80+80*i,
            label:buttons[i][0],
            option:buttons[i][1],
            color:'black'
        },function(){
            Q[this.p.option]();
        }));
    }
    
    return menu;
};

Q.UI.Container.extend("MainMenu",{
    init:function(p){
        this._super(p,{
            x:0
        });
    }
});

Q.menuButtons = {
    //Label  (What the button displays)
    //Option (When clicked)
    Main:[
        ['Play','startGame'],
        ['Instructions','showInstructions']
    ]
};

Q.scene('title',function(stage){
    //The main container that holds the title menu. The gradient is attached to it
    var mainCont = stage.insert(new Q.UI.Container({x:Q.width/2,y:0,w:Q.width/2,h:Q.height,fill:true,cy:0}));
    //Gets the colors for the types (in colors.js)
    var colors = Q.getGradient(["Water","Fire"]);
    mainCont.insert(new Q.Gradient({w:mainCont.p.w,h:mainCont.p.h,col0:colors[0],col1:colors[1]}));
    var headerImage = stage.insert(new Q.Sprite({asset:"Pokemon_Mystery_Dungeon_Logo.png",x:Q.width/2,y:20,cy:0}));
    var menu = makeMainMenu(mainCont);
});

Q.scene('tophud',function(stage){
    var target = stage.options.target;
    //The box that holds the HUD
    var box = stage.insert(new Q.HUDCont());
    box.stage.insert(new Q.Card({
        user:target,
        menu:box
    }));
    
});

Q.scene('bottomhud',function(stage){
   // stage.options.player.disableControls();
    var box = stage.insert(new Q.BottomTextBox());
    var colors = Q.getGradient(stage.options.player.p.types);
    box.insert(new Q.Gradient({w:box.p.w,h:box.p.h,col0:colors[0],col1:colors[1]}));
    box.cycleText();
    Q.inputs['interact']=false;
});

Q.scene('playerMenu',function(stage){
    //stage.options.player.disableControls();
    var menu = stage.insert(new Q.Menu({h:330}));
    menu.p.player=stage.options.player;
    menu.p.menuOpts={
        attack:{
            text:"Attack",
            func:"showAttacks",
            params:["player"]
        },
        move:{
            text:"Move",
            func:"showPointer",
            params:["player"]
        },
        items:{
            text:"Items",
            func:"showItems",
            params:["player"]
        },
        status:{
            text:"Status",
            func:"showStatus",
            params:["player"]
        },
        checkGround:{
            text:"Check Ground",
            func:"checkGround",
            params:["player"]
        },
        resetMove:{
            text:"Re-do",
            func:"resetMovement",
            params:["player"]
        },
        endTurn:{
            text:"End Turn",
            func:"endTurn",
            params:["player"]
        },
        exit:{
            text:"Exit Menu",
            func:"exitMenu",
            params:["player"]
        }
    };
    if(Q.state.get("phase")!==2){
        menu.p.greyed.push(1,5,6);
    }
    menu.add("playerMenu");
    menu.setUpMenu();
    var colors = Q.getGradient(stage.options.player.p.types);
    menu.insert(new Q.Gradient({w:menu.p.w,h:menu.p.h,col0:colors[0],col1:colors[1],player:stage.options.player}));
    Q.inputs['interact']=false;
});

Q.scene('interactingMenu',function(stage){
    //stage.options.player.disableControls();
    var menu = stage.insert(new Q.Menu({h:130}));
    menu.p.player=stage.options.player;
    menu.p.target=stage.options.target;
    menu.p.menuOpts={
        talk:{
            text:"Talk",
            func:"showTalkOptions",
            params:["player","target"]
        },
        status:{
            text:"Status",
            func:"showTargetStatus",
            params:["target"]
        },
        exit:{
            text:"Exit Menu",
            func:"exitMenu",
            params:["player"]
        }
    };
    menu.add("interactingMenu");
    menu.setUpMenu();
    var colors = Q.getGradient(stage.options.player.p.types);
    menu.insert(new Q.Gradient({w:menu.p.w,h:menu.p.h,col0:colors[0],col1:colors[1],player:stage.options.player}));
    Q.inputs['interact']=false;
});

Q.addActor=function(actor){
    if(actor.p.playerId!==Q.state.get("playerConnection").id){
        var obj = Q.stage(1).insert(new Q.Player({data:actor}));
        obj.p.playerId=actor.p.playerId;
        obj.p.area=actor.p.area;
        obj.p.loc = actor.p.loc;
        obj.add("actor, stepControls");
    }
};

Q.checkSameStage=function(actorStage){
    if(Q.stage(1)&&actorStage===Q.stage(1).scene.name){
        return true;
    }
    return false;
};

Q.updatePlayers=function(pl){
    for(i=0;i<Q.players.length;i++){
        if(Q.players[i].p.playerId===pl.p.playerId){
            Q.players[i]=pl;
        }
    }
};
require(['socket.io/socket.io.js']);

var socket = io.connect();
var UiPlayers = document.getElementById("players");
var selfId;
Q.players = [];
var objectFiles = [
  './objects'
];

require(objectFiles, function () {
    function setUp() {
        
        //When the user connects to the game
        socket.on('connected', function (data) {
            selfId = data['playerId'];
            Q.state.set("playerConnection",{id:data['playerId'],socket:socket});
            //Display the login
            document.getElementById('login').style.display='block';
            console.log("I am "+data['playerId']);
        });
        
        //When the user disconnects from the game
        socket.on("disconnected",function(data){
            Q.players = data['players'];
            UiPlayers.innerHTML = 'Players: ' + Q.players.length;
        });
        
        socket.on('startedGame', function (data) {
            Q.players=data['players'];
            /*UiPlayers.innerHTML = 'Players: ' + Q.players.length;
            for(i=0;i<data['players'].length;i++){
                console.log(data['players'][i].p.playerId)
            }*/
            var player = data['player'];
            if(data['player'].p.playerId===selfId){
                Q.state.set("player",player);
                Q.goToStage(player.p.area,player.p.loc,data['events']);
                setInterval(function(){
                    var player = Q.state.get("playerObj");
                    if(player){
                        socket.emit('update',{
                            inputs:{
                                left:Q.inputs['left'],
                                right:Q.inputs['right'],
                                up:Q.inputs['up'],
                                down:Q.inputs['down']
                            },
                            playerId:selfId,
                            props:{
                                x:player.p.x,
                                y:player.p.y,
                                dir:player.p.dir,
                                loc:player.p.loc,
                                animation:player.p.animation,
                                area:player.p.area
                            }
                        });
                    }
                },50);
            } else if(Q.checkSameStage(player.p.area)){
                Q.addActor(player);
            }
        });
        socket.on('updated', function (data) {
            if(!Q.stage(1)){return;}
            var actor = Q("Player",1).items.filter(function (obj) {
                return obj.p.playerId == data['playerId'];
            })[0];
            if(actor){
                if(actor.p.playerId===selfId){
                    actor.p.inputted=data['inputted'];
                    actor.trigger("acceptInput")
                } else if(Q.checkSameStage(actor.p.area)){
                    var pl = data['player'];
                    actor.p.x=pl.p.x;
                    actor.p.y=pl.p.y;
                    actor.p.dir=pl.p.dir;
                    actor.p.loc=pl.p.loc;
                    actor.p.area = pl.p.area;
                    actor.p.update=true;
                    if(actor.p.animation!==pl.p.animation){
                        actor.play(''+pl.p.animation);
                        actor.p.animation = pl.p.animation;
                    }
                } else {
                    actor.destroy();
                }
            }
        });
        socket.on("changedArea",function(data){
            var pl = data['player'];
            //Update the Q.players
            Q.updatePlayers(pl);
            if(Q.checkSameStage(pl.p.area)){
                Q.addActor(pl);
            }
        });
        socket.on("recievedEvents",function(data){
            var player = data['player'];
            Q.state.set("player",player);
            Q.goToStage(player.p.area,player.p.loc,data['events']);
        });
        socket.on("triggeredEvent",function(data){
            var stageName = Q.stage(1).scene.name;
            var eventName = data['stageName'];
            //Run the trigger if the player is currently in the stage that it was triggered.
            if(stageName===eventName){
                var event = Q.state.get("events")[data['eventId']];
                Q.eventFuncs[event.event](event);
            }
        });
        socket.on("playersInBattle",function(data){
           console.log(data) 
            
        });
    };

    //Define the image files to be loaded
    var imageFiles = [
        //Images
        "Aipom60x60.png",
        "Dratini.png",
        "Deino60x60.png",
        "Totodile60x60.png",
        "sprites.png",
        "berries.png",
        "fog.png"
    ];
    for(i=0;i<imageFiles.length;i++){
        imageFiles[i]="/images/"+imageFiles[i];
    }
    Q.load(imageFiles.join(','),function(){
        Q.setUpAnimations();
        //Stage the title scene
        //Q.stageScene('title', 0);
        
    });

    Q.startGame = function(name){
        //Get rid of the login
        var div = document.getElementById('login');
        document.getElementById('main').removeChild(div);
        
        Q.state.set({
            //Stores all level data
            levelData: [],
            //The current stage that the player is on
            currentStage:[],

            //Which tunes have been loaded (so that we don't load music twice)
            loadedMusic:[],
            //The current music
            currentMusic:"",

            playerMenuPos:"right",
            character:name,
            
            turnOrder:[],
            currentCharacter:{},
            currentCharacterTurn:0,//The current turn (position in turnOrder array
            turnNumber:1,//The total number of rounds

            enemies:{},

            //The current events happening in this level
            events:{},
            //Is set to true when there is a battle
            //Is set to false when all enemies are defeated, and is checked after the dirTri is set
            battle:true,

            //1 - Adventuring
            //2 - Battle
            //3 - Story
            phase:1,

            //The speed at which the enemy ai text goes (actually, this is just used for all bottomtextbox cycling now)
            //30-60-90
            textSpeed:30
        });
        var character = name;
        Q.state.get("playerConnection").socket.emit('startGame', { playerId:Q.state.get("playerConnection").id, character:character});
    };
    Q.goToStage = function(whereTo, playerLoc,events){
        Q.state.set("events",events);
        var levels = Q.state.get("levelData");
        var currentPath = Q.getPath(whereTo);
        //Check if the player has been to a level before
        for(i=0;i<levels.length;i++){
            if(levels[i].id===whereTo){
                Q.stageScene(whereTo,1,{path:currentPath[0],pathNum:currentPath[1],playerLoc:playerLoc});
                return;
            }
        }
        //CODE BELOW WON'T RUN IF THE PLAYER HAS BEEN TO THE STAGE BEFORE (FIRST TIME ONLY)
        //If the level hasn't been gone to yet
        Q.scene(""+whereTo,function(stage){
            //Q.stageScene("background",0,{path:stage.options.path});
            Q.stageTMX(""+stage.options.path+"/"+whereTo+".tmx",stage);
            Q.stage(1).add("viewport");
            //Q.getMusic(stage.options.path);
            //Here, get all players that are in this area and insert them.
            var players = Q.players;
            for(ii=0;ii<players.length;ii++){
                if(Q.checkSameStage(players[ii].p.area)){
                    Q.addActor(players[ii]);
                }
            }
            //Insert the protagonist
            var player = Q.givePlayerProperties(stage,stage.options.playerLoc);
            player.p.area=whereTo;
            Q.state.set("playerObj",player);
            //Adventuring Phase
            if(Q.state.get("phase")===1){
                setTimeout(function(){
                    Q.addViewport(player);
                    player.setMyTurn();
                    //Q.stageScene("tophud",3,{chars:Q.state.get("turnOrder")});
                    Q.setEvents(stage,events);
                },10);
            } /*
            else if(Q.state.get("phase")===2){
                setTimeout(function(){
                    Q.state.get("turnOrder")[0].turnStart();
                    //Q.stageScene("tophud",3,{chars:Q.state.get("turnOrder")});
                    var events = Q.getEvents(whereTo);
                    Q.setEvents(stage,events);
                },10);
            }*/

            /*if(THIS STAGE IS A CAVE LEVEL)
            Q.stageScene("fog",2);
            */
        });
        Q.loadTMX(currentPath[0]+"/"+whereTo+".tmx",function(){
            Q.stageScene(whereTo,1,{path:currentPath[0],pathNum:currentPath[1],playerLoc:playerLoc});
        });
    };
    setUp();
});
//Q.debug=true;
});

