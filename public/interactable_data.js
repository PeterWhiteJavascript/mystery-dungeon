Quintus.InteractableData = function(Q){
Q.intData={
    first_demo1_0:{
        NPC0:{
            textNum:0,
            text:[
                ["If you bring me something valuable I might let you past!",{changeText:1}],
                ["I hear that there are bandits robbing people in the forest in the East.","Maybe you can find something valuable there."]
            ]
        }
    },
    first_plains2_0:{
        NPC0:{
            textNum:0,
            //On text num 0, give 1 potion
            items:[[0,{amount:1,item:"Potion"}]],
            text:[
                ["Hello, I'm test.","Here's a Potion!","By the way, this area will be expanded further in time.",{changeText:1}],
                ["I've given away my potion, baka!"]
            ]
            
            
        },
        NPC1:{
            textNum:0,
            items:[],
            text:[["Hello, I'm test2.","By the way, this area will be expanded further in time."]]
        }
    },
};
};