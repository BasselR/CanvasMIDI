var myCanvas = document.querySelector('canvas');
var c = myCanvas.getContext('2d');

var now, last, delta    //For calculating time between frames (time-based animation)

var midiFile;   //Text representation of input .JSON file
var songObj;    //JSON.parse(text) - JSON object representation of input .JSON file
var noteList;   //JSON Array storing all notes (JSON objects)
var mySound;

var barPos = (myCanvas.width / 2);

var spd = 200; //200 px/s -- speed at which note circles travel at

var globalRadius = 30;
var vertClear = 2 * globalRadius;     //Padding between 'top and bottom of canvas' and notes (min: 1 radius)

myCanvas.width = window.innerWidth - 50;
myCanvas.height = window.innerHeight - 50;

// Hardcoding sound retrieval from local directory

// function loadSound(){
//     mySound = new sound("resources/songs/twinkle.mp3");
// }

//onUpload event is fired from <input> once user uploads a file
function onMP3Upload(e){
    let fname = document.getElementById('mp3File').files[0];
    mySound = new sound(fname);
}

function onJSONUpload(){
    midiFile = document.getElementById('jsonFile').files[0];    //Stores uploaded file in midiFile
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

        for(i in noteList){
            console.log(noteList[i].name);
        }

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

        for(i in noteList){
            let x = barPos + (noteList[i].time * spd);
            let y = vertClear + ((maxMidi - noteList[i].midi) / diff) * (myCanvas.height - (2 * vertClear));
            let dx = -spd;
            let dy = 0;
            let radius = noteList[i].duration * 30;
            nodeArray.push(new Circle(x, y, dx, dy, radius));
        }

    }

    fr.readAsText(midiFile);    //Reads file as text, stores in fr.result
}

//On button click "Visualize!"
function onSubmit(){
    //Hide all 'initial' elements
    let initials = document.getElementsByClassName('initial');
    for(let i = 0; i < initials.length; i++){
        initials[i].style.display = "none";
    }

    //Reveal canvas
    document.getElementById("myCanvas").style.display = "block";
    
    //Start delta timing and begin song & animation
    last = Date.now();
    mySound.play();
    animate();
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

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        c.strokeStyle = 'rgba(155, 220, 242, 0.6)';
        c.lineWidth = 1;
        c.stroke();
        if(this.x > barPos){
            c.fillStyle = 'rgba(155, 220, 242, 0.6)';
            c.fill();
        }
    }

    drawLines(i){
        if(i == nodeArray.length - 1){
            return;
        }
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(nodeArray[i + 1].getX(), nodeArray[i + 1].getY());
        c.lineWidth = 3;
        c.strokeStyle = 'rgba(255, 102, 207, 0.3)';
        c.stroke();
    }

    update(){

        this.x += this.dx * delta;
        this.y += this.dy * delta;

        // if(this.x <= myCanvas.width / 2){

        // }

        this.draw();
    }

}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = URL.createObjectURL(src);
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
    this.sound.onend = function(e) {
      URL.revokeObjectURL(this.src);
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
        nodeArray[i].drawLines(i);
    }
    c.beginPath();
    c.moveTo(barPos, 0);
    c.lineTo(barPos, myCanvas.height);
    c.lineWidth = 5;
    c.strokeStyle = 'rgba(245, 66, 209, 0.7)';
    c.stroke();
}

function animate(){
    setDelta();
    globalDraw();
    requestAnimationFrame(animate);
}