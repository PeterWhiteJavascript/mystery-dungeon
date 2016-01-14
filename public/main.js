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
    if(stage.options.player){
        var colors = Q.getGradient(stage.options.player.p.types);
        box.insert(new Q.Gradient({w:box.p.w,h:box.p.h,col0:colors[0],col1:colors[1]}));
    }
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
        console.log("Placed "+actor.p.name+" at "+actor.p.loc[0]+","+actor.p.loc[1]);
        var obj = Q.stage(1).insert(new Q.Player({character:actor.p.character}));
        var ps = Object.keys(actor.p);
        for(i=0;i<ps.length;i++){
            obj.p[ps[i]]=actor['p'][ps[i]];
        }
        obj.p.sheet=actor.p.species;
        obj.p.playerId=actor.p.playerId;
        obj.p.area=actor.p.area;
        obj.p.loc = actor.p.loc;
        obj.add("actor");
        //obj.addControls();
    }
};

Q.updatePlayers=function(pl){
    for(i=0;i<Q.players.length;i++){
        if(Q.players[i].p.playerId===pl.p.playerId){
            Q.players[i]=pl;
        }
    }
};

Q.updateEvents=function(events){
    var evs = Q.state.get("events");
    for(i=0;i<events.length;i++){
        var ev = evs[events[i].eventId];
        ev.enemies=events[i].enemies;
        ev.turnOrder = events[i].turnOrder;
    }
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

Q.setTurnOrder=function(){
    var events = Q.state.get("events");
    var keys = Object.keys(events);
    for(i=0;i<keys.length;i++){
        var event = events[keys[i]];
        if(event.p.turnOrder.length>0){Q.state.set("turnOrder",event.p.turnOrder);return;}
    }
};

Q.checkBattleEvents=function(events){
    var keys = Object.keys(events);;
    for(i=0;i<keys.length;i++){
        if(events[keys[i]].p.enemies&&events[keys[i]].p.status===1){
            return true;
        }
    }
    return false;
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
        
        socket.on('startedGame', function (data) {
            Q.players=data['players'];
            /*UiPlayers.innerHTML = 'Players: ' + Q.players.length;
            for(i=0;i<data['players'].length;i++){
                console.log(data['players'][i].p.playerId)
            }*/
            
            var player = Q.buildCharacter(data['player']['p']);
            if(data['player'].p.playerId===selfId){
                Q.state.set("player",player);
                Q.goToStage(player.p.area,player.p.loc,data['events']);
                Q.setPhaseOneUpdating();
            } else {
                Q.addActor(player);
                if(Q.state.get("battle")){
                    var tO = Q.state.get("turnOrder");
                    tO.push(player.p.playerId);
                    Q.state.set("turnOrder",tO);
                }
            }
        });
        socket.on('updated', function (data) {
            //This is here because when the player is loading in, there is no stage(1) for a few milliseconds
            if(!Q.stage(1)){return;};
            var actor = Q("Player",1).items.filter(function (obj) {
                return obj.p.playerId === data['playerId'];
            })[0];
            if(actor){
                if(actor.p.playerId===selfId){
                    actor.p.inputted=data['inputted'];
                    actor.trigger("acceptInput");
                } else {
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
                }
            }
        });
        socket.on("leftArea",function(data){
            Q.updatePlayers(data['player']);
            var actor = Q("Player",1).items.filter(function (obj) {
                return obj.p.playerId === data['playerId'];
            })[0];
            if(actor){
                actor.destroy();
            }
        });
        socket.on("changedArea",function(data){
            //Update the Q.players
            Q.updatePlayers(data['player']);
            console.log(Q.state.get("battle"))
            if(!Q.state.get("battle")){
                var pl = Q.buildCharacter(data['player'].p);
                Q.addActor(pl);
            } else {
                var pl = Q.buildCharacter(data['player'].p);
                var wP = Q.state.get("waitingPlayers");
                wP.push(pl);
            }
            
        });
        socket.on("recievedEvents",function(data){
            Q.state.set("currentBattles",[]);
            Q.players=data['players'];
            var player = Q.buildCharacter(data['player']['p']);
            Q.state.set("player",player);
            if(!Q.checkBattleEvents(data['events'])){
                Q.goToStage(player.p.area,player.p.loc,data['events']);
            } else {
                //show waiting for best time to join (at host's turn)
            }
        });
        socket.on('joinedBattle',function(data){
            
            console.log(data)
        });
        socket.on("triggeredEvent",function(data){
            Q.state.get("events")[data['event']['p']['eventId']]=data['event'];
            var event = Q.state.get("events")[data['event']['p']['eventId']];
            event.eventId=event.p.eventId;
            if(event.event==="spawnEnemies"){
                var curBattles = Q.state.get("currentBattles");
                curBattles.push(event.p.eventId);
            }
            Q.eventFuncs[event.event](event,data['host']);
            
        });
        socket.on("playersInBattle",function(data){
            if(selfId!==data['host']){
                var player = Q.state.get("playerObj");
                player.p.x=player.p.loc[0]*70+35;
                player.p.y=player.p.loc[1]*70+35;
                Q.state.get("playerConnection").socket.emit('update',{
                    inputs:{
                        left:Q.inputs['left'],
                        right:Q.inputs['right'],
                        up:Q.inputs['up'],
                        down:Q.inputs['down']
                    },
                    playerId:Q.state.get("playerConnection").id,
                    props:{
                        x:player.p.x,
                        y:player.p.y,
                        dir:player.p.dir,
                        loc:player.p.loc,
                        animation:player.p.animation,
                        area:Q.stage(1).scene.name
                    }
                });
            }
            //clearInterval(Q.updateInterval);
            Q.state.set("battleHost",data['host']);
            var tO = data['turnOrder'];
            Q.state.set("turnOrder",tO);
            if(tO[0]===selfId){
                Q.state.get("playerObj").turnStart();
            } else {
                Q.state.get("playerObj").p.myTurn=false;
                Q.state.get("playerObj").disableControls();
                Q.addTurnOrderView();
            }
        });
        socket.on("battleMoved",function(data){
            var whatMoved = data['playerId'];
            //Is enemy
            if(Q._isString(whatMoved)){
                var enemy = Q("Enemy",1).items.filter(function(obj){
                    return obj.p.playerId===whatMoved;
                })[0];
                enemy.p.calcMenuPath=data['walkPath'];
                enemy.p.myTurnTiles=data['myTurnTiles'];
                Q.addViewport(enemy);
                enemy.add("autoMove");
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
            //TO DO ACTUALLY CHANGE THE STATS OF THE TARGET/USER
            var player;
            if(Q._isNumber(data['playerId'])){
                player = Q("Player",1).items.filter(function(obj){
                    return obj.p.playerId===data['playerId'];
                })[0];
            } else if(Q._isString(data['playerId'])){
                player = Q("Enemy",1).items.filter(function(obj){
                    return obj.p.playerId===data['playerId'];
                })[0];
            }
            Q.stageScene("bottomhud",3,{text:data['text'],player:player});
            
        });
        socket.on("startTurn",function(data){
            var tO = data['turnOrder'];
            Q.state.set("turnOrder",tO);
            Q.updateEvents(data['events']);
            //If it's the host's turn
            if(tO[0]===selfId){
                var wP = Q.state.get("waitingPlayers");
                if(wP.length){
                    socket.emit('joinBattle',{playerId:selfId,players:wP});
                }
                //Start the host's turn
                Q.state.get("playerObj").turnStart();
            }
            //If the current player is a user
            else if(Q._isNumber(tO[0])){
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
                if(data['events'][0].host===selfId){
                    enemyTurn.turnStart();
                } else {
                    Q.addViewport(enemyTurn);
                }
            }
            
        });
        socket.on('completedEvent',function(data){
            Q.eventCompleted(data['eventId'],data['onCompleted']);
        });
        socket.on("updatePlayerItems",function(data){
            var player = Q.players.filter(function(obj){
                return obj.p.playerId===data['playerId'];
            })[0];
            player.p.items=data['items'];
        });
        socket.on("updatedStats",function(data){
            if(data['playerId']!==selfId){
                var player = Q("Player",1).items.filter(function(obj){
                    return obj.p.playerId===data['playerId'];
                })[0];

                var keys = Object.keys(data['player']['p']);
                for(i=0;i<keys.length;i++){
                    if(keys[i]==="attacks"){
                        var attacks=[];
                        for(j=0;j<data['player']['p'][keys[i]].length;j++){
                            attacks.push(RP.moves[data['player']['p'][keys[i]][j]]);
                        }
                        data['player']['p'][keys[i]]=attacks;
                    }
                    else if(keys[i]==="ability"){data['player']['p'][keys[i]]=RP.abilities[data['player']['p'][keys[i]]];}
                    else if(keys[i]==="items"){
                        var itms = [];
                        for(j=0;j<data['player']['p'][keys[i]].length;j++){
                            if(Q._isArray(data['player']['p'][keys[i]][j])){
                                itms.push({p:RP.items[data['player']['p'][keys[i]][j][0]],amount:data['player']['p'][keys[i]][j][1]});
                            } else if(Q._isObject(data['player']['p'][keys[i]][j])){
                                itms.push(data['player']['p'][keys[i]][j]);
                            }
                        }
                        data['player']['p'][keys[i]]=itms;
                    }
                    player.p[keys[i]]=data['player']['p'][keys[i]];
                }
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
        "fog.png",
        "battle_complete.png"
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
            //All battles eventId's that are going on in this stage right now
            currentBattles:[],
            //All players that are waiting to join the battle
            waitingPlayers:[],

            //The current events happening in this level
            events:{},
            //Is set to true when there is a battle
            //Is set to false when all enemies are defeated, and is checked after the dirTri is set
            battle:false,

            //1 - Adventuring
            //2 - Battle
            //3 - Story
            phase:1,

            //The speed at which the enemy ai text goes (actually, this is just used for all bottomtextbox cycling now)
            //30-60-90
            textSpeed:30
        });
        var character = name;
        Q.state.get("playerConnection").socket.emit('startGame', { 
            playerId:Q.state.get("playerConnection").id, 
            character:character
        });
    };
    Q.goToStage = function(whereTo, playerLoc,events){
        Q.state.set("events",events);
        var levels = Q.state.get("levelData");
        var currentPath = Q.getPath(whereTo);
        //Check if the player has been to a level before
        if(levels.length){
            for(i=0;i<levels.length;i++){
                if(levels[i].id===whereTo){
                    Q.stageScene(whereTo,1,{path:currentPath[0],pathNum:currentPath[1],playerLoc:playerLoc});
                    return;
                }
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
                if(players[ii].p.playerId!==selfId&&players[ii].p.area===Q.stage(1).scene.name){
                    var pl = Q.buildCharacter(players[ii].p);
                    Q.addActor(pl);
                }
            }
            //Insert the protagonist
            var player = Q.givePlayerProperties(stage,stage.options.playerLoc);
            player.p.area=whereTo;
            Q.state.set("playerObj",player);
            if(Q.state.get("events",events)){
                Q.setEvents(stage,Q.state.get("events",events));
            }
            //Adventuring Phase
            if(Q.state.get("phase")===1){
                setTimeout(function(){
                    Q.addViewport(player);
                    player.setMyTurn();
                    //Q.stageScene("tophud",3,{chars:Q.state.get("turnOrder")});
                    
                },10);
            } 
            else if(Q.state.get("phase")===2){
                setTimeout(function(){
                    Q.setTurnOrder();
                    Q.addTurnOrderView();
                },10);
            }

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

