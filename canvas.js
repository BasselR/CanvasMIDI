var myCanvas = document.querySelector('canvas');
var c = myCanvas.getContext('2d');

var now, last, delta;    //For calculating time between frames (time-based animation)

var midiFile;   //Text representation of input .JSON file
var songObj;    //JSON.parse(text) - JSON object representation of input .JSON file
var noteList;   //JSON Array storing all notes (JSON objects)
var mySound;

var barPos = (myCanvas.width / 2);
var displayLines = false;

var spd = 200; //200 px/s -- speed at which note circles travel at

var globalRadius = 30;
var vertClear = 2 * globalRadius;     //Padding between 'top and bottom of canvas' and notes (min: 1 radius)

myCanvas.width = window.innerWidth - 50;
myCanvas.height = window.innerHeight - 50;

/* API Keys:
 * basselrezkalla@gmail.com: ed84f12919e7beecde965a135248f5cf
 * bazzyoperations@gmail.com: 458b84e5f39e5ab3c2f2100733f69508
 */

// online-convert.com developer API key 
var apiKey = "ed84f12919e7beecde965a135248f5cf";
// jobID generated from createSkeleton to fetch from the correct URL in uploadFile and getJob
var jobID;
// time (in ms) between each getJob call
var jobInterval = 200;
// Object storing the MIDI file
var midiFileObj;

// Wait function - sleeps for x milliseconds
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

function createSkeleton(){
    var myHeaders = new Headers();
    myHeaders.append("x-oc-api-key", apiKey);
    myHeaders.append("Content-Type", "text/plain");

    var raw = "{\"conversion\": [{\"category\": \"audio\",\"target\": \"mp3\"}]}";

    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };

    return fetch("https://api2.online-convert.com/jobs", requestOptions);
}

function uploadFile(file, strJSON){

    const resJSON = JSON.parse(strJSON);
    const uploadServer = resJSON["server"];
    jobID = resJSON["id"];
    const concatURL = uploadServer + "/upload-file/" + jobID;
    console.log("Job ID: " + jobID);
    console.log("Concat URL: " + concatURL);

    var myHeaders = new Headers();
    myHeaders.append("x-oc-api-key", apiKey);
    
    var formdata = new FormData();
    formdata.append("file", file);
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow'
    };
    
    return fetch(concatURL, requestOptions);
}

function getJob(){
    var myHeaders = new Headers();
    myHeaders.append("x-oc-api-key", apiKey);

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    return fetch("https://api2.online-convert.com/jobs/" + jobID, requestOptions);
}

async function jobLoop(){
    let jobDone = false;
    while(!jobDone){
        const response = await getJob();
        const strJSON = await response.text();
        const resJSON = JSON.parse(strJSON);
        const code = resJSON["status"]["code"];
        console.log("Code: " + code);
        if(code === "completed"){
            jobDone = true;
            const outputURL = resJSON["output"][0]["uri"];
            console.log("Output URL: " + outputURL);
            mySound = new sound(outputURL);
            parseFile(midiFileObj);
        }
        else{
            wait(jobInterval);
        }
    }
}

function midiToMP3(){
    midiFileObj = document.getElementById('midiFile').files[0];
    createSkeleton()
        .then(response => response.text())
        .then(result => uploadFile(midiFileObj, result))
        .then(jobLoop)
        .catch(error => console.log('error', error));
}

function parseFile(file) {
    //read the file
    var reader = new FileReader();
    reader.onload = function (e) {
        var partsData = MidiConvert.parse(e.target.result);
        console.log(partsData);
        songObj = partsData;
        parseJSON();
    };
    reader.readAsBinaryString(file);
}

function onMIDIUpload(e){
    document.getElementById('loading').textContent = "Processing...";
    console.log(document.getElementById('loading').textContent);
    midiToMP3();
}

function parseJSON(){
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
    document.getElementById('visButton').style.display = "inline";
    document.getElementById('loading').style.display = "none";
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
        if(displayLines) nodeArray[i].drawLines(i);
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