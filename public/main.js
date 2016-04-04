window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Shared, Objects, Areas, Animations, HUD, TileCosts, AttackFuncs, ItemFuncs, Music, AI, MenuScenes, Interaction, Story, QFunctions, StoryScenes")
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
                document.getElementById('create_account').style.display='block';
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
            Q.state.get("players").push(data['user']);
            //Make sure to update who is in the lobby
            Q.state.trigger("change.players");
        });
        //Gets called when the user logs in
        //This sends the user to the lobby
        socket.on('goToLobby', function (data) {
            Q.state.set("players",data['users']);
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
            //Q.startScene(data);
            //Uncomment this and comment the above to go the the battle instantly
            Q.readyForBattle();
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
        //The first turn of the battle
        socket.on("firstTurn",function(data){
            //If the user is watching others do their turns
            if(Q.state.get("options").watchingTurn){
                Q.state.set("watchingTurn",true);
            }
            //Clear the path boxes
            Q("PathBox",1).each(function(){
                this.destroy();
            });
            Q("User",1).each(function(){
                this.firstTurn();
            });
            Q("Participant",1).each(function(){
                this.del("storySprite");
            });
            if(data['response']){
                Q.startTurn(data);
            }
        });
        //Any turns after the first
        socket.on("startTurn",function(data){
            Q.startTurn(data);
        });
        //After the server has calculated what happens with the AI, play it out on the client
        socket.on("AIAction",function(data){
            var turnOrder = data['turnOrder'];
            Q.state.set("turnOrder",turnOrder);
            
            var ai = data['AI'];
            var aiObj = Q("Participant",1).items.filter(function(obj){
                return obj.p.playerId===data['playerId'];
            })[0];
            aiObj.p.calcMenuPath = ai.path;
            aiObj.p.action = ai.action;
            aiObj.add("autoMove");
            Q.viewFollow(aiObj);
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
            Q.endScene(Q.state.get("sceneData").onCompleted);
        });
    };
    
    Q.setInitialState=function(){
        Q.state.set({
            //The current stage that the player is on
            currentStage:[],
            currentStageName:"",
            
            //Which tunes have been loaded (so that we don't load music twice)
            loadedMusic:[],
            //The current music
            currentMusic:"",
            //The position of the player menu
            
            //The turn order for the battle
            turnOrder:[],
            turnNumber:1,//The total number of rounds

            //The current data happening in this level
            levelData:{},
            //Is set to true when there is a battle
            //Is set to false when all enemies are defeated, and is checked after the dirTri is set
            battle:false,

            
            //Set to whatever is in options on battle start
            watchingTurn:false,
            //Default to watching the currnet user's turn
            //If false, give a free pointer to the user during battle
            //TO DO: Add music/sound etc to this
            options:{
                //Also affects the sound toggle position
                playerMenuPos:"right",
                //Is this user watching other user's turns
                watchingTurn:true,
                //Scene music
                musicEnabled:false,//true,
                //sound effects
                soundEnabled:true,
                //Auto scrolling for the interacting boxes
                autoScroll:true,
                //The speed at which the enemy ai text goes (actually, this is just used for all bottomtextbox cycling now)
                //1-2-3
                textSpeed:1,
            }
        });
    };
    
    //When the user presses 'login' in the html
    Q.login = function(){
        var input = document.getElementById("login_string");
        Q.load("_json/users.json",function(){
            var users = Q.assets['_json/users.json'];
            var user = users.filter(function(us){
                return us.login===input.value;
            })[0];
            if(user){
                Q.toLobby(user.login,user.file);
            } else {
                alert("That login didn't work!");
            }
        });
    };

    Q.toLobby = function(login,file){
        //Get rid of the login
        document.getElementById('main').removeChild(document.getElementById('login'));
        document.getElementById('main').removeChild(document.getElementById('create_account'));
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
                    login:login,
                    file:file
                });
            });
            
        //});
    };
    Q.loadCreateAccountForm=function(){
        document.getElementById('main').style.display='none';
        document.getElementById('login').style.display='none';
        document.getElementById('quintus').style.display='none';
        var form = document.createElement("form");
        form.setAttribute("id", "create_account_form");
        document.body.appendChild(form);

        var name = document.createElement("INPUT");
        name.setAttribute("type", "text");
        name.setAttribute("value", "");
        document.getElementById("create_account_form").appendChild(name);
        
        //Q.state.get("playerConnection").socket.emit("createAccount");
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
        "classes.json",
        
        "menus.json"
    ];
    for(i=0;i<jsonFiles.length;i++){
        jsonFiles[i]="_json/"+jsonFiles[i];
    }
    
    Q.load(soundFiles.concat(imageFiles).concat(storyImages).concat(battleImages).concat(jsonFiles).concat(["/lib/astar.js"]).join(','),function(){
        Q.state.set("expNeeded",Q.assets['_json/exp_needed.json'].exp);
        Q.state.set("abilities",Q.assets['_json/abilities.json']);
        Q.state.set("items",Q.assets['_json/items.json']);
        Q.state.set("attacks",Q.assets['_json/attacks.json']);
        //Power, Accuracy, Range, Area all parseInt
        Q.state.get("attacks").forEach(function(atk){
            atk.power = parseInt(atk.power);
            atk.accuracy = parseInt(atk.accuracy);
            atk.range = parseInt(atk.range);
            atk.area = parseInt(atk.area);
        });
        Q.state.set("classes",Q.assets['_json/classes.json']);
        
        Q.state.set("menus",Q.assets['_json/menus.json']);
        Q.astar = astar;
        Q.Graph = Graph;
        Q.setUpAnimations();
        //Stage the title scene
        //Q.stageScene('title', 0);
        setUp();
    });
    
});
//Q.debug=true;
});

