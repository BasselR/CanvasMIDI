/******************
 * 
 * Function definitions for 3 main job functions (createSkeleton, uploadFile, getJob)
 * 
*******************/

function createSkeleton(){
    // Create Skeleton
    var data = "{\"conversion\": [{\"category\": \"audio\",\"target\": \"mp3\"}]}";
    //var data = "{\"conversion\": [{\"category\": \"image\",\"target\": \"png\"}]}";

    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        let respJSON = JSON.parse(this.responseText);
        jobID = respJSON["id"];
        console.log("Job ID: " + jobID);
        concatURL = respJSON["server"] + "/upload-file/" + jobID;
        console.log("concatURL: " + concatURL);
    }
    });

    xhr.open("POST", "https://api2.online-convert.com/jobs");
    xhr.setRequestHeader("x-oc-api-key", "ed84f12919e7beecde965a135248f5cf");
    xhr.setRequestHeader("Content-Type", "text/plain");

    xhr.send(data);
}

function uploadFile(file){
    // Upload file for job
    var data2 = new FormData();
    data2.append("file", file);
    
    var xhr2 = new XMLHttpRequest();
    //xhr2.withCredentials = true;

    xhr2.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        console.log("Upload file response: \n" + this.responseText);
    }
    });
    
    // if open async is set to true, we get missing / incomplete info error
    xhr2.open("POST", concatURL, false);
    xhr2.setRequestHeader("x-oc-api-key", "ed84f12919e7beecde965a135248f5cf");
    xhr2.setRequestHeader("x-oc-upload-uuid", "rtyuio");

    xhr2.send(data2);
}

function getJob(){
    // Get job
    var xhr3 = new XMLHttpRequest();
    //xhr3.withCredentials = true;

    xhr3.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        console.log("Get job response: \n" + this.responseText);
        //let resp2JSON = JSON.parse(this.responseText);
        getJobJSON = JSON.parse(this.responseText);
        let resp2JSON = getJobJSON;
        code = resp2JSON["status"]["code"];
        document.getElementById('jobStatus').textContent = code;
        if(code === "completed"){
            outputURL = resp2JSON["output"][0]["uri"];
            console.log("Output URL: " + outputURL);
            document.getElementById('result').textContent = "output link";
            document.getElementById('result').setAttribute("href", outputURL); 
        }
    }
    });

    var getJobURL = "https://api2.online-convert.com/jobs/" + jobID;
    console.log("getJobURL: " + getJobURL);

    // if open async is set to true, loop of getJob() doesn't work
    xhr3.open("GET", getJobURL, false);
    xhr3.setRequestHeader("x-oc-api-key", "ed84f12919e7beecde965a135248f5cf");

    xhr3.send();
    return getJobJSON["status"]["code"];
}

// Wait function - sleeps for x milliseconds
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

var jobID;
var outputURL;
var midiFileObj;
var concatURL;
var code;
var getJobJSON;
var temp = "initial";

createSkeleton();

// Upload file
function onMIDIUpload(e){
    midiFileObj = document.getElementById('midiFile').files[0];
    uploadFile(midiFileObj); 

    // while( !(temp == "completed") ){
    //     console.log(temp);
    //     wait(2000);
    //     console.log("AHHHH");
    //     temp = getJob();
    // }

    while( !(code == "completed") ){
        console.log(code);
        wait(2000);
        console.log("AHHHH");
        code = getJob();
    }

    console.log("done while loop...")

    // setInterval(function(){
    //     if (code === "processing"){
    //         getJob();
    //     }
    //     else{
    //         clearInterval();
    //     }
    // }, 100);
}