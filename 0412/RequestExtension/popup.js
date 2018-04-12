var wl = [];
var br = [];
var cs = [];
var cr = [];
var URL ="";
var urlcs = [];

document.addEventListener(
    "DOMContentLoaded",
    ()=>{
        var B1 = document.querySelector("#B1");
        var B2 = document.querySelector("#B2");
        var B3 = document.querySelector("#B3");
        var B4 = document.querySelector("#B4");

        var P1 = document.querySelector("#P1");
        var P2 = document.querySelector("#P2");
        var P3 = document.querySelector("#P3");
        var P4 = document.querySelector("#P4");

        B1.onclick = ()=>{tabButtonClicked(B1,B2,B3,B4,P1,P2,P3,P4)}
        B2.onclick = ()=>{tabButtonClicked(B2,B1,B3,B4,P2,P1,P3,P4)}
        B3.onclick = ()=>{tabButtonClicked(B3,B1,B2,B4,P3,P1,P2,P4)}
        B4.onclick = ()=>{tabButtonClicked(B4,B1,B2,B3,P4,P1,P2,P3)}

        tabButtonClicked(B1,B2,B3,B4,P1,P2,P3,P4);
    }
)



function tabButtonClicked(Ba,Bb,Bc,Bd,Pa,Pb,Pc,Pd){//切換頁面

    //tab和page外觀切換
    if(Ba.className=="tab-button-off"){

        Ba.className="tab-button-on";
        Bb.className="tab-button-off";
        Bc.className="tab-button-off";
        Bd.className="tab-button-off";

        Pa.style.display = "block";
        Pb.style.display = "none";
        Pc.style.display = "none";
        Pd.style.display = "none";
    }
    //如果是P1 取得阻擋紀錄
    if(Ba.id == "B1"){
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
    }
    //如果是B2 取得白名單
    else if(Ba.id=="B2"){
        chrome.runtime.sendMessage(
            {get:"wl"},
            (response)=>{
                wl = JSON.parse(response.wl);
                refreshWL();
            }
        );
    }
    //如果是B3 取得當前網頁Cookie狀態
    else if(Ba.id=="B3"){
        chrome.runtime.sendMessage(
            {get:"cs"},
            (response)=>{
                cs = JSON.parse(response.cs);
                refreshCS();
            }
        );
        chrome.runtime.sendMessage(
            {get:"url"},
            (response)=>{
                URL = JSON.parse(response.url);
            }
        );
    }
    //如果是B4 取得網頁Cookie設定紀錄
    else if(Ba.id=="B4"){
        chrome.runtime.sendMessage(
            {get:"cr"},
            (response)=>{
                cr = JSON.parse(response.cr);
                refreshCR();
            }
        );
    }
}

function refreshBR(){//根據阻擋紀錄刷新頁面
    var table = document.querySelector("#T1");
        while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    var tr = document.createElement("tr");
    var time = document.createElement("th");
        time.innerHTML = "Time";
        time.id = "BRHeaderTime";
    var url = document.createElement("th");
        url .innerHTML = "URL";
        url.id = "BRHeader";
    var ref = document.createElement("th");
        ref.innerHTML = "Referrer";
        ref.id = "BRHeader";
    table.appendChild(tr);
    tr.appendChild(time);
    tr.appendChild(url);
    tr.appendChild(ref);
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
    var table = document.querySelector("#T1");
    var tr = document.createElement("tr");
    var time = document.createElement("th");
        time.innerHTML = arr[0];
        time.className = "BRItem";
    var url = document.createElement("th");
        url.innerHTML = arr[1];
        url.className = "BRItem";
        url.id = "BRUrl";
        url.onclick = ()=>{add2WL(url.innerHTML)};
    var ref = document.createElement("th");
        ref.innerHTML = arr[2];
        ref.className = "BRItem";
    table.appendChild(tr);
    tr.appendChild(time);
    tr.appendChild(url);
    tr.appendChild(ref);
}

function refreshWL(){//根據WL刷新頁面
    //移除舊表格
    var table = document.querySelector("#T2");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    //生成新表格的標題列
    var tr = document.createElement("tr");
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
    table.appendChild(tr);
    tr.appendChild(th);
    th.appendChild(input);
    tr.appendChild(add);
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
    var table = document.querySelector("#T2");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
        th.innerHTML = url;
        th.id = "WLURL";
    var del = document.createElement("th");
        del.id = "WLDel";
        del.onmouseover =()=>{del.innerHTML = "—";};
        del.onmouseout =()=>{del.innerHTML = "";};
        del.onclick =()=>{delWLRow(url)};
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
    var table = document.querySelector("#T3");
        while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    //新增表格
    var tr = document.createElement("tr");

    var add = document.createElement("th");
    add.innerHTML= "＋";
    add.id = "add";
    add.onclick=()=>{Add2CR(URL)};
    var name = document.createElement("th");
    name.innerHTML = "Name";
    name.id = "CSHeader";
    var samesite = document.createElement("th");
    samesite.innerHTML = "SameSite";
    samesite.id = "CSHeader";

    table.appendChild(tr);
    tr.appendChild(name);
    tr.appendChild(samesite);
    tr.appendChild(add);

    for(var i = 0 ; i < cs.length ; i++){
        addCSRows(cs[i]);
    }
}
function addCSRows(cookie){//依照cookie內容在頁面上新增一頁
    var table = document.querySelector("#T3");
    var tr = document.createElement("tr");
    var name = document.createElement("th");
        name.innerHTML = cookie.name;
        name.className = "CSItem";
    var samesite = document.createElement("th");
        samesite.innerHTML = cookie.sameSite;
        samesite.className = "CSItem";
    var ChangeButton = document.createElement("th");
        ChangeButton.innerHTML = "CM";
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
            //console.log("cr:",cr);
            console.log(url);
            if(cr.indexOf(url)==-1){
                cr.push(escapeHtml(url));
                updateCR();
            }
        }
    ); 
}
function updateCR(){
	var json_str = JSON.stringify(cr);
    chrome.runtime.sendMessage(
        {CRupdate: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
                refreshCR();
            }else{
                console("CR update failed");
            }
        }
    );   
}
function refreshCR(){
    //移除舊表格
    var table = document.querySelector("#T4");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    //生成新表格的標題列
    var tr = document.createElement("tr");
    var th = document.createElement("th");
        th.innerHTML = "Domain Name";
        th.id = "CRHeader";
    var del = document.createElement("th");
        del.id = "CRHeader";
        del.innerHTML = "Delete";
    table.appendChild(tr);
    tr.appendChild(th);
    tr.appendChild(del);
    //生成新表格的內容
    for(var i = 0; i < cr.length; i++){
        addCRRows(cr[i]);
    }
}
function addCRRows(url){
    var table = document.querySelector("#T4");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
        th.innerHTML = url;
        th.id = "CRURL";
        th.onclick=async function(){
            urlcs = await GetCS(url);
            showCS(url);
        };
    var del = document.createElement("th");
        del.innerHTML = "X";
        del.id = "CRDEL";
        del.onclick =()=>{delCRRow(url)};

    table.appendChild(tr);
    tr.appendChild(th);
    tr.appendChild(del);
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
    refreshCR();
}
function showCS(url){
    var table = document.querySelector("#T4");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    //生成新表格的標題列
    var tr = document.createElement("tr");
    var th = document.createElement("th");
        th.innerHTML = url;
        th.id = "CRHeader";
    var save = document.createElement("th");
        save.innerHTML = "Save";
        save.id = "CRButton";
        save.onclick=()=>{saveCR(url);}
    var back = document.createElement("th");
        back.innerHTML = "Back";
        back.id = "CRButton";
        back.onclick=()=>{refreshCR();}
    table.appendChild(tr);
    tr.appendChild(th);
    tr.appendChild(save);
    tr.appendChild(back);
    for(var i = 0 ; i < urlcs.length ; i++){
        AddCS(urlcs[i],url);
    }
}

function AddCS(cookie,url){
    var table = document.querySelector("#T4");
    var tr = document.createElement("tr");
    var name = document.createElement("th");
        name.innerHTML = cookie.name;
        name.className = "CSItem";
    var samesite = document.createElement("th");
        samesite.innerHTML = cookie.sameSite;
        samesite.className = "CSItem";
    var ChangeButton = document.createElement("th");
        ChangeButton.innerHTML = "CM";
        ChangeButton.className = "CSButton";
        ChangeButton.onclick =()=>{ChangeCS(urlcs,cookie.name);showCS(url)};

    table.appendChild(tr);
    tr.appendChild(name);
    tr.appendChild(samesite);
    tr.appendChild(ChangeButton);
}
