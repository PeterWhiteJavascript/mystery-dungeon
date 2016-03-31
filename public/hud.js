Quintus.HUD = function(Q){
    Q.Sprite.extend("Pointer",{
        init: function(p) {
            this._super(p, {
                sheet:"objects",
                frame:4,
                type:Q.SPRITE_NONE,
                w:Q.tileH,h:Q.tileH,
                
                guide:[],
                movTiles:[],
                
                stepDistance:Q.tileH,
                stepDelay:0.2,
                stepWait:0,
                
                flashObjs:[],
                viewNotSet:true,
                
                locsTo:[]
            });
        },
        initialize:function(){
            var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
            this.p.x = pos[0];
            this.p.y = pos[1];
            this.p.z=this.p.y+Q.tileH/2;
            this.p.destX = this.p.x;
            this.p.destY = this.p.y;
            this.p.diffX=0;
            this.p.diffY=0;
            this.moveGuide(0,0);
            this.on("unflash",this,"unFlashObjs");
            this.on("finished");
            this.showName(this.p.name);
        },
        showName:function(name){
            this.p.username = Q.stage(1).insert(new Q.UI.Container({x:this.p.x,y:this.p.y-this.p.h,z:100000}));
            this.p.username.insert(new Q.UI.Text({label:name,z:100000,size:20}));
            this.p.username.fit(2,2);
        },
        //This function displays the attack area and moves with the pointer
        createAttackArea:function(areas){
            this.p.attackAreas=areas;
            for(i=0;i<areas.length;i++){
                this.p.guide.push(Q.stage(1).insert(new Q.PathBox({loc:[this.p.loc[0]+areas[i][0],this.p.loc[1]+areas[i][1]]})));
            }
        },
        //Clears the guide that shows where you can place a player at the start of the scene
        clearStartGuide:function(){
            if(this.p.startGuide.length>0){
                for(i=0;i<this.p.startGuide.length;i++){
                    this.p.startGuide[i].destroy();
                }
            }
        },
        validPointerLoc:function(){
            var guide = this.p.player.p.guide;
            var valid = false;
            for(i=0;i<guide.length;i++){
                if(guide[i].p.loc[0]===this.p.loc[0]&&guide.p.loc[1]===this.p.loc[1]){
                    valid = true;
                }
            }
            return valid;
        },
        clearGuide:function(){
            var p = this.p;
            if(p.guide&&p.guide.length>0){
                for(i=0;i<p.guide.length;i++){
                    p.guide[i].destroy();
                }
            }
            this.p.guide=[];
        },
        finished:function(){
            this.trigger("unflash");
            if(this.p.user.p.player){
                this.p.user.p.player.clearGuide();
            }
            this.clearGuide();
            Q.clearStage(3);
            this.stage.remove(this);
            this.stage.remove(this.p.username);
        },
        flashObjs:function(guide){
            var obj = Q.getTarget(guide.p.x,guide.p.y);
            if(obj&&this.p.user.p.player.checkValidTarget(obj,this.p.attack)){
                obj.flash();
                this.p.flashObjs.push(obj);
            }
        },
        unFlashObjs:function(){
            if(this.p.flashObjs.length>0){
                for(i=0;i<this.p.flashObjs.length;i++){
                    this.p.flashObjs[i].stopFlash();
                }
            }
        },
        moveGuide:function(dir,sd){
            var guide = this.p.guide;
            this.unFlashObjs();
            this.p.flashObjs=[];
            if(guide.length>0){
                for(i=0;i<guide.length;i++){
                    guide[i].p[dir]+=sd;
                    this.flashObjs(guide[i]);
                }
            }
        },
        //Checks to see if we're going off the map and stop it.
        checkValidLoc:function(loc){
            if(loc[0]<0||loc[1]<0||loc[0]>=Q.state.get("mapWidth")||loc[1]>=Q.state.get("mapHeight")){
                return false;
            }
            return loc;
        },
        compareLocs:function(loc){
            //Compare the locs and determine the movement
            var inputs = {};
            var pLoc = this.p.loc;
            switch(true){
                case pLoc[0]>loc[0]:
                    inputs.left=true;
                    break;
                case pLoc[0]<loc[0]:
                    inputs.right=true;
                    break;
            }
            switch(true){
                case pLoc[1]>loc[1]:
                    inputs.up=true;
                    break;
                case pLoc[1]<loc[1]:
                    inputs.down=true;
                    break;
            }
            return inputs;
        },
        move:function(loc){
            if(!this.p.stepping){
                var inputs = this.compareLocs(loc);
                this.checkInputs(inputs);
            } else {
                this.p.locsTo.push(loc);
            }
        },
        //Do the logic for the directional inputs that were pressed
        checkInputs:function(input){
            var p = this.p;
            var loc;
            var newLoc = [p.loc[0],p.loc[1]];
            if(input['up']){
                p.diffY = -p.stepDistance;
                this.moveGuide('y',p.diffY);
                newLoc[1]--;
            } else if(input['down']){
                p.diffY = p.stepDistance;
                this.moveGuide('y',p.diffY);
                newLoc[1]++;
            }
            if(input['right']){
                p.diffX = p.stepDistance;
                this.moveGuide('x',p.diffX);
                newLoc[0]++;
            } else if(input['left']){
                p.diffX = -p.stepDistance;
                this.moveGuide('x',p.diffX);
                newLoc[0]--;
            }
            var loc = this.checkValidLoc(newLoc);
            //If there's a loc and the loc was changed
            if(loc&&(newLoc[0]!==p.loc[0]||newLoc[1]!==p.loc[1])){
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;
                p.destX = p.x + p.diffX;
                p.destY = p.y + p.diffY;
                p.stepWait = p.stepDelay;
                //Set the loc right away and not when the pointer gets to the location
                p.loc = newLoc;
                p.target=Q.getTargetAt(p.loc[0],p.loc[1]);
                if(p.target){
                    if(Q.state.get("watchingTurn")||p.user.controlled()){
                        p.target.showCard();
                    }
                } else {
                    if(Q.state.get("watchingTurn")||p.user.controlled()){
                        p.user.checkClearStage(3);
                    }
                }
            } else {
                p.diffX = 0;
                p.diffY = 0;
            }
        },
        //Figure out if we're interacting of pressing back before checking the movement
        processInputs:function(input){
            var p = this.p;
            //Don't process the inputs while moving
            if(!p.stepping&&!this.p.noInteract&&!this.p.noBack){
                if(input['interact']){
                    if(p.target){
                        //If we're attacking
                        if(p.attack&&p.user.p.player.checkValidTarget(p.target,p.attack)){
                            //p.user.loadAttackPrediction(p.attack,p.target);
                        } 
                        //If we're not attacking, load the full menu of the target
                        else if(!p.user.p.player.checkValidTarget(p.target,p.user.p.player.attack)){
                            //p.user.loadFullMenu(p.target);
                        }
                        Q.inputs['interact']=false;
                    } else {
                        this.trigger("inputsInteract");
                    }
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{interact:true,time:input.time}});
                    this.p.noInteract = true;
                    setTimeout(function(){
                        p.noInteract=false;
                    },100);
                    Q.inputs['interact']=false;
                    return;
                } else if(input['back']){
                    this.trigger("inputsBack");
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{back:true,time:input.time}});
                    this.p.noBack = true;
                    setTimeout(function(){
                        p.noBack=false;
                    },100);
                    Q.inputs['back']=false;
                    return;
                }
                this.checkInputs(input);
                Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:input});
                //console.log(this.p.loc)
            }
        },
        step:function(dt){
            this.p.z=this.p.y+Q.tileH/2;
            var p = this.p,
                moved = false;
            p.stepWait -= dt;
            if(p.stepping) {
                p.x += p.diffX * dt / p.stepDelay;
                p.y += p.diffY * dt / p.stepDelay;
                p.username.p.x = p.x;
                p.username.p.y = p.y-p.h;
            }
            if(p.stepWait > 0) { return;}
            if(p.stepping) {
                p.x = p.destX;
                p.y = p.destY;
                p.username.p.x = p.x;
                p.username.p.y = p.y-p.h;
            }
            p.stepping = false;
            p.diffX = 0;
            p.diffY = 0;
            if(p.locsTo.length){
                this.move(p.locsTo[0]);
                p.locsTo.splice(0,1);
            }
        }
    });
    
     Q.Sprite.extend("PathBox",{
        init: function(p){
            this._super(p,{
                sheet:"objects",
                frame:5,
                w:Q.tileH,h:Q.tileH,
                opacity:0.3,
                radius:0,
                type:Q.SPRITE_INTERACTABLE
            });
            if(!this.p.x||!this.p.y){
                var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
                this.p.x = pos[0];
                this.p.y = pos[1];
            }
            this.p.z=this.p.y-Q.tileH/2;
            if(!this.p.loc){
                this.p.loc = Q.getLoc(this.p.x,this.p.y);
            }
            this.on("step",this,function(){this.p.z=this.p.y-Q.tileH/2;});
        }
    });
    
    Q.UI.Text.extend("NameText",{
        init: function(p){
            this._super(p,{
                color:"white",
                size:30,
                outlineWidth:3,
                type:Q.SPRITE_NONE,
                label:"Aipom"
            });
            this.p.x-=this.p.w/2;
            this.setLabel();
            Q.state.on("change.currentTilesLeft",this,"setLabel");
        },
        changeCurChar:function(){
            this.p.curChar=Q.state.get("turnOrder")[Q.state.get("currentCharacterTurn")];
            this.setLabel();
        },
        setLabel:function(){
            this.p.label="Moves left: "+this.p.curChar.p.myTurnTiles;
        }
    });
    
    //MENUS BELOW
    Q.UI.Container.extend("BottomTextBox",{
        init: function(p){
            this._super(p,{
                cx:0, cy:0,
                x:0,
                w:Q.width, h:Q.height/6,
                textNum:0,
                type:Q.SPRITE_NONE,
                canInteract:true,
                fill:'#9999ff'
            });
            this.p.y=Q.height-this.p.h;
            this.p.startTime = Q.state.get("options").textSpeed;
            this.p.time=this.p.startTime;
        },
        destroyText:function(){
            this.p.text.destroy();
        },
        done:function(){
            this.p.textNum=0;/*
            if(this.stage.options.obj){
                this.stage.options.obj.createFreePointer();
            }*/
            for(i=0;i<this.children.length;i++){
                this.children[i].destroy();
            }
            if(this.stage.options.npc){this.stage.options.npc.trigger("runAfterFuncs");};
            this.destroy();
        },
        cycleText:function(){
            if(this.p.textNum<this.stage.options.text.length){
                //Do the function if it is an object
                function checkObject(object){
                    //If this text is an object (to run a function)
                    if(Q._isObject(object.stage.options.text[object.p.textNum])){
                        var keys = Object.keys(object.stage.options.text[object.p.textNum]);
                        var p = object.p;
                        var stage = object.stage;
                        for(i=0;i<keys.length;i++){
                            if(Q._isString(stage.options.text[p.textNum][keys[i]])){
                                Q[keys[i]](stage.options.text[p.textNum][keys[i]]);
                            } else {
                                var obj = Q(stage.options.text[p.textNum][keys[i]][0].Class,1).items.filter(function(o){
                                    return o.p.playerId===stage.options.text[p.textNum][keys[i]][0].id;
                                })[0];
                                if(obj){
                                    obj[keys[i]](stage.options.text[p.textNum][keys[i]][1]);
                                }
                            }
                        }
                        object.p.textNum++;
                        checkObject(object);
                        if(object.p.textNum>=object.stage.options.text.length){
                            object.done();
                        }
                    }
                }
                checkObject(this);
                //Show the text if it is text
                if(Q._isString(this.stage.options.text[this.p.textNum])){
                    this.p.text = this.insert(new Q.BottomText({label:this.stage.options.text[this.p.textNum],x:10,y:10}));
                    this.p.textNum++;
                }
            } 
            else if(this.p.textNum>=this.stage.options.text.length){
                this.done();
            }
            Q.inputs['interact']=false;
        },
        step:function(dt){
            if(this.p.autoScroll){
                this.p.time--;
                if(this.p.time<=0){
                    this.destroyText();
                    this.cycleText();
                    this.p.time=this.p.startTime;
                }
            } else {
                if(Q.inputs['interact']){
                    //Need to check if the text is done displaying
                    //If the text is not done, insta-finish it
                    //If the text is done, cycle it.
                    this.destroyText();
                    this.cycleText();
                }
            }
        }
    });
    
    Q.UI.Text.extend("BottomText",{
        init: function(p){
            this._super(p,{
                cx:0, cy:0,
                color:"white",
                size:30,
                outlineWidth:3,
                type:Q.SPRITE_NONE,
                align:'left'
            });
        }
    });
    
    Q.component("interactingMenu",{
        extend:{
            showTalkOptions:function(p){
                p.player.interact(p.target);
            },
            showTargetStatus:function(p){
                this.destroyTexts();
                this.stage.insert(new Q.Card({
                    user:p.target,
                    menu:this
                }));
                this.p.disabled=true;
                this.hide();
            }
        }
    });
    Q.UI.Container.extend("PlayerMenu",{
        init:function(p){
            this._super(p,{
                x:Q.width,
                w:Q.width/4,
                selectorNum:0,
                type:Q.SPRITE_NONE,
                fill:'#009933',
                spacing:10,
                textH:40,
                
                texts:[],
                otherTexts:[],
                greyed:[],
                cy:0
            });
            this.p.x-=this.p.w/2+this.p.spacing;
            this.p.y = this.p.spacing;
            this.p.menus = Q.state.get("menus").playerMenu;
            this.p.h = this.p.spacing*2+this.p.menus.initial.display.length*this.p.textH;
            this.on("finished",this,"destroy");
        },
        //Create the other parts of the menu such as the text areas and the selector
        initializeMenu:function(){
            this.makeMenu(this.p.menus.initial);
        },
        destroyTexts:function(){
            if(this.p.texts.length){
                for(var i=0;i<this.p.texts.length;i++){
                    this.p.texts[i].destroy();
                }
            }
            this.p.texts=[];
        },
        makeMenu:function(menu){
            this.destroyTexts();
            var display = menu.display;
            //Create the text for each of the displays
            for(var i=0;i<display.length;i++){
                this.p.texts.push(this.insert(new Q.MenuText({label:display[i],x:10,y:this.p.spacing+this.p.textH*i,num:i})));
            }
            this.p.menu = menu;
        },
        changeSelected:function(newTextNum){
            var selectorNum = this.p.selectorNum;
            var texts = this.p.texts;
            texts[selectorNum].p.color="white";
            texts[this.p.selectorNum+newTextNum].p.color="red";
            this.p.selectorNum+=newTextNum;
        },
        
        //Gets the attacks for the menu
        getAttacks:function(){
            var attacks = this.p.player.p.attacks;
            var display = [];
            var funcs = [];
            for(var i=0;i<attacks.length;i++){
                display.push(attacks[i][0]);
                funcs.push("selectAttack");
            }
            this.makeMenu({display:display,funcs:funcs,backFunc:"initializeMenu"});
        },
        //Gets the items for the menu
        getItems:function(){
            var items = this.p.player.p.items;
            var display = [];
            var funcs = [];
            for(var i=0;i<items.length;i++){
                display.push(items[i][0]);
                funcs.push("selectItem");
            }
            this.makeMenu({display:display,funcs:funcs,backFunc:"initializeMenu"});
        },
        //Load the use item text in the menu
        selectItem:function(item){
            if(item){
                this.p.itemSelected=item;
            }
            this.makeMenu(this.p.menus.selectItem);
        },
        //When the player selects use item, do the item effect and lower the item amount by 1
        useItem:function(item){
            
        },
        //Set movingItem to true which makes the next interact change the item location in the player's items property
        //Pressing back just sets movingItem to false
        moveItem:function(item){
            
        },
        //Load the yes/no menu for confirming if the user intends to toss this item
        askTossItem:function(item){
            this.makeMenu(this.p.menus.askTossItem);
        },
        //Minus the inventory by one for this item and load the items screen
        tossItem:function(){
            
        },
        //Creates the status card and closes the menu
        showStatus:function(){
            
        },
        //Closes the menu and loads the interaction text for what happens when checking the ground
        checkGround:function(){
            
        },
        //Resets the player loc to the startLoc and closes then opens the menu again
        redo:function(){
            this.p.player.setPos(this.p.user.p.player.p.startLoc);
            this.p.player.p.modStats.movement=this.p.player.p.stats.movement;
            this.p.selectorNum=0;
            this.initializeMenu();
        },
        //Loads up the direction triangle that allows the player to select a direction before ending the turn
        endTurn:function(){
            this.processInputs=function(){};
            this.destroy();
        },
        //Creates a pointer when 'move' is selected (After getting info from server)
        move:function(){
            this.processInputs=function(){};
            this.destroy();
        },
        goForward:function(){
            if(this[this.p.menu.funcs[this.p.selectorNum]]){
                this[this.p.menu.funcs[this.p.selectorNum]](this.p.menu.display[this.p.selectorNum]);
                this.p.selectorNum = 0;
            }
        },
        goBack:function(){
            if(this[this.p.menu.backFunc]){
                this[this.p.menu.backFunc]();
                this.p.selectorNum = 0;
            }
        },
        moveUp:function(){
            if(this.p.selectorNum-1<0){
                this.changeSelected(this.p.menu.display.length-1);
            } else {
                this.changeSelected(-1);
            }
        },
        moveDown:function(){
            if(this.p.selectorNum+1>this.p.menu.display.length-1){
                this.changeSelected(-this.p.menu.display.length+1);
            } else {
                this.changeSelected(1);
            }
        },
        processInputs:function(input){
            if(!this.p.noInput){
                var p = this.p;
                if(input['up']){
                    this.moveUp();
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{up:true,time:input.time}});
                } else if(input['down']){
                    this.moveDown();
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{down:true,time:input.time}});
                    
                } else if(input['interact']){
                    this.goForward();
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{interact:true,time:input.time}});
                    Q.inputs['interact']=false;
                } else if(input['back']){
                    this.goBack();
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{back:true,time:input.time}});
                    Q.inputs['back']=false;
                }
                this.p.noInput = true;
                setTimeout(function(){
                    p.noInput=false;
                },100);
                Q.inputs['up']=false;
                Q.inputs['down']=false;
                Q.inputs['interact']= false;
                Q.inputs['back']=false;
            }
        },
        executeFunc:function(func,props){
            this[func](props);
        },
    });
    Q.UI.Text.extend("MenuText",{
        init: function(p){
            this._super(p,{
                color:"white",
                size:24,
                outlineWidth:3,
                type:Q.SPRITE_NONE,
                align:'center'
            });
            if(this.p.num===0){this.p.color="red";};
        }
    });
    
    Q.UI.Container.extend("Card",{
        init: function(p) {
            this._super(p, {
                border:5,
                x:0,y:0,
                w:400,
                h:250,
                cx:0,cy:0,
                fill:"yellow",
                type:Q.SPRITE_NONE
            });
            this.p.x=Q.width-this.p.w-10;
            this.p.y=10;
            this.p.z = 100000;
            var t = this;
            setTimeout(function(){
                t.setup();
            },1);
        },

        showStats:function(){
            var data = this.p.user.p;
            var imageCont = this.insert(new Q.UI.Container({
                x:0,
                y:0,
                w:this.p.w/3-this.p.border/2,
                h:this.p.h,
                radius:0
            }));
            imageCont.insert(new Q.UI.Text({
                label:(data.gender?data.gender:"M")+" Lv"+data.level,
                x:imageCont.p.w/2,y:30+this.p.border/2,
                size:14,
                cx:0,cy:0,
                family:"Monaco"
            }));
            imageCont.insert(new Q.UI.Text({
                label:data.name,
                x:imageCont.p.w/2+imageCont.p.border/2,y:10+this.p.border/2,
                size:18,
                family:"Monaco"
            }));
            var image = imageCont.insert(new Q.Sprite({
                x:imageCont.p.w/2,
                y:imageCont.p.h/3+6,
                sheet:data.className,frame:0,
                sprite:"player"
            }));
            image.add("animation");
            image.play("standingdown");
            var attacks = Q.state.get("attacks");
            for(i=0;i<data.attacks.length;i++){
                if(data.attacks[i][0].length>0){
                    //Get the attack data (loaded from JSON)
                     var attack = attacks.filter(function(obj){
                        return obj.id===data.attacks[i][0];
                     })[0];
                     imageCont.insert(new Q.UI.Text({
                         label:attack.name,
                         x:imageCont.p.w/2+imageCont.p.border/2,y:imageCont.p.h/2+this.p.border/2+i*20,
                         size:16,
                         cx:0,cy:0,
                         family:"Monaco"
                     }));
                 }
             } 
            if(data.abilities){
                //For now, just display the first ability
                var keys = Object.keys(data.abilities);
                imageCont.insert(new Q.UI.Text({
                    label:Q.state.get("abilities")[keys[0]].name+" "+data.abilities[keys[0]],
                    x:imageCont.p.w/2+imageCont.p.border/2,y:imageCont.p.h/1.15+this.p.border/2,
                    size:16,
                    cx:0,cy:0,
                    family:"Monaco"
                }));
            }
            
            var statCont = this.p.statCont = this.insert(new Q.UI.Container({
                x:this.p.w/3,
                y:this.p.border/2,
                w:this.p.w/1.5-this.p.border/2,
                h:this.p.h-this.p.border,
                cx:0,cy:0,
                radius:0
            }));
            var stats =[
                "Class",
                "Hit Points",
                "Physical Offense",
                "Physical Defense",
                "Special Offense",
                "Special Defense",
                "Agility",
                "Strength",
                "Intellect",
                "Awareness",
                "Willpower",
                "Persuasion",
                "Fate",
                "Exp. Points",
                "Next Lv."
            ];
            var st = data.stats;
            var ms = data.modStats;
            var statValues = [
                data.className,
                ms.hp+"/"+st.hp,
                ms.phys_ofn+" ("+st.phys_ofn+")",
                ms.phys_dfn+" ("+st.phys_dfn+")",
                ms.spec_ofn+" ("+st.spec_ofn+")",
                ms.spec_dfn+" ("+st.spec_dfn+")",
                ms.agility+" ("+st.agility+")",
                
                ms.strength+" ("+st.strength+")",
                ms.intellect+" ("+st.intellect+")",
                ms.awareness+" ("+st.awareness+")",
                ms.willpower+" ("+st.willpower+")",
                ms.persuasion+" ("+st.persuasion+")",
                ms.fate+" ("+st.fate+")",
                data.exp?data.exp:Q.state.get("expNeeded")[data.level-1],
                Q.getNextLevelEXP(data.level)
            ];
            //Insert stats into the stat cont
            for(i=0;i<stats.length;i++){
                statCont.insert(new Q.UI.Container({
                    fill:"#FFF",
                    border:1,
                    x:0,y:4+i*20,
                    w:statCont.p.w,h:18,
                    cx:0,cy:0
                }));
                statCont.insert(new Q.UI.Text({
                    label:stats[i],
                    align:'left',
                    x:10,y:6+i*20,
                    size:14,
                    cx:0,cy:0
                }));
                statCont.insert(new Q.UI.Text({
                    label:""+statValues[i],
                    align:'right',
                    x:statCont.p.w-10,y:6+i*20,
                    size:14,
                    cx:0,cy:0
                }));
            }
        },
        setup:function(){
            this.showStats();
        }
    });
    
};