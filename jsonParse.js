// function onMIDIUpload(e){
//     midiFileObj = document.getElementById('midiFile').files[0];
//     createSkeleton()
//         .then(response => response.text())
//         .then(result => uploadFile(midiFileObj, result))
//         .then(jobLoop)
//         .catch(error => console.log('error', error));
// }


function parseFile(file) {
    //read the file
    var reader = new FileReader();
    reader.onload = function (e) {
        var partsData = MidiConvert.parse(e.target.result);
        document.querySelector("#ResultsText").value = JSON.stringify(partsData, undefined, 2);
    };
    reader.readAsBinaryString(file);
}