async function AccountPage(){
    var table = document.querySelector("#TAccountData");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    var tr1 = document.createElement("tr");
    var Return = document.createElement("th");
        Return.id = "LogReturn";
        Return.onclick=()=>{ReturnHome();};
    
    var threespace = document.createElement("th");
            
    var Add = document.createElement("th");
        Add.id = "add";
        Add.innerHTML = "＋";
        Add.onclick=()=>{NewPage();}
    var space = document.createElement("th");

    var tr2 = document.createElement("tr");
    var Name = document.createElement("th");
        Name.id = "label1";
        Name.innerHTML = "Name";
    var Account = document.createElement("th");
        Account.id = "label1";
        Account.innerHTML = "Account";
    var Password = document.createElement("th");
        Password.id = "label1";
        Password.innerHTML = "Password";
    var twospace = document.createElement("th");
    var threespace = document.createElement("th");
    var fourspace = document.createElement("th");
    var fivespace = document.createElement("th");
    

    table.appendChild(tr1);
    tr1.appendChild(fourspace);
    tr1.appendChild(Return);
    tr1.appendChild(Add);
    tr1.appendChild(space);
    tr1.appendChild(twospace);


    table.appendChild(tr2);
    tr2.appendChild(fivespace);
    tr2.appendChild(Name);
    tr2.appendChild(Account);
    tr2.appendChild(Password);
    tr2.appendChild(threespace);


    var ad = await GetAccountLabel();
    try{
        for(var i = 0 ; i < ad.length ; i++){
            var Label = ad[i] + "_" + "Phase";
            var Password = await GetAccountPassword(ad[i]);
            var Phase = await GetAccountPhase(Label);
                AddAccountRow(ad[i],Password,Phase);
            }
        }catch(err){
            console.log(err);
        }
    }

function AddAccountRow(label,password,phase){
    var Data = label.split("_"); 
    var table = document.querySelector("#TAccountData");
    var tr = document.createElement("tr");
    var Name = document.createElement("td");
        Name.id = "label2";
        Name.innerHTML = SubString(Data[0],10);
    var Account = document.createElement("td");
        Account.id = "label2";
        Account.innerHTML = SubString(Data[1],10);
    var Password = document.createElement("td");
        Password.id = "AccountDataPassword";
        Password.innerHTML = SubString(password.toString(),10);
        Password.onclick=()=>{Decrypt(password,phase);}
    var Phase = document.createElement("td");
        Phase.id = "label1";
        if(phase == "uncheckbox"){
            Phase.innerHTML = "1";
        }
        else{
            Phase.innerHTML = "2";
        }     
    var Delete = document.createElement("td");
        Delete.id = "Del";
        Delete.onmouseover =()=>{Delete.innerHTML = "—";};
        Delete.onmouseout =()=>{Delete.innerHTML = "";};
        Delete.onclick=()=>{DeleteData(label);}

    table.appendChild(tr);
    tr.appendChild(Phase);
    tr.appendChild(Name);
    tr.appendChild(Account);
    tr.appendChild(Password);
    tr.appendChild(Delete);
}

function GetAccountPassword(AccountLabel){
	return new Promise(
		(resolve)=>{
			chrome.storage.sync.get(AccountLabel,function(items){
                    resolve(items[AccountLabel]);
			})
		}
	);
}

function GetAccountPhase(Label){
	return new Promise(
		(resolve)=>{
			chrome.storage.sync.get(Label,function(items){
                    resolve(items[Label]);
			})
		}
	);
}

async function DeleteData(label){
    var ad = await GetAccountLabel();
    for(var i = 0 ; i < ad.length-1 ; i++){
        if(ad[i] == label){
            ad[i] = ad[i+1];
            ad[i+1] = label;
        }
    }
    ad.pop();
    chrome.storage.sync.set({"AccountLabel":ad},function(){});
    AccountPage();
}
async function Decrypt(Cipertext,Phase) {
    var Key = await GetKey1();
    var SHAPassword = await GetPassword();
    var Plaintext ;
    var clip_area = document.createElement('textarea');
    
    //解密方法
    if(Phase == "checkbox"){
        Key2 = await GetKey2();
        if(Key2 == ""){
            alert("讀不到KEY,請重新匯入KEY資料");
            ReturnHome();
        }
        else{

            Cipertext = Aes.Ctr.decrypt(Cipertext, Key2, 256);
            Cipertext = Aes.Ctr.decrypt(Cipertext, Key, 256);
            Plaintext = Aes.Ctr.decrypt(Cipertext, SHAPassword, 256);

            clip_area.textContent = Plaintext;
            document.body.appendChild(clip_area);
            clip_area.select();
            document.execCommand('copy');
            clip_area.remove();
        }
    }
    else{
        Cipertext = Aes.Ctr.decrypt(Cipertext, Key, 256);
        Plaintext = Aes.Ctr.decrypt(Cipertext, SHAPassword, 256);

        clip_area.textContent = Plaintext;
        document.body.appendChild(clip_area);
        clip_area.select();
        document.execCommand('copy');
        clip_area.remove();
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }