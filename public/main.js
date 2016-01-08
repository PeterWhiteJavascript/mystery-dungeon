window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Gradient, Objects, Areas, Animations, InteractableData, HUD, TileCosts, AttackFuncs, ItemFuncs, Events")
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
        var obj = Q.stage(1).insert(actor);
        obj.add("actor");
        //console.log("Inserted "+actor.p.character+". #"+actor.p.playerId)
    }
};

Q.checkSameStage=function(actorStage){
    if(Q.stage(1)&&actorStage===Q.stage(1).scene.name){
        return true;
    }
    return false;
};
//This function is run after a player changes area.
//When a player goes to another area, 
Q.updatePlayersArea=function(data){
    var players = Q.players;
    for(i=0;i<players.length;i++){
        if(data.playerId===players[i].p.playerId){
            if(data.currentStage!==Q.stage(1).scene.name){players[i].destroy();};
            players.splice(i,1);
            var player = new Q.Player();
            var keys = Object.keys(data);
            for(j=0;j<keys.length;j++){
                player.p[keys[j]]=data[keys[j]];
            }
            players.push(player);
            return player;
        }
    }
    
};
require(['socket.io/socket.io.js']);

Q.players = [];
var socket = io.connect();
var UiPlayers = document.getElementById("players");
var selfId;

var objectFiles = [
  './objects'
];

require(objectFiles, function () {
    var players = Q.players;
    function setUp() {
        socket.on('count', function (data) {
            UiPlayers.innerHTML = 'Players: ' + data['playerCount'];
        });

        socket.on('connected', function (data) {
            selfId = data['playerId'];
            //This connection's character
            Q.state.set("playerConnection",{id:selfId,socket:socket});
            document.getElementById('login').style.display='block';
            console.log("I am "+selfId);
            console.log(players)
        });
        
        socket.on("disconnected",function(data){
            for(i=0;i<players.length;i++){
                if(players[i].playerId===data.playerId){
                    players.splice(i,1);
                    if(Q.stage(1)){
                        var items = Q("Player",1).items;
                        for(jj=0;jj<items.length;jj++){
                            if(items[jj].p.playerId===data.playerId){
                                items[jj].destroy();
                                return;
                            }
                        }
                    }
                }
            }
        });

        socket.on('updated', function (data) {
            var actor = players.filter(function (obj) {
                return obj.p.playerId == data['playerId'];
            })[0];
            //After the player has connected
            if (actor) {
                var pl = actor;
                if(pl.p.x!==data['x']||pl.p.y!==data['y']){
                    pl.p.x = data['x'];
                    pl.p.y = data['y'];
                    pl.playWalk(data['dir']);
                } else {
                    pl.playStand(data['dir']);
                }
                pl.p.dir = data['dir'];
                if(pl.p.currentStage!==data['currentStage']){
                    pl.p.currentStage = data['currentStage'];
                }
                pl.p.update = true;
                
            //Do this when a player connects
            } else {
                if(data['playerId']!==selfId){
                    //var startArea = RP.users[data['character']].startArea;
                    var temp = new Q.Player({ playerId: data['playerId'], x: data['x'], y:data['y'], sheet: data['sheet'],character:data['character'],currentStage:data['currentStage']});
                    temp.playerId = data['playerId'];
                    players.push(temp);
                    if(Q.checkSameStage(data['currentStage'])){
                        Q.addActor(temp);
                    }
                }
                
            }
        });
        socket.on("changedArea",function(data){console.log("Changed to "+data['currentStage'])
            var player = Q.updatePlayersArea(data);
            if(Q.checkSameStage(data.currentStage)){
                var loc = data['playerLoc'];
                if(loc){
                    if(loc[0]==='x'){
                        loc[0]=Q.stage(1).items[0].p.tiles[0].length-1;
                        player.p.x=loc[0]*70+35;
                        player.p.y=loc[1]*70-35;
                    } else if(loc[1]==='y'){
                        loc[1]=Q.stage(1).items[0].p.tiles.length-1;
                        player.p.x=loc[0]*70-35;
                        player.p.y=loc[1]*70+35;
                    } else if(loc[0]===0){
                        player.p.x=loc[0]*70+35;
                        player.p.y=loc[1]*70-35;
                    } else if(loc[1]===0){
                        player.p.x=loc[0]*70-35;
                        player.p.y=loc[1]*70+35;
                    }
                }
                player.p.loc=loc;
                player.p.playerId=data['playerId'];
                player.playerId=data['playerId'];
                Q.addActor(player);
            }
        });
        socket.on("triggeredEvent",function(data){
            var stageName = Q.stage(1).scene.name;
            var event = Q.events[data['stageName']][data['eventId']];
            //console.log(event)
            //Actually run the function
            if(stageName===data['stageName']){
                Q.eventFuncs[event.event](event);
            }
            
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
        if(!RP.users[name]||!Q.state.get("playerConnection")){return alert("Please try again!");};
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
            //All completed events from all levels
            completedEvents:{},
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
        //[whereTo, x , y]
        var startLevel = RP.users[Q.state.get("character")].startArea;
        Q.goToStage(startLevel[0],[startLevel[1],startLevel[2]]);
    };
    Q.goToStage = function(whereTo, playerLoc){
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
            for(ii=0;ii<players.length;ii++){
                if(Q.checkSameStage(players[ii].p.currentStage)){
                    Q.addActor(players[ii]);
                }
            }
            //Insert the protagonist
            var player = Q.givePlayerProperties(stage,stage.options.playerLoc);
            player.p.currentStage=whereTo;
            
            //Adventuring Phase
            if(Q.state.get("phase")===1){
                setTimeout(function(){
                    Q.addViewport(player);
                    player.setMyTurn();
                    //Q.stageScene("tophud",3,{chars:Q.state.get("turnOrder")});
                    var events = Q.getEvents(whereTo);
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
           Q.state.set("player",player);
        });
        Q.loadTMX(currentPath[0]+"/"+whereTo+".tmx",function(){
            Q.stageScene(whereTo,1,{path:currentPath[0],pathNum:currentPath[1],playerLoc:playerLoc});
        });
    };
    setUp();
});
//Q.debug=true;
});

