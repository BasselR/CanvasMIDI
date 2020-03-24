var myCanvas = document.querySelector('canvas');

//var midiFile = require(['./songs/bassTest.json']);
//var midiFile = JSON.parse(data);
//console.log(midiFile);

var midiFile;   //Text representation of input .JSON file
var songObj;    //JSON.parse(text) - JSON object representation of input .JSON file
var noteList;   //JSON Array storing all notes (JSON objects)

myCanvas.width = window.innerWidth - 50;
myCanvas.height = window.innerHeight - 50;

var c = myCanvas.getContext('2d');

//onUpload event is fired from <input> once user uploads a file
function onUpload(){
    console.log("Event occured: onUpload");
    midiFile = document.getElementById('song').files[0];    //Stores uploaded file in midiFile
    var fr = new FileReader();

    //fr.onload event is fired once fr.readAsText finishes loading file
    fr.onload = function(){
        console.log("Event occured: FileReader onLoad");
        songObj = JSON.parse(fr.result);    //JSON parses the JSON text stored in uploaded file (midiFile)

        //Assigns noteList to the first non-empty "note" list (JSON array)
        for(i in songObj.tracks){
            console.log(songObj.tracks[i]);
            if(songObj.tracks[i].notes.length > 0){
                noteList = songObj.tracks[i].notes;
            }
        }
        console.log("noteList: " + noteList[0].name);
    }

    fr.readAsText(midiFile);    //Reads file as text, stores in fr.result

}

class Circle{

    constructor(x, y, dx, dy, radius){
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.resizeSpd = -1;
    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        c.strokeStyle = 'rgba(255, 0, 0, 1)';
        c.stroke();
        c.fillStyle = 'rgba(100, 0, 0, 1)';
        c.fill();
    }

    update(){

        if(this.x + this.radius > myCanvas.width || this.x - this.radius < 0){
            this.dx *= -1;
        }

        if(this.y + this.radius > myCanvas.height || this.y - this.radius < 0){
            this.dy *= -1;
        }

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
        //this.resize();
    }

    resize(){
        this.radius += this.resizeSpd;
        if(this.radius <= 0){
            this.radius = 0;
            this.resizeSpd *= -1;
        }
        else if(this.radius >= 30){
            this.radius = 30;
            this.resizeSpd *= -1; 
        }
    }

}

var circleArray = [];
for(var i = 0; i < 100; i++){
    var x = radius + Math.random() * (myCanvas.width - 2 * radius);
    var y = radius + Math.random() * (myCanvas.height - 2 * radius);
    var dx = (Math.random() - 0.5) * 8;
    var dy = 2 + Math.random() * 4;
    if(Math.random() > 0.5){
        dx *= -1;
    }
    if(Math.random() > 0.5){
        dy *= -1;
    }
    var radius = 30;
    circleArray.push(new Circle(x, y, dx, dy, radius));
}

function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for(var i = 0; i < circleArray.length; i++){
        circleArray[i].update();
    }
}

animate();