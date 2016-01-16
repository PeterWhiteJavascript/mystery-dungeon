 var Events=function(){
    this.getEvents=function(stage){
        if(this.events[stage]){
            return this.events[stage];
        }
    };
    this.updateEvent=function(event){
        var ev = this.events[event.stageName][event.eventId].p;
        //Need to loop though and update the event
        var keys = Object.keys(event);
        for(i=0;i<keys.length;i++){
            ev[keys[i]]=event[keys[i]];
        }
        return this.events[event.stageName][event.eventId];
    };
    //When updating more than one event at a time, for example: two battles going on at one time in the same level.
    this.updateEvents=function(event){
        var evs = [];
        for(i=0;i<event.eventIds.length;i++){
            var ev = this.events[event.stageName][event.eventIds[i]].p;
            //Need to loop though and update the event
            var keys = Object.keys(event);
            for(i=0;i<keys.length;i++){
                ev[keys[i]]=event[keys[i]];
            }
            evs.push(ev);
        }
        return evs;
    };
    this.triggerEvent=function(event){
        this.events[event.stageName][event.eventId].p.status=1;
        this.events[event.stageName][event.eventId].p.host=event.host;
        return this.updateEvent(event);
    };
    this.completeEvent=function(eventId,stageName){
        this.events[stageName][eventId].p.status=2;
        return this.events[stageName][eventId];
    };
     //status
     //0 waiting to be triggered
     //1 in progress
     //2 complete
    this.events={
        //first_demo start
        //Anything not in p is a constant
        first_demo1_0:{
            
        },
        
        first_demo1_1:{
            a:{
                trigger:{type:"onLocation"},
                locations:[[14,1]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[2,7],opts:{gender:'M',level:1},character:"Spinarak"},
                        {loc:[4,9],opts:{gender:'M',level:2,drop:{p:{item:"OranBerry",amount:1}}},character:"Grimer"},
                        {loc:[6,10],opts:{gender:'M',level:1},character:"Spinarak"}
                    ],
                    turnOrder:[]
                }
            },
            b:{
                trigger:{type:"onLocation"},
                locations:[[16,10],[16,11]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[20,10],opts:{gender:'M',level:1},character:"Spinarak"},
                        {loc:[18,11],opts:{gender:'M',level:1},character:"Spinarak"},
                        {loc:[21,9],opts:{gender:'M',level:1,drop:{p:{item:"OranBerry",amount:1}}},character:"Spinarak"}
                    ],
                    turnOrder:[]
                }
            }
        },
        
        first_demo2_0:{
            a:{
                trigger:{type:"onLocation"},
                locations:[[13,9],[13,10],[13,6],[14,4],[15,4],[16,4]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[17,9],opts:{gender:'M',level:2},character:"Grimer"},
                        {loc:[20,5],opts:{gender:'M',level:4,drop:{p:{item:"OranBerry",amount:1}}},character:"Deino"},
                        {loc:[22,9],opts:{gender:'F',level:2},character:"Grimer"},
                        {loc:[15,11],opts:{gender:'M',level:1},character:"Grimer"}
                    ],
                    turnOrder:[]
                }
            },
            b:{
                trigger:{type:"onLocation"},
                locations:[[1,13],[5,10]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[17,9],opts:{gender:'M',level:2,drop:{p:{item:"OranBerry",amount:1}}},character:"Spinarak"},
                        {loc:[22,9],opts:{gender:'F',level:1},character:"Spinarak"},
                        {loc:[15,11],opts:{gender:'M',level:1},character:"Spinarak"}
                    ],
                    turnOrder:[]
                }
            }
        },
        first_demo3_0:{
            a:{
                trigger:{type:"onLocation"},
                locations:[[2,10],[1,10],[4,12],[4,13]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[3,13],opts:{gender:'M',level:3},character:"Grimer"},
                        {loc:[2,13],opts:{gender:'M',level:3,drop:{p:{item:"OranBerry",amount:1}}},character:"Grimer"}
                    ],
                    turnOrder:[]
                }
            },
            b:{
                trigger:{type:"onLocation"},
                locations:[[6,2],[6,1],[10,2],[10,1]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[8,1],opts:{gender:'M',level:3},character:"Grimer"},
                        {loc:[8,2],opts:{gender:'M',level:3,drop:{p:{item:"OranBerry",amount:1}}},character:"Grimer"}
                    ],
                    turnOrder:[]
                }
            },
            c:{
                trigger:{type:"onLocation"},
                locations:[[15,3],[16,3],[15,7],[16,7]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[15,5],opts:{gender:'M',level:3},character:"Grimer"},
                        {loc:[16,5],opts:{gender:'M',level:3,drop:{p:{item:"OranBerry",amount:1}}},character:"Grimer"}
                    ],
                    turnOrder:[]
                }
            },
            d:{
                trigger:{type:"onLocation"},
                locations:[[22,3],[23,3],[18,8],[18,9],[18,12],[18,13]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[19,5],opts:{gender:'M',level:3},character:"Grimer"},
                        {loc:[20,8],opts:{gender:'M',level:3,drop:{p:{item:"OranBerry",amount:1}}},character:"Grimer"},
                        {loc:[19,10],opts:{gender:'M',level:3},character:"Grimer"},
                        {loc:[20,13],opts:{gender:'M',level:4,drop:{p:{item:"OranBerry",amount:1}}},character:"Spinarak"},
                        {loc:[23,6],opts:{gender:'M',level:4},character:"Aipom"}
                    ],
                    turnOrder:[]
                }
            },
        },
        first_demo3_1:{
            a:{
                trigger:{type:"onLocation"},
                locations:[[11,1],[12,1],[13,1]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[21,4],opts:{gender:'F',level:5},character:"Spinarak"},
                        {loc:[10,2],opts:{gender:'M',level:5},character:"Spinarak"},
                        
                        {loc:[2,8],opts:{gender:'F',level:6},character:"Totodile"},
                        {loc:[22,8],opts:{gender:'M',level:6},character:"Totodile"},
                        
                        {loc:[12,13],opts:{gender:'M',level:8,drop:{p:{item:"OranBerry",amount:1}}},character:"Dratini"}
                    ],
                    turnOrder:[]
                }
            },
        },
        first_demo3_2:{
            a:{
                trigger:{type:"onLocation"},
                locations:[[11,1],[12,1],[13,1]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[8,8],opts:{gender:'F',level:5},character:"Spinarak"},
                        {loc:[16,8],opts:{gender:'M',level:5},character:"Spinarak"},
                        
                        {loc:[11,10],opts:{gender:'F',level:6},character:"Aipom"},
                        {loc:[13,10],opts:{gender:'M',level:6},character:"Aipom"},
                        
                        {loc:[12,8],opts:{gender:'M',level:8,drop:{p:{item:"OranBerry",amount:1}}},character:"Dratini"}
                    ],
                    turnOrder:[]
                }
            },
            b:{
                trigger:{type:"onLocation"},
                locations:[[12,17],[11,18],[13,18]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[4,22],opts:{gender:'M',level:3},character:"Dratini"},
                        {loc:[4,19],opts:{gender:'M',level:10,drop:{p:{item:"Diamond",amount:1}}},character:"Deino"},
                        {loc:[8,21],opts:{gender:'F',level:3},character:"Dratini"},
                        {loc:[8,19],opts:{gender:'M',level:5},character:"Dratini"},
                        {loc:[6,21],opts:{gender:'F',level:5},character:"Dratini"},
                        {loc:[6,19],opts:{gender:'M',level:5},character:"Dratini"},
                        
                        {loc:[15,19],opts:{gender:'F',level:3},character:"Dratini"},
                        {loc:[15,22],opts:{gender:'M',level:5},character:"Dratini"},
                        {loc:[17,19],opts:{gender:'F',level:5},character:"Dratini"},
                        {loc:[17,22],opts:{gender:'M',level:3},character:"Dratini"},
                        
                        {loc:[20,20],opts:{gender:'F',level:7},character:"Grimer"},
                        {loc:[20,21],opts:{gender:'M',level:7},character:"Grimer"},
                    ],
                    turnOrder:[]
                }
            },
        }
    };
    
};
module.exports = new Events();