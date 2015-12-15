Quintus.Gradient=function(Q){
Q.UI.Container.extend("Gradient",{
    init:function(p){
        this._super(p,{});
        if(!this.p.col1){this.p.col1=this.p.col0;}
    },
    draw:function(ctx){
        var grd=ctx.createLinearGradient(0,0,this.p.w/2,this.p.h/2);
        grd.addColorStop(0,this.p.col0);
        grd.addColorStop(1,this.p.col1);
        ctx.fillStyle=grd;
        ctx.fill();
    }
});
//Pass an array of types and it will return an array of color codes
Q.getGradient=function(types){
    var typeCols=[];
    for(i=0;i<types.length;i++){
        switch(types[i]){
            case "Normal":
                typeCols.push("#A8A77A");
                break;
            case "Fire":
                typeCols.push("#EE8130");
                break;
            case "Water":
                typeCols.push("#6390F0");
                break;
            case "Electric":
                typeCols.push("#F7D02C");
                break;
            case "Grass":
                typeCols.push("#7AC74C");
                break;
            case "Ice":
                typeCols.push("#96D9D6");
                break;
            case "Fighting":
                typeCols.push("#C22E28");
                break;
            case "Poison":
                typeCols.push("#A33EA1");
                break;
            case "Ground":
                typeCols.push("#E2BF65");
                break;
            case "Flying":
                typeCols.push("#A98FF3");
                break;
            case "Psychic":
                typeCols.push("#F95587");
                break;
            case "Bug":
                typeCols.push("#A6B91A");
                break;
            case "Rock":
                typeCols.push("#B6A136");
                break;
            case "Ghost":
                typeCols.push("#735797");
                break;
            case "Dragon":
                typeCols.push("#6F35FC");
                break;
            case "Dark":
                typeCols.push("#705746");
                break;
            case "Steel":
                typeCols.push("#B7B7CE");
                break;
            case "Fairy":
                typeCols.push("#D685AD");
                break;
        }
    }
    return typeCols;
};

};