//Contains any object that the user can controll (I may even add the player itself here at some point)
var quintusServerPlayerObjects = function(Quintus) {
"use strict";
Quintus.ServerPlayerObjects = function(Q) {
    //START POINTER
    Q.component("placementControls",{
        added:function(){
            this.entity.on("inputsInteract",this,"interact");
            this.entity.on("inputsBack",this,"back");
        },
        //Check if the pointer is on top of a possible target
        interact:function(){
            var p = this.entity.p;
            //Get the location that the pointer has interacted with
            var pLoc = p.playerLocs.filter(function(loc){
                return loc[0]===p.loc[0]&&loc[1]===p.loc[1];
            })[0];
            if(pLoc){
                //If it's valid, check if there's a player already there
                var placedPlayers = p.user.p.saveData.playersPlacedAt;
                var placed = placedPlayers.filter(function(obj){
                    return obj.loc[0]===pLoc[0]&&obj.loc[1]===pLoc[1];
                })[0];
                //If there's no player at this position, place this player there
                if(!placed){
                    placedPlayers.push({playerId:p.user.p.playerId,loc:pLoc});
                    p.user.placePlayer(pLoc);
                    Q.sendPlayerEvent(p.user.p.file.name,{playerId:p.user.p.playerId,funcs:["placePlayer"],props:[pLoc]});
                }
            }
            
        },
        back:function(){
            
        }
    });
    //Added after the player has been placed and waiting for other users to place their players
    Q.component("freeControls",{
        added:function(){
            this.entity.on("inputsInteract",this,"interact");
            this.entity.on("inputsBack",this,"back");
        },
        interact:function(){
            
        },
        back:function(){
            var saveData = Q.state.get("files")[this.entity.p.user.p.file.name];
            saveData.removePlacedPlayer(this.entity.p.user.p.playerId);
            var p = this.entity.p;
            p.user.removeReady();
            Q.sendPlayerEvent(p.user.p.file.name,{playerId:p.user.p.playerId,funcs:["removeReady"],props:[]});
        }
    });
    Q.component("attackControls",{
        added:function(){
            this.entity.on("inputsInteract",this,"interact");
            this.entity.on("inputsBack",this,"back");
            this.entity.on("inputsMenu",this,"back");
        },
        //Check if the pointer is on top of a possible target
        //If there's a target, load the battle prediction menu (shows percent to hit and both player cards(main target only))
        interact:function(){
            var p = this.entity.p;
            if(p.target){
                //If we're attacking
                if(p.attack&&p.user.p.player.checkValidTarget(p.target,p.attack)){
                    p.user.loadAttackPrediction(p.attack,p.target);
                    Q.sendPlayerEvent(p.user.p.file.name,{playerId:p.user.p.playerId,funcs:["loadAttackPrediction"],props:[[p.attack.id,p.target.p.playerId]]});
                }
            }
        },
        //Load the player menu, delete the pointer, and center on the player
        back:function(){
            var p = this.entity.p;
            p.user.createPlayerMenu();
            Q.sendPlayerEvent(p.user.p.file.name,{playerId:p.user.p.playerId,funcs:["createPlayerMenu"],props:[]});
        }
    });
    Q.component("movementControls",{
        added:function(){
            this.entity.on("inputsInteract",this,"interact");
            this.entity.on("inputsBack",this,"back");
            this.entity.on("inputsMenu",this,"back");
        },
        //Check if the pointer is on top of a valid move location
        //If so, calculate the best path to that square and move the player to it
        //Also load the menu on arrival
        //Also grey out the move command
        interact:function(){
            var p = this.entity.p;
            var loc = p.loc;
            var movePaths = p.user.p.player.p.movePaths;
            for(var i=0;i<movePaths.length;i++){
                if(loc[0]===movePaths[i][movePaths[i].length-1].x&&loc[1]===movePaths[i][movePaths[i].length-1].y){
                    var cost = Q.getPathCost(movePaths[i]);
                    p.user.p.player.p.modStats.movement-=cost;
                    //The user will be in the menu on arrival
                    p.user.createPlayerMenu();
                    //Set the location of the player to the destination since he doesn't have to move to the location on the server
                    p.user.p.player.p.loc = [movePaths[i][movePaths[i].length-1].x,movePaths[i][movePaths[i].length-1].y];
                    //Move the player to this square using this path
                    Q.sendPlayerEvent(p.user.p.file.name,{playerId:p.user.p.playerId,funcs:["autoMove"],props:[movePaths[i]]});
                    return;
                }
            }
        },
        //Load the player menu, delete the pointer, and center on the player
        back:function(){
            var p = this.entity.p;
            p.user.createPlayerMenu();
            Q.sendPlayerEvent(p.user.p.file.name,{playerId:p.user.p.playerId,funcs:["createPlayerMenu"],props:[]});
        }
    });
    Q.component("selectionControls",{
        added:function(){
            this.entity.on("inputsInteract",this,"interact");
            this.entity.on("inputsBack",this,"back");
            this.entity.on("inputsMenu",this,"back");
        },
        //If an object is selected, allow for cycling on its player card
        interact:function(){
            
        },
        //Load the player menu, delete the pointer, and center on the player
        back:function(){
            var p = this.entity.p;
            p.user.createPlayerMenu();
            Q.sendPlayerEvent(p.user.p.file.name,{playerId:p.user.p.playerId,funcs:["createPlayerMenu"],props:[]});
        }
    });
    //The server pointer updates the location instantly when it accepts a user input
    //It does not move via an x/y position as it only needs to track the location of itself
    Q.Sprite.extend("Pointer",{
        init:function(p){
            this._super(p,{
                stepDistance:Q.tileH,
                stepDelay:0.3,
                stepWait:0
            });
            var p = this.p;
            p.target = Q.getTargetAt(p.loc[0],p.loc[1]);
        },
        checkValidLoc:function(loc){
            if(loc[0]<0||loc[1]<0||loc[0]>=Q.state.get("mapWidth")||loc[1]>=Q.state.get("mapHeight")){
                return false;
            }
            return loc;
        },
        checkInputs:function(input){
            var p = this.p;
            var newLoc = [p.loc[0],p.loc[1]];
            if(input['up']){
                newLoc[1]--;
            } else if(input['down']){
                newLoc[1]++;
            }
            if(input['right']){
                newLoc[0]++;
            } else if(input['left']){
                newLoc[0]--;
            }
            var loc = this.checkValidLoc(newLoc);
            if(loc&&(newLoc[0]!==p.loc[0]||newLoc[1]!==p.loc[1])){
                p.loc = newLoc;
                //Set the target to be whatever the pointer is hovering
                p.target = Q.getTargetAt(p.loc[0],p.loc[1]);
                //Sends an event to move confirm that the pointer has moved
                //Also moves the pointer on all other clients
                Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["confirmPointerInput"],props:[{loc:p.loc,time:input.time}]});
            }
        },
        processInputs:function(inputs){
            var p = this.p;
            //Don't process the inputs while moving
            if(!this.p.stepping){
                if(inputs['interact']){
                    this.trigger("inputsInteract");
                    return;
                } else if(inputs['back']){
                    this.trigger("inputsBack");
                    return;
                } else if(inputs['menu']){
                    this.trigger("inputsMenu");
                    return;
                }
                this.checkInputs(inputs);
                //console.log(this.p.loc)
            }
        },
        step:function(dt){
            var inputs = this.p.user.p.inputs;
            if(inputs.length){
                //Process the least recent input
                this.processInputs(inputs[0]);
                this.p.user.p.inputs.splice(0,1);
            }
        }
    });
    //END POINTER
    //START MENU
    //The menu that allows the player to do things on his turn
    Q.Sprite.extend("PlayerMenu",{
        init:function(p){
            this._super(p,{
                attackSelected:null,
                itemSelected:null
            });
            this.p.selectorNum = 0;
            this.p.menus = Q.state.get("menus").playerMenu; 
            this.initializeMenu();
        },
        initializeMenu:function(){
            this.p.menu = this.p.menus.initial;
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
            this.p.menu = {display:display,funcs:funcs,backFunc:"initializeMenu"};
        },
        //When the user selects an attack, close the menu and show the attack pointer
        selectAttack:function(attack){
            var pointer = this.p.user.createPointer(this.p.player.p.loc,{name:attack});
            pointer.p.attack = Q.state.get("attacks").filter(function(obj){return obj.id===attack;})[0];
            //Displays the attack as the name. Makes any object that is valid flash when hovering. Interacting loads the battle prediction menu.
            pointer.add("attackControls");
            Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["createPointer","createAttackGuide"],props:[{loc:this.p.player.p.loc,name:attack},attack]});
        },
        //Shows the movement grid, hides the menu, and creates the movement pointer
        move:function(){
            var pointer = this.p.user.createPointer(this.p.player.p.loc,{name:"Moving",move:this.p.player.p.modStats.movement});
            //Shows the guide on the client side. Also allows the user to select where he'd like to move
            pointer.add("movementControls");
            //guidePaths holds all possible movement paths. This means the path will not have to be calculated for movement this turn, unless the player moves.
            //This will allow us to authenticate where a player wants to move
            this.p.user.createMoveGuide(this.p.player.p.loc,this.p.player.p.modStats.movement);
            //Tell all clients to display this pointer and calculate the guide paths on each client.
            //This is probably more efficient than sending a huge array of paths to all clients
            Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["createPointer","createMoveGuide"],props:[{loc:this.p.player.p.loc,name:"Moving"}]});
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
            this.p.menu = {display:display,funcs:funcs,backFunc:"initializeMenu"};
        },
        //Load the use item text in the menu
        selectItem:function(item){
            if(item){
                this.p.itemSelected=item;
            }
            this.p.menu =  this.p.menus.selectItem;
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
            this.p.menu =  this.p.menus.askTossItem;
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
            this.p.player.setPos(this.p.player.p.startLoc);
            this.p.player.p.modStats.movement=this.p.player.p.stats.movement;
            this.p.selectorNum=0;
            this.initializeMenu();
        },
        //Allows the player to select a direction before ending the turn
        endTurn:function(){
            this.p.user.endTurnControls();
        },
        //Closes the menu and opens the selection pointer
        //The selection pointer hovers squares and provides information about that square
        exitMenu:function(){
            var pointer = this.p.user.createPointer(this.p.player.p.loc,{name:this.p.user.p.name});
            //Give the pointer selection controls, which are used to select objects and learn about them
            pointer.add("selectionControls");
            Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["createPointer"],props:[{loc:this.p.player.p.loc}]});
        },
        goForward:function(){
            this[this.p.menu.funcs[this.p.selectorNum]](this.p.menu.display[this.p.selectorNum]);
            this.p.selectorNum = 0;
        },
        goBack:function(){
            this[this.p.menu.backFunc]();
            this.p.selectorNum = 0;
        },
        moveUp:function(){
            if(this.p.selectorNum<0){
                this.p.selectorNum=this.p.menu.funcs.length-1;
            }
        },
        moveDown:function(){
            this.p.selectorNum++;
            if(this.p.selectorNum>this.p.menu.funcs.length-1){
                this.p.selectorNum=0;
            }  
        },
        processInputs:function(inputs){
            //console.log(this.p.selectorNum,this.p.menu.display[this.p.selectorNum])
            if(inputs['up']){
                this.p.selectorNum--;
                this.moveUp();
                Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["confirmMenuInput"],props:["moveUp"]});
            } else if(inputs['down']){
                this.moveDown();
                Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["confirmMenuInput"],props:["moveDown"]});
            } else if(inputs['interact']){
                this.goForward();
                if(!this.isDestroyed){
                    Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["confirmMenuInput"],props:["goForward"]});
                }
            } else if(inputs['back']){
                this.goBack();
                if(!this.isDestroyed){
                    Q.sendPlayerEvent(this.p.user.p.file.name,{playerId:this.p.user.p.playerId,funcs:["confirmMenuInput"],props:["goBack"]});
                }
            }
        },
        executeFunc:function(func,props){
            this[func](props);
        },
        step:function(dt){
            var inputs = this.p.user.p.inputs;
            if(inputs.length){
                //Process the least recent input
                this.processInputs(inputs[0]);
                this.p.user.p.inputs.splice(0,1);
            }
        }
    });
    //END MENU
    Q.Sprite.extend("AttackPrediction",{
        init:function(p){
            this._super(p,{});
        },
        processInputs:function(inputs){
            if(inputs['interact']){
                this.p.user.useAttack(this.p.attack,this.p.target);
            } else if(inputs['back']){
                
            }
        },
        step:function(dt){
            var inputs = this.p.user.p.inputs;
            if(inputs.length){
                //Process the least recent input
                this.processInputs(inputs[0]);
                this.p.user.p.inputs.splice(0,1);
            }
        }
    });
};
};
module.exports = quintusServerPlayerObjects;