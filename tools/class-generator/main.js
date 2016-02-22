var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var replaceall = require("replaceall");
var ejs = require('ejs');
var util = require('util');

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        getAttacks(res);
    } else if (req.method.toLowerCase() == 'post') {
        processFormFieldsIndividual(req, res);
    }
});

function createMaster(res){
    fs.readdir("public/classes", function(err, items) {
        //arr stores all class data
        var arr = [];
        //The current file we're on
        var num = 0;
        //Loop through the files in the directory
        for (var i=0; i<items.length; i++) {
            //What should we do with the file?
            fs.readFile("./public/classes/"+items[i],function(err,data){
                if(err) throw err;
                var attack = JSON.parse(data);
                arr.push(attack);
                num++;
                //This means that this is the last file.
                //We can now write the data to the master file
                if(num===items.length){
                    var data = JSON.stringify(arr);
                    fs.writeFile("../../server/json/classes.json",data, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                        displayClasses(res,arr);
                    });
                }
            });
        }
    });
}
function getClass(res,pclassName){
    if(pclassName){
        fs.readFile("./public/classes/"+pclassName+".json",function(err,data){
            if(err) throw err;
            var pclass = JSON.parse(data);
            var genClass={
                name:pclass.name,
                description:pclass.description,
                base:{
                    max_hp:pclass.base.max_hp,
                    phys_ofn:pclass.base.phys_ofn,
                    phys_dfn:pclass.base.phys_dfn,
                    spec_ofn:pclass.base.spec_ofn,
                    spec_dfn:pclass.base.spec_dfn,
                    agility:pclass.base.agility,
                    strength:pclass.base.strength,
                    intellect:pclass.base.intellect,
                    awareness:pclass.base.awareness,
                    willpower:pclass.base.willpower,
                    persuasion:pclass.base.persuasion,
                    fate:pclass.base.fate
                },
                attacks:pclass.attacks
            }; 
            getAttacks(res,genClass);
        });
    }
};
//Reads the json that stores all of the attacks
function getAttacks(res,pclass){
    fs.readFile("../../public/json/attacks.json",function(err,data){
        if(err) throw err;
        displayForm(res,JSON.parse(data),pclass);
    });
};
function displayClasses(res,data){
    var content = fs.readFileSync('./public/show_classes.ejs', 'utf-8');
    var compiled = ejs.compile(content);
    res.writeHead(200, {'Content-Type': 'text/html'});
    //Pass the JSON attacks to the html
    res.write(compiled({classes:data}));
    res.end();
}

function displayForm(res,data,pclass) {
    var content = fs.readFileSync('./public/generate_class.ejs', 'utf-8');
    var compiled = ejs.compile(content);
    res.writeHead(200, {'Content-Type': 'text/html'});
    if(!pclass){
        pclass={
            name:"",
            description:"",
            base:{
                max_hp:"",
                phys_ofn:"",
                phys_dfn:"",
                spec_ofn:"",
                spec_dfn:"",
                agility:"",
                strength:"",
                intellect:"",
                awareness:"",
                willpower:"",
                persuasion:"",
                fate:""
            },
            attacks:["","","","",""]
        }; 
    }
    //Pass the JSON attacks to the html
    res.write(compiled({attacks:data,pclass:pclass}));
    res.end();
}
function deleteClass(res,className){
    //Delete the class
    fs.unlink("public/classes/"+className+".json",function(err){
        if(err) throw err;
        //Recreate the master classes file
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
        if(fields['taskFunc']==="generateClass"){
            //Make sure there's no white space for the id
            var id = replaceall(' ','',fields['name']);
            //Initialize the plclass object
            var pclass = {};
            //Set the id and other info
            pclass={
                id:id,
                name:fields['name'],
                description:fields['description'],
                base:{
                    max_hp:fields['base_max_hp'],
                    phys_ofn:fields['base_phys_ofn'],
                    phys_dfn:fields['base_phys_dfn'],
                    spec_ofn:fields['base_spec_ofn'],
                    spec_dfn:fields['base_spec_dfn'],
                    agility:fields['base_agility'],

                    strength:fields['base_strength'],
                    intellect:fields['base_intellect'],
                    awareness:fields['base_awareness'],
                    willpower:fields['base_willpower'],
                    persuasion:fields['base_persuasion'],
                    fate:fields['base_fate']
                },
                attacks:[fields['attack1'],fields['attack2'],fields['attack3'],fields['attack4'],fields['attack5']]
            };
            //If we have entered a class
            if(id.length){
                var data = JSON.stringify(pclass);
                fs.writeFile("./public/classes/"+id+".json",data, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                    createMaster(res);
                });
            } 
            //If we're not adding an attack, generate the master JSON
            else {
                createMaster(res);
            }
        } 
        //Display the form, but with the fields filled out.
        else if(fields['taskFunc']==="editClass"){
            //Make sure there's no white space for the id
            var id = replaceall(' ','',fields['name']);
            getClass(res,id);
        } else if(fields['taskFunc']==='deleteClass'){
            var id = replaceall(' ','',fields['name']);
            deleteClass(res,id);
        }

    });

    form.parse(req);
}

server.listen(5000);
console.log("server listening on 5000");