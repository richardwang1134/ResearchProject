var wl = [];
var br = [];

document.addEventListener(
    "DOMContentLoaded",
    ()=>{
        var B1 = document.querySelector("#B1");
        var B2 = document.querySelector("#B2");
        var P1 = document.querySelector("#P1");
        var P2 = document.querySelector("#P2");
        B1.onclick = ()=>{tabButtonClicked(B1,B2,P1,P2)}
        B2.onclick = ()=>{tabButtonClicked(B2,B1,P2,P1)}
        tabButtonClicked(B1,B2,P1,P2);
    }
)



function tabButtonClicked(Ba,Bb,Pa,Pb){//切換白名單和阻擋紀錄頁面

    //tab和page外觀切換
    if(Ba.className=="tab-button-off"){
        Ba.className="tab-button-on";
        Bb.className="tab-button-off";
        Pa.style.display = "block";
        Pb.style.display = "none";
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
            console.log("wl:",wl);
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
        {update: json_str },
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
