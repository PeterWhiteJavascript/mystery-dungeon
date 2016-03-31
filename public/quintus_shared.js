var quintusShared = function(Quintus) {
"use strict";
Quintus.Shared = function(Q) {
//All attack functions
Q.attackFuncs = {
    //Calculate extra damage from type advantage/disadvantage
    getTypeModifiers:function(target,attack){
        var modifier = 1;
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
    compareDirection:function(user,target){
        var getDirection = function(dir,dirs){
            for(var i=0;i<dirs.length;i++){
                if(dir===dirs[i]){
                    return i;
                }
            }
        };
        var checkBounds = function(num){
            if(num>=dirs.length){
                return num-dirs.length;
            }
            return num;
        };
        //0.50 is from behind
        //0.75 is from back-side
        //1.00 is side
        //1.25 is from front-side
        //1.50 is from front
        //Set values that we will multiply accuracy and power by later on
        var back = 0.5;
        var side = 1;
        var front = 1.5;

        //Array of possible directions clockwise from 12 o'clock
        var dirs = ["up", "right", "down", "left"];
        //Get the number for the user dir
        var userDir = getDirection(user.p.dir,dirs);
        //Get the number for the target dir
        var targetDir = getDirection(target.p.dir,dirs);
        //An array of the values (also clockwise from 12 o'clock)
        //EX:
        //if both user and target are 'Up', they will both be 0 and that will give the back value (since they are both facing up, the user has attacked from behind).
        var values = [back,side,front,side];
        for(var j=0;j<values.length;j++){
            //Make sure we are in bounds, else loop around to the start of the array
            if(checkBounds(userDir+j)===targetDir){
                //If we've found the proper value, return it
                return values[j];
            }
        }
    },
    //Calculate total damage dealt with an attack
    calculateDamage:function(user,target,attack,facingValue){
        var offence = user.p.modStats[attack.category+"_ofn"];
        var defense = target.p.modStats[attack.category+"_dfn"];
        var baseDamage = parseInt(attack.power);
        var modifier = 1;
        var modText={text:[]};
        //TODO Need to include ability into STAB
        var stab = 1;//Q.attackFuncs.getSTAB(user,attack);
        var typeMod = 1;//Q.attackFuncs.getTypeModifiers(target,attack);
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
        //Q.attackFuncs.getOther();
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
                    target.p.modStats[keys[ii]]=Math.round(target.p[keys[ii]]*((2+target.p.statsModified[keys[ii]])/2));
                } else if(target.p.statsModified[keys[ii]]<0){
                    target.p.modStats[keys[ii]]=Math.round(target.p[keys[ii]]*(2/Math.abs(target.p.statsModified[keys[ii]]-2)));
                }
                text.push(target.p.name+"'s "+keys[ii]+" was decreased to "+target.p.modStats[keys[ii]]+".");
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
return Q;

};
};

if(typeof Quintus === 'undefined') {
  module.exports = quintusShared;
} else {
  quintusShared(Quintus);
}
