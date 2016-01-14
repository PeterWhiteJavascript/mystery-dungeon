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
            return text;
        },
        buff:function(props,user){
            
        },
        showDesc:function(text){
            return text.effect[1].text;
        }
    };
};
