Quintus.Interaction=function(Q){  
//An interaction (Talking in the story, and battle text in a battle)
Q.scene('interaction',function(stage){
    Q.interactionBox = stage.insert(new Q.InteractionBox({interaction:stage.options.interaction,stage:stage}));
    Q.interactionBox.cycleInteraction();
    Q.inputs['interact']=false;
});

Q.Sprite.extend("InteractionImage",{
    init:function(p){
        this._super(p,{
            cx:0,cy:0,
            x:0,y:0,
            w:300,h:450,
            type:Q.SPRITE_NONE
        });
        this.p.asset="/images/story/"+this.p.asset;
        this.p.x = this.p.pos==="left" ? this.p.w : Q.width-this.p.w;
        this.p.y-=this.p.h;
        this.p.flip = this.p.pos==="left" ? 'x' : false;
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
            speed:Q.state.get("textSpeed"),
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
        if(Q.state.get("autoScroll")){
            this.setAutoScroll();
        }
    },
    setAutoScroll:function(){
        clearInterval(this.p.interval);
        var interval = this.p.interval = setInterval(function(){
            Q.inputs['interact']=true;
            if(!Q.interactionBox){console.log("ded");clearInterval(interval);};
        },1000);
    },
    stopAutoScroll:function(){
        clearInterval(this.p.interval);
    },
    destroyText:function(){
        this.p.textDisplay.destroy();
    },
    destroyImage:function(){
        if(this.p.image){
            this.p.image.destroy();
        }
    },
    done:function(){
        for(i=0;i<this.children.length;i++){
            this.children[i].destroy();
        }
        this.destroy();
        this.stopAutoScroll();
        Q.interactionBox = false;
    },
    cycleInteraction:function(){
        if(this.p.interactionNum>=this.p.interaction.length){
            return this.done();
        }
        var stage = this.stage;
        var inter = this.p.interaction;
        var interNum = this.p.interactionNum;
        this.p.text = inter[interNum].text;
        if(inter[interNum].asset){
            this.p.image = this.insert(new Q.InteractionImage({asset:inter[interNum].asset,pos:inter[interNum].pos,y:this.p.h}));
        }
        this.cycleText();
    },
    cycleText:function(){
        if(this.p.textNum<this.p.text.length){
            function checkObject(text){
                if(Q._isObject(text)){
                    var obj = text.obj;
                    if(Q._isString(obj)){
                        if(obj[0]==="Q"){
                            obj = Q;
                        } else if(obj[0]==="e"){
                            obj = Q("Enemy",1).items.filter(function(o){
                                return o.p.playerId===obj;
                            })[0];
                        } else if(obj[0]==="a"){
                            obj = Q("Ally",1).items.filter(function(o){
                                return o.p.playerId===obj;
                            })[0];
                        } 
                    }
                    if(Q._isNumber(obj)){
                        obj = Q("Player",1).items.filter(function(o){
                            return o.p.playerId===obj;
                        })[0];
                    }
                    var func = text.func;
                    //If there's no obj, that means the obj killed itself
                    if(!obj){return Q.afterDir();}
                    obj[func](text.props);
                    return true;
                }
            }
            //Check if this text position has an object
            if(checkObject(this.p.text[this.p.textNum])){
                this.p.textNum++;
                this.cycleText();
                return;
            };
            //Show the text if it is text
            if(Q._isString(this.p.text[this.p.textNum])){
                this.p.textDisplay = this.insert(new Q.InteractionText({text:this.p.text[this.p.textNum],y:this.p.h/2}));
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
};