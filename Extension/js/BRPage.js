function refreshBR(){//根據阻擋紀錄刷新頁面
    var table = document.querySelector("#Tstatus");
        while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    var tr1 = document.createElement("tr");
    var CS = document.createElement("td");
        CS.innerHTML = "CookieStatus";
        CS.id = "StatusCS";
        CS.onclick = ()=>{refreshCS();}
    var Return = document.createElement("td");
        Return.id = "StatusReturn";
        Return.onclick=()=>{ReturnHome();}
    var LED =  document.createElement("td");
    var tr2 = document.createElement("tr");
    var time = document.createElement("td");
        time.innerHTML = "Time";
        time.id = "BRHeader";
    var url = document.createElement("td");
        url .innerHTML = "URL";
        url.id = "BRHeader";
    var ref = document.createElement("td");
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
        url.innerHTML = SubString(arr[0],20);
        url.className = "BRItem";
        url.id = "BRUrl";
        url.onclick = ()=>{add2WL(url.innerHTML);ReturnHome();};
    var ref = document.createElement("th");
        ref.innerHTML = SubString(arr[1],25);
        console.log(SubString(arr[1]));
        ref.className = "BRItem";
    var time = document.createElement("th");
        time.innerHTML = SubString(arr[2]);
        time.className = "BRItem";
        
    table.appendChild(tr);
    tr.appendChild(url);
    tr.appendChild(ref);
    tr.appendChild(time);
}