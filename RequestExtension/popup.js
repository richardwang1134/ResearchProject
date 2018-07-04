var wl = [];
var br = [];
var cs = [];
var cr = [];
var URL ="";
var urlcs = [];

 

document.addEventListener(
    "DOMContentLoaded",
    ()=>{
        var Status = document.querySelector("#Status");
        var Record = document.querySelector("#Record");

        var Pstatus = document.querySelector("#Pstatus");
        var Precord = document.querySelector("#Precord");

        Status.onmouseover = () =>{ChangeColor(Status,Record);}
        Record.onmouseover = () =>{ChangeColor(Record,Status);}

        Status.onclick = ()=>{tabButtonClicked(Status,Record,Pstatus,Precord);}
        Record.onclick = ()=>{tabButtonClicked(Record,Status,Precord,Pstatus);}
        
    }
)
function ChangeColor(Ba,Bb){
    Ba.className = "tab-onmouseover";
    Bb.className = "tab-button-off";
    if(Selection == "Status"){
        Status.className = "tab-button-on";
    }
    else if(Selection == "Record"){
        Record.className = "tab-button-on";
    }
}
function tabButtonClicked(Ba,Bb,Pa,Pb){
    if(Ba.className!="tab-button-on"){

        Ba.style.display = "none";
        Bb.style.display = "none";

        Pa.style.display = "block";
        Pb.style.display = "none";

        if(Ba.id == "Status"){
            chrome.runtime.sendMessage(
                {get:"br"},
                    (response)=>{
                        br = JSON.parse(response.br);
                        for(var i =0; i < br.length; i++){
                            br[i] = JSON.parse(br[i]);
                        }
                        refreshBR();
                }
            );
            chrome.runtime.sendMessage(
                {get:"url"},
                (response)=>{
                    URL = JSON.parse(response.url);
                }
            );
            chrome.runtime.sendMessage(
                {get:"cs"},
                (response)=>{
                    cs = JSON.parse(response.cs);
                }
            );
            chrome.runtime.sendMessage(
                {get:"wl"},
                (response)=>{
                    wl = JSON.parse(response.wl);
                }
            );
        }
        else if(Ba.id=="Record"){
            chrome.runtime.sendMessage(
                {get:"wl"},
                (response)=>{
                    wl = JSON.parse(response.wl);
                    refreshWL();
                }
            );
            chrome.runtime.sendMessage(
                {get:"cr"},
                (response)=>{
                    cr = JSON.parse(response.cr);
                }
            );
            chrome.runtime.sendMessage(
                {get:"br"},
                (response)=>{
                    br = JSON.parse(response.br);
                    for(var i =0; i < br.length; i++){
                        br[i] = JSON.parse(br[i]);
                    }
                }
            );
        }
    }
}

function refreshBR(){//根據阻擋紀錄刷新頁面
    var table = document.querySelector("#Tstatus");
        while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    var tr1 = document.createElement("tr");
    var CS = document.createElement("th");
        CS.innerHTML = "CookieStatus";
        CS.id = "StatusCS";
        CS.onclick = ()=>{refreshCS();}
    var Return = document.createElement("th");
        Return.id = "StatusReturn";
        Return.onclick=()=>{ReturnHome();}
    var LED =  document.createElement("th");
    var tr2 = document.createElement("tr");
    var time = document.createElement("th");
        time.innerHTML = "Time";
        time.id = "BRHeader";
    var url = document.createElement("th");
        url .innerHTML = "URL";
        url.id = "BRHeader";
    var ref = document.createElement("th");
        ref.innerHTML = "Refer";
        ref.id = "BRHeader";

    if(LEDcolor(URL)){
        LED.id = "LEDGreen";
    }else{
        LED.id = "LEDRed";
    }

    table.appendChild(tr1);
    tr1.appendChild(CS);
    tr1.appendChild(Return);
    tr1.appendChild(LED);
    table.appendChild(tr2);
    tr2.appendChild(url);
    tr2.appendChild(ref);
    tr2.appendChild(time);

    var num = br.length;
    
    if(num >= 15){
        for(var i = num-15; i < num; i++)
            addBRRows(br[i]);
    }else{
        for(var i = 0; i < num; i++)
            addBRRows(br[i]);
    }

}

function addBRRows(arr){//依照arr內容在頁面上新增一頁
    var table = document.querySelector("#Tstatus");
    var tr = document.createElement("tr");
    var url = document.createElement("th");
        url.innerHTML = arr[0];
        url.className = "BRItem";
        url.id = "BRUrl";
        url.onclick = ()=>{add2WL(url.innerHTML);ReturnHome();};
    var ref = document.createElement("th");
        ref.innerHTML = arr[1];
        ref.className = "BRItem";
    var time = document.createElement("th");
        time.innerHTML = arr[2];
        time.className = "BRItem";
        
    table.appendChild(tr);
    tr.appendChild(url);
    tr.appendChild(ref);
    tr.appendChild(time);
}

function refreshWL(){//根據WL刷新頁面
    //移除舊表格
    var table = document.querySelector("#Trecord");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    //生成新表格的標題列
    var tr1 = document.createElement("tr");
    var th = document.createElement("th");
        th.innerHTML = "Domain Name";
        th.id = "WLHeader";
    var add = document.createElement("th");
    var input = document.createElement("input");
        input.id = "input";
        input.onkeypress =()=>{if(event.keyCode == 13) add2WL(input.value);};
    var add = document.createElement("th");
        add.id = "add";
        add.innerHTML= "＋";
        add.onclick =()=>{add2WL(input.value)};
    var tr2 = document.createElement("tr");

    var URL = document.createElement("th");
        URL.id = "RecordURL";
        URL.innerHTML = "URL";
    var Return = document.createElement("th");
        Return.id = "RecordReturn";
        Return.onclick=()=>{ReturnHome();};

    table.appendChild(tr1);
    tr1.appendChild(th);
    th.appendChild(input);
    tr1.appendChild(add);

    table.appendChild(tr2);
    tr2.appendChild(URL);
    tr2.appendChild(Return);
    //生成新表格的內容
    for(var i = 0; i < wl.length; i++){
        addWLRows(wl[i]);
    }
}

function add2WL(url){//新增新的url到白名單、更新白名單、刷新頁面
    chrome.runtime.sendMessage(
        {get:"wl"},
        (response)=>{
            wl = JSON.parse(response.wl);
            //console.log("wl:",typeof(wl));
            if(wl.indexOf(url)==-1){
                wl.push(escapeHtml(url));
                updateWL();
            }
        }
    );
}

function addWLRows(url){//依照url在頁面上新增一頁
    var table = document.querySelector("#TRecord");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
        th.innerHTML = url;
        th.id = "RecordWeb";
        th.onclick=async function(){
            urlcs = await GetCS(url);
            ShowInfo(url);
        };
    var del = document.createElement("th");
        del.id = "WLDel";
        del.onmouseover =()=>{del.innerHTML = "—";};
        del.onmouseout =()=>{del.innerHTML = "";};
        del.onclick =()=>{delWLRow(url);delCRRow(url);};
    table.appendChild(tr);
    tr.appendChild(th)
    tr.appendChild(del);
}

function delWLRow(url){
    for(var i =0; i < wl.length-1; i++){
        if(wl[i] == url){
            wl[i] = wl[i+1];
            wl[i+1] = url;
        }
    }
    wl.pop();
    updateWL();
}

function updateWL(){//更新白名單並刷新頁面
    var json_str = JSON.stringify(wl);
    chrome.runtime.sendMessage(
        {WLupdate: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
                refreshWL();
            }else{
                console("WL update failed");
            }
        }
    );
}

function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[|&|<|>|"|']/g,(m)=>{ return map[m]; });
}

function refreshCS(){
    //移除舊表格
    var table = document.querySelector("#TStatus");
        while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    //新增表格
    var tr1 = document.createElement("tr");

    var add = document.createElement("th");
    add.innerHTML= "＋";
    add.id = "add";
    add.onclick=()=>{Add2CR(URL);ReturnHome();};
    var name = document.createElement("th");
    name.innerHTML = "Name";
    name.id = "CSHeader";
    var samesite = document.createElement("th");
    samesite.innerHTML = "SameSite";
    samesite.id = "CSHeader";

    var tr2 = document.createElement("tr");
    var url = document.createElement("th");
        url.innerHTML = URL;
        url.id = "StatusURL";
    var Return = document.createElement("th");
        Return.id = "StatusReturn";
        Return.onclick = ()=>{ReturnStatus();}
    var space = document.createElement("th");

    table.appendChild(tr2);
    tr2.appendChild(url);
    tr2.appendChild(Return);
    tr2.appendChild(space);

    table.appendChild(tr1);
    tr1.appendChild(name);
    tr1.appendChild(samesite);
    tr1.appendChild(add);

    for(var i = 0 ; i < cs.length ; i++){
        addCSRows(cs[i]);
    }
}
function addCSRows(cookie){//依照cookie內容在頁面上新增一頁
    var table = document.querySelector("#TStatus");
    var tr = document.createElement("tr");
    var name = document.createElement("th");
        name.innerHTML = cookie.name;
        name.className = "CSItem";
    var samesite = document.createElement("th");
        samesite.innerHTML = cookie.sameSite;
        samesite.className = "CSItem";
    var ChangeButton = document.createElement("th");
        //ChangeButton.innerHTML = "CM";
        ChangeButton.className = "CSButton";
        ChangeButton.onclick =()=>{ChangeCS(cs,cookie.name);updateCS();};

    table.appendChild(tr);
    tr.appendChild(name);
    tr.appendChild(samesite);
    tr.appendChild(ChangeButton);
}

function ChangeCS(CookieArray,CookieName){
    for(var i = 0 ; i < CookieArray.length ; i++){
        if(CookieName == CookieArray[i].name){
            if(CookieArray[i].sameSite == "strict"){CookieArray[i].sameSite = "no_restriction" ;}
            else{CookieArray[i].sameSite = "strict";}
        }
    }
}
function updateCS(){
    var json_str = JSON.stringify(cs);
    chrome.runtime.sendMessage(
        {CSupdate: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
                refreshCS();
            }else{
                console("CS update failed");
            }
        }
    );   
}

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

function GetCS(url){
    return new Promise(
        (resolve)=>{
            chrome.storage.sync.get(
                url,
                (item)=>{
                    resolve(item[url]);
                }
            )
        }
    )
}
function saveCR(url){
    chrome.storage.sync.set({[url]:urlcs},function(){});
    ReturnRecord();
}

function AddCS(cookie,url){
    var table = document.querySelector("#Trecord");
    var tr = document.createElement("tr");
    var name = document.createElement("th");
        name.innerHTML = cookie.name;
        name.className = "CSItem";
    var samesite = document.createElement("th");
        samesite.innerHTML = cookie.sameSite;
        samesite.className = "CSItem";
    var ChangeButton = document.createElement("th");
        ChangeButton.className = "CSButton";
        ChangeButton.onclick =()=>{ChangeCS(urlcs,cookie.name);ShowInfo(url)};

    table.appendChild(tr);
    tr.appendChild(name);
    tr.appendChild(samesite);
    tr.appendChild(ChangeButton);
}
function AddResource(resource){
    var table = document.querySelector("#Trecord");
    var tr = document.createElement("tr");
    var Resource = document.createElement("th");
    var space = document.createElement("th");
    var twospace = document.createElement("th");
    Resource.innerHTML = resource ;
    Resource.id = "label";

    table.appendChild(tr);
    tr.appendChild(Resource);
    tr.appendChild(space);
    tr.appendChild(twospace);
}

function ReturnHome(){
    var table = document.querySelector("#Trecord");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    table = document.querySelector("#Tstatus");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    var Status = document.querySelector("#Status");
    var Record = document.querySelector("#Record");

    Status.style.display = "block";
    Record.style.display = "block";


    
}
function ReturnRecord(){
    var table = document.querySelector("#Trecord");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    table = document.querySelector("#Tstatus");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    refreshWL();
}
function ReturnStatus(){
    var table = document.querySelector("#Trecord");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    table = document.querySelector("#Tstatus");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    refreshBR();
}
function ShowInfo(url){
    var table = document.querySelector("#Trecord");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    var tr1 = document.createElement("tr");
    var space = document.createElement("th");
    var twospace = document.createElement("th");
    var URLinfo = document.createElement("th");
        URLinfo.innerHTML = url;
        URLinfo.id = "RecordURL";
    var Return = document.createElement("th");
        Return.id = "RecordReturn";
        Return.onclick=()=>{ReturnRecord();}
    var Save = document.createElement("th");
        Save.id = "RecordSave";
        Save.onclick=()=>{saveCR(url);}
    var tr2 = document.createElement("tr");
    var Resource =document.createElement("th");
        Resource.innerHTML = "Resource";
        Resource.id = "label1";
    var tr3 = document.createElement("tr");
    var CN = document.createElement("th");
        CN.innerHTML = "CookieName";
        CN.id = "label1";
    var Same = document.createElement("th");
        Same.innerHTML = "SameSite";
        Same.id = "label1";
    var Change = document.createElement("th");
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
function LEDcolor(url){
    
    for(var i = 0; i < wl.length ; i++){
        if(url == wl[i]){
            return true;
        }
    }
    return false;
}