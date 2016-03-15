//All of the stories are stored here
Quintus.StoryScenes=function(Q){
Q.endScene = function(data){
    Q.playMusic(data.music+".mp3",function(){ 
        switch(data.scene){
            case "Prologue_00_end":
                var stage = Q.stage(1);
                var players = Q(".commonPlayer",1).items;
                var doneDisappearing = players.length;
                var timer;
                var interaction = [
                    {asset:"Professor_Story_Idle.png",pos:"right",text:["Hah, they thought they could take me out!","They should save their dreams for when they are sleeping!"]},
                    {asset:"Dratini_Story_Idle.png",pos:"left",text:["Hmm..."]},
                    {asset:"Professor_Story_Idle.png",pos:"right",text:["Let's get back to the village now!","We must tell chief Obama what has happened here.",
                        {obj:window,func:"setTimeout",props:function(){
                            for(i_play=0;i_play<players.length;i_play++){
                                if(players[i_play].p.playerId==="a0"){Q.addViewport(players[i_play]);};
                                players[i_play].del("storySprite,AI,protagonist");
                                players[i_play].off("atDest");
                                players[i_play].off("doneAutoMove");
                                players[i_play].add("storySprite");
                                players[i_play].p.onArrival = [{func:"disappear"}];
                                players[i_play].startAutoMove([14,0]);
                                players[i_play].on("disappeared",function(){doneDisappearing--;if(doneDisappearing<=0){Q.goToNextScene();clearTimeout(timer);}});
                            }
                        }},
                        {obj:window,func:"setTimeout",props:function(){
                            Q.stageScene("customAnimate",4,{anim:"fadeOut",speed:10});
                            timer = setTimeout(function(){
                                if(doneDisappearing>0){doneDisappearing=100;Q.goToNextScene();};
                            },10000);
                        }}
                    ]}
                ];
                Q.stageScene("interaction",10,{interaction:interaction});
                break;
            case "Prologue_01_end":
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
                    {asset:"Professor_Story_Idle.png",pos:"right",text:["We need to check if the townspeople are okay.","Quickly, let's go!"]},
                    {asset:"Dratini_Story_Idle.png",pos:"left",text:["Yes...",
                        {obj:prof,func:"startAutoMove",props:[10,17]},
                        {obj:drat,func:"startAutoMove",props:[10,17]},
                        {obj:window,func:"setTimeout",props:function(){
                            Q.stageScene("customAnimate",4,{anim:"fadeOut",speed:5});
                            setTimeout(function(){Q.goToNextScene();},3000);
                        }}]}
                ];
                Q.stageScene("interaction",10,{interaction:interaction});

                break;
        }
    });
};
Q.startScene = function(data){
    var scene = data.scene;
    var us = data.userData;
    var pa = data.partsData;
    var pi = data.pickupsData;
    var ob = data.objectData;
    //Get the path if we're staging a .tmx
    var currentPath = Q.getPath(scene.levelMap.name);
    //Load the .tmx
    Q.loadTMX(currentPath[0]+"/"+scene.levelMap.name+".tmx",function(){
        //Load the music
        Q.playMusic(scene.onStart.music+".mp3",function(){ 
            //Create the scene
            Q.makeScene(scene.onStart.name,currentPath[0],scene.levelMap.name,us,pa,ob,function(stage){
            Q.TL = stage.lists.TileLayer[stage.lists.TileLayer.length-1];
            var users = Q("User",1).items;
            var players = Q("Participant",1).items.filter(function(obj){
                return Q._isNumber(obj.p.playerId);
            });
            var allies = Q("Participant",1).items.filter(function(obj){
                return Q._isString(obj.p.playerId)&&obj.p.ally==="Player";
            });
            var enemies =Q("Participant",1).items.filter(function(obj){
                return Q._isString(obj.p.playerId)&&obj.p.ally==="Enemy";
            });
            //Play the correct scene
            switch(scene.onStart.name){
                //This is the first scene.
                case "Prologue_00":
                    //Fade in
                    Q.stageScene("customAnimate",4,{anim:"fadeIn",speed:5});

                    //Create the "viewMover" which moves the camera
                    var viewMover = stage.insert(new Q.Sprite({
                        x:14*Q.tileH,y:5*Q.tileH
                    }));
                    //Give the viewMover the tween component so that it can animate to wherever it needs to go
                    viewMover.add("tween");
                    //Follow the viewMover
                    Q.viewFollow(viewMover,stage);
                    stage.viewport.scale=1.2;
                    var prof = allies[0];
                    prof.add("storySprite");
                    prof.p.moveTo = [14,19];
                    prof.p.onArrival = [{func:"playStand",props:["down"]}];
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
                    drat.add("storySprite");
                    drat.p.moveTo = [13,19];
                    drat.p.onArrival = [{func:"playStand",props:["down"]}];

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
                                prof.startPresetAutoMove([[14,18],[13,18]]);
                                prof.p.onArrival=[{
                                    func:function(dir){
                                        prof.playStand(dir);
                                        //Set what happens when you see the enemies
                                        viewMover.seeEnemies=function(){
                                            Q.playMusic(scene.battle.music+".mp3");
                                            var interaction = [
                                                {asset:"Professor_Story_Idle.png",pos:"right",text:["Looks like they found us.","If they think they can stop me, then they are wrong.","Come, let us fight!"]},
                                                {asset:"Dratini_Story_Idle.png",pos:"left",text:["Let's fight then!",{obj:Q,func:"readyForBattle"}]}
                                            ];
                                            Q.stageScene("interaction",10,{interaction:interaction});
                                        };

                                        //Spawn the enemies
                                        for(i=0;i<enemies.length;i++){
                                            Q.showStoryObj(enemies[i]);
                                        }
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
                    var prof = allies[0];
                    prof.add("storySprite");
                    var drat = allies[1];
                    drat.add("storySprite");
                    var chief = enemies[0];
                    chief.add("storySprite");
                    setTimeout(function(){
                        Q.viewFollow(allies[0],stage);
                        var path = [16,6];
                        prof.p.onArrival = [{
                            func:function(){
                                prof.playStand("left");
                                var interaction = [
                                    {asset:"Professor_Story_Idle.png",pos:"right",text:["Obama!","We encountered some bandits on the way here.","Have they made it to the village yet?"]},
                                    {asset:"obama_serious.jpg",pos:"left",text:["...","I can't say I've seen any bandits today."]},
                                    {asset:"Professor_Story_Idle.png",pos:"right",text:["Where are the townspeople?","The town square is usually filled at this time of day."]},
                                    {asset:"obama_happy.jpg",pos:"left",text:["Tonight, we are having a banquet to discuss and celebrate this town's new industry!","Everyone is already at the town hall."]},
                                    {asset:"Professor_Story_Idle.png",pos:"right",text:["A new source of income?","That's just what we needed after last year's of famine!"]},
                                    {asset:"obama_winking.jpg",pos:"left",text:[{obj:Q,func:"playMusic",props:"gambling1.mp3"},"Yes, yes.","You two had better get going before the food is all eaten!","My back is aching with old age so I'll be right behind you!"]},
                                    {asset:"Professor_Story_Idle.png",pos:"right",text:["Hmm...","Alright, let's go!",
                                        {obj:prof,func:"setProp",props:["onArrival",[{func:"playStand",props:"left"}]]},
                                        {obj:prof,func:"setProp",props:["stepDelay",0.65]},
                                        {obj:prof,func:"startPresetAutoMove",props:[[16,15],[13,15]]},
                                        {obj:drat,func:"setProp",props:["onArrival",[{func:"playStand",props:"left"}]]},
                                        {obj:drat,func:"setProp",props:["stepDelay",0.65]},
                                        {obj:drat,func:"startPresetAutoMove",props:[[16,16],[13,16]]},
                                        {obj:chief,func:"setProp",props:["onArrival",[{func:"playStand",props:"left"},{func:function(){funnelEnemies();}}]]},
                                        {obj:chief,func:"setProp",props:["stepDelay",0.7]},
                                        {obj:chief,func:"startPresetAutoMove",props:[[15,6],[17,14]]}
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
                        Q.playSound("whistle.mp3");
                        prof.p.onArrival = [{
                            func:function(){
                                Q.playMusic(scene.battle.music+".mp3",function(){
                                    var interaction = [
                                        {asset:"bandit_happy.png",pos:"left",text:["Hah!","You've walked right into our trap.","We'll be taking your valuable stone now."]},
                                        {asset:"Professor_Story_Idle.png",pos:"left",text:["Chief!","What is the meaning of this?"]},
                                        {asset:"obama_serious.jpg",pos:"right",text:["I suppose it's time to reveal my true identity!","I am the notorious villain, Obama!","If you hand over that stone, I will give you a painless death!",{obj:chief,func:"moveForward"}]},
                                        {asset:"Professor_Story_Idle.png",pos:"left",text:["I will never give it up!","Come on, I'll take you all on!",{obj:Q,func:"readyForBattle"}]},
                                    ];
                                    Q.stageScene("interaction",10,{interaction:interaction});
                                    prof.p.stepDelay=0.3;
                                    drat.p.stepDelay=0.3;
                                    prof.off("doneAutoMove");
                                    drat.off("doneAutoMove");
                                    chief.off("doneAutoMove");
                                });
                            }
                        }];
                        drat.p.onArrival = [{func:"playStand",props:"left"}];
                        //We're going to use group one's enemies for the moving
                        var group = 1;
                        //Where all of the enemies move to
                        var moving = [
                            [10,14],
                            [10,15],
                            [10,16],
                            [19,15],
                            [19,16],
                            [19,14],
                            [17,11],
                            [16,11],
                            [15,11]
                        ];
                        var arrive = [
                            [{func:"playStand",props:"right"}],
                            [{func:"playStand",props:"right"}],
                            [{func:"playStand",props:"right"}],
                            
                            [{func:"playStand",props:"left"}],
                            [{func:"playStand",props:"left"}],
                            
                            [{func:"playStand",props:"left"}],
                            
                            [{func:"playStand",props:"down"}],
                            [{func:"playStand",props:"down"}],
                            [{func:"playStand",props:"down"}]
                        ];
                        //Used later for when some enemies move forward
                        var forward = [
                            false,
                            false,
                            false,
                            [18,15],
                            [18,16],
                            [18,14],
                            [17,13],
                            [16,13],
                            [15,13]
                        ];
                        setTimeout(function(){
                            var wave = 0;
                            var inter = setInterval(function(){
                                var en = enemies.filter(function(obj){
                                    return obj.p.group===1&&obj.p.groupNum%3===wave;
                                });
                                for(ii=0;ii<en.length;ii++){
                                    en[ii].p.moveTo = moving[en[ii].p.groupNum];
                                    en[ii].p.onArrival = arrive[en[ii].p.groupNum];
                                    en[ii].p.moveForward = forward[en[ii].p.groupNum];
                                    en[ii].add("storySprite");
                                    Q.showStoryObj(en[ii]);
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
                    //alert("That's all folks!");
                    Q.stageScene("customAnimate",4,{anim:"fadeIn",speed:5});
                    Q.readyForBattle();
                    break;
            };
            });
            //Stage the TMX tilemap
            Q.stageScene(scene.onStart.name,1,{path:currentPath[0],pathNum:currentPath[1],sort:true});
            
        });
    });    
};
Q.setUpObject=function(stage,objClass,data){
    var obj = stage.insert(new Q[objClass]({loc:data.loc,playerId:data.playerId}));
    var pos = Q.setXY(obj.p.loc[0],obj.p.loc[1]);
    obj.p.x = pos[0];
    obj.p.y = pos[1];
    obj.p.z = pos[1];
};
Q.makeScene = function(sceneName,path,levelName,users,parts,objects,callback){
    Q.scene(sceneName,function(stage){
        Q.stageTMX(path+"/"+levelName+".tmx",stage);
        stage.add("viewport");
        //Create the user sprites which allow the user to control things
        for(var i=0;i<users.length;i++){
            stage.insert(new Q.User({playerId:users[i].playerId,file:users[i].file,ready:users[i].ready,name:users[i].name}));
        }
        //Create all of the allies, enemies, and players (default hidden)
        var objs = parts;
        for(var i=0;i<objs.length;i++){
            var pl = objs[i];
            var classData = Q.state.get("classes").filter(function(obj){
                return obj.id===pl.className;
            })[0];
            stage.insert(new Q.Participant({
                playerId:pl.playerId,
                className:pl.className,
                sheet:pl.sheet?pl.sheet:pl.className,
                loc:pl.loc,
                level:pl.level,
                dir:pl.dir,
                iv:pl.iv,
                base:classData.base,
                stats:pl.stats,
                modStats:pl.modStats,
                attacks:pl.attacks,
                items:pl.items,
                abilities:pl.abilities,
                exp:pl.exp,
                gender:pl.gender?pl.gender:"M",
                name:pl.name,
                text:pl.text?pl.text:"...",
                traits:pl.traits,
                
                final:pl.final,
                group:pl.group,
                groupNum:pl.groupNum
            }));
        }
        //Put all objects in the stage (things that do not have a turn but can still be interacted with in some way)
        for(var i=0;i<objects.length;i++){
            Q.setUpObject(stage,objects[i].className,objects[i]);
        } 
        
        Q.TL = stage.lists.TileLayer[stage.lists.TileLayer.length-1];
        Q.state.set("mapWidth",Q.TL.p.cols);
        Q.state.set("mapHeight",Q.TL.p.rows);
        //Also sets the final locations
        Q.showAllStoryObjs();
        stage.viewport.scale=1;
        //Q.stageScene("customAnimate",4,{anim:"battleStart"});
        //Run the unique scene function
        callback(stage);
    });
};
    
};