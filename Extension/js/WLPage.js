function refreshWL(){//根據WL刷新頁面
    //移除舊表格
    var table = document.querySelector("#Trecord");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    //生成新表格的標題列
    var tr1 = document.createElement("tr");
    var th = document.createElement("td");
        th.innerHTML = "Domain Name";
        th.id = "WLHeader";
    var add = document.createElement("td");
    var input = document.createElement("input");
        input.id = "input";
        input.onkeypress =()=>{
            if(event.keyCode == 13) {
                add2WL(input.value);
                updateWL();
            }
        };
    var add = document.createElement("td");
        add.id = "add";
        add.innerHTML= "＋";
        add.onclick =()=>{add2WL(input.value)};
    var tr2 = document.createElement("tr");

    var URL = document.createElement("td");
        URL.id = "RecordURL";
        URL.innerHTML = "URL";
    var Return = document.createElement("td");
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
    var th = document.createElement("td");
        th.innerHTML = SubString(url,45);
        th.id = "RecordWeb";
        th.onclick=async function(){
            urlcs = await GetCS(url);
            ShowInfo(url);
        };
    var del = document.createElement("td");
        del.id = "Del";
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