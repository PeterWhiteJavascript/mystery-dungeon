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
        //Gets called when another user joins the lobby
        socket.on("playerJoinedLobby",function(data){
            //Push the connected player into the players
            Q.state.get("players").push(data['player']);
            //Make sure to update who is in the lobby
            Q.state.trigger("change.players");
        });
        //Gets called when the user logs in
        //This sends the user to the lobby
        socket.on('goToLobby', function (data) {
            Q.state.set("players",data['players']);
            var host = false;
            //This is the first one here
            if(Q.state.get("players").length===1){
                host = true;
                Q.state.set("host",selfId);
            } 
            Q.stageScene("lobby",1,{host:host});
        });
        //At the start of the scene
        socket.on("startedScene",function(data){
            Q.state.set("sceneData",data.scene);
            //Clear the first scene
            Q.clearStage(1);
            //Start the scene
            Q.startScene(data);
        });
        //Called when all players must now place their units
        socket.on("startedBattle",function(data){
            Q.state.set("turnOrder",data['turnOrder']);
            Q.state.set("battle",true);
            //Need to just restage the scene for syncing with the server
            Q.stageBattleScene(data);
            var playerLocs = data['scene'].battle.playerLocs;
            var stage = Q.stage(1);
            for(i=0;i<playerLocs.length;i++){
                stage.insert(new Q.PathBox({loc:playerLocs[i]}),false,true);
            }
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
                var player = Q("Player",1).items.filter(function(obj){
                    return obj.p.playerId===data['playerId'];
                })[0];
                player.p.loc = data['loc'];
                player.p.dir=data['dir'];
                player.placePlayer();
                player.show();
            }
        });
        socket.on("removedPlayerPlacement",function(data){
            var player = Q("Player",1).items.filter(function(obj){
                return obj.p.playerId===data['playerId'];
            })[0];
            player.destroyReady();
            player.p.loc=[-1,-1];
            player.placePlayer();
                
        });
        socket.on("confirmedPlayerPlacement",function(data){
            //Can't do this if we're not at the battle placement area yet
            if(!Q.state.get("battle")){return;};
            var pl = Q("Player",1).items.filter(function(obj){
                return obj.p.playerId===data['playerId'];
            })[0];
            
            pl.p.loc = data['loc'];
            pl.p.dir = data['dir'];
            pl.placePlayer();
            pl.showReady();
            pl.playStand(data['dir']);
            if(data['playerId']===selfId){
                pl.add("protagonist");
                Q.pointer.p.player = pl;
            }

            //If this was the last player to 'lock in', start the battle
            if(data['startBattle']){
                Q("Player",1).each(function(){
                    this.destroyReady();
                });
                for(i=0;i<Q.pointer.p.startGuide.length;i++){
                    Q.pointer.p.startGuide[i].destroy();
                }
                //Destroy the pointer
                Q.pointer.destroy();
                delete(Q.pointer);
                //Animate the 'start battle'
                //Q.stageScene("customAnimate",4,{anim:"battleStart"});
                //Start the battle music
                var ld = Q.state.get("sceneData");
                Q.playMusic(ld.battle.music+".mp3");
                if(data['res']){
                    Q.startTurn(data['res']);
                }
            } 
        });/*
        socket.on("inputted",function(data){
            var player = Q("Player",1).items.filter(function (obj) {
                return obj.p.playerId === data['playerId'];
            })[0];
            player.p.inputted.push(data['inputted']);
            player.p.locTo=data['locTo'];
            player.trigger("acceptInput");
        });*/
        
        socket.on('pickedUpItem',function(data){
            var item = Q("Pickup",1).items.filter(function (obj) {
                return obj.p.pickupId === data['pickupId'];
            })[0];
            if(item){
                item.destroy();
            }
        });
        //After the server has calculated what happens with the AI, play it out on the client
        socket.on("AIAction",function(data){
            var ai = data['AI'];
            var aiObj = Q(".commonPlayer",1).items.filter(function(obj){
                return obj.p.playerId===data['playerId'];
            })[0];
            aiObj.p.calcMenuPath = ai.path;
            aiObj.add("autoMove");
            aiObj.p.action = ai.action;
            Q.addViewport(aiObj);
            
        });
        socket.on("startNextTurn",function(playerId){
            var player = Q("Player",1).items.filter(function(obj){
                return obj.p.playerId===playerId;
            })[0];
            player.turnStart();
        });
        //playerEvent is run when a function needs to be executed during a player's turn
        socket.on("playerEvent",function(data){
            var user = Q("User",1).items.filter(function(obj){
                return obj.p.playerId===data['playerId'];
            })[0];
            //Loop through the funcs array
            for(var i=0;i<data['funcs'].length;i++){
                user[data['funcs'][i]](data['props'][i]);
            }
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
                    name:name,
                    file:file
                });
            });
            
        //});
    };
    
    
    //Define the misc image files to be loaded
    var imageFiles = [
        "bullets.png",
        
        "berries.png",
        "objects.png",
        
        "battle_start.png",
        "battle_complete.png",
        "battle_waiting.png"
       
    ];
    for(i=0;i<imageFiles.length;i++){
        imageFiles[i]="/images/"+imageFiles[i];
    }
    //The big images that show talking
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
    //The sprites that move around the world
    var battleImages = [
        "Fighter.png",
        "Pyromancer.png",
        "Paladin.png"
    ];
    for(i=0;i<battleImages.length;i++){
        battleImages[i]="/images/battle/"+battleImages[i];
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
    
    var jsonFiles = [
        "exp_needed.json",
        "abilities.json",
        "items.json",
        "attacks.json",
        "classes.json"
    ];
    for(i=0;i<jsonFiles.length;i++){
        jsonFiles[i]="_json/"+jsonFiles[i];
    }
    
    Q.load(soundFiles.concat(imageFiles).concat(storyImages).concat(battleImages).concat(jsonFiles).join(','),function(){
        Q.state.set("expNeeded",Q.assets['_json/exp_needed.json'].exp);
        Q.state.set("abilities",Q.assets['_json/abilities.json']);
        Q.state.set("items",Q.assets['_json/items.json']);
        Q.state.set("attacks",Q.assets['_json/attacks.json']);
        Q.state.set("classes",Q.assets['_json/classes.json']);
        Q.setUpAnimations();
        //Stage the title scene
        //Q.stageScene('title', 0);
        setUp();
    });
    
});
//Q.debug=true;
});

