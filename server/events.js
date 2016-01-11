 var Events=function(){
    this.addEvent=function(event){
        if(!this.p.events[event.stageName]){
            this.p.events[event.stageName]={};
        }
        if(!this.p.events[event.stageName][event.eventId]){
            this.p.events[event.stageName][event.eventId]={complete:false};
        }
        return event;
    };
    this.getEvents=function(stage){
        return this.events[stage];
    };
    this.attachPlayerToEvent=function(data){
        var players = this.events[data['stageName']][data['eventId']].players;
        var found=false;
        for(i=0;i<players.length;i++){
            if(players[i]===data['playerId']){
                found = true;
            }
        }
        if(!found){
            players.push(data['playerId']);
        }
        return players;
    };
    this.triggerEvent=function(event){
        this.events[event.stageName][event.eventId].status=1;
        return event;
    };
    this.completeEvent=function(event){
        this.events[event.stageName][event.eventId].status=2;
        //todo
        return "What to do on event complete";
    };
     //status
     //0 waiting to be triggered
     //1 in progress
     //2 complete
    this.events={
        first_plains0_0:{},
        first_plains1_0:{
            a:{
                trigger:{type:"onLocation"},
                locations:[[3,2]],
                event:"spawnEnemies",
                enemies:[
                    {loc:[12,2],opts:{gender:'M',level:5},character:"Totodile"},
                    {loc:[12,2],opts:{gender:'M',level:5},character:"Totodile"},
                    {loc:[12,2],opts:{gender:'M',level:5},character:"Totodile"}
                ],
                status:0,
                onCompleted:"doneBattle",
                players:[]
            },
            b:{
                trigger:{type:"onLocation"},
                locations:[[1,8],[1,9],[1,10]],
                event:"spawnEnemies",
                enemies:[
                    {loc:[4,21],opts:{gender:'M',level:5},character:"Grimer"},
                    {loc:[21,19],opts:{gender:'M',level:5},character:"Grimer"},
                    {loc:[11,21],opts:{gender:'M',level:5},character:"Grimer"},
                    {loc:[12,21],opts:{gender:'F',level:5},character:"Spinarak"},
                    {loc:[12,21],opts:{gender:'M',level:5},character:"Spinarak"},
                    {loc:[12,21],opts:{gender:'M',level:5},character:"Spinarak"}
                ],
                status:0,
                onCompleted:"doneBattle",
                players:[]
            }
        },
        first_plains2_0:{
            a:{
                trigger:{type:"onLocation"},
                locations:[[13,14]],
                event:"spawnEnemies",
                enemies:[
                    {loc:[8,19],opts:{gender:'M',level:5},character:"Dratini"},
                    {loc:[9,20],opts:{gender:'M',level:5},character:"Dratini"},
                    {loc:[6,22],opts:{gender:'M',level:5},character:"Dratini"},
                ],
                status:0,
                onCompleted:"doneBattle",
                players:[]
            },
        },
        first_plains0_1:{/*
            a:{
                trigger:{type:"enter"},
                event:"spawnEnemies",
                enemies:[
                    {loc:[2,9],opts:{gender:'M',level:5},character:"Grimer"},
                    {loc:[19,8],opts:{gender:'M',level:5},character:"Grimer"},
                    {loc:[11,21],opts:{gender:'M',level:5},character:"Grimer"},
                    {loc:[12,20],opts:{gender:'F',level:5},character:"Spinarak"},
                    {loc:[12,20],opts:{gender:'M',level:5},character:"Spinarak"},
                    {loc:[12,20],opts:{gender:'M',level:5},character:"Spinarak"}
                ],
                completed:"doneBattle"
            },*/
        },
        first_plains1_1:{},
        first_plains2_1:{},
        first_plains3_1:{},
        first_plains4_1:{},
        first_plains0_2:{},
    };
    
};
module.exports = new Events();