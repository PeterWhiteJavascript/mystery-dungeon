var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var replaceall = require("replaceall");
var ejs = require('ejs');
var util = require('util');

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        processFormFieldsIndividual(req, res);
    }
});

function createMaster(res){
    fs.readdir("public/attacks", function(err, items) {
        //arr stores all attacks data
        var arr = [];
        //The current file we're on
        var num = 0;
        //Loop through the files in the directory
        for (var i=0; i<items.length; i++) {
            //What should we do with the file?
            fs.readFile("./public/attacks/"+items[i],function(err,data){
                if(err) throw err;
                var attack = JSON.parse(data);
                arr.push(attack);
                num++;
                //This means that this is the last file.
                //We can now write the data to the master file
                if(num===items.length){
                    var data = JSON.stringify(arr);
                    fs.writeFile("../../public/data/_json/attacks.json",data, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                        displayAttacks(res,arr);
                    });
                }
            });
        }
    });
}
function displayAttacks(res,objs){
    var content = fs.readFileSync('./public/show_attacks.ejs', 'utf-8');
    var compiled = ejs.compile(content);
    res.writeHead(200, {'Content-Type': 'text/html'});
    //Pass the JSON attacks to the html
    res.write(compiled({attacks:objs}));
    res.end();
}

function displayForm(res,attack) {
    if(!attack){
        attack={
            name:"",
            description:"",
            power:"",
            accuracy:"",
            range:"",
            area:"",
            category:"",
            targets:"",
            stat_type:"",
            effect:{
                statusChange:'',
                statChange:''
            }
        }; 
    }
    var content = fs.readFileSync('./public/generate_attack.ejs', 'utf-8');
    var compiled = ejs.compile(content);
    res.writeHead(200, {'Content-Type': 'text/html'});
    //Pass the JSON attacks to the html
    res.write(compiled({attack:attack}));
    res.end();
}

function getAttack(res,attackName){
    if(attackName){
        fs.readFile("./public/attacks/"+attackName+".json",function(err,data){
            if(err) throw err;
            var attack = JSON.parse(data);
            //Set the id and other info
            var genAttack={
                id:attackName,
                name:attack.name,
                description:attack.description,
                power:attack.power,
                accuracy:attack.accuracy,
                range:attack.range,
                area:attack.area,
                category:attack.category,
                stat_type:attack.stat_type,
                targets:attack.targets,
                effect:attack.effect
            };
            displayForm(res,genAttack);
        });
    }
};
function deleteAttack(res,attackName){
    //Delete the attack
    fs.unlink("public/attacks/"+attackName+".json",function(err){
        if(err) throw err;
        //Recreate the master attacks file
        createMaster(res);
    });
};
function processFormFieldsIndividual(req, res) {
    //Store the data from the fields in your data store.
    //The data store could be a file or database or any other store based
    //on your application.
    var fields = [];
    var form = new formidable.IncomingForm();
    form.on('field', function (field, value) {
        fields[field] = value;
    });

    form.on('end', function () {
        if(fields['taskFunc']==="generateAttack"){
            //Make sure there's no white space for the id
            var id = replaceall(' ','',fields['name']);
            //Initialize the attacks object
            var attacks = {};
            //Set the id and other info
            attacks={
                id:id,
                name:fields['name'],
                description:fields['description'],
                power:fields['power'],
                accuracy:fields['accuracy'],
                range:fields['range'],
                area:fields['area'],
                category:fields['category'],
                stat_type:fields['stat_type'],
                targets:fields['targets'],
                effect:{
                    statusChange:'',
                    statChange:''
                }
            };
            //Only set effect if there is one
            if(fields['effect_type']!=="none"){
                attacks.effect={
                    targets:fields['effect_targets'],
                    accuracy:fields['effect_accuracy'],
                    type:fields['effect_type'],
                    statusChange:{
                        type:fields['effect_status_change'],
                        turns:fields['effect_status_change_turns']
                    },
                    statChange:{
                        type:fields['effect_stat_change'],
                        amount:fields['effect_stat_change_amount'],
                        turns:fields['effect_stat_change_turns']
                    },
                    move:fields['effect_move'],
                    changeTile:fields['effect_change_tile'],
                    unique:fields['effect_unique'],
                    description:fields['effect_description']
                };
            }
            //If we have entered an attack
            if(id.length){
                var data = JSON.stringify(attacks);
                fs.writeFile("./public/attacks/"+id+".json",data, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    createMaster(res);
                });
            } 
            //If we're not adding an attack, generate the master JSON
            else {
                createMaster(res);
            }
        } else if(fields['taskFunc']==="editAttack"){
            var id = replaceall(' ','',fields['name']);
            getAttack(res,id);
        } else if(fields['taskFunc']==="deleteAttack"){
            var id = replaceall(' ','',fields['name']);
            deleteAttack(res,id);
        }
    });
    form.parse(req);
};

server.listen(5000);
console.log("server listening on 5000");