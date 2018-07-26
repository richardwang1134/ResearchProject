var wl = [];
var br = [];
var cs = [];
var cr = [];
var ad = [];
var URL ="";
var urlcs = [];

var Status = "";
var TwoPhaseLock = "";
var Key2 = "";

document.write('<script src="js/BRPage.js"></script>');
document.write('<script src="js/WLPage.js"></script>');
document.write('<script src="js/CSPage.js"></script>');
document.write('<script src="js/CRPage.js"></script>');
document.write('<script src="js/LogPage.js"></script>');
document.write('<script src="js/NewPage.js"></script>');
document.write('<script src="js/SettingPage.js"></script>');
document.write('<script src="js/AccountDataPage.js"></script>');
document.write('<script src="js/sha256.js"></script>');
document.write('<script src="js/AES.js"></script>');

window.onload = function () {
    document.getElementById('FileInput').onchange = ReadFile;
};

document.addEventListener(
    "DOMContentLoaded",
    ()=>{
        var Setting = document.querySelector("#Setting");
        var Status = document.querySelector("#Status");
        var Record = document.querySelector("#Record");
        var AccountData = document.querySelector("#AccountData");
        var Log = document.querySelector("#Log");
        var FileInput = document.querySelector("#FileInput");

        var Psetting = document.querySelector("#Psetting");
        var Pstatus = document.querySelector("#Pstatus");
        var Precord = document.querySelector("#Precord");
        var Paccount = document.querySelector("#PaccountData");
        var Plog = document.querySelector("#Plog");


        Setting.onmouseover = () =>{ChangeColor(Setting,Status,Record,AccountData,Log);}
        Status.onmouseover = () =>{ChangeColor(Status,Record,Setting,AccountData,Log);}
        Record.onmouseover = () =>{ChangeColor(Record,Status,Setting,AccountData,Log);}
        AccountData.onmouseover = () =>{ChangeColor(AccountData,Status,Setting,Record,Log);}
        Log.onmouseover = () =>{ChangeColor(Log,Status,Setting,AccountData,Record);}

        Setting.onclick = ()=>{tabButtonClicked(Setting,Record,Status,AccountData,Log,Psetting,Precord,Pstatus,PaccountData,Plog);}
        Status.onclick = ()=>{tabButtonClicked(Status,Record,Setting,AccountData,Log,Pstatus,Precord,Psetting,PaccountData,Plog);}
        Record.onclick = ()=>{tabButtonClicked(Record,Status,Setting,AccountData,Log,Precord,Pstatus,Psetting,PaccountData,Plog);}
        AccountData.onclick = ()=>{tabButtonClicked(AccountData,Status,Setting,Record,Log,PaccountData,Pstatus,Psetting,Precord,Plog);}
        Log.onclick = ()=>{tabButtonClicked(Log,Status,Setting,AccountData,Record,Plog,Pstatus,Psetting,PaccountData,Precord);}
        
    }
)
function ChangeColor(Ba,Bb,Bc,Bd,Be){
    Ba.className = "tab-onmouseover";
    Bb.className = "tab-button-off";
    Bc.className = "tab-button-off";
    Bd.className = "tab-button-off";
    Be.className = "tab-button-off";
}
function tabButtonClicked(Ba,Bb,Bc,Bd,Be,Pa,Pb,Pc,Pd,Pe){
    if(Ba.className!="tab-button-on"){

        FileInput.style.display = "none";

        Ba.style.display = "none";
        Bb.style.display = "none";
        Bc.style.display = "none";
        Bd.style.display = "none";
        Be.style.display = "none";

        Pa.style.display = "block";
        Pb.style.display = "none";
        Pc.style.display = "none";
        Pd.style.display = "none";
        Pe.style.display = "none";

        if(Ba.id == "Status"){
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
        else if(Ba.id=="Record"){
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
            chrome.runtime.sendMessage(
                {get:"wl"},
                (response)=>{
                    wl = JSON.parse(response.wl);
                    refreshWL();
                }
            );
        }
        else if(Ba.id=="Setting"){
            SettingPage();
        }
        else if(Ba.id=="AccountData"){
            AccountPage();
        }
        else if(Ba.id=="Log"){
            LogPage();
        }
        
    }
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

function ReturnHome(){
    var table = document.querySelector("#Trecord");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    table = document.querySelector("#Tstatus");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    table = document.querySelector("#Tsetting");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    table = document.querySelector("#TLog");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    table = document.querySelector("#TAccountData");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }

    var Setting = document.querySelector("#Setting");
    var Status = document.querySelector("#Status");
    var Record = document.querySelector("#Record");
    var AccountData = document.querySelector("#AccountData");
    var Log = document.querySelector("#Log");

    Setting.style.display = "block";
    Status.style.display = "block";
    Record.style.display = "block";
    AccountData.style.display = "block";
    Log.style.display = "block";
    FileInput.style.display = "block";

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
function LEDcolor(url){
    
    for(var i = 0; i < wl.length ; i++){
        if(url == wl[i]){
            return true;
        }
    }
    return false;
}
function SubString(TheString,length){
    if(TheString.length > length){
        TheString = TheString.substring(0,length)+"...";
    }
    return TheString;
}
function GenerateKey(){
    var Key = '';
    var word = '';

    for(var i = 0 ; i < 64 ; i++){
        var Random = Math.floor(Math.random()*16);
        switch (Random){
            case 10:
                word = 'A';
                break;
            case 11:
                word = 'B';
                break;
            case 12:
                word = 'C';
                break;
            case 13:
                word = 'D';
                break;
            case 14:
                word = 'E';
                break;
            case 15:
                word = 'F';
                break;
            default:
                word = String(Random);
        }
        Key = Key + word;
    }
    return Key;
}
/*
function TwoPhaseLockVerify(Key){
    
    var Signature = "NCYU@CSIE@SECURITY";
    var VerifyKey = Key + Signature;
    var Timer = new(Date);
    var Second = Timer.getSeconds();
    var input = String(parseInt(Second/30));
    var hmac = sha256.hmac(VerifyKey,input);
    var fourbyte = "";
    for(var i = hmac.length-5 ; i < hmac.length-1 ; i++ ){
        fourbyte = fourbyte + hmac[i];
    }
    var temp = "";
    for(var i = 0 ; i < 4 ; i++){
        temp = temp + String(fourbyte[i].charCodeAt());
    }
    var LargeInt = parseInt(temp);
    var SmallInt = LargeInt % 1000000;
    while(SmallInt < 100000){
        SmallInt = SmallInt * 10;
    }

    return SmallInt;
    //console.log(Aes.Ctr.encrypt('big secret', "665", 256));
    //console.log(Aes.Ctr.decrypt('bQDJE6wKR1swbQRPSMPisHIP', "666", 256));
    //console.log(sha256.hmac(VerifyKey,"TEST111111"));
}*/
function GetKey1(){
	return new Promise(
		(resolve)=>{
			chrome.storage.local.get("key1",function(items){
				resolve(items["key1"]);
			})
		}
	);
}
function ReadFile() {
    file = this.files[0];
    var fReader = new FileReader();
    fReader.onload = function (event) {
        FileInputData(event);
    };
    fReader.readAsText(file);
}
function FileInputData(){
    Key2 = event.target.result;
    updateKey2();
}