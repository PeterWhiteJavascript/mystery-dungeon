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
    if(Q.state.get("phase")!==2&&!Q.state.get("battle")){
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
            Q.state.set("currentMusic",false)
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
    var tiles = Q.TL.p.tiles;
    if(Q.TL.tileCollisionObjects[tiles[y][x]]){
         return Q.TL.tileCollisionObjects[tiles[y][x]].p.type;
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
            //Display the login
            document.getElementById('login').style.display='block';
            console.log("I am "+data['playerId']);
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
        
        socket.on('startedGame', function (data) {
            Q.players=data['players'];
            /*UiPlayers.innerHTML = 'Players: ' + Q.players.length;
            for(i=0;i<data['players'].length;i++){
                console.log(data['players'][i].p.playerId)
            }*/
            
            
            if(data['player'].p.playerId===selfId){
                var player = Q.buildCharacter(data['player']['p']);
                Q.state.set("player",player);
                Q.goToStage(player.p.area,player.p.loc,data['levelData']);
                //Join the room
                socket.emit("joinRoom",{playerId:selfId});
                Q.setPhaseOneUpdating();
            } else if(Q.stage(1)&&data['player']['p']['area']===Q.stage(1).scene.name){
                var player = Q.buildCharacter(data['player']['p']);
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
                Q.setPhaseOneUpdating();
                Q.goToStage(player.p.area,player.p.loc,data['levelData']);
                //Join the room
                socket.emit("joinRoom",{playerId:selfId});
            } else {
                //show waiting for best time to join (at host's turn)
                Q.clearStage(1);
                clearInterval(Q.updateInterval);
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
            if(Q.state.get("phase")===2){
                Q.stageScene("bottomhud",3,{text:[data['text']],player:player});
            }
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

    Q.startGame = function(name){
        //Get rid of the login
        var div = document.getElementById('login');
        document.getElementById('main').removeChild(div);
        
        Q.state.set({
            //The current stage that the player is on
            currentStage:[],
            currentStageName:"",
            //Scene music
            musicEnabled:false,//true,
            //sound effects
            soundEnabled:false,//true,
            //Which tunes have been loaded (so that we don't load music twice)
            loadedMusic:[],
            //The current music
            currentMusic:"",
            //The position of the player menu
            //Also affects the sound toggle position
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
            //Any players that didn't get added because more than one player ws going to the stage at a time during a battle.
            actorsToAdd:[],

            //The current data happening in this level
            levelData:{},
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
        Q.stageScene('soundControls',2);
        var character = name;
        Q.state.get("playerConnection").socket.emit('startGame', { 
            playerId:Q.state.get("playerConnection").id, 
            character:character
        });
    };
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
                    for(ac=0;ac<Q.state.get("actorsToAdd").length;ac++){
                        Q.addActor(Q.state.get("actorsToAdd")[ac]);
                        Q.state.set("actorsToAdd",[]);
                    }
                    Q.setTurnOrder();
                    Q.addTurnOrderView();
                    if(Q.state.get("turnOrder")[0]!==selfId){
                        Q.state.get("playerObj").disableControls();
                    }
                },10);
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
        "level_up.mp3"
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

