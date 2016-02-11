Quintus.HUD = function(Q){
    //For rotating the player when placing him
    Q.component("dirControls",{
        added:function(){
            this.entity.on("step",this,"step");
        },
        step:function(dt){
            var p = this.entity.p;
            if(Q.inputs['up']){
              this.entity.playStand("up");  
            } else if(Q.inputs['right']){
                this.entity.playStand("right");
            } else if(Q.inputs['down']){
                this.entity.playStand("down");
            } else if(Q.inputs['left']){
                this.entity.playStand("left");
            }
        }
    });
    Q.component("pointerControls", {
        added: function() {
          var p = this.entity.p;

          if(!p.stepDistance) { p.stepDistance = Q.tileH; }
          if(!p.stepDelay) { p.stepDelay = 0.2; }

          p.stepWait = 0;
          this.entity.on("step",this,"step");
          p.destX=p.x;
          p.destY=p.y;
          p.flashObjs=[];
          p.viewNotSet=true;
          this.moveGuide(0,0);
          this.entity.on("unflash",this,"unFlashObjs");
        },
        flashObjs:function(guide){
            var obj = Q.getTarget(guide.p.x,guide.p.y);
            if(obj&&this.entity.validTarget(obj)){
                obj.flash();
                this.entity.p.flashObjs.push(obj);
            }
        },
        unFlashObjs:function(){
            if(this.entity.p.flashObjs.length>0){
                for(i=0;i<this.entity.p.flashObjs.length;i++){
                    this.entity.p.flashObjs[i].stopFlash();
                }
            }
        },
        moveGuide:function(dir,sd){
            var guide = this.entity.p.guide;
            this.unFlashObjs();
            this.entity.p.flashObjs=[];
            if(guide.length>0){
                for(i=0;i<guide.length;i++){
                    guide[i].p[dir]+=sd;
                    /*if(dir==='x'){
                        guide[i].p.loc[0]+=sd/this.entity.p.stepDistance;
                    } else if(dir==='y'){
                        guide[i].p.loc[1]+=sd/this.entity.p.stepDistance;
                    }*/
                    this.flashObjs(guide[i]);
                }
            }
            
        },
        step: function(dt) {
            if(Q.inputs['back']){this.unFlashObjs();};
            var p = this.entity.p,
                moved = false;
            p.stepWait -= dt;

            if(p.stepping) {
                p.x += p.diffX * dt / p.stepDelay;
                p.y += p.diffY * dt / p.stepDelay;
                if(this.entity.p.viewNotSet){
                    Q.addViewport(this.entity);
                    if(Q.stage(1).viewport.following.p.id===this.entity.p.id){
                        this.entity.p.viewNotSet=false;
                    }
                }
            }

            if(p.stepWait > 0) { return; }
            if(p.stepping) {
              p.x = p.destX;
              p.y = p.destY;
            }
            p.stepping = false;

            p.diffX = 0;
            p.diffY = 0;
            if(Q.inputs['left']&&p.loc[0]>p.rangeMinX) {
                p.diffX = -p.stepDistance;
                p.loc[0]--;
                this.moveGuide('x',-p.stepDistance);
            } else if(Q.inputs['right']&&p.loc[0]<p.rangeMaxX-1) {
                p.diffX = p.stepDistance;
                p.loc[0]++;
                this.moveGuide('x',p.stepDistance);
            }

            if(Q.inputs['up']&&p.loc[1]>p.rangeMinY) {
                p.diffY = -p.stepDistance;
                p.loc[1]--;
                this.moveGuide('y',-p.stepDistance);
            } else if(Q.inputs['down']&p.loc[1]<p.rangeMaxY-1) {
                p.diffY = p.stepDistance;
                p.loc[1]++;
                this.moveGuide('y',p.stepDistance);
            }
            if(p.diffY || p.diffX ) {
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;
                p.destX = p.x + p.diffX;
                p.destY = p.y + p.diffY;
                p.target=Q.getTargetAt(p.loc[0],p.loc[1]);
                if(p.target&&p.target.has("attacker")){
                    Q.stageScene("tophud",3,{target:p.target});
                } else {
                    if(Q.stage(3)){
                        Q.clearStage(3);
                    }
                }
                p.stepWait = p.stepDelay; 
            }

        }

      });
      
    Q.Sprite.extend("Pointer",{
        init: function(p) {
            this._super(p, {
                sheet:"objects",
                frame:4,
                type:Q.SPRITE_NONE,
                w:Q.tileH,h:Q.tileH,
                
                guide:[],
                movTiles:[],
                
                name:"Pointer"
            });
            var tileLayer = Q.TL;
            this.p.rangeMinX=0;
            this.p.rangeMaxX=tileLayer.p.tiles[0].length;
            this.p.rangeMinY=0;
            this.p.rangeMaxY=tileLayer.p.tiles.length;
            var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
            this.p.x = pos[0];
            this.p.y = pos[1];
            Q.addViewport(this);
            /*
            if(this.p.freeSelecting){
                Q.stageScene("tophud",3,{target:Q.getTargetAt(this.p.loc[0],this.p.loc[1])});
            }
            else if(this.p.attack){
                //this.p.player.getAttackRange(this.p.attack);
                //this.createAttackArea(this.p.player.getAttackArea(this.p.attack));
                Q.stageScene("tophud",3,{target:Q.getTargetAt(this.p.loc[0],this.p.loc[1])});
            } else {
                this.p.player.getRange();
            }*/
            this.add("pointerControls");
            
        },
        //This function displays the attack area and moves with the pointer
        createAttackArea:function(areas){
            for(i=0;i<areas.length;i++){
                this.p.guide.push(Q.stage(1).insert(new Q.PathBox({x:(this.p.loc[0]+areas[i][0])*Q.tileH+Q.tileH/2,y:(this.p.loc[1]+areas[i][1])*Q.tileH+Q.tileH/2,loc:this.p.loc}),false,true));
            }
        },
        clearGuide:function(){
            if(this.p.guide.length>0){
                for(i=0;i<this.p.guide.length;i++){
                    this.p.guide[i].destroy();
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
            this.stage.remove(this);
        },
        
        step:function(dt){
            if(Q.inputs['back']||Q.inputs['esc']){
                this.trigger("back");
                Q.inputs['back']=false;
                Q.inputs['esc']=false;
            }
            if(Q.inputs['menu']){
                this.trigger("menu");
                Q.inputs['menu']=false;
                return;
            }
            if(Q.inputs['interact']){
                this.trigger("interact");
                Q.inputs['interact']=false;
                return;
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
            var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
            this.p.x = pos[0];
            this.p.y = pos[1];
        }
    });
      
    //HUD
    Q.UI.Container.extend("HUDCont",{
        init: function(p){
            this._super(p,{
                cx:0,cy:0,
                x:Q.width-200,y:0,
                w:200,h:140,
                type:Q.SPRITE_NONE
            });
        },
        changeChar:function(){
            for(i=0;i<this.children.length;i++){
                this.children[i].changeCurChar();
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
    /*
    Q.UI.Container.extend("StatBar",{
        init: function(p){
            this._super(p,{
                radius:0,
                curStat:0,
                w:100,
                h:10,
                cx:0
            });
            if(this.p.isFill==="HP"){
                this.p.curChar.on("change.hp",this,"changeHpBar");
                this.p.curChar.on("change.maxHp",this,"changeHpBar");
                this.changeHpBar();
            }
        },
        changeCurChar:function(){
            //Turn off the previous curChar
            if(this.p.isFill==="HP"){
                this.p.curChar.off("change.hp",this,"changeHpBar");
                this.p.curChar.off("change.maxHp",this,"changeHpBar");

                this.p.curChar=Q.state.get("turnOrder")[Q.state.get("currentCharacterTurn")];
                this.changeHpBar();

                this.p.curChar.on("change.hp",this,"changeHpBar");
                this.p.curChar.on("change.maxHp",this,"changeHpBar");
            }
        },
        changeHpBar: function(){
            var hp = this.p.curChar.p.curHp;
            var maxHp = this.p.curChar.p.maxHp;
            var num = (hp/maxHp)*100;
            if(num<0){num=0;};
            this.p.w = num;
        }
    });
    
    Q.UI.Text.extend("StatValue",{
        init: function(p){
            this._super(p,{
                label:"",
                color:"white",
                size:16,
                outlineWidth:5,
                cx:0
            });
            this.getLabel();
        },
        
        changeCurChar:function(){
            this.p.curChar.off("change.curHp",this,"changeStat");
            this.p.curChar=Q.state.get("turnOrder")[Q.state.get("currentCharacterTurn")];
            this.getLabel();
        },
        
        getLabel: function(){
            this.p.label=this.p.curChar.p.curHp+"/"+this.p.curChar.p.maxHp;
            this.p.curChar.on("change.curHp",this,"changeStat");
        },

        changeStat: function(){
            var statValue = this.p.curChar.p.curHp;
            var maxStat = this.p.curChar.p.maxHp;
            this.p.label=statValue+"/"+maxStat;
        }
    });
    
    Q.UI.Text.extend("StatText",{
        init: function(p){
            this._super(p,{
                label:"",
                curStat:0,
                hudText:["HP","EXP"],
                color:"white",
                outlineWidth:5,
                size:20,
                cx:0
            });
            this.getLabel();
        },
        changeCurChar:function(){
            
        },

        getLabel: function(){
            this.p.label=this.p.hudText[this.p.curStat];
        }
    });*/
    
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
    
    Q.component("playerMenu",{
       extend:{
            useAttack:function(params){
                var player = params.player;
                this.showPointer(player,params.p);
            },
        
            showAttacks:function(p){
                this.destroyTexts();
                this.p.maxText = p.player.p.attacks.length-1;
                this.p.curText=0;
                for(i=0;i<p.player.p.attacks.length;i++){
                    this.p.texts.push(this.stage.insert(new Q.MenuText({x:this.p.x-this.p.w/2+this.p.spacing,y:this.p.y-this.p.h/2+this.p.spacing+(this.p.textH*i),label:p.player.p.attacks[i].name,func:"useAttack",params:["player",p.player.p.attacks[i]],align:"left"})));
                }

                this.createSel();
                if(this.p.path[this.p.path.length-1][0]!=="showAttacks"){
                    this.p.path.push(["showAttacks",p.player]);
                }
            },
            //When 'Move' is selected
            showPointer:function(player,attack){
                Q.clearStage(3);
                if(player&&attack){
                    Q.stage(1).insert(new Q.Pointer({player:player,attack:attack}));
                } else {
                    Q.stage(1).insert(new Q.Pointer());
                }
                
            },

            useItem:function(props){
                //TODO: Code the logic for using items in the RP global since it stores constants.
                //Make a variable for 'used' 'threw' etc
                var player = props.player;
                var text = [];
                text.push({playSound:"use_item.mp3"},player.p.name+" used "+props.p.p.name);
                var itemText = player.useItem(props.p);
                text.push(itemText);
                var endFuncs = {endTurn:[{Class:player.p.Class,id:player.p.playerId}]};
                text.push(endFuncs);
                Q.stageScene("bottomhud",3,{text:text,player:player});
            },
            askUseItem:function(props){
                this.destroyTexts();
                this.p.curText=0;
                this.p.maxText=1;
                this.p.texts.push(this.stage.insert(new Q.MenuText({x:this.p.x,y:this.p.y-this.p.h/2+this.p.spacing+(this.p.textH*0),label:"Use "+props.p.p.name+"?",func:"useItem",params:["player",props.p]})));
                this.p.texts.push(this.stage.insert(new Q.MenuText({x:this.p.x,y:this.p.y-this.p.h/2+this.p.spacing+(this.p.textH*1),label:"Go Back",func:"goBack",params:["player"]})));
                if(this.p.path[this.p.path.length-1][0]!=="askUseItem"){
                    this.p.path.push(["askUseItem",false,["player"]]);
                }
                this.createSel();
            },
            showItemList:function(p){
                if(this.p.texts.length>0){
                    for(i=0;i<this.p.texts.length;i++){
                        this.p.texts[i].destroy();
                    }
                    this.p.texts=[];
                }
                if(this.p.otherTexts.length>0){
                    for(i=0;i<this.p.otherTexts.length;i++){
                        this.p.otherTexts[i].destroy();
                    }
                    this.p.otherTexts=[];
                }
                if(this.p.maxText===-1){
                    this.p.texts.push(this.stage.insert(new Q.MenuText({x:this.p.x,y:this.p.y-this.p.h/2+this.p.spacing,label:"No Items",func:"showItems",params:["player",p]})));
                    return;
                }
                for(i=this.p.curItem;i<this.p.curItem+this.p.maxShowing;i++){
                    this.p.texts.push(this.stage.insert(new Q.MenuText({x:this.p.x-this.p.w/2+this.p.spacing,y:this.p.y-this.p.h/2+this.p.spacing+(this.p.textH*(i-this.p.curItem)),label:p.player.p.items[i].p.name,func:"askUseItem",params:["player",p.player.p.items[i]],align:'left'})));
                    this.p.otherTexts.push(this.stage.insert(new Q.MenuText({x:this.p.x+this.p.w/2-this.p.spacing,y:this.p.y-this.p.h/2+this.p.spacing+(this.p.textH*(i-this.p.curItem)),label:""+p.player.p.items[i].amount,align:'right'})));
                }
            },
            showItems:function(p){
                this.destroyTexts();
                this.p.maxText = p.player.p.items.length-1;
                this.p.curText=0;
                this.p.curItem=0;
                this.p.cyclingItems=true;
                this.p.maxShowing = 6;
                if(p.player.p.items.length<6){this.p.maxShowing=p.player.p.items.length;};
                this.showItemList(p);
                this.createSel();
                if(this.p.path[this.p.path.length-1][0]!=="showItems"){
                    this.p.path.push(["showItems",p]);
                }
            },

            showStatus:function(p){
                this.destroyTexts();
                this.stage.insert(new Q.Card({
                    user:p.player,
                    menu:this
                }));
                this.p.disabled=true;
                this.hide();
            },

            checkGround:function(p){
                p.player.checkGround();
            },
            resetMovement:function(p){
                //Only reset if the player can redo (he hasn't done anything that cannot be reversed just by moving back)
                if(p.player.p.canRedo){
                    p.player.p.x=p.player.p.w/2+p.player.p.startLocation[0]*Q.tileH;
                    p.player.p.y=p.player.p.h/2+p.player.p.startLocation[1]*Q.tileH;
                    p.player.p.loc = [(p.player.p.x-p.player.p.w/2)/Q.tileH,(p.player.p.y-p.player.p.h/2)/Q.tileH];
                    p.player.resetMove();
                    //this.exitMenu();
                } else {
                    //Play can't do that sound
                }
            },

            endTurn:function(p){
                p.player.endTurn();
            }
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
        init: function(p){
            this._super(p,{
                x:Q.width,
                w:Q.width/4,//h is set in setUpMenu()
                textNum:0,
                type:Q.SPRITE_NONE,
                canInteract:true,
                fill:'white',
                spacing:10,
                textH:40,
                
                curText:0,
                
                texts:[],
                otherTexts:[],
                greyed:[],
                //Fill this with the path the user has taken in the menu
                path:[["setUpMenu",false,[]]],
                
                disabled:false
            });
            this.p.y=10+this.p.h/2;
            var pos = Q.state.get("playerMenuPos");
            if(pos==="right"){this.p.x=Q.width-this.p.w/2-this.p.spacing;}
            
        },
        
        exitMenu:function(){
            Q.clearStage(3);
            this.stage.options.player.createFreePointer();
        },
        
        executeFunc:function(func,params){
            this[func](params);
        },
        
        setUpMenu:function(){
            //Define the player menu
            //The text is what is displayed
            //func is the function that is run on selection.
            var playerMenu=this.p.menuOpts;
            
            
            var keys = Object.keys(playerMenu);
            this.p.curText=0;
            //Set the max text which is how many text options there are. Used when cycling
            this.p.maxText = keys.length-1;
            var textH = this.p.textH;
            //size the menu to look nice
            this.p.h=keys.length*textH+this.p.spacing;
            for(i=0;i<keys.length;i++){
                var textColor = 'white';
                //Create a text UI for each option and push it to the texts array.
                this.p.texts.push(this.stage.insert(new Q.MenuText({x:this.p.x,y:this.p.y-this.p.h/2+this.p.spacing+(textH*i),label:playerMenu[keys[i]].text,func:playerMenu[keys[i]].func,params:playerMenu[keys[i]].params,color:textColor})));
            }
            this.createSel();
            if(this.p.path[this.p.path.length-1][0]!=="setUpMenu"){
                this.p.path.push(["setUpMenu",false]);
            }
        },
        
        createSel:function(){
            this.p.menuSel = this.stage.insert(new Q.MenuSelector({x:this.p.x,y:(this.p.y-this.p.h/2)+this.p.textH/2+this.p.spacing/2,w:this.p.w-this.p.spacing,h:this.p.textH,spacing:this.p.spacing}));
        },
        getParams:function(paramsArrOrObj){
            var params = {p:{}};
            if(Q._isArray(paramsArrOrObj)){
                for(i=0;i<paramsArrOrObj.length;i++){
                    if(Q._isString(paramsArrOrObj[i])){
                        var param = paramsArrOrObj[i];
                        params[param]=this.p[param];
                    } else {
                        params.p=paramsArrOrObj[i];
                    }
                }
            } else {
                params.p=paramsArrOrObj;
            }
            return params;
        },
        
        goBack:function(p){
            this.destroyTexts();
            this.p.path.splice(this.p.path.length-1,1);
            if(this.p.path.length===0){
                this.exitMenu();
                return;
            };
            var func = this.p.path[this.p.path.length-1][0];
            if(!Q._isObject(p)){
                var params = this.getParams(p);
            } else {
                var params = p;
            }
            this[func](params);
        },
        
        destroyTexts:function(){
            if(this.p.texts.length>0){
                for(i=0;i<this.p.texts.length;i++){
                    this.p.texts[i].destroy();
                }
                this.p.texts=[];
            }
            if(this.p.otherTexts.length>0){
                for(i=0;i<this.p.otherTexts.length;i++){
                    this.p.otherTexts[i].destroy();
                }
                this.p.otherTexts=[];
            }
            this.p.menuSel.destroy();
        },
        
        step:function(dt){
            if(!this.p.disabled){
                if(Q.inputs['up']){
                    if(this.p.cyclingItems){
                        if(this.p.curItem>0){
                            if(this.p.curText>this.p.maxShowing-5){
                                this.p.curText = this.p.menuSel.move(this.p.curText,this.p.maxText,-1,this);
                            } else {
                                this.p.curItem--;
                            }
                        } else {
                            if(this.p.curText>0){
                                this.p.curText = this.p.menuSel.move(this.p.curText,this.p.maxText,-1,this);
                            }
                        }
                        this.showItemList(this.p);
                    } else {
                        this.p.curText = this.p.menuSel.move(this.p.curText,this.p.maxText,-1,this);
                    }
                    Q.inputs['up']=false;
                } else if(Q.inputs['down']){
                    if(this.p.cyclingItems){
                        if(this.p.curItem<this.p.maxText-this.p.maxShowing){
                            if(this.p.curText<this.p.maxShowing-2){
                                this.p.curText = this.p.menuSel.move(this.p.curText,this.p.maxText,1,this);
                            } else {
                                this.p.curItem++;
                            }
                        } else {
                            if(this.p.curText+1<this.p.maxShowing){
                                this.p.curText = this.p.menuSel.move(this.p.curText,this.p.maxText,1,this);
                            }
                        }
                        this.showItemList(this.p);
                    } else {
                        this.p.curText = this.p.menuSel.move(this.p.curText,this.p.maxText,1,this);
                    }
                    
                    Q.inputs['down']=false;
                }
                if(Q.inputs['interact']){
                    if(this.p.cyclingItems){this.p.cyclingItems=false;};
                    var params = this.getParams(this.p.texts[this.p.curText].p.params);
                    this.executeFunc(this.p.texts[this.p.curText].p.func,params);
                    Q.inputs['interact']=false;
                }
                if(Q.inputs['back']){
                    if(this.p.cyclingItems){this.p.cyclingItems=false;};
                    this.goBack(["player"]);
                    Q.inputs['back']=false;
                }
                if(Q.inputs['esc']){
                    this.exitMenu();
                    Q.inputs['esc']=false;
                }
            }
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
            ctx.lineWidth="6";
            ctx.strokeStyle="red";
            ctx.rect(-this.p.w/2,-this.p.h/2,this.p.w,this.p.h);
            ctx.stroke();
        }
    });
    
    
    Q.UI.Container.extend("Card",{
        init: function(p) {
            this._super(p, {

                cardPos:1,
                attackNum:0,
                border:5,
                x:0,y:0,
                w:400,
                h:250,
                cx:0,cy:0,
                fill:"yellow"
            });
            this.p.x=Q.width-this.p.w-10;
            this.p.y=10;
            this.p.data=this.p.user.p ? this.p.user.p : this.p.user;
            var t = this;
            setTimeout(function(){
                t.setup();
            },1);
        },

        showStats:function(){
            var data = this.p.data;
            var imageCont = this.insert(new Q.UI.Container({
                x:0,
                y:0,
                w:this.p.w/3-this.p.border/2,
                h:this.p.h,
                radius:0
            }));
            imageCont.insert(new Q.UI.Text({
                label:data.gender+" Lv"+data.level,
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
                sheet:"Professor",frame:0,
                sprite:"player"
            }));
            image.add("animation");
            image.play("standingdown");
            
            for(i=0;i<data.attacks.length;i++){
                 var attack = RP.moves[data.attacks[i][0]];
                 imageCont.insert(new Q.UI.Text({
                     label:attack.name,
                     x:imageCont.p.w/2+imageCont.p.border/2,y:imageCont.p.h/2+this.p.border/2+i*20,
                     size:16,
                     cx:0,cy:0,
                     family:"Monaco"
                 }));
             } 
            
            imageCont.insert(new Q.UI.Text({
                label:RP.abilities[data.abilities[0]].name,
                x:imageCont.p.w/2+imageCont.p.border/2,y:imageCont.p.h/1.15+this.p.border/2,
                size:16,
                cx:0,cy:0,
                family:"Monaco"
            }));
            
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
                "Offense",
                "Defense",
                "Speed",
                "Mind",
                "Dexterity",
                "Strength",
                "Stamina",
                "Exp. Points",
                "Next Lv."
            ];
            var statValues = [
                data.className,
                data.curHp+"/"+data.maxHp,
                data.mod_ofn ? data.mod_ofn : data.ofn+" ("+data.ofn+")",
                data.mod_dfn? data.mod_dfn : data.dfn+" ("+data.dfn+")",
                data.mod_spd? data.mod_spd : data.spd+" ("+data.spd+")",
                data.stats.sp.mind,
                data.stats.sp.dexterity,
                data.stats.sp.strength,
                data.stats.sp.stamina,
                data.exp,
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

        showAttacks:function(num){
            var attack = RP.moves[this.p.user.p.attacks[num][0]];
            var attackCont = this.insert(new Q.UI.Container({
                x:this.p.border,
                y:0,
                w:this.p.w-this.p.border*2,
                h:this.p.h-this.p.border,
                cx:0,cy:0,
                radius:0
            }));
            var stats =[
                "Attack Name",
                "Power",
                "Accuracy",
                "Type",
                "Category",
                "Area",
                "Range"
            ];
            var keys = [
                "name",
                "power",
                "accuracy",
                "type",
                "cat",
                "area",
                "range"
            ];
            for(j=0;j<stats.length;j++){
                attackCont.insert(new Q.UI.Container({
                    fill:"#FFF",
                    border:1,
                    x:0,y:6+j*20,
                    w:attackCont.p.w,h:18,
                    cx:0,cy:0
                }));
                attackCont.insert(new Q.UI.Text({
                    label:stats[j],
                    align:'left',
                    x:10,y:8+j*20,
                    size:14,
                    cx:0,cy:0
                }));
                attackCont.insert(new Q.UI.Text({
                    label:""+attack[keys[j]],
                    align:'right',
                    x:attackCont.p.w-10,y:8+j*20,
                    size:14,
                    cx:0,cy:0
                }));
            }
            var text = Q.chopText(attack.desc,attackCont);
            var descCont = attackCont.insert(new Q.UI.Container({
                fill:"#FFF",
                border:1,
                x:0,y:8+j*20,
                w:attackCont.p.w,h:76,
                cx:0,cy:0
            }));

            descCont.insert(new Q.UI.Text({
                label:text,
                align:'left',
                x:10,y:0,
                size:14,
                cx:0,cy:0
            }));
        },

        showAbility:function(){
            var ability = RP.abilities[this.p.data.abilities[0]];
            var abilityCont = this.insert(new Q.UI.Container({
                x:this.p.border,
                y:this.p.border,
                w:this.p.w-this.p.border*2,
                h:this.p.h-this.p.border,
                cx:0,cy:0,
                radius:0
            }));

            abilityCont.insert(new Q.UI.Container({
                fill:"#FFF",
                border:1,
                x:0,y:10,
                w:abilityCont.p.w,h:18,
                cx:0,cy:0
            }));
            abilityCont.insert(new Q.UI.Text({
                label:ability.name,
                align:'left',
                x:10,y:12,
                size:14,
                cx:0,cy:0
            }));
            var text = Q.chopText(ability.desc,abilityCont);
            abilityCont.insert(new Q.UI.Container({
                fill:"#FFF",
                border:1,
                x:0,y:50,
                w:abilityCont.p.w,h:abilityCont.p.h/1.4,
                cx:0,cy:0
            }));
            abilityCont.insert(new Q.UI.Text({
                label:text,
                align:'left',
                x:10,y:60,
                size:14,
                cx:0,cy:0
            }));
        },

        showItems:function(){
            this.p.startNum = 0;
            this.showNextItems(this.p.startNum,this);
        },
        showNextItems:function(startNum,t){
            var itemsCont = t.p.itemsCont = t.insert(new Q.UI.Container({
                x:t.p.border,
                y:t.p.border,
                w:t.p.w-t.p.border*2,
                h:t.p.h-t.p.border,
                radius:0
            }));
            var data = this.p.data;
            var maxItems=12;
            for(i=0;i<data.items.length;i++){
                if(maxItems-i>0){
                    itemsCont.insert(new Q.UI.Container({
                        fill:"#FFF",
                        border:1,
                        x:0,y:1+i*20,
                        w:itemsCont.p.w,h:18,
                        cx:0,cy:0
                    }));
                    itemsCont.insert(new Q.UI.Text({
                        label:data.items[i+startNum].p.name,
                        align:'left',
                        x:10,y:3+i*20,
                        size:14,
                        cx:0,cy:0
                    }));
                    itemsCont.insert(new Q.UI.Text({
                        label:""+data.items[i+startNum].amount,
                        align:'right',
                        x:itemsCont.p.w-10,y:3+i*20,
                        size:14,
                        cx:0,cy:0
                    }));
                } else {
                    if(startNum<data.items.length-maxItems){
                        t.p.canToggleDown=true;
                    } else {
                        t.p.canToggleDown=false;
                    }
                    if(startNum>0){
                        t.p.canToggleUp=true;
                    } else {
                        t.p.canToggleUp=false;
                    }
                    return;
                }
            }
        },
        
        setup:function(){
            this.showStats();
        },
        
        destroyChildren:function(){
            for(i=0;i<this.children.length;i++){
                this.children[i].destroy();
            }
        },

        cycleCard:function(){
            this.destroyChildren();
            if(this.p.cardPos>3){
                this.p.cardPos=0;
            }
            switch(this.p.cardPos){
                case 0:
                    this.p.cardPos++;
                    this.showStats();
                    break;
                case 1:
                    this.showAttacks(this.p.attackNum);
                    this.p.attackNum++;
                    if(this.p.attackNum>this.p.data.attacks.length-1){
                        this.p.cardPos++;
                        this.p.attackNum=0;
                    }
                    break;
                case 2:
                    this.p.cardPos++;
                    this.showAbility();
                    break;
                case 3:
                    this.p.cardPos++;
                    if(this.p.data.items!==undefined&&this.p.data.items.length>0){
                        this.showItems();
                    } else {
                        this.cycleCard();
                    }
                    break;
            }
        },
        step:function(dt){
            if(Q.inputs['interact']){
                this.cycleCard();
                Q.inputs['interact']=false;
            }
            if(Q.inputs['back']||Q.inputs['esc']){
                if(this.p.menu){
                    this.p.menu.p.disabled=false;
                    this.p.menu.show();
                    this.p.menu.setUpMenu();
                }
                this.destroy();
                Q.inputs['back']=false;
                Q.inputs['esc']=false;
            }
            
            if(this.p.canToggleDown&&Q.inputs['down']){
                this.p.startNum++;
                this.p.itemsCont.destroy();
                if(this.p.itemsCont.up){
                    this.p.itemsCont.up.destroy();
                }
                if(this.p.itemsCont.down){
                    this.p.itemsCont.down.destroy();
                }
                this.showNextItems(this.p.startNum,this);
                Q.inputs['down']=false;
            }
            if(this.p.canToggleUp&&Q.inputs['up']){
                this.p.startNum--;
                this.p.itemsCont.destroy();
                if(this.p.itemsCont.up){
                    this.p.itemsCont.up.destroy();
                }
                if(this.p.itemsCont.down){
                    this.p.itemsCont.down.destroy();
                }
                this.showNextItems(this.p.startNum,this);
                Q.inputs['up']=false;
            }
        }
    });
    
    
    Q.getNextLevelEXP=function(level){
        if(RP.expNeeded[level]!==undefined){
            return RP.expNeeded[level];
        } else {
            return "-";
        }
    };

    

    Q.getAttack=function(atk){
        var attack = RP.moves[atk[0]];
        return attack;
    };
    
    Q.chopText=function(txt,cont){
        var text = "";
        var tNum = 0;
        var charW = 8.8;
        var maxChars = cont.p.w/charW;
        var line = 0;
        for(i=0;i<txt.length;i++){
            if(tNum<maxChars){
                text+=txt[i];
            } else {
                line++;
                tNum=0;
                text+=txt[i];
                text+="\n";
            }
            tNum++;
        }
        return text;
    };
    Q.sceneAnimations = {
        doneBattle:function(stage){
            var box = stage.insert(new Q.Sprite({
                x:200,y:200,
                w:200,h:150,
                asset:"/images/battle_complete.png",
                type:Q.SPRITE_NONE,
                scale:0.1
            }));
            box.add('tween');
            box.animate({ x: 500, y:  400, scale:1 }, 1, Q.Easing.Quadratic.InOut)
                .chain({ angle: 360 },0.25)
                .chain({ angle: 720 },0.25) 
                .chain({ angle: 0 },0.25) 
                .chain({  x: 800, y:  200, scale:0.1  }, 1, Q.Easing.Quadratic.InOut,{callback:function(){Q.clearStage(4);}});
        },
        waitingBattle:function(stage){
            var box = stage.insert(new Q.Sprite({
                x:200,y:200,
                w:200,h:150,
                asset:"/images/battle_waiting.png",
                type:Q.SPRITE_NONE,
                scale:0.1
            }));
            box.add('tween');
            function animateBox(b){
                b.animate({ x: 500, y:  400, scale:1 }, 1, Q.Easing.Quadratic.InOut)
                    .chain({ angle: 360 },0.25)
                    .chain({ angle: 720 },0.25) 
                    .chain({ angle: 0 },0.25) 
                    .chain({  x: 800, y:  200, scale:0.1  }, 1, Q.Easing.Quadratic.InOut,{callback:function(){animateBox(b);}});
            }
            animateBox(box);
        },
        fadeIn:function(stage){
            var fader = stage.insert(new Q.UI.Container({
                x:0,y:0,
                cx:0,cy:0,
                w:Q.width,h:Q.height,
                fill:"black",
                type:Q.SPRITE_NONE
            }));
            fader.add("tween");
            //speed is a number in seconds for how long the fade in lasts
            fader.animate({opacity:0},stage.options.speed||1,Q.Easing.Out,{callback:function(){Q.clearStage(4);}});
        },
        fadeOut:function(stage){
            var fader = stage.insert(new Q.UI.Container({
                x:0,y:0,
                cx:0,cy:0,
                w:Q.width,h:Q.height,
                fill:"black",
                type:Q.SPRITE_NONE,
                opacity:0
            }));
            fader.add("tween");
            //speed is a number in seconds for how long the fade in lasts
            fader.animate({opacity:0},stage.options.speed||1,Q.Easing.Out);
        },
        dimToNight:function(stage){
            var fader = stage.insert(new Q.UI.Container({
                x:0,y:0,
                cx:0,cy:0,
                w:Q.width,h:Q.height,
                fill:"black",
                type:Q.SPRITE_NONE,
                opacity:0
            }));
            fader.add("tween");
            //speed is a number in seconds for how long the fade in lasts
            fader.animate({opacity:0.3},stage.options.speed||1,Q.Easing.Out);
        },
        getItem:function(stage){
            var box = stage.insert(new Q.UI.Container({
                x:Q.width/2,y:Q.height/2,
                w:200,h:150,
                fill:"#234073",
                type:Q.SPRITE_NONE,
                scale:0.1
            }));
            box.insert(new Q.UI.Text({
                x:0,
                y:0,
                type:Q.SPRITE_NONE,
                color:"white",
                size:30,
                outlineWidth:3,
                label:stage.options.item.item+" x"+stage.options.item.amount
            }));
            box.add('tween');
            box.fit(10,10);
            box.animate({scale:1 }, 1, Q.Easing.Quadratic.InOut)
                .chain({ angle: 360 },1)
                .chain({opacity:0.1}, 0.5, Q.Easing.Quadratic.InOut,{callback:function(){Q.clearStage(4);}});
        },
        battleStart:function(stage){
            //Flasher
            var fader = stage.insert(new Q.UI.Container({
                x:0,y:0,
                cx:0,cy:0,
                w:Q.width,h:Q.height,
                fill:"yellow",
                type:Q.SPRITE_NONE
            }));
            fader.add("tween");
            
            var box = stage.insert(new Q.Sprite({
                x:Q.width/2,y:Q.height/2,
                asset:"/images/battle_start.png",
                type:Q.SPRITE_NONE
            }));
            box.add("tween")
            var gradient = fader.insert(new Q.UI.Container({
                col1:"yellow",
                col2:"orange",
                x:0,y:0,
                w:0, h:0,
                cx:0, cy:0, radius:10
            }));
            gradient.draw=function(ctx) {
                var grd=ctx.createLinearGradient(0,0,fader.p.w/2,fader.p.h/2);
                grd.addColorStop(0,this.p.col1);
                grd.addColorStop(1,this.p.col2);
                ctx.fillStyle=grd;
                ctx.fill();
            };
            gradient.add("tween");
            setTimeout(function(){
                fader.animate({opacity:0},1,Q.Easing.Out,{callback:function(){Q.clearStage(4);}});
                box.animate({opacity:0},1,Q.Easing.Out,{callback:function(){Q.clearStage(4);}});
                gradient.animate({opacity:0},1,Q.Easing.Out,{callback:function(){Q.clearStage(4);}});
            },500);
        }
    };
    Q.scene('customAnimate',function(stage){
        var anims = Q.sceneAnimations;
        switch(stage.options.anim){
            case "doneBattle":
                anims.doneBattle(stage);
                break;
            case "waitingBattle":
                anims.waitingBattle(stage);
                break;
            case "getItem":
                anims.getItem(stage);
                break;
            case "fadeIn":
                anims.fadeIn(stage);
                break;
            //Goes completely black
            case "fadeOut":
                anims.fadeOut(stage);
                break;
            case "dimToNight":
                anims.dimToNight(stage);
                break;
            case "battleStart":
                anims.battleStart(stage);
                break;
        }
    });
    Q.scene("lobby",function(stage){
        var box = stage.insert(new Q.UI.Container({
            x:Q.width/2,y:Q.height/4,
            w:200,h:0,
            fill:"#234073",
            type:Q.SPRITE_NONE
        }));
        box.insertPlayerText = function(name){
            box.insert(new Q.UI.Text({
                x:0,
                y:30+(box.children.length*28),
                cy:0,
                type:Q.SPRITE_NONE,
                color:"white",
                size:22,
                outlineWidth:3,
                label:name
            }));
            box.p.h=50+(box.children.length*28);
        };
        box.insert(new Q.UI.Text({
            x:0,
            y:box.p.h/2+10,
            type:Q.SPRITE_NONE,
            color:"white",
            size:30,
            outlineWidth:3,
            label:"Player List"
        }));
        var players = Q.state.get("players");
        for(i=0;i<players.length;i++){
            box.insertPlayerText(players[i].name,i);
        }
        if(stage.options.host){
            var startButton = stage.insert(new Q.UI.Button({
                x:Q.width/2,y:Q.height/4-60,
                w:120,h:50,
                fill:"#234073"
            },function(){
                Q.state.get("playerConnection").socket.emit("startGame");
            }));
            startButton.insert(new Q.UI.Text({
                x:0,
                y:-startButton.p.h/2+11,
                type:Q.SPRITE_NONE,
                color:"white",
                size:22,
                outlineWidth:3,
                label:"Start!"
            }));
        } else {
            var waitingCont = stage.insert(new Q.UI.Container({
                x:Q.width/2,y:Q.height/4-60,
                w:120,h:50,
                fill:"#234073",
                type:Q.SPRITE_NONE
            }));
            waitingCont.insert(new Q.UI.Text({
                x:0,
                y:-waitingCont.p.h/2+11,
                type:Q.SPRITE_NONE,
                color:"white",
                size:22,
                outlineWidth:3,
                label:"Waiting"
            }));
        }
        Q.state.on("change.players",function(){
            box.insertPlayerText(Q.state.get("players")[Q.state.get("players").length-1].name);
        });
    })
};