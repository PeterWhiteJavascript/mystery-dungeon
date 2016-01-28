Quintus.Music = function(Q){
    
Q.stopMusic=function(music){
    Q.audio.stop(music);
};

Q.playMusic=function(music){
    if(Q.state.get("musicEnabled")){
        var loadedMusic = Q.state.get("loadedMusic");
        var ld = loadedMusic.filter(function(songName){
            return songName===music;
        })[0];
        if(!ld){
            Q.load("scenes/"+music,function(){
                Q.audio.stop("scenes/"+Q.state.get("currentMusic"));
                Q.audio.play("scenes/"+music,{loop:true});
                Q.state.set("currentMusic",music);
                loadedMusic.push(music);
            });
        } else if(Q.state.get("currentMusic")!==music){
            Q.audio.stop("scenes/"+Q.state.get("currentMusic"));
            Q.audio.play("scenes/"+music,{loop:true});
            Q.state.set("currentMusic",music);
        }
    }
};

Q.playSound=function(sound,callback){
    if(Q.state.get("soundEnabled")){
        Q.audio.play("sounds/"+sound);
    }
    if(callback){
        callback();
    }
};

//Gets the music in a stage
Q.getMusic=function(whereTo){
    switch(whereTo){
        case "first_demo":
            Q.playMusic("adventure1.mp3");
            break;
        
    }
};
    
    
};


