var UpdateLoop = function(delay,callback){
    var self = this;
    
    var counter = 0;
    var start = new Date().getTime();
    
    function delayed(){
        callback(delay);
        counter++;
        var diff = (new Date().getTime() - start) - counter * delay;
        setTimeout(delayed, delay - diff);
    }
    delayed();
    setTimeout(delayed, delay);
};
module.exports = UpdateLoop;