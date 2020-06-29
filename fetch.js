/* API Keys:
 * basselrezkalla@gmail.com: ed84f12919e7beecde965a135248f5cf
 * bazzyoperations@gmail.com: 458b84e5f39e5ab3c2f2100733f69508
 */

// online-convert.com developer API key 
var apiKey = "458b84e5f39e5ab3c2f2100733f69508";
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
            // document.getElementById('jobStatus').textContent = "Completed!";
            // document.getElementById('result').textContent = "output link";
            // document.getElementById('result').setAttribute("href", outputURL); 
            console.log("Output URL: " + outputURL);
            parseFile(midiFileObj);
        }
        else{
            wait(jobInterval);
        }
    }
}

function midiToMP3(){
    midiFileObj = document.getElementById('midiFile').files[0];
    //document.getElementById('jobStatus').textContent = "Processing...";
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
    };
    reader.readAsBinaryString(file);
}