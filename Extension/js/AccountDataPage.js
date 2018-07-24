async function AccountPage(){
    Status = await GetStatus();
    if(Status == "Login"){
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
        var Name = document.createElement("td");
            Name.id = "label1";
            Name.innerHTML = "Name";
        var Account = document.createElement("td");
            Account.id = "label1";
            Account.innerHTML = "Account";
        var Password = document.createElement("th");
            Password.id = "label1";
            Password.innerHTML = "Password";
        var twospace = document.createElement("th");

        table.appendChild(tr1);
        tr1.appendChild(Return);
        tr1.appendChild(threespace);
        tr1.appendChild(Add);
        tr1.appendChild(space);

        table.appendChild(tr2);
        tr2.appendChild(Name);
        tr2.appendChild(Account);
        tr2.appendChild(Password);
        tr2.appendChild(twospace);

        var ad = await GetAccountLabel();
        
        try{
            for(var i = 0 ; i < ad.length ; i++){
                var Password = await GetAccountPassword(ad[i]);
                AddAccountRow(ad[i],Password);
            }
        }catch(err){
            ;
        }
    }
    else{
        ReturnHome();
    }
}
function AddAccountRow(label,password){
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
        Password.onclick=()=>{Decrypt(password);}

    var Delete = document.createElement("td");
        Delete.id = "Del";
        Delete.onmouseover =()=>{Delete.innerHTML = "—";};
        Delete.onmouseout =()=>{Delete.innerHTML = "";};
        Delete.onclick=()=>{DeleteData(label);}

    table.appendChild(tr);
    tr.appendChild(Name);
    tr.appendChild(Account);
    tr.appendChild(Password);
    tr.appendChild(Delete);
}

function GetAccountPassword(AccountLabel){
	return new Promise(
		(resolve)=>{
			chrome.storage.local.get(AccountLabel,function(items){
                    resolve(items[AccountLabel]);
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
    chrome.storage.local.set({"AccountLabel":ad},function(){});
    AccountPage();
}
async function Decrypt(Cipertext) {
    var Key = await GetKey1();
    var Plaintext = Aes.Ctr.decrypt(Cipertext, Key, 256);
    var clip_area = document.createElement('textarea');

    clip_area.textContent = Plaintext;
    document.body.appendChild(clip_area);
    clip_area.select();
      
    document.execCommand('copy');
    clip_area.remove();
    
  }