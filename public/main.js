window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Objects, Areas, Animations, HUD, TileCosts, AttackFuncs, ItemFuncs, Music, AI, MenuScenes, Interaction, Story, QFunctions, StoryScenes")
        .setup({ development: true})
        .touch().controls(true)
        .enableSound();

//GLOBALS
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
//END GLOBALS

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
            //Q.afterDir();
            //Q.stageScene("customAnimate",4,{anim:"battleStart"});
            //TEMP
            //This allows for not placing the players
            //return;
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
            
            //Create a pointer so the user can select a guide spot (and hover enemies to check their stats before the battle)
            var pointer = stage.insert(new Q.Pointer({loc:playerLocs[0]}));
            pointer.p.startGuide = [];
            for(i=0;i<playerLocs.length;i++){
                pointer.p.startGuide.push(stage.insert(new Q.PathBox({loc:playerLocs[i]}),false,true));
            }
            pointer.p.z=100;
            pointer.p.sort=true;
            Q.pointer = pointer;
            pointer.p.playerLocs = pointer.p.startGuide;
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
                for(i=0;i<Q.pointer.p.startGuide.length;i++){
                    Q.pointer.p.startGuide[i].destroy();
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
        //Used when ending turn without action
        socket.on("setDirection",function(data){
            var player = Q(".commonPlayer",1).items.filter(function(obj){
                return obj.p.playerId===data['playerId'];
            })[0];
            player.p.dir=data['dir'];
            player.playStand(player.p.dir);
            socket.emit("readyForNextTurn",{playerId:Q.state.get("playerConnection").id});
        });
        socket.on("resetMove",function(data){
            var player = Q("Player",1).items.filter(function(obj){
                return obj.p.playerId===data['playerId'];
            })[0];
            player.resetMove();
        });
        
        socket.on("attacked",function(data){
           var interaction = data['text'];
           Q.stageScene("interaction",10,{interaction:interaction});
        });
        
        socket.on("startedTurn",function(data){
            var tO = data['turnOrder'];
            Q.state.set("turnOrder",tO);
            Q.state.set("battleHost",data['host']);
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
                playerTurn.setStartLoc();
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
                    //This only happens when it's the turn of a dead enemy.
                    //Not sure why, but it may be due to the enemy not being actually dead when the turn order gets sent off
                    if(!AITurn){
                        console.log(AITurn,tO[0])
                        Q.afterDir();
                        return;
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
            musicEnabled:false,//true,
            //sound effects
            soundEnabled:true,
            //Auto scrolling for the interacting boxes
            autoScroll:false,
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
            //1-2-3
            textSpeed:1
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
        /*
        var musicToLoad =[
            "adventure1.mp3",
            "adventure2.mp3",
            
            "battle3.mp3",
            "battle4.mp3",
            
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
            }*/
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
            
        //});
    };
    
    
    //Define the image files to be loaded
    var imageFiles = [
        //Images
        "Aipom60x60.png",
        "Dratini.png",
        "Deino60x60.png",
        "Totodile60x60.png",
        
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
    var storyImages = [
        "Dratini_Story_Idle.png",
        "Professor_Story_Idle.png",
        
        "obama_happy.jpg",
        "obama_serious.jpg",
        "obama_winking.jpg",
        
        "bandit_happy.png"
    ];
    for(i=0;i<storyImages.length;i++){
        storyImages[i]="/images/story/"+storyImages[i];
    }
    var soundFiles = [
        "enter_door.mp3",
        "attack.mp3",
        "use_item.mp3",
        "battle_complete.mp3",
        "level_up.mp3",
        "text_stream.mp3",
        "explosion_1.mp3",
        "explosion_2.mp3",
        "whistle.mp3"
    ];
    
    for(i=0;i<soundFiles.length;i++){
        soundFiles[i]="sounds/"+soundFiles[i];
    }
    Q.load(imageFiles.concat(soundFiles).concat(storyImages).join(','),function(){
        
        Q.setUpAnimations();
        //Stage the title scene
        //Q.stageScene('title', 0);
        setUp();
    });
    
});
//Q.debug=true;
});

