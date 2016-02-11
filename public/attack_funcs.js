Quintus.AttackFuncs=function(Q){  
    RP.attackFuncs={
        //Calculate extra damage from type advantage/disadvantage
        getTypeModifiers:function(target,attack){
            var modifier = 1;
            return modifier;
            //If the attack doesn't affect, lower the modifier by 100 and then check later to see if it's less than or equal to 0.
            //First, loop through both types of the target and then compare that to the attack type
            //DONE
            //Normal, Fighting, Flying, Water, Bug, Poison
            //http://bulbapedia.bulbagarden.net/wiki/Type
            for(i=0;i<target.p.types.length;i++){
                switch(target.p.types[i]){
                    case "Normal":
                        switch(attack.type){
                            case "Fighting":
                                modifier*=2;
                                break;
                            case "Ghost":
                                modifier=0;
                                break;
                        }
                        break;
                    case "Fighting":
                        switch(attack.type){
                            case "Flying":
                                modifier*=2;
                                break;
                            case "Rock":
                                modifier*=0.5;
                                break;
                            case "Bug":
                                modifier*=0.5;
                                break;
                            case "Psychic":
                                modifier*=2;
                                break;
                            case "Dark":
                                modifier*=0.5;
                                break;
                            case "Fairy":
                                modifier*=2;
                                break;
                        }
                        break;
                    case "Flying":
                        switch(attack.type){
                            case "Fighting":
                                modifier*=0.5;
                                break;
                            case "Ground":
                                modifier=0;
                                break;
                            case "Rock":
                                modifier*=2;
                                break;
                            case "Bug":
                                modifier*=0.5;
                                break;
                            case "Grass":
                                modifier*=0.5;
                                break;
                            case "Electric":
                                modifier*=2;
                                break;
                            case "Ice":
                                modifier*=2;
                                break;
                        }
                        break;
                    case "Poison":
                        switch(attack.type){
                            case "Fighting":
                                modifier*=0.5;
                                break;
                            case "Poison":
                                modifier*=0.5;
                                break;
                            case "Ground":
                                modifier*=2;
                                break;
                                break;
                            case "Bug":
                                modifier*=0.5;
                                break;
                                break;
                            case "Grass":
                                modifier*=0.5;
                                break;
                            case "Fairy":
                                modifier*=0.5;
                                break;
                        }
                        break;
                    case "Ground":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Rock":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Bug":
                        switch(attack.type){
                            case "Fighting":
                                modifier*=0.5;
                                break;
                            case "Flying":
                                modifier*=2;
                                break;
                            case "Ground":
                                modifier*=0.5;
                                break;
                            case "Rock":
                                modifier*=2;
                                break;
                            case "Fire":
                                modifier*=2;
                                break;
                            case "Grass":
                                modifier*=0.5;
                                break;
                        }
                        break;
                    case "Ghost":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Steel":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Fire":
                        switch(attack.type){
                            case "Ground":
                                modifier+=2;
                                break;
                            case "Rock":
                                modifier+=2;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=2;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Water":
                        switch(attack.type){
                            case "Steel":
                                modifier*=0.5;
                                break;
                            case "Fire":
                                modifier*=0.5;
                                break;
                            case "Water":
                                modifier*=0.5;
                                break;
                            case "Grass":
                                modifier*=2;
                                break;
                            case "Electric":
                                modifier*=2;
                                break;
                            case "Ice":
                                modifier*=0.5;
                                break;
                        }
                        break;
                    case "Grass":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Electric":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Psychic":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Ice":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Dragon":
                        switch(attack.type){
                            case "Fire":
                                modifier*=0.5;
                                break;
                            case "Water":
                                modifier*=0.5;
                                break;
                            case "Grass":
                                modifier*=0.5;
                                break;
                            case "Electric":
                                modifier*=0.5;
                                break;
                            case "Ice":
                                modifier*=2;
                                break;
                            case "Dragon":
                                modifier*=2;
                                break;
                            case "Fairy":
                                modifier*=2;
                                break;
                        }
                        break;
                    case "Dark":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                    case "Fairy":
                        switch(attack.type){
                            case "Normal":
                                modifier+=0.5;
                                break;
                            case "Fighting":
                                modifier+=0.5;
                                break;
                            case "Flying":
                                modifier+=0.5;
                                break;
                            case "Poison":
                                modifier+=0.5;
                                break;
                            case "Ground":
                                modifier+=0.5;
                                break;
                            case "Rock":
                                modifier+=0.5;
                                break;
                            case "Bug":
                                modifier+=0.5;
                                break;
                            case "Ghost":
                                modifier+=0.5;
                                break;
                            case "Steel":
                                modifier+=0.5;
                                break;
                            case "Fire":
                                modifier+=0.5;
                                break;
                            case "Water":
                                modifier+=0.5;
                                break;
                            case "Grass":
                                modifier+=0.5;
                                break;
                            case "Electric":
                                modifier+=0.5;
                                break;
                            case "Psychic":
                                modifier+=0.5;
                                break;
                            case "Ice":
                                modifier+=0.5;
                                break;
                            case "Dragon":
                                modifier+=0.5;
                                break;
                            case "Dark":
                                modifier+=0.5;
                                break;
                            case "Fairy":
                                modifier+=0.5;
                                break;
                        }
                        break;
                        
                }
            }
            return modifier;
        },
        //See if the attack has STAB
        getSTAB:function(user,attack){
            var stab = 1;
            return stab;
            for(i=0;i<user.p.types.length;i++){
                //If the attack is the same type as one of the user's types
                if(attack.type===user.p.types[i]){
                    stab=1.3;
                }
            }
            return stab;
        },
        getOther:function(){
            
        },
        //Calculate total damage dealt with an attack
        calculateDamage:function(user,target,attack,facingValue){
            var offence = user.p.mod_ofn;
            var defense = target.p.mod_dfn;
            var baseDamage = attack.power;
            var modifier = 1;
            var modText={text:[]};
            //TODO Need to include ability into STAB
            var stab = RP.attackFuncs.getSTAB(user,attack);
            var typeMod = RP.attackFuncs.getTypeModifiers(target,attack);
            switch(true){
                case typeMod===0:
                    //Doesn't affect
                    modText.text.push(attack.name+" doesn't affect "+target.p.name+"...");
                    var noEffect=true;
                    break;
                case typeMod<1:
                    //Not very effective
                    modText.text.push(attack.name+" is not very effective against "+target.p.name+"...");
                    break;
                case typeMod>1:
                    //Super effective
                    modText.text.push(attack.name+" is super effective against "+target.p.name+"!");
                    break;
                default:
                    //Normal effective
                    break;
            }
            //Check for crit
            var doCrit = Math.floor(Math.random()*20);
            //We crit!
            var crit=1;
            if(doCrit<=2){
                crit=1.5;
                modText.text.push("Critical hit!");
            }
            //other is Weather, Held items, Stat boosts, etc...
            var other = 1;
            //RP.attackFuncs.getOther();
            var rand = (85+Math.ceil(Math.random()*15))/100;
            modifier = stab*typeMod*crit*other*rand;
            
            
            var damage = (((2*user.p.level+10)/250)*(offence/defense)*baseDamage+2)*modifier;
            //Divide in the direction the participants are facing.
            damage/=facingValue;
            //Make sure we do at least 1 damage, unless it doesn't affect
            if(damage<1&&!noEffect){damage=1;};
            return {damage:Math.round(damage),modText:modText};
        },
        
        effects:{
            stat:function(props,target,user){
                var keys = Object.keys(props);
                var text=[];
                for(ii=0;ii<keys.length;ii++){
                    target.p.statsModified[keys[ii]]+=props[keys[ii]];
                    if(target.p.statsModified[keys[ii]]>0){
                        target.p["mod_"+keys[ii]]=Math.round(target.p[keys[ii]]*((2+target.p.statsModified[keys[ii]])/2));
                    } else if(target.p.statsModified[keys[ii]]<0){
                        target.p["mod_"+keys[ii]]=Math.round(target.p[keys[ii]]*(2/Math.abs(target.p.statsModified[keys[ii]]-2)));
                    }
                    text.push(target.p.name+"'s "+keys[ii]+" was decreased to "+target.p["mod_"+keys[ii]]+".");
                }
                return text;
            },
            buff:function(buff,target,user){
                var text=[];
                //Add the buff to the target
                switch(buff){
                    //BUFFS
                    //covers endure, detect
                    case "braced":
                        target.p.buffs.push({name:buff,turns:1});
                        text.push(target.p.name+" braced for impact!");
                        break;
                    //DEBUFFS
                    //covers foresight, lock on
                    case "identified":
                        target.p.debuffs.push({name:buff,turns:5});
                        text.push(target.p.name+" was identified.");
                        break;
                    //covers bind, wrap, 
                    case "bind":
                        //Between 2 and 5
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand,boundBy:user});
                        user.p.buffs.push({name:"binding",turns:rand,target:target});
                        text.push(target.p.name+" was bound.");
                        break;
                    case "poisoned":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was poisoned.");
                        break;
                    //toxic
                    case "toxic":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was badly poisoned.");
                        break;
                    //Leech seed
                    case "seeded":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was seeded.");
                        break;
                    case "paralyzed":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was paralyzed.");
                        break;
                    case "burned":
                        target.p.debuffs.push({name:buff});
                        text.push(target.p.name+" was burned.");
                        break
                    case "confused":
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand});
                        text.push(target.p.name+" was confused.");
                        break;
                    case "frozen":
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand});
                        text.push(target.p.name+" was frozen.");
                        break;
                    case "attracted":
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand});
                        user.p.buffs.push({name:"attracting",turns:rand,target:target});
                        text.push(target.p.name+" was infatuated.");
                        break;
                    case "taunted":
                        var rand = 2+Math.floor(Math.random()*4);
                        target.p.debuffs.push({name:buff,turns:rand});
                        text.push(target.p.name+" was taunted.");
                        break;
                }
                return text;
        
            }
        }
    };
    
};