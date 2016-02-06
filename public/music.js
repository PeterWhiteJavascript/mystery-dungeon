Quintus.Music = function(Q){
    
Q.stopMusic=function(music){
    Q.audio.stop("scenes/"+music);
};

Q.playMusic=function(music,callback){
    if(Q.state.get("musicEnabled")){
        var loadedMusic = Q.state.get("loadedMusic");
        var ld = loadedMusic.filter(function(songName){
            return songName===music;
        })[0];
        //If the music hasn't been loaded
        if(!ld){
            Q.stopMusic(Q.state.get("currentMusic"));
            Q.stopMusic(music);
            Q.load("scenes/"+music,function(){
                Q.audio.play("scenes/"+music,{loop:true});
                loadedMusic.push(music);
                if(callback){callback();}
            });
        //If the music is different than the currentMusic
        } else if(Q.state.get("currentMusic")!==music){
            Q.stopMusic(Q.state.get("currentMusic"));
            Q.stopMusic(music);
            Q.audio.play("scenes/"+music,{loop:true});
        }
        if(ld){
            if(callback){callback();}
        }
    } else {
        if(callback){callback();}
    }
    Q.state.set("currentMusic",music);
};

Q.playSound=function(sound,callback){
    if(Q.state.get("soundEnabled")){
        Q.audio.play("sounds/"+sound);
    }
    if(callback){callback();}
};

    
    
};


