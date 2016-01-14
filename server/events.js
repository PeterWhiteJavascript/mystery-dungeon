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
            a:{
                trigger:{type:"onLocation"},
                locations:[[14,11]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[17,9],opts:{gender:'M',level:5},character:"Dratini"},
                        {loc:[20,5],opts:{gender:'M',level:7,drop:{p:{item:"Diamond",amount:1}}},character:"Dratini"},
                        {loc:[22,9],opts:{gender:'F',level:5},character:"Dratini"},
                        {loc:[15,11],opts:{gender:'M',level:5},character:"Dratini"}
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
                        {loc:[17,9],opts:{gender:'M',level:5},character:"Dratini"},
                        {loc:[20,5],opts:{gender:'M',level:7,drop:{p:{item:"Diamond",amount:1}}},character:"Dratini"},
                        {loc:[22,9],opts:{gender:'F',level:5},character:"Dratini"},
                        {loc:[15,11],opts:{gender:'M',level:5},character:"Dratini"}
                    ],
                    turnOrder:[]
                }
            }
        },
        first_demo1_1:{
            
            b:{
                trigger:{type:"onLocation"},
                locations:[[13,2]],
                event:"spawnEnemies",
                onCompleted:"doneBattle",
                p:{
                    status:0,
                    enemies:[
                        {loc:[14,5],opts:{gender:'M',level:7,drop:{p:{item:"Diamond",amount:1}}},character:"Dratini"},
                        {loc:[14,4],opts:{gender:'M',level:7,drop:{p:{item:"Diamond",amount:1}}},character:"Dratini"},
                        {loc:[14,3],opts:{gender:'M',level:7,drop:{p:{item:"Diamond",amount:1}}},character:"Dratini"}
                    ],
                    turnOrder:[]
                }
            }
        }
    };
    
};
module.exports = new Events();