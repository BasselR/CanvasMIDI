var myCanvas = document.querySelector('canvas');

var now;    //For calculating time between frames (time-based animation)
var last;
var delta;

var midiFile;   //Text representation of input .JSON file
var songObj;    //JSON.parse(text) - JSON object representation of input .JSON file
var noteList;   //JSON Array storing all notes (JSON objects)
var mySound;
var spd = 200; //200 px/s -- speed at which note circles travel at

var globalRadius = 30;
var vertClear = 2.5 * globalRadius;     //Padding between 'top and bottom of canvas' and notes

myCanvas.width = window.innerWidth - 50;
myCanvas.height = window.innerHeight - 50;

var c = myCanvas.getContext('2d');

function loadSound(){
    mySound = new sound("songs/bassTest.mp3");
}

//onUpload event is fired from <input> once user uploads a file
function onUpload(e){
    mySound.play();
    console.log("Event occured: onUpload");
    midiFile = document.getElementById('song').files[0];    //Stores uploaded file in midiFile
    var fr = new FileReader();

    //fr.onload event is fired once fr.readAsText finishes loading file
    // *** fr.onload is ASYNCHRONOUS ***
    fr.onload = function(){
        console.log("Event occured: FileReader onLoad");
        songObj = JSON.parse(fr.result);    //JSON parses the JSON text stored in uploaded file (midiFile)

        //Assigns noteList to the first non-empty "note" list (JSON array)
        for(i in songObj.tracks){
            if(songObj.tracks[i].notes.length > 0){
                noteList = songObj.tracks[i].notes;
                break;
            }
        }
        //console.log("noteList: " + noteList[0].name);
        console.log("foo");

        for(i in noteList){
            console.log(noteList[i].name);
        }

        // PUT MAIN CODE HERE

        var maxMidi = noteList[0].midi;
        var minMidi = noteList[0].midi;

        for(i in noteList){
            if(noteList[i].midi > maxMidi){
                maxMidi = noteList[i].midi;
            }
            if(noteList[i].midi < minMidi){
                minMidi = noteList[i].midi;
            }
        }

        nodeArray = [];
        diff = maxMidi - minMidi;

        //FIX HEIGHT (AND ORGANIZATION lol)
        for(i in noteList){
            let x = (myCanvas.width / 2) + (noteList[i].time * 200);
            let y = vertClear + ((maxMidi - noteList[i].midi) / diff) * (myCanvas.height - (2 * vertClear));
            let dx = -spd;
            let dy = 0;
            let radius = globalRadius;
            nodeArray.push(new Circle(x, y, dx, dy, radius));
        }

        //console.log(nodeArray.length);

        last = Date.now();
        animate();

    }

    fr.readAsText(midiFile);    //Reads file as text, stores in fr.result
    console.log("bar");
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

        this.x += this.dx * delta;
        this.y += this.dy * delta;

        this.draw();
    }

}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

function setDelta(){
    now = Date.now();
    delta = (now - last) / 1000;    //Seconds since last frame
    last = now;
}

function globalDraw(){
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for(var i = 0; i < nodeArray.length; i++){
        nodeArray[i].update();
    }
}

function animate(){
    setDelta();
    globalDraw();
    requestAnimationFrame(animate);
}