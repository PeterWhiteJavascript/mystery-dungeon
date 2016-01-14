Quintus.ItemFuncs=function(Q){
    RP.itemFuncs={
        stat:function(props,user){
            var keys = Object.keys(props.effect[1]);
            var text = "";
            user.p[keys[0]]+=props.effect[1][keys[0]];
            if(keys[0]==="curHp"){
                var healed = props.effect[1][keys[0]]
                if(user.p.curHp>user.p.maxHp){
                    healed = user.p.maxHp-user.p.curHp+healed;
                    user.p.curHp=user.p.maxHp;
                };
                if(healed>0){
                    text = user.p.name+" was healed "+healed+" hp.";
                } else {
                    text = ""+props.name+" did nothing...";
                }
            }
            Q.state.get("playerConnection").socket.emit('updateStats',{
                stats:{
                    level:user.p.level,
                    ofn:user.p.ofn,
                    dfn:user.p.dfn,
                    spd:user.p.spd,
                    mod_ofn:user.p.mod_ofn,
                    mod_dfn:user.p.mod_dfn,
                    mod_spd:user.p.mod_spd,
                    curHp:user.p.curHp,
                    maxHp:user.p.maxHp
                },
                playerId:Q.state.get("playerConnection").id
            });
            return text;
        },
        statPercent:function(props,user){
            var keys = Object.keys(props.effect[1]);
            var text = "";
            user.p[keys[0]]+=props.effect[1][keys[0]];
            if(keys[0]==="curHp"){
                var healed = user.p.maxHp/props.effect[1][keys[0]];
                if(user.p.curHp>user.p.maxHp){
                    healed = user.p.maxHp-user.p.curHp+healed;
                    user.p.curHp=user.p.maxHp;
                };
                if(healed>0){
                    text = user.p.name+" was healed "+healed+" hp.";
                } else {
                    text = ""+props.name+" did nothing...";
                }
            }
            Q.state.get("playerConnection").socket.emit('updateStats',{
                stats:{
                    level:user.p.level,
                    ofn:user.p.ofn,
                    dfn:user.p.dfn,
                    spd:user.p.spd,
                    mod_ofn:user.p.mod_ofn,
                    mod_dfn:user.p.mod_dfn,
                    mod_spd:user.p.mod_spd,
                    curHp:user.p.curHp,
                    maxHp:user.p.maxHp
                },
                playerId:Q.state.get("playerConnection").id
            });
            return text;
        },
        buff:function(props,user){
            
        },
        showDesc:function(text){
            return text.effect[1].text;
        }
    };
};
