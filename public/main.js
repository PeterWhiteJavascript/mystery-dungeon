window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Objects, Areas, Animations, HUD, TileCosts, AttackFuncs, ItemFuncs, Music, AI")
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
Q.tileH = 64;

var colors = {
    Menu:"",
    MenuButton:'#AAFF33'
};
var makeMainMenu=function(cont){
    var buttons = Q.menuButtons.Main;
    var menu = cont.insert(new Q.MainMenu({x:0,y:200,w:cont.p.w/2,h:80+buttons.length*80,fill:'red',cx:cont.p.w/4,cy:0}));
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
    box.p.textNum=stage.options.startAt ? stage.options.startAt : 0;
    
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
    menu.add("playerMenu");
    menu.setUpMenu();
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
    Q.inputs['interact']=false;
});

Q.scene('soundControls',function(stage){
    var soundCont = stage.insert(new Q.UI.Container({x:Q.width-100,y:5}));
    var pos = Q.state.get("playerMenuPos");
    //If the menu is on the right, this needs to be on the left
    if(pos==="right"){soundCont.p.x=100;}
    //Disable/enable music
    soundCont.insert(new Q.UI.Button({
        label:"Music on/off",
        radius:8,
        border:0,
        
        fill:Q.state.get("musicEnabled") ? "#345894" : "#447ba4",
        y:20,
        w:150,
        h:30

    },function(){
        var music=Q.state.get("musicEnabled");
        if(!music){
            this.p.fill="#345894";
            Q.state.set("musicEnabled",true);
            var mus = Q.state.get("currentMusic");
            Q.state.set("currentMusic",false);
            Q.playMusic(mus);
        } else {
            this.p.fill="#447ba4";
            Q.state.set("musicEnabled",false);
            Q.stopMusic(Q.state.get("currentMusic"));
        }
    }));
    
    //Disable/enable sounds
    soundCont.insert(new Q.UI.Button({
        label:"Sound on/off",
        radius:8,
        border:0,
        stroke:"black",
        fill:Q.state.get("soundEnabled") ? "#345894" : "#447ba4",
        y:60,
        w:150,
        h:30

    },function(){
        var sound=Q.state.get("soundEnabled");
        if(!sound){
            this.p.fill="#345894";
            Q.state.set("soundEnabled",true);
        } else {
            this.p.fill="#447ba4";
            Q.state.set("soundEnabled",false);
        }
        
    }));
});

Q.addActor=function(actor,loc,dir){
    var obj = Q.stage(1).insert(new Q.Player({className:actor.className,loc:loc,dir:dir||"down"}));
    var ps = Object.keys(actor);
    for(i=0;i<ps.length;i++){
        obj.p[ps[i]]=actor[ps[i]];
    }
    console.log("Placed "+obj.p.name+" at "+obj.p.loc[0]+","+obj.p.loc[1]);
    obj.add("actor");
    return obj;
};

Q.addTurnOrderView=function(){
    var tO = Q.state.get("turnOrder");
    if(Q._isNumber(tO[0])){
        var playerTurn = Q("Player",1).items.filter(function(obj){
            return obj.p.playerId===tO[0];
        })[0];
        Q.addViewport(playerTurn);
    } 
    //If the current player is an enemy
    else if(Q._isString(tO[0])){
        var enemyTurn = Q("Enemy",1).items.filter(function(obj){
            return obj.p.playerId===tO[0];
        })[0];
        Q.addViewport(enemyTurn);
    }
};

Q.showWaiting=function(){
    Q.stageScene("customAnimate",4,{anim:"waitingBattle"});
};

Q.getLoc=function(x,y){
    var tempPt = {
        x:Math.floor(x/Q.tileH),
        y:Math.floor(y/Q.tileH)
    };
    return [tempPt.x,tempPt.y];
};

Q.setXY=function(x,y){
    return [x*Q.tileH+Q.tileH/2,y*Q.tileH+Q.tileH/2];
};

//Used when setting position after coming from another area
Q.setPosition = function(player,loc){
    if(loc[0]==='x'){
        loc[0]=Math.floor(Q("TileLayer").items[0].p.tiles[0].length-1);
    } else if(loc[1]==='y'){
        loc[1]=Math.floor(Q("TileLayer").items[0].p.tiles.length-1);
    }
    var pos = Q.setXY(loc[0],loc[1]);
    player.p.x=pos[0];
    player.p.y=pos[1];
    return player;
};

Q.getTarget=function(x,y){
    var target = Q(".commonPlayer",1).items.filter(function(obj){
        return obj.p.loc[0]===Math.round(x/Q.tileH-1)&&obj.p.loc[1]===Math.round(y/Q.tileH-1);
    })[0];
    
    return target;
};

Q.getTargetAt=function(x,y){
    var target = Q(".commonPlayer",1).items.filter(function(obj){
        return obj.p.loc[0]===x&&obj.p.loc[1]===y;
    })[0];
    return target;
};

Q.getObjectAt=function(x,y){
    var target = Q.stage(1).locate(x,y,Q.SPRITE_INTERACTABLE);
    return target;
};

Q.getTileType=function(x,y){
    var tileLayer = Q.stage(1).lists.TileLayer[Q.stage(1).lists.TileLayer.length-1];
    if(tileLayer.p.tiles[y]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[y][x]]){
         return tileLayer.tileCollisionObjects[tileLayer.p.tiles[y][x]].p.type;
    } else {
        return "SPRITE_STANDARD";
    }
};



require(['socket.io/socket.io.js']);

var socket = io.connect();
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
            Q.setInitialState();
            Q.playMusic("gambling1.mp3",function(){
                Q.stageScene('soundControls',2); 
                //Display the login
                document.getElementById('login').style.display='block';
                console.log("I am "+data['playerId']);
            });
            //Tell the server that this client has connected properly
            socket.emit('confirmConnect');
        });
        
        //When the user disconnects from the game
        socket.on("disconnected",function(data){
            Q.players = data['players'];
            if(Q.state.get("battle")){
                //TO DO Remove the dc'ed player from the tO
                Q.state.set("battleHost",selfId);
                Q.afterDir(selfId);
            }
            if(Q.stage(1)){
                var actor = Q("Player",1).items.filter(function (obj) {
                    return obj.p.playerId === data['userId'];
                })[0];
                if(actor&&actor.p.area===Q.stage(1).scene.name){
                    actor.destroy();
                }
            }
        });
        //Gets called when the user logs in
        //This sends the user to the lobby
        socket.on('goToLobby', function (data) {
            Q.state.set("players",data['players']);
            if(data['player'].playerId===selfId){
                var host = false;
                //This is the first one here
                if(Q.state.get("players").length===1){
                    host = true;
                } 
                //Waiting on "host" to start the game
                else {
                    
                }
                Q.stageScene("lobby",1,{host:host});
            }
        });
        //At the start of the scene
        socket.on("startedScene",function(data){
            //Clear the first scene
            Q.clearStage(1);
            //Start the scene
            Q.startScene(data.levelData);
        });
        //Called when all players must now place their units
        socket.on("startedBattle",function(data){
            Q.stage(1).viewport.scale=1;
            Q.state.set("turnOrder",data['turnOrder']);
            Q.state.set("battle",true);
            Q.afterDir();
            Q.stageScene("customAnimate",4,{anim:"battleStart"});
            
            //TEMP
            return;
            var placed = data['placed'];
            if(placed){
                for(i=0;i<placed.length;i++){
                    var player = Q.state.get("players").filter(function(obj){
                        return obj.playerId===placed[i][2];
                    })[0];
                    var pl = Q.addActor(player,[placed[i][0],placed[i][1]],placed[i][3]);
                    var objs = Q.state.get("playerObjs");
                    objs.push(pl);
                };
            }
            var stage = Q.stage(1);
            var ld = Q.state.get("levelData");
            //All of this user's players (for now, just the main one)
            var myPlayers = Q.state.get("players").filter(function(obj){
                return obj.playerId === Q.state.get("playerConnection").id;
            });
            //Place the playerLocs guide
            var playerLocs = ld.battle.playerLocs;
            var guide = [];
            for(i=0;i<playerLocs.length;i++){
                guide.push(stage.insert(new Q.PathBox({loc:playerLocs[i]}),false,true));
            }
            //Create a pointer so the user can select a guide spot (and hover enemies to check their stats before the battle)
            var pointer = stage.insert(new Q.Pointer({loc:playerLocs[0]}));
            pointer.p.z=100;
            pointer.p.sort=true;
            Q.pointer = pointer;
            pointer.p.playerLocs = guide;
            pointer.initial = function(){  
                //If there's a card up top, get rid of it.
                Q.clearStage(3);
                //Set the pointer's defaults
                pointer.p.sheet = "objects";
                pointer.p.frame = 4;
                pointer.p.player = null;
                pointer.del("animation,animations,dirControls");
                pointer.add("pointerControls");
            };
            pointer.attachPlayer = function(){
                Q.playSound("text_stream.mp3");
                //Make sure the pointer is at the correct position
                pointer.p.loc = [pointer.p.placedLoc[0],pointer.p.placedLoc[1]];
                //Default to the first player
                var player = myPlayers[0];
                //Set up the player's card
                Q.stageScene("tophud",3,{target:player});
                //Insert the player onto the pointer
                pointer.p.sheet = player.sheet;
                pointer.p.sprite = "player";
                pointer.p.frame = 3;
                pointer.p.playerId = player.playerId;
                pointer.del("pointerControls");
                pointer.add("animation,animations,dirControls");
                //Make the pointer animate
                pointer.playStand(pointer.p.dir||"down");
            };
            //Happens if two players try to place on the same square at the same time
            pointer.invalidPos=function(){
                pointer.p.placedLoc = null;
                pointer.p.player = null;
            };
            //Checks if there is a player on the spot we want to place
            pointer.checkPlayers=function(loc){
                var players = Q.state.get("playerObjs");
                for(i=0;i<players.length;i++){
                    if(players[i].p.loc[0]===loc[0]&&players[i].p.loc[1]===loc[1]){
                        pointer.invalidPos();
                        return true;
                    }
                }
                return false;
            };
            pointer.on("interact",function(){
                if(pointer.p.placedPlayer){return;};
                //Confirm placement if we're placing a player
                if(pointer.has("dirControls")){
                    Q.playSound("text_stream.mp3");
                    Q.state.get("playerConnection").socket.emit("confirmPlayerPlacement",{playerId:pointer.p.playerId,dir:pointer.p.dir,loc:pointer.p.loc});
                    pointer.p.placedPlayer = true;
                    pointer.initial();
                    return;
                }
                //Load the 'select character to put' scene if we've selected in the guide
                //Can't do it while moving
                if(!pointer.p.stepping&&pointer.p.diffX===0&&pointer.p.diffY===0){
                    var obj = Q.getObjectAt(pointer.p.x,pointer.p.y);
                    if(obj&&obj.isA("PathBox")&&!pointer.checkPlayers(pointer.p.loc)){
                        pointer.p.placedLoc = [pointer.p.loc[0],pointer.p.loc[1]];
                        pointer.p.player = true;
                        Q.state.get("playerConnection").socket.emit("checkPlayerPlacement",{playerId:Q.state.get("playerConnection").id,dir:pointer.p.dir,loc:pointer.p.loc});
                        return;
                    }
                }
                
            });
            pointer.on("menu",function(){
                console.log("menu")
                //Show turn order
                console.log(Q.state.get("turnOrder"))
            });
            pointer.on("back",function(){
                if(pointer.p.placedPlayer){
                    Q.playSound("text_stream.mp3");
                    pointer.p.placedPlayer = false;
                    pointer.p.player.destroy();
                    pointer.p.loc=[pointer.p.placedLoc[0],pointer.p.placedLoc[1]];
                    var pos = Q.setXY(pointer.p.loc[0],pointer.p.loc[1]);
                    pointer.p.x = pos[0];
                    pointer.p.y = pos[1];
                    pointer.initial();
                    Q.state.get("playerConnection").socket.emit("removePlayerPlacement",{playerId:Q.state.get("playerConnection").id,loc:pointer.p.loc});
                } else if(pointer.p.player){
                    Q.playSound("text_stream.mp3");
                    pointer.p.player = null;
                    pointer.initial();
                    Q.state.get("playerConnection").socket.emit("removePlayerPlacement",{playerId:Q.state.get("playerConnection").id,loc:pointer.p.loc});
                }
            });
        });
        socket.on("checkedPlayerPlacement",function(data){
            //Don't do it if this client isn't at the battle placement area yet
            if(!Q.state.get("battle")){return;};
            //Can't do it if there was already a player placed
            if(data['found']){
                Q.pointer.invalidPos();
                return;
            }
            if(data['playerId']===Q.state.get("playerConnection").id){
                Q.pointer.attachPlayer();
            } else {
                var player = Q.state.get("players").filter(function(obj){
                    return obj.playerId===data['playerId'];
                })[0];
                var pl = Q.addActor(player,data['loc'],data['dir']);
                var objs = Q.state.get("playerObjs");
                objs.push(pl);
            }
        });
        socket.on("removedPlayerPlacement",function(data){
            var objs = Q.state.get("playerObjs");
            for(i=0;i<objs.length;i++){
                if(objs[i].p.playerId===data['playerId']){
                    objs[i].destroyReady();
                    objs[i].destroy();
                    objs.splice(i,1);
                }
            }
        });
        socket.on("confirmedPlayerPlacement",function(data){
            //Can't do this if we're not at the battle placement area yet
            if(!Q.state.get("battle")){return;};
            var pl = Q.state.get("players").filter(function(obj){
                return obj.playerId===data['playerId'];
            })[0];
            var player;
            if(data['playerId']===selfId){
                player = Q.givePlayerProperties(Q.stage(1),pl,data['loc'],data['dir']);
                var objs = Q.state.get("playerObjs");
                objs.push(player);
                Q.pointer.p.player = player;
            } else {
                player = Q.state.get("playerObjs").filter(function(obj){
                    return obj.p.playerId===data['playerId'];
                })[0];
                player.playStand(data['dir']);
            }
            //If this was the last player to 'lock in', start the battle
            if(data['startBattle']){
                var plObjs = Q.state.get("playerObjs");
                for(i=0;i<plObjs.length;i++){
                    plObjs[i].destroyReady();
                }
                //Destroy the pointer
                Q.pointer.destroy();
                //Animate the 'start battle'
                //Q.stageScene("customAnimate",4,{anim:"battleStart"});
                //Start the battle music
                var ld = Q.state.get("levelData");
                Q.playMusic(ld.battle.music+".mp3");
                
            } 
            //If there are still people who haven't selected a location
            else {
                player.showReady();
            }
        });
        socket.on("getFastestClient",function(){
            socket.emit("reciveFastestClients",{playerId:selfId});
        });
        
        socket.on("inputted",function(data){
            var player = Q("Player",1).items.filter(function (obj) {
                return obj.p.playerId === data['playerId'];
            })[0];
            player.p.inputted.push(data['inputted']);
            player.p.locTo=data['locTo'];
            player.trigger("acceptInput");
        });
        
        socket.on('pickedUpItem',function(data){
            var item = Q("Pickup",1).items.filter(function (obj) {
                return obj.p.pickupId === data['pickupId'];
            })[0];
            if(item){
                item.destroy();
            }
        });
        
        
        socket.on("battleMoved",function(data){
            var whatMoved = data['playerId'];
            //Is enemy
            if(Q._isString(whatMoved)){
                var AITurn;
                //Ally
                if(whatMoved[0]==="a"){
                    AITurn = Q("Ally",1).items.filter(function(obj){
                        return obj.p.playerId===whatMoved;
                    })[0];
                } 
                //Enemy
                else if(whatMoved[0]==="e"){
                    AITurn = Q("Enemy",1).items.filter(function(obj){
                        return obj.p.playerId===whatMoved;
                    })[0];
                }
                AITurn.p.calcMenuPath=data['walkPath'];
                AITurn.p.myTurnTiles = AITurn.p.stats.sp.stamina;
                Q.addViewport(AITurn);
                AITurn.add("autoMove");
                AITurn.on("doneAutoMove",function(){
                   console.log("Waiting for AI"); 
                });
            }
            //Is player
            else {
                var player = Q("Player",1).items.filter(function(obj){
                    return obj.p.playerId===whatMoved;
                })[0];
                player.p.calcMenuPath=data['walkPath'];
                player.p.myTurnTiles=data['myTurnTiles'];
                Q.addViewport(player);
                player.add("autoMove");
            }
        });
        socket.on("attacked",function(data){
           var interaction = data['text'];
           Q.stageScene("interaction",10,{interaction:interaction});
        });
        socket.on("startedTurn",function(data){
            var tO = data['turnOrder'];
            Q.state.set("turnOrder",tO);
            //If it's the current player turn
            if(tO[0]===selfId){
                var playerTurn = Q("Player",1).items.filter(function(obj){
                    return obj.p.playerId===tO[0];
                })[0];
                //Clear the menu if there is one
                Q.clearStage(3);
                //Start the player's turn
                playerTurn.turnStart();
            }
            //If the current player is a user
            else if(Q._isNumber(tO[0])){
                var playerTurn = Q("Player",1).items.filter(function(obj){
                    return obj.p.playerId===tO[0];
                })[0];
                Q.addViewport(playerTurn);
            } 
            //If the current player is an AI
            else if(Q._isString(tO[0])){
                var AITurn;
                //Ally
                if(tO[0][0]==="a"){
                    AITurn = Q("Ally",1).items.filter(function(obj){
                        return obj.p.playerId===tO[0];
                    })[0];
                } 
                //Enemy
                else if(tO[0][0]==="e"){
                    AITurn = Q("Enemy",1).items.filter(function(obj){
                        return obj.p.playerId===tO[0];
                    })[0];
                }
                //If this is the host, calculate the AI here
                if(data['host']===selfId){
                    if(!AITurn){
                        console.log(AITurn,tO[0])
                    }
                    Q.addViewport(AITurn);
                    AITurn.turnStart();
                } 
                //If this is not the host, center on the enemy and wait for the AI to be passed in
                else {
                    Q.addViewport(AITurn);
                }
            }
        });
        socket.on("endedBattle",function(){
            //Play any win animations
            
            //Stage the win battle scene
            Q.endScene(Q.state.get("levelData").onCompleted);
        });
    };
    
    Q.setInitialState=function(){
        Q.state.set({
            //The current stage that the player is on
            currentStage:[],
            currentStageName:"",
            //Scene music
            musicEnabled:true,//true,
            //sound effects
            soundEnabled:true,
            //Which tunes have been loaded (so that we don't load music twice)
            loadedMusic:[],
            //The current music
            currentMusic:"",
            //The position of the player menu
            //Also affects the sound toggle position
            playerMenuPos:"right",
            //All the player objects (actors and players)
            playerObjs:[],
            //The turn order for the battle
            turnOrder:[],
            currentCharacter:{},
            currentCharacterTurn:0,//The current turn (position in turnOrder array
            turnNumber:1,//The total number of rounds
            
            enemies:{},
            //All battles eventId's that are going on in this stage right now
            currentBattles:[],
            //All players that are waiting to join the battle
            waitingPlayers:[],
            //Any players that didn't get added because more than one player ws going to the stage at a time during a battle.
            actorsToAdd:[],

            //The current data happening in this level
            levelData:{},
            //Is set to true when there is a battle
            //Is set to false when all enemies are defeated, and is checked after the dirTri is set
            battle:false,

            //The speed at which the enemy ai text goes (actually, this is just used for all bottomtextbox cycling now)
            //30-60-90
            textSpeed:90
        });
    };

    Q.toLobby = function(name,file){
        //Get rid of the login
        var div = document.getElementById('login');
        document.getElementById('main').removeChild(div);
        //Show the "loading" animation
        var loading = Q.stage(2).insert(new Q.Sprite({
            x:0,y:0,
            cx:0,cy:0,
            w:200,h:100,
            asset:"/images/battle_waiting.png"
        }));
        loading.add("tween");
        loading.doAnim=function(x,y){
            loading.animate({x:x,y:y},2,Q.Easing.Quadratic.InOut,{callback:function(){loading.doAnim(Math.random()*Q.width,Math.random()*Q.height);}});
        };
        loading.doAnim(Math.random()*Q.width,Math.random()*Q.height);
        
        var musicToLoad =[
            "adventure1.mp3",
            "battle1.mp3",
            "talking1.mp3"
        ];
        var ld =Q.state.get("loadedMusic");
        for(i=0;i<musicToLoad.length;i++){
            musicToLoad[i]="scenes/"+musicToLoad[i];
        }
        //Start loading the music
        Q.load(musicToLoad.join(','),function(){
            for(i=0;i<musicToLoad.length;i++){
                ld.push(musicToLoad[i]);
            }
            //At this point, we will have pulled user settings from the database
            //We will probably want to update something in the Q.state here
            Q.playMusic("adventure2.mp3",function(){
                loading.destroy();
                Q.state.get("playerConnection").socket.emit('toLobby', { 
                    playerId:Q.state.get("playerConnection").id, 
                    character:name,
                    file:file
                });
            });
            
        });
    };
    //createEnemies accepts an array of enemies taken from the server
    Q.createEnemies = function(enemies,stage){
        var ens = [];
        for(i=0;i<enemies.length;i++){
            var en = enemies[i];
            var keys = Object.keys(en);
            var enemy = stage.insert(new Q.Enemy());
            for(j=0;j<keys.length;j++){
                enemy.p[keys[j]]= en[keys[j]];
            };
            ens.push(enemy);
        }
        return ens;
    };
    Q.createAllies=function(allies,stage){
        var als = [];
        for(i=0;i<allies.length;i++){
            var al = allies[i];
            var keys = Object.keys(al);
            var ally = stage.insert(new Q.Ally());
            for(j=0;j<keys.length;j++){
                ally.p[keys[j]]= al[keys[j]];
            };
            als.push(ally);
        }
        return als;
        
    };
    Q.readyForBattle=function(){
        var socket = Q.state.get("playerConnection").socket;
        socket.emit("readyForBattle",{playerId:Q.state.get("playerConnection").id});
    };
    Q.goToNextScene = function(){
        var nextScene = Q.state.get("levelData").onCompleted.nextScene;
        var socket = Q.state.get("playerConnection").socket;
        socket.emit('readyForNextScene',{playerId:Q.state.get("playerConnection").id,nextScene:nextScene});
    };
    Q.endScene = function(data){
        Q.playMusic(data.music+".mp3",function(){ 
            switch(data.scene){
                case "Prologue_00_end":
                    var stage = Q.stage(1);
                    var objs = Q(".commonPlayer",1).items;
                    var prof = objs.filter(function(obj){
                        return obj.p.playerId === "a0";
                    })[0];
                    var drat = objs.filter(function(obj){
                        return obj.p.playerId === "a1";
                    })[0];
                    prof.del("storySprite,AI");
                    drat.del("storySprite,AI");
                    prof.off("doneAutoMove");
                    drat.off("doneAutoMove");
                    prof.add("storySprite");
                    drat.add("storySprite");
                    prof.p.onArrival = [{func:"disappear"}];
                    drat.p.onArrival = [{func:"disappear"}];
                    var interaction = [
                        {asset:"Professor_Story_Idle.png",pos:"right",text:["Hah, they thought they could take me out!","They should save their dreams for when they are sleeping!"]},
                        {asset:"Dratini_Story_Idle.png",pos:"left",text:["Hmm..."]},
                        {asset:"Professor_Story_Idle.png",pos:"right",text:["Let's get back to the village now!",
                            {obj:prof,func:"startAutoMove",props:[14,0]},
                            {obj:drat,func:"startAutoMove",props:[14,0]},
                            {obj:window,func:"setTimeout",props:function(){
                                Q.stageScene("customAnimate",4,{anim:"fadeOut",speed:10});
                                setTimeout(function(){Q.goToNextScene();},6000);
                            }}
                        ]}
                    ];
                    Q.stageScene("interaction",10,{interaction:interaction});
                    break;
                case "Prologue_01_end":
                    console.log("emonpsa")
                    break;
            }
        });
    };
    Q.startScene = function(data){
        Q.state.set("levelData",data);
        //Get the path if we're staging a .tmx
        var currentPath = Q.getPath(data.levelMap.name);
        //Load the .tmx
        Q.loadTMX(currentPath[0]+"/"+data.levelMap.name+".tmx",function(){
            //Load the music
            Q.playMusic(data.onStart.music+".mp3",function(){ 
                //Create the scene
                Q.makeScene(data.onStart.name,currentPath[0],data.levelMap.name);
                //Stage the TMX tilemap
                Q.stageScene(data.onStart.name,1,{path:currentPath[0],pathNum:currentPath[1],sort:true});
                var stage = Q.stage(1);
                Q.TL = stage.lists.TileLayer[stage.lists.TileLayer.length-1];
                //Play the correct scene
                switch(data.onStart.name){
                    //This is the first scene.
                    case "Prologue_00":
                        //Fade in
                        Q.stageScene("customAnimate",4,{anim:"fadeIn",speed:5});
                       
                        //The locations for all barrels to be placed
                        var barrels = [
                            [6,19],
                            [7,19],
                            [8,19],
                            
                            [20,16],
                            [21,16],
                            [22,16],
                            [20,17],
                            [21,17],
                            [22,17],
                            [20,18],
                            [21,18],
                            [22,18],
                            [23,18],
                            [24,18],
                            [20,19],
                            [21,19],
                            [22,19],
                            [23,19],
                            [24,19],
                            [20,20],
                            [21,20],
                            [22,20],
                            [23,20],
                            
                            [19,21],
                            
                            [13,22],
                            [14,22]
                        ];
                        for(i=0;i<barrels.length;i++){
                            stage.insert(new Q.Barrel({loc:barrels[i]}));
                        }
                        
                        //Create the "viewMover" which moves the camera
                        var viewMover = stage.insert(new Q.Sprite({
                            x:14*Q.tileH,y:5*Q.tileH
                        }));
                        //Give the viewMover the tween component so that it can animate to wherever it needs to go
                        viewMover.add("tween");
                        //Follow the viewMover
                        Q.viewFollow(viewMover,stage);
                        stage.viewport.scale=1.2;
                        var allies = Q.createAllies(data.curAllies[0],stage);
                        var prof = allies[0]; 
                        prof.p.moveTo = [14,19];
                        prof.p.onArrival = [{func:"playStand",props:["down"]}];
                        prof.add("storySprite");
                        prof.launchFireball=function(){
                            var fireballs = 9;
                            for(i=0;i<fireballs;i++){
                                setTimeout(function(){
                                    Q.playSound("attack.mp3");
                                    stage.insert(new Q.Fireball({loc:[prof.p.loc[0],prof.p.loc[1]],dir:prof.p.dir}));
                                    stage.insert(new Q.Fireball({loc:[prof.p.loc[0],prof.p.loc[1]-1],dir:prof.p.dir}));
                                },i*150);
                            }
                            setTimeout(function(){
                                viewMover.animate({x:14*Q.tileH,y:19*Q.tileH}, 2, Q.Easing.Linear,{callback:function(){
                                    var interaction = [
                                        {asset:"Professor_Story_Idle.png",pos:"right",text:[{obj:prof,func:"changeDir",props:"left"},"Would you like to try?","There is a barrel behind you that you can destroy!"]},
                                        {asset:"Dratini_Story_Idle.png",pos:"left",text:["I guess I'll have to now!",{obj:drat,func:"changeDir",props:"left"},"Here it goes!",{obj:viewMover,func:"animater",props:[11*Q.tileH,19*Q.tileH,2,drat,"playBreatheFire","left"]}]}
                                    ];
                                    Q.stageScene("interaction",10,{interaction:interaction});
                                }});
                            },fireballs*150+700);
                            prof.playStand(prof.p.dir);
                        };
                        prof.on("launchFireball");
                        var drat = allies[1];
                        drat.p.moveTo = [13,19];
                        drat.p.onArrival = [{func:"playStand",props:["down"]}];
                        
                        drat.add("storySprite");
                        drat.launchFireball=function(){
                            Q.playSound("attack.mp3");
                            //Launch the fireball
                            stage.insert(new Q.Fireball({loc:[drat.p.loc[0]-1,drat.p.loc[1]],dir:drat.p.dir,scale:0.5}));
                            setTimeout(function(){
                                //Move the viewMover back to the center
                                viewMover.animate({x:14*Q.tileH,y:19*Q.tileH}, 2, Q.Easing.Linear,{callback:function(){
                                    Q.stageScene("customAnimate",9,{anim:"dimToNight",speed:10});
                                    Q.clearStage(10);
                                    //Prof move to above drat
                                    prof.startAutoMove([13,18]);
                                    prof.p.onArrival=[{
                                        func:function(dir){
                                            prof.playStand(dir);
                                            //Set what happens when you see the enemies
                                            viewMover.seeEnemies=function(){
                                                Q.playMusic("battle1.mp3");
                                                var interaction = [
                                                    {asset:"Professor_Story_Idle.png",pos:"right",text:["Looks like they found us.","If they think they can stop me, then they are wrong.","Come, let us fight!"]},
                                                    {asset:"Dratini_Story_Idle.png",pos:"left",text:["Let's fight then!",{obj:Q,func:"readyForBattle"}]}
                                                ];
                                                Q.stageScene("interaction",10,{interaction:interaction});
                                            };
                                            
                                            //Spawn the enemies
                                            Q.createEnemies(data.curEnemies[0],stage);
                                            var interaction = [
                                                {asset:"Professor_Story_Idle.png",pos:"right",text:["You have done well enough to be called my aprentice!","It is getting dark, let us depart for home.",
                                                        {obj:prof,func:"setProp",props:["onArrival",[{func:"playStand",props:"up"}]]},
                                                        {obj:prof,func:"startAutoMove",props:[13,13]},
                                                        {obj:drat,func:"setProp",props:["onArrival",[{func:"playStand",props:"up"}]]},
                                                        {obj:drat,func:"startAutoMove",props:[13,14]},
                                                        {obj:viewMover,func:"animater",props:[14*Q.tileH,12*Q.tileH,4,viewMover,"seeEnemies"]}
                                                    ]}
                                            ];
                                            Q.stageScene("interaction",10,{interaction:interaction});
                                        },
                                        props:"down"
                                    }];
                                }});
                            },1200);
                            drat.playStand(drat.p.dir);
                        };
                        drat.on("launchFireball");
                        
                        viewMover.moveChars = function(){
                            if(viewMover.p.y>15*Q.tileH){
                                prof.startAutoMove(prof.p.moveTo);
                                drat.startAutoMove(drat.p.moveTo);
                                //After drat has reached the target (he reaches it second) play this interaction
                                drat.on("doneAutoMove",function(){
                                    var interaction = [
                                        {asset:"Professor_Story_Idle.png",pos:"right",text:["We have arrived!","This is where you will practice launching fireballs.",{obj:prof,func:"changeDir",props:"left"},"One day you'll be able to protect the village!",{obj:prof,func:"changeDir",props:"down"}]},
                                        {asset:"Dratini_Story_Idle.png",pos:"left",text:[{obj:drat,func:"changeDir",props:"right"},"I'll surpass you in no time!"]},
                                        {asset:"Professor_Story_Idle.png",pos:"right",text:[{obj:drat,func:"changeDir",props:"right"},"Hah, save your dreams for when you're sleeping!",{obj:viewMover,func:"animater",props:[20*Q.tileH,19*Q.tileH,2,prof,"playBreatheFire","right"]}]}
                                    ];
                                    Q.stageScene("interaction",10,{interaction:interaction});
                                    drat.off("doneAutoMove");
                                });
                                viewMover.off("step",viewMover,"moveChars");
                            }
                        };
                        viewMover.on("step",viewMover,"moveChars");
                        viewMover.animater=function(props){
                            viewMover.animate({x:props[0],y:props[1]},props[2],Q.Easing.Linear,
                            {callback:function(){
                                    props[3][props[4]](props[5]);
                            }});
                        };
                        //Start moving the camera
                        viewMover.animate({x:14*Q.tileH,y:19*Q.tileH}, 7, Q.Easing.Linear);
                        break;
                    case "Prologue_01":
                        Q.stageScene("customAnimate",4,{anim:"fadeIn",speed:5});
                        Q.stageScene("customAnimate",5,{anim:"dimToNight",speed:1});
                        stage.viewport.scale=1.2;
                        var allies = Q.createAllies(data.curAllies[0],stage);
                        var prof = allies[0];
                        prof.add("storySprite");
                        var drat = allies[1];
                        drat.add("storySprite");
                        var chief = Q.createEnemies(data.curEnemies[1],stage)[0];
                        chief.add("storySprite");
                        setTimeout(function(){
                            Q.viewFollow(allies[0],stage);
                            var path = [16,6];
                            prof.p.onArrival = [{
                                func:function(){
                                    prof.playStand("left");
                                    var interaction = [
                                        {asset:"Professor_Story_Idle.png",pos:"right",text:["Chief!","We encountered some bandits on the way here.","Have they made it to the village yet?"]},
                                        {asset:"Dratini_Story_Idle.png",pos:"left",text:["...","I can't say I've seen any bandits today."]},
                                        {asset:"Professor_Story_Idle.png",pos:"right",text:["Where are the townspeople?","The town square is usually filled at this time of day."]},
                                        {asset:"Dratini_Story_Idle.png",pos:"left",text:["Tonight, we are having a banquet to discuss and celebrate this town's new industry!","Everyone is already at the town hall."]},
                                        {asset:"Professor_Story_Idle.png",pos:"left",text:["A new source of income?","That's just what we needed after last year's of famine!"]},
                                        {asset:"Dratini_Story_Idle.png",pos:"left",text:[{obj:Q,func:"playMusic",props:"gambling1.mp3"},"Yes, yes.","You two had better get going before the food is all eaten!","My back is aching with old age so I'll be right behind you!"]},
                                        {asset:"Professor_Story_Idle.png",pos:"right",text:["Hmm...","Alright, let's go!",
                                            {obj:prof,func:"setProp",props:["onArrival",[{func:"playStand",props:"left"},{func:function(){funnelEnemies();}}]]},
                                            {obj:prof,func:"setProp",props:["stepDelay",0.7]},
                                            {obj:prof,func:"startAutoMove",props:[16,15]},
                                            {obj:drat,func:"setProp",props:["onArrival",[{func:"playStand",props:"left"}]]},
                                            {obj:drat,func:"setProp",props:["stepDelay",0.7]},
                                            {obj:drat,func:"startAutoMove",props:[16,16]},
                                            {obj:chief,func:"setProp",props:["onArrival",[{func:"playStand",props:"left"}]]},
                                            {obj:chief,func:"setProp",props:["stepDelay",0.7]},
                                            {obj:chief,func:"startPresetAutoMove",props:[[16,6],[16,15]]}
                                        ]},
                                            
                                        
                                    ];
                                    Q.stageScene("interaction",10,{interaction:interaction});
                                }
                            }];
                            prof.startAutoMove(path);
                            var path = [16,7];
                            drat.p.onArrival = [{func:"playStand",props:["left"]}];
                            
                            drat.startAutoMove(path);
                            
                        },4);
                        chief.moveForward = function(){
                            var en = Q("Enemy",1).items.filter(function(obj){
                                return obj.p.moveForward;
                            });
                            for(iii=0;iii<en.length;iii++){
                                en[iii].startAutoMove(en[iii].p.moveForward);
                            }
                        };
                        //Make the enemies come out of all 3 houses
                        var funnelEnemies = function(){
                            prof.p.onArrival = [{
                                func:function(){
                                    Q.playMusic("battle1.mp3",function(){
                                        var interaction = [
                                            {asset:"Dratini_Story_Idle.png",pos:"left",text:["Hah!","You've walked right into our trap.","We'll be taking your valuable stone now."]},
                                            {asset:"Professor_Story_Idle.png",pos:"left",text:["Chief!","What is the meaning of this?"]},
                                            {asset:"Dratini_Story_Idle.png",pos:"right",text:["I suppose it's time to reveal my true identity!","I am the notorious villain!","If you hand over that stone, I will give you a painless death!",{obj:chief,func:"moveForward"}]},
                                            {asset:"Professor_Story_Idle.png",pos:"left",text:["I will never give it up!","Come on, I'll take you all on!",{obj:Q,func:"readyForBattle"}]},
                                        ];
                                        Q.stageScene("interaction",10,{interaction:interaction});
                                    });
                                }
                            }];
                            drat.p.onArrival = [{func:"playStand",props:"left"}];
                            setTimeout(function(){
                                prof.startAutoMove([13,15]);
                                drat.startAutoMove([13,16]);
                            },4);
                            setTimeout(function(){
                                var wave = 0;
                                var enemies = Q.createEnemies(data.curEnemies[0],stage);
                                var inter = setInterval(function(){
                                    var en = enemies.filter(function(obj){
                                        return parseInt(obj.p.playerId[1])%3===wave;
                                    });
                                    for(ii=0;ii<en.length;ii++){
                                        en[ii].add("storySprite");
                                        en[ii].show();
                                        en[ii].startAutoMove();
                                    }
                                    wave++;
                                    if(wave>=3){
                                        clearInterval(inter);

                                    }
                                },500);
                            },500);
                        };
                        
                        break;
                    case "Prologue_02":
                        Q.stageScene("customAnimate",4,{anim:"fadeIn",speed:5});
                        Q.createAllies(data.curAllies[0],stage);
                        Q.createEnemies(data.curEnemies[0],stage);
                        Q.readyForBattle();
                        break;
                };
                
                
                
            });
        });    
    };
    Q.Sprite.extend("Barrel",{
        init:function(p){
            this._super(p,{
                sheet:"objects",
                frame:0,
                w:64,h:64,
                type:Q.SPRITE_DEFAULT,
                sensor:true
            });
            this.add("2d");
            var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
            this.p.x = pos[0];
            this.p.y = pos[1];
        }
    });
    Q.Sprite.extend("Fireball",{
        init:function(p){
            this._super(p,{
                sprite:"fireball",
                sheet:"fireball",
                w:32,h:32,
                type:Q.SPRITE_NONE,
                stepDelay:0.2,
                sensor:true
            });
            this.add("2d,animation");
            var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
            this.p.x = pos[0];
            this.p.y = pos[1];
            this.play("burning");
            this.on("sensor");
            this.on("burned");
            this.add("basicMover");
        },
        burned:function(){
            this.p.col.destroy();
            this.destroy();
        },
        burn:function(){
            this.play("engulf");
            Q.playSound("explosion_2.mp3");
        },
        sensor:function(col){
           if(col.isA("Barrel")&&!this.p.col&&this.p.animation==="burning"){
               this.burn();
               this.p.col = col;
               this.p.x=col.p.x;
               this.p.y=col.p.y;
               this.p.diffX=0;
               this.p.diffY=0;
           }
        }
    });
    //Used for fireball
    Q.component("basicMover",{
        added:function(){
            var p = this.entity.p;
            if(!p.stepDistance) { p.stepDistance = Q.tileH; }
            if(!p.stepDelay) { p.stepDelay = 0.3; }
            p.stepWait = 0;
            p.diffX = 0;
            p.diffY = 0;
            switch(p.dir){
                case "up":
                    p.diffY=-Q.tileH;
                    break;
                case "right":
                    p.diffX=+Q.tileH;
                    break;
                case "down":
                    p.diffY=+Q.tileH;
                    break;
                case "left":
                    p.diffX=-Q.tileH;
                    break;
            }
            this.entity.on("step",this,"step");
        },
        step:function(dt){
            var p = this.entity.p;
            p.stepWait -= dt;
            p.x += p.diffX * dt / p.stepDelay;
            p.y += p.diffY * dt / p.stepDelay;
            //If it goes offscreen, destroy it
            if(p.x<0||p.y<0||p.x>Q.TL.p.w||p.y>Q.TL.p.h){
                this.entity.destroy();
            }
        }
    });
    Q.component("storySprite",{
        added:function(){
            this.entity.on("doneAutoMove");
            var p = this.entity.p;
            p.myTurnTiles=100000;
            p.stepDelay=0.4;
            p.stepDistance=64;
            p.type=Q.SPRITE_NONE;
        },
        extend:{
            disappear:function(){
                this.add("tween");
                this.animate({opacity:0.01},1,Q.Easing.Linear,{callback:function(){this.destroy();}});
            },
            changeDir:function(dir){
                this.p.dir=dir;
                this.playStand(dir);
            },
            //If we have a path that we want to follow
            //This path is a series of moveTo's
            startPresetAutoMove:function(paths){
                var t = this;
                setTimeout(function(){
                    var path = [];
                    var graph = new Graph(t.getWalkMatrix());
                    for(i=0;i<paths.length;i++){
                        var loc;
                        if(i>0){loc=paths[i-1];}
                        var pa = t.getPath(paths[i],graph,false,false,loc);
                        for(j=0;j<pa.length;j++){
                            path.push(pa[j]);
                        }
                    }
                    t.p.calcMenuPath = path;
                    t.add("autoMove");
                },4);
            },
            //follow the fastest path to a location
            startAutoMove:function(moveTo){
                if(moveTo){this.p.moveTo = moveTo;};
                var graph = new Graph(this.getWalkMatrix());
                this.p.calcMenuPath = this.getPath(this.p.moveTo,graph);
                this.add("autoMove");
            },
            doneAutoMove:function(){
                for(i=0;i<this.p.onArrival.length;i++){
                    if(Q._isFunction(this.p.onArrival[i].func)){
                        this.p.onArrival[i].func(this.p.onArrival[i].props);
                    //Else if it's a string
                    } else {
                        this[this.p.onArrival[i].func](this.p.onArrival[i].props);
                    }
                }
            },
            setProp:function(props){
                this.p[props[0]]=props[1];
            },
        }
    })
    Q.viewFollow=function(obj,stage){
        var tl = stage.lists.TileLayer[0];
        obj.p.stageMaxX=tl.p.w;
        var minX=0;
        var maxX=tl.p.w;
        var minY=0;
        var maxY=tl.p.h;
        if(tl.p.w<Q.width){minX=-(Q.width-tl.p.w),maxX=Q.width;};
        if(tl.p.h<Q.height){minY=-Q.height;maxY=tl.p.h;};
        stage.follow(obj,{x:true,y:true},{minX: minX, maxX: maxX, minY: minY,maxY:maxY});
    };
    Q.makeScene = function(sceneName,path,levelName){
        Q.scene(sceneName,function(stage){
            Q.stageTMX(path+"/"+levelName+".tmx",stage);
            stage.add("viewport");
        });
    };
    Q.Sprite.extend("InteractionImage",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                x:0,y:0,
                w:300,h:450,
                type:Q.SPRITE_NONE
            });
            this.p.asset="/images/"+this.p.asset;
            this.p.x = this.p.pos==="left" ? 0 : Q.width-this.p.w;
            this.p.y-=this.p.h;
        }
    });
    Q.UI.Text.extend("InteractionText",{
        init:function(p){
            this._super(p,{
                color:"white",
                align:"left",
                outlineWidth:5,
                size:20,
                cx:0,
                charNum:0,
                time:0,
                speed:4,
                label:"_"
            });
            //this.p.x = this.p.pos==="left" ? 300 : Q.width - 300; 
            this.p.x = 300;
            this.p.cx = 0;
            this.p.label=this.p.text[this.p.charNum];
            this.on("step",this,"streamCharacters");
        },
        streamCharacters:function(){
            this.p.time++;
            if(this.p.time>=this.p.speed){
                this.p.time=0;
                this.p.charNum++;
                if(this.p.charNum>=this.p.text.length){
                    this.off("step",this,"streamCharacters");
                    return;
                }
                this.p.label+=this.p.text[this.p.charNum];
                Q.playSound("text_stream.mp3");
            }
        },
        interact:function(){
            var done = false;
            if(this.p.label.length>=this.p.text.length){
                done=true;
            } else {
                this.p.label=this.p.text;
                this.off("step",this,"streamCharacters");
            }
            return done;
        }
    });
    Q.UI.Container.extend("InteractionBox",{
        init:function(p){
            this._super(p,{
                cx:0, cy:0,
                x:0,
                w:Q.width, h:Q.height/6,
                //This is the number for the interaction
                interactionNum:0,
                //This is the number for the array of text in the interaction
                textNum:0,
                fill:'#AAFF33',
                canInteract:true
            });
            this.p.y=Q.height-this.p.h;
            this.p.interval = setInterval(function(){
                Q.inputs['interact']=true;
            },200);
        },
        destroyText:function(){
            this.p.textDisplay.destroy();
        },
        destroyImage:function(){
            if(this.p.image){
                this.p.image.destroy();
            }
        },
        done:function(){
            for(i=0;i<this.children.length;i++){
                this.children[i].destroy();
            }
            this.destroy();
            clearInterval(this.p.interval);
        },
        cycleInteraction:function(){
            if(this.p.interactionNum>=this.p.interaction.length){
                return this.done();
            }
            var stage = this.stage;
            var inter = this.p.interaction;
            var interNum = this.p.interactionNum;
            this.p.text = inter[interNum].text;
            if(inter[interNum].asset){
                this.p.image = this.insert(new Q.InteractionImage({asset:inter[interNum].asset,pos:inter[interNum].pos,y:this.p.h}));
            }
            this.cycleText();
        },
        cycleText:function(){
            if(this.p.textNum<this.p.text.length){
                function checkObject(text){
                    if(Q._isObject(text)){
                        var obj = text.obj;
                        if(Q._isString(obj)){
                            if(obj[0]==="Q"){
                                obj = Q;
                            } else if(obj[0]==="e"){
                                obj = Q("Enemy",1).items.filter(function(o){
                                    return o.p.playerId===obj;
                                })[0];
                            } else if(obj[0]==="a"){
                                obj = Q("Ally",1).items.filter(function(o){
                                    return o.p.playerId===obj;
                                })[0];
                            } 
                        }
                        if(Q._isNumber(obj)){
                            obj = Q("Player",1).items.filter(function(o){
                                return o.p.playerId===obj;
                            })[0];
                        }
                        var func = text.func;
                        obj[func](text.props);
                        return true;
                    }
                }
                //Check if this text position has an object
                if(checkObject(this.p.text[this.p.textNum],this.p.textNum)){
                    this.p.textNum++;
                    return this.cycleText();
                };
                //Show the text if it is text
                if(Q._isString(this.p.text[this.p.textNum])){
                    var inter = this.p.interaction;
                    var interNum = this.p.interactionNum;
                    this.p.textDisplay = this.insert(new Q.InteractionText({text:this.p.text[this.p.textNum],y:this.p.h/2/*,pos:inter[interNum].pos*/}));
                    this.p.textNum++;
                }
            } 
            else if(this.p.textNum>=this.p.text.length){
                this.p.interactionNum++;
                this.p.textNum=0;
                this.destroyImage();
                this.destroyText();
                this.cycleInteraction();
            }
        },
        step:function(){
            
            if(this.p.canInteract&&Q.inputs['interact']){
                if(this.p.textDisplay.interact()){
                    this.destroyText();
                    this.cycleText();
                }
                Q.inputs['interact']=false;
                this.p.canInteract=false;
                var t = this;
                setTimeout(function(){
                    t.p.canInteract=true;
                },200);
            }
        }
    });
    Q.scene('interaction',function(stage){
        var box = stage.insert(new Q.InteractionBox({interaction:stage.options.interaction}));
        box.cycleInteraction();
        Q.inputs['interact']=false;
    });
    
    //Define the image files to be loaded
    var imageFiles = [
        //Images
        "Aipom60x60.png",
        "Dratini.png",
        "Deino60x60.png",
        "Totodile60x60.png",
        
        "Dratini_Story_Idle.png",
        "Professor_Story_Idle.png",
        
        "bullets.png",
        
        "sprites.png",
        "berries.png",
        "objects.png",
        "fog.png",
        
        "battle_start.png",
        "battle_complete.png",
        "battle_waiting.png"
       
    ];
    for(i=0;i<imageFiles.length;i++){
        imageFiles[i]="/images/"+imageFiles[i];
    }
    
    var soundFiles = [
        "enter_door.mp3",
        "attack.mp3",
        "use_item.mp3",
        "battle_complete.mp3",
        "level_up.mp3",
        "text_stream.mp3",
        "explosion_1.mp3",
        "explosion_2.mp3"
    ];
    
    for(i=0;i<soundFiles.length;i++){
        soundFiles[i]="sounds/"+soundFiles[i];
    }
    Q.load(imageFiles.concat(soundFiles).join(','),function(){
        
        Q.setUpAnimations();
        //Stage the title scene
        //Q.stageScene('title', 0);
        setUp();
    });
    
    
});
//Q.debug=true;
});

