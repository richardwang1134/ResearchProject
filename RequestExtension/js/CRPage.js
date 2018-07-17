function Add2CR(url){
    chrome.runtime.sendMessage(
        {get:"AddCR"},
        (response)=>{
            cr = JSON.parse(response.cr);
            if(cr.indexOf(url)==-1){
                cr.push(escapeHtml(url));
                updateCR();
            }
        }
    );
    add2WL(url); 
}
function updateCR(){
	var json_str = JSON.stringify(cr);
    chrome.runtime.sendMessage(
        {CRupdate: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
            }else{
                console("CR update failed");
            }
        }
    );   
}
function delCRRow(url){
    for(var i =0; i < cr.length-1; i++){
        if(cr[i] == url){
            cr[i] = cr[i+1];
            cr[i+1] = url;
        }
    }
    cr.pop();
    chrome.storage.sync.remove(url,function(){
        console.log("remove CS on",url);
    });
    updateCR();
}

function saveCR(url){
    chrome.storage.sync.set({[url]:urlcs},function(){});
    ReturnRecord();
}

function AddResource(resource){
    var table = document.querySelector("#Trecord");
    var tr = document.createElement("tr");
    var Resource = document.createElement("th");
    var space = document.createElement("th");
    var twospace = document.createElement("th");
    Resource.innerHTML = SubString(resource,25) ;
    Resource.id = "label";

    table.appendChild(tr);
    tr.appendChild(Resource);
    tr.appendChild(space);
    tr.appendChild(twospace);
}
function ShowInfo(url){
    var table = document.querySelector("#Trecord");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    var tr1 = document.createElement("tr");
    var space = document.createElement("th");
    var twospace = document.createElement("th");
    var URLinfo = document.createElement("td");
        URLinfo.innerHTML = SubString(url,25);
        URLinfo.id = "RecordURL";
    var Return = document.createElement("td");
        Return.id = "RecordReturn";
        Return.onclick=()=>{ReturnRecord();}
    var Save = document.createElement("td");
        Save.id = "RecordSave";
        Save.onclick=()=>{saveCR(url);}
    var tr2 = document.createElement("tr");
    var Resource =document.createElement("th");
        Resource.innerHTML = "Resource";
        Resource.id = "label1";
    var tr3 = document.createElement("tr");
    var CN = document.createElement("td");
        CN.innerHTML = "CookieName";
        CN.id = "label1";
    var Same = document.createElement("td");
        Same.innerHTML = "SameSite";
        Same.id = "label1";
    var Change = document.createElement("td");
        Change.innerHTML="change";
        Change.id = "label1";

    table.appendChild(tr1);
    tr1.appendChild(URLinfo);
    tr1.appendChild(Return);
    tr1.appendChild(Save);
    table.appendChild(tr2);
    tr2.appendChild(Resource);
    tr2.appendChild(space);
    tr2.appendChild(twospace);
    for(var i = 0 ; i < br.length ; i++){
        if(br[i][0] == url){
            AddResource(br[i][1]);
        }
    }

    table.appendChild(tr3);
    tr3.appendChild(CN);
    tr3.appendChild(Same);
    tr3.appendChild(Change);

    for(var i = 0 ; i < urlcs.length ; i++){
        AddCS(urlcs[i],url);
    }
}