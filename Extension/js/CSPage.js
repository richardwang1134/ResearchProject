function refreshCS(){
    //移除舊表格
    var table = document.querySelector("#TStatus");
        while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    //新增表格
    var tr1 = document.createElement("tr");

    var add = document.createElement("td");
    add.innerHTML= "＋";
    add.id = "add";
    add.onclick=()=>{Add2CR(URL);ReturnHome();};
    var name = document.createElement("td");
    name.innerHTML = "Name";
    name.id = "CSHeader";
    var samesite = document.createElement("td");
    samesite.innerHTML = "SameSite";
    samesite.id = "CSHeader";

    var tr2 = document.createElement("tr");
    var url = document.createElement("td");
        url.innerHTML = URL;
        url.id = "StatusURL";
    var Return = document.createElement("td");
        Return.id = "StatusReturn";
        Return.onclick = ()=>{ReturnStatus();}
    var space = document.createElement("td");

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
        name.innerHTML = SubString(cookie.name,20);
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
function AddCS(cookie,url){
    var table = document.querySelector("#Trecord");
    var tr = document.createElement("tr");
    var name = document.createElement("td");
        name.innerHTML = cookie.name;
        name.className = "CSItem";
    var samesite = document.createElement("td");
        samesite.innerHTML = cookie.sameSite;
        samesite.className = "CSItem";
    var ChangeButton = document.createElement("td");
        ChangeButton.className = "CSButton";
        ChangeButton.onclick =()=>{ChangeCS(urlcs,cookie.name);ShowInfo(url)};

    table.appendChild(tr);
    tr.appendChild(name);
    tr.appendChild(samesite);
    tr.appendChild(ChangeButton);
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