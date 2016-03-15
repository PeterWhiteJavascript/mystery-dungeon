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
                
                name:"Pointer",
                stepDistance:Q.tileH,
                stepDelay:0.2,
                stepWait:0,
                
                flashObjs:[],
                viewNotSet:true,
                
                locsTo:[]
            });
            var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
            this.p.x = pos[0];
            this.p.y = pos[1];
            this.p.z=this.p.y+Q.tileH/2;
            this.p.destX = this.p.x;
            this.p.destY = this.p.y;
            
            this.moveGuide(0,0);
            this.on("unflash",this,"unFlashObjs");
            this.on("finished");
            var t = this;
            setTimeout(function(){
                t.showUserName();
            },1);
        },
        showUserName:function(){
            this.p.username = this.stage.insert(new Q.UI.Container({x:this.p.x,y:this.p.y-this.p.h,z:100000}));
            this.p.username.insert(new Q.UI.Text({label:this.p.user.p.name,z:100000,size:20}));
            this.p.username.fit(2,2);
        },
        //This function displays the attack area and moves with the pointer
        createAttackArea:function(areas){
            this.p.attackAreas=areas;
            for(i=0;i<areas.length;i++){
                this.p.guide.push(Q.stage(1).insert(new Q.PathBox({loc:[this.p.loc[0]+areas[i][0],this.p.loc[1]+areas[i][1]]}),false,true));
            }
        },
        clearGuide:function(){
            if(this.p.guide.length>0){
                for(i=0;i<this.p.guide.length;i++){
                    this.p.guide[i].destroy();
                }
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
        hideGuide:function(){
            if(this.p.guide.length>0){
                for(i=0;i<this.p.guide.length;i++){
                    this.p.guide[i].hide();
                }
            }
        },
        showGuide:function(){
            if(this.p.guide.length>0){
                for(i=0;i<this.p.guide.length;i++){
                    this.p.guide[i].show();
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
        finished:function(){
            this.trigger("unflash");
            this.clearGuide();
            Q.clearStage(3);
            this.stage.remove(this);
            this.stage.remove(this.p.username);
        },
        flashObjs:function(guide){
            var obj = Q.getTarget(guide.p.x,guide.p.y);
            if(obj&&this.p.player.checkValidTarget(obj,this.entity.p.attack)){
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
                newLoc[1]--;
            } else if(input['down']){
                p.diffY = p.stepDistance;
                newLoc[1]++;
            }
            if(input['right']){
                p.diffX = p.stepDistance;
                newLoc[0]++;
            } else if(input['left']){
                p.diffX = -p.stepDistance;
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
                    if(p.user.controlled()){
                        p.target.showCard();
                    }
                } else {
                    if(p.user.controlled()){
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
                        p.user.loadFullMenu(p.target);
                    } else {
                        this.trigger("inputsInteract");
                        Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{interact:true,time:input.time}});
                        this.p.noInteract = true;
                        setTimeout(function(){
                            p.noInteract=false;
                        },200);
                    }
                    return;
                } else if(input['back']){
                    this.trigger("inputsBack");
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{back:true,time:input.time}});
                    this.p.noBack = true;
                    setTimeout(function(){
                        p.noBack=false;
                    },200);
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
            this.p.startTime = Q.state.get("textSpeed");
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
    Q.UI.Container.extend("Menu",{
        init:function(p){
            this._super(p,{
                x:Q.width,
                w:Q.width/4,//h is set in setUpMenu()
                textNum:0,
                type:Q.SPRITE_NONE,
                fill:'#009933',
                spacing:10,
                textH:40,
                
                texts:[],
                otherTexts:[],
                greyed:[],
                cy:0
            });
        }
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
        }
    });
    
    Q.UI.Container.extend("MenuSelector",{
        init: function(p){
            this._super(p,{
                
            });
            this.p.startY=this.p.y;
        },
        move:function(curText,maxText,dir,cont){
            var newTextNum = curText+dir;
            //Check if we need to loop around
            if(newTextNum>maxText){newTextNum=0;}else if(newTextNum<0){newTextNum=maxText;};
            this.p.y=(this.p.startY-cont.p.spacing/2)+(this.p.h*newTextNum)+this.p.spacing/2;
            return newTextNum;
        },
        draw:function(ctx){
            ctx.beginPath();
            ctx.lineWidth="8";
            ctx.strokeStyle="#660033";
            ctx.rect(-this.p.w/2,-this.p.h/2,this.p.w,this.p.h);
            ctx.stroke();
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