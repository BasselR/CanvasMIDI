/* API Keys:
 * basselrezkalla@gmail.com: ed84f12919e7beecde965a135248f5cf
 * bazzyoperations@gmail.com: 458b84e5f39e5ab3c2f2100733f69508
 */

var apiKey = "458b84e5f39e5ab3c2f2100733f69508";
var concatURL;
var jobID;
var bigX;
var jobDone = false;

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

    let resJSON = JSON.parse(strJSON);
    let uploadServer = resJSON["server"];
    jobID = resJSON["id"];
    concatURL = uploadServer + "/upload-file/" + jobID;
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

function jobLoop(){
    let promise = getJob();
    promise.then()
}

function onMIDIUpload(e){
    midiFileObj = document.getElementById('midiFile').files[0];
    createSkeleton()
        .then(response => response.text())
        .then(result => uploadFile(midiFileObj, result))
        .then(z => getJob())
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}




    // {
    //     let resJSON = JSON.parse(result);
    //     jobID = resJSON["id"];
    //     console.log("Job ID: " + jobID);
    //     concatURL = resJSON["server"] + "/upload-file/" + jobID
    // }
// createSkeleton()
//     .then(response => response.text())
//     .then(result => console.log(result))
//     .catch(error => console.log('error', error));