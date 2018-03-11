var wl = [];
var B1 = document.querySelector("#B1");
var B2 = document.querySelector("#B2");
var P1 = document.querySelector("#P1");
var P2 = document.querySelector("#P2");
B1.onclick = ()=>{tabButtonClicked(B1,B2,P1,P2)}
B2.onclick = ()=>{tabButtonClicked(B2,B1,P2,P1)}

function tabButtonClicked(Ba,Bb,Pa,Pb){

    //tab和page外觀切換
    if(Ba.className=="tab-button-off"){
        Ba.className="tab-button-on";
        Bb.className="tab-button-off";
        Pa.style.display = "block";
        Pb.style.display = "none";
    }
    //如果是P1 取得阻擋紀錄
    if(Ba.id == "B1"){
        ;
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

function refreshWL(){
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

function add2WL(url){
    wl.push(escapeHtml(url));
    updateWL();
}

function addWLRows(url){
    var table = document.querySelector("#T2");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var del = document.createElement("th");
    th.innerHTML = url;
    th.id = "WLURL";
    table.appendChild(tr);
    tr.appendChild(th)
    del.id = "WLDel";
    del.onmouseover =()=>{del.innerHTML = "—";};
    del.onmouseout =()=>{del.innerHTML = "";};
    del.onclick =()=>{delWLRow(url)};
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

function updateWL(){
    var json_str = JSON.stringify(wl);
    chrome.runtime.sendMessage(
        {update: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
                refreshWL();
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