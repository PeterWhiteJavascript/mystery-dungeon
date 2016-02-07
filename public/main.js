window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Gradient, Objects, Areas, Animations, HUD, TileCosts, AttackFuncs, ItemFuncs, Music")
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

Q.addActor=function(actor){
    if(actor.p.playerId!==Q.state.get("playerConnection").id){
        var obj = Q.stage(1).insert(new Q.Player({className:actor.p.className}));
        var ps = Object.keys(actor.p);
        for(i=0;i<ps.length;i++){
            obj.p[ps[i]]=actor['p'][ps[i]];
        }
        //CHangwe
        obj.p.sheet=actor.p.sheet;
        obj.p.playerId=actor.p.playerId;
        obj.p.area=actor.p.area;
        obj.p.loc = actor.p.loc;
        obj.p.dir = actor.p.dir;
        //var obj = Q.setPosition(obj,obj.p.loc);
        console.log("Placed "+obj.p.name+" at "+obj.p.loc[0]+","+obj.p.loc[1]);
        obj.playWalk(obj.p.dir);
        obj.add("actor");
        return obj;
    }
};

Q.updatePlayers=function(pl){
    for(i=0;i<Q.players.length;i++){
        if(Q.players[i].p.playerId===pl.p.playerId){
            Q.players[i]=pl;
        }
    }
};

Q.updateEnemies=function(events){
    if(!Q.stage(1)){return;};
    for(i=0;i<events.length;i++){
        if(events[i].status===1&&events[i].enemies){
            for(j=0;j<events[i].enemies.length;j++){
                var enemy = events[i].enemies[j];
                var enm = Q("Enemy",1).items.filter(function(obj){
                    return obj.p.playerId===enemy.playerId;
                })[0];
                var keys = Object.keys(enemy.p);
                for(k=0;k<keys.length;k++){
                    enm.p[keys[k]]=enemy.p[keys[k]];
                }
            }
        }
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
    if(events.length){
        for(i=0;i<events.length;i++){
            if(events[i].p.enemies&&events[i].p.status===1){
                return true;
            }
        }
    }
    return false;
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
        socket.on('connected', function (data) {console.log(data)
            selfId = data['playerId'];
            Q.state.set("playerConnection",{id:data['playerId'],socket:socket});
            Q.setInitialState();
            Q.playMusic("gambling1.mp3",function(){
                Q.stageScene('soundControls',2); 
                //Display the login
                document.getElementById('login').style.display='block';
                console.log("I am "+data['playerId']);
            });
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
            /*UiPlayers.innerHTML = 'Players: ' + Q.players.length;
            for(i=0;i<data['players'].length;i++){
                console.log(data['players'][i].p.playerId)
            }*/
            if(data['player'].p.playerId===selfId){
                var host = false;
                //This is the first one here
                if(Q.state.get("players").length===1){
                    host = true;
                //Waiting on "host" to start the game
                } else {
                    
                }
                Q.stageScene("lobby",1,{host:host});
            }
        });
        
        socket.on("startedGame",function(data){
            //Clear the lobby
            Q.clearStage(1);
            //Start the scene
            Q.startScene(data.levelData);
        });
        
        
        socket.on("changeDir",function(data){
            var player = Q("Player",1).items.filter(function (obj) {
                return obj.p.playerId === data['playerId'];
            })[0];
            player.p.dir=data['inputted'];
            player.playStand(player.p.dir);
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
        
        socket.on('gotTextNum',function(data){
            var npc = Q("NPC",1).items.filter(function(obj){
                return obj.p.npcId===data['npcId'];
            })[0];
            npc.checkedServer(data['textNum']);
        });
        
        socket.on('movedNPC',function(data){
            var npc = Q("NPC",1).items.filter(function(obj){
                    return obj.p.npcId===data['npcId'];
            })[0];
            npc.moveTo(data['moveTo']);
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
            if(Q.stage(1)&&Q.stage(1).scene.name===data['player'].p.area){
                if(!Q.state.get("battle")){
                    var pl = Q.buildCharacter(data['player'].p);
                    Q.addActor(pl);
                } else {
                    var pl = Q.buildCharacter(data['player'].p);
                    var wP = Q.state.get("waitingPlayers");
                    wP.push(pl);
                }
            }
            
        });
        socket.on("recievedLevelData",function(data){
            Q.state.set("currentBattles",[]);
            Q.updatePlayers(data['player']);
            var player = Q.buildCharacter(data['player']['p']);
            Q.state.set("player",player);
            if(data['levelData']&&!Q.checkBattleEvents(data['levelData'].events)||!data['levelData']){
                Q.goToStage(player.p.area,player.p.loc,data['levelData']);
                //Join the room
                socket.emit("joinRoom",{playerId:selfId});
            } else {
                //show waiting for best time to join (at host's turn)
                Q.clearStage(1);
                //clearInterval(Q.updateInterval);
                Q.showWaiting();
                socket.emit("joinRoom",{playerId:selfId,battle:true});
            }
        });
        socket.on('joinedBattle',function(data){
            var player = Q.buildCharacter(data['player']['p']);
            if(data['playerId']===selfId){
                socket.emit("joinRoom",{playerId:selfId});
                Q.state.set("battleHost",data['host']);
                Q.state.set("battle",true);
                Q.state.set("player",player);
                Q.clearStage(4);
                Q.state.set("events",data['levelData'].events);
                Q.goToStage(player.p.area,player.p.loc,data['levelData']);
            } else {
                //If this actor is being added to someone that is already in the stage
                if(Q.stage(1)){
                    var obj = Q.addActor(player);
                    obj = Q.setPosition(obj,obj.p.loc);
                    console.log(obj.p.loc)
                } else {
                    var toAdd = Q.state.get("actorsToAdd");
                    toAdd.push(player);
                }
            }
            Q.state.set("waitingPlayers",[]);
        });
        socket.on("setEvent",function(data){
            Q.eventFuncs[data['event'].eventType](data['event'],Q.state.get("playerConnection").id);
        });
        socket.on("triggeredEvent",function(data){
            Q.state.get("events")[data['event']['p']['eventId']]=data['event'];
            var trigger = Q("Trigger",1).items.filter(function(obj){
                return obj.p.eventId===data['event']['p']['eventId'];
            })[0];
            if(trigger.p.status===0){
                trigger.p.status = data['event']['p']['status'];
                var event = Q.state.get("events")[data['event']['p']['eventId']];
                event.eventId=event.p.eventId;
                if(event.eventType==="spawnEnemies"){
                    var curBattles = Q.state.get("currentBattles");
                    curBattles.push(event.p.eventId);
                }
                Q.eventFuncs[event.eventType](event,data['host']);
            }
            
        });
        socket.on("playersInBattle",function(data){
            if(selfId!==data['host']){
                var player = Q.state.get("playerObj");
                player.p.x=player.p.loc[0]*Q.tileH+Q.tileH/2;
                player.p.y=player.p.loc[1]*Q.tileH+Q.tileH/2;
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
            Q.state.set("battle",true);
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
            Q.updateEnemies(data['events']);
            //If it's the current player turn
            if(tO[0]===selfId){
                var wP = Q.state.get("waitingPlayers");
                if(wP.length){
                    socket.emit('joinBattle',{playerId:selfId,players:wP,battleHost:Q.state.get("battleHost")});
                    Q.state.set("waitingPlayers",[]);
                }
                //Clear the menu if there is one
                Q.clearStage(3);
                //Start the player's turn
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
                if(enemyTurn){
                    if(data['events'][0].host===selfId){
                        enemyTurn.turnStart();
                    } else {
                        Q.addViewport(enemyTurn);
                    }
                } else {
                    Q.afterDir();
                }
            }
            
        });
        socket.on('completedEvent',function(data){
            var event = data['event'];
            Q.eventCompleted(event['p']['eventId'],event['onCompleted']);
            //Clear the menu if there is one
            Q.clearStage(3);
        });
        socket.on("updatePlayerItems",function(data){
            var player = Q.players.filter(function(obj){
                return obj.p.playerId===data['playerId'];
            })[0];
            player.p.items=data['items'];
            Q.stageScene("bottomhud",3,{text:[data['text']],player:player});
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
    
    Q.startScene = function(data){
        //Get the path if we're staging a .tmx
        var currentPath = Q.getPath(data.levelMap.name);
        //Load the .tmx
        Q.loadTMX(currentPath[0]+"/"+data.levelMap.name+".tmx",function(){
            //Load the music
            Q.playMusic(data.onStart.music+".mp3",function(){ 
                //Play the correct scene
                switch(data.onStart.name){
                    //This is the first scene.
                    case "Prologue_00":
                        //Fade in
                        Q.stageScene("customAnimate",4,{anim:"fadeIn",speed:5});
                        //Create the scene
                        Q.makeScene(data.onStart.name,currentPath[0],data.levelMap.name);
                        //Stage the TMX tilemap
                        Q.stageScene(data.onStart.name,1,{path:currentPath[0],pathNum:currentPath[1]});
                        var stage = Q.stage(1);
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
                        
                        var prof = stage.insert(new Q.StorySprite({loc:[14,13],moveTo:[14,19],onArrival:[{func:"playStand",props:["down"]}],dir:"left",anim:"Walk",sheet:"Professor"}));
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
                                        {asset:"Dratini_Story_Idle.png",pos:"left",text:["I guess I'll have to now!",{obj:drat,func:"changeDir",props:"left"},"Here it goes!",{obj:viewMover,func:"animater",props:[9*Q.tileH,19*Q.tileH,2,drat,"playBreatheFire","left"]}]}
                                    ];
                                    Q.stageScene("interaction",10,{interaction:interaction});
                                }});
                            },fireballs*150+700);
                            prof.playStand(prof.p.dir);
                        };
                        prof.on("launchFireball");
                        var drat = stage.insert(new Q.StorySprite({loc:[13,13],moveTo:[13,19],onArrival:[{func:"playStand",props:["down"]}],dir:"right",anim:"Walk",sheet:"Dratini"}));
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
                                            prof.playWalk(dir);
                                            //Set what happens when you see the enemies
                                            viewMover.seeEnemies=function(){
                                                Q.playMusic("battle1.mp3");
                                                var interaction = [
                                                    {asset:"Professor_Story_Idle.png",pos:"right",text:["Looks like they found us.","If they think they can stop me, then they are wrong.","Come, let us fight!"]},
                                                    {asset:"Dratini_Story_Idle.png",pos:"left",text:["Yeah!"]}
                                                ];
                                                Q.stageScene("interaction",10,{interaction:interaction});
                                            };

                                            //Spawn several enemies up top here
                                            var enemy1 = stage.insert(new Q.StorySprite({loc:[12,9],dir:"down",anim:"Walk",sheet:"Professor"}));
                                            var enemy2 = stage.insert(new Q.StorySprite({loc:[14,9],dir:"down",anim:"Walk",sheet:"Professor"}));
                                            var enemy3 = stage.insert(new Q.StorySprite({loc:[9,10],dir:"right",anim:"Walk",sheet:"Professor"}));
                                            var enemy4 = stage.insert(new Q.StorySprite({loc:[16,10],dir:"left",anim:"Walk",sheet:"Professor"}));
                                            var enemy5 = stage.insert(new Q.StorySprite({loc:[9,9],dir:"right",anim:"Walk",sheet:"Professor"}));
                                            
                                            var interaction = [
                                                {asset:"Professor_Story_Idle.png",pos:"right",text:["You have done well enough to be called my aprentice!","It is getting dark, let us depart for home.",
                                                        {obj:prof,func:"setProp",props:["onArrival",{func:"playStand",props:"up"}]},
                                                        {obj:prof,func:"startAutoMove",props:[13,13]},
                                                        {obj:drat,func:"setProp",props:["onArrival",{func:"playStand",props:"up"}]},
                                                        {obj:drat,func:"startAutoMove",props:[13,14]},
                                                        {obj:viewMover,func:"animater",props:[14*Q.tileH,11*Q.tileH,5,viewMover,"seeEnemies"]}
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
                                prof.startAutoMove();
                                drat.startAutoMove();
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
        }
    });
    Q.Sprite.extend("StorySprite",{
        init:function(p){
            this._super(p,{
                sprite:"player",
                w:64,h:64,
                types:["Normal"],
                myTurnTiles:1000000,
                stepDelay:0.4,
                type:Q.SPRITE_NONE
            });
            this.p.dir ? this.p.dir : "down";
            var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
            this.p.x = pos[0];
            this.p.y = pos[1];
            this.add("2d,tween,animation,animations");
            this["play"+this.p.anim](this.p.dir);
            this.on("doneAutoMove");
        },
        changeDir:function(dir){
            this.p.dir=dir;
            this.playStand(dir);
        },
        startAutoMove:function(moveTo){
            if(moveTo){this.p.moveTo = moveTo;};
            var graph = new Graph(this.getWalkMatrix());
            this.moveAlong(this.getPath(this.p.moveTo,graph));
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
        getWalkMatrix:function(){
            function getWalkable(obj){
                return Q.getTileCost(Q.getTileType(i,j),obj.p);
            }
            var tiles=Q.stage(1).lists.TileLayer[Q.stage(1).lists.TileLayer.length-1].p.tiles;
            var cM=[];
            if(tiles){
                for(i=0;i<tiles[0].length;i++){
                    var costRow = [];
                    for(j=0;j<tiles.length;j++){
                        var cost = getWalkable(this);
                        costRow.push(cost);
                    }
                    cM.push(costRow);
                }
            }
            return cM;
        },
        getPath:function(toLoc,graph){
            var loc = this.p.loc;
            var start = graph.grid[loc[0]][loc[1]];
            var end = graph.grid[toLoc[0]][toLoc[1]];
            var result = astar.search(graph, start, end);
            return result;
        },
        moveAlong:function(path){
            this.p.calcMenuPath = path;
            this.add("autoMove");
        }
    });
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
        },
        destroyText:function(){
            this.p.textDisplay.destroy();
        },
        destroyImage:function(){
            this.p.image.destroy();
        },
        done:function(){
            for(i=0;i<this.children.length;i++){
                this.children[i].destroy();
            }
            this.destroy();
        },
        cycleInteraction:function(){
            if(this.p.interactionNum>=this.p.interaction.length){
                return this.done();
            }
            var stage = this.stage;
            var inter = this.p.interaction;
            var interNum = this.p.interactionNum;
            this.p.text = inter[interNum].text;
            this.p.image = this.insert(new Q.InteractionImage({asset:inter[interNum].asset,pos:inter[interNum].pos,y:this.p.h}));
            this.cycleText();
        },
        cycleText:function(){
            if(this.p.textNum<this.p.text.length){
                function checkObject(text){
                    if(Q._isObject(text)){
                        var obj = text.obj;
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
                    this.p.textDisplay = this.insert(new Q.InteractionText({text:this.p.text[this.p.textNum],y:this.p.h/2,pos:inter[interNum].pos}));
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
    
    Q.goToStage = function(whereTo, playerLoc,levelData){
        var currentPath = Q.getPath(whereTo);
        Q.state.set("levelData",levelData);
        //Check if the player has been to a level before
        /*if(levels.length){
            for(i=0;i<levels.length;i++){
                if(levels[i].id===whereTo){
                    Q.stageScene(whereTo,1,{path:currentPath[0],pathNum:currentPath[1],playerLoc:playerLoc});
                    return;
                }
            }
        }*/
        //CODE BELOW WON'T RUN IF THE PLAYER HAS BEEN TO THE STAGE BEFORE (FIRST TIME ONLY)
        //If the level hasn't been gone to yet
        Q.scene(""+whereTo,function(stage){
            Q.state.set("currentStageName",stage.options.path);
            //Q.stageScene("background",0,{path:stage.options.path});
            Q.stageTMX(""+stage.options.path+"/"+whereTo+".tmx",stage);
            Q.TL = stage.lists.TileLayer[stage.lists.TileLayer.length-1];
            Q.stage(1).add("viewport");
            if(Q.state.get("levelData")){
                Q.setLevelData(stage,Q.state.get("levelData"));
            }
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
            
            Q.setTurnOrder();
            Q.addTurnOrderView();
            if(Q.state.get("turnOrder")[0]!==selfId){
                Q.state.get("playerObj").disableControls();
            }
            
            

            /*if(THIS STAGE IS A CAVE LEVEL)
            Q.stageScene("fog",2);
            */
           
           
        });
        Q.loadTMX(currentPath[0]+"/"+whereTo+".tmx",function(){
            Q.getMusic(currentPath[0],function(){
                Q.stageScene(whereTo,1,{path:currentPath[0],pathNum:currentPath[1],playerLoc:playerLoc});
            });
        });
    };
    
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

