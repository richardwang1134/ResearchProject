function saveTextAsFile( _fileName, _text ) {
    var textFileAsBlob = new Blob([_text], {type:'text/plain'});

    var downloadLink = document.createElement("a");
    downloadLink.download = _fileName;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

function updateKey2(){
    var json_str = JSON.stringify(Key2);
    chrome.runtime.sendMessage(
        {Key2update: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
            }else{
                console("Key update failed");
            }
        }
    );
}
function GetKey2(){
	return new Promise(
		(resolve)=>{
			chrome.runtime.sendMessage(
                {get:"Key2"},
                (response)=>{
                    resolve(JSON.parse(response.Key2));
                }
            );
		}
	);
}