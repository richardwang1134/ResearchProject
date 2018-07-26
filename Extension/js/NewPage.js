function NewPage(){
    var table = document.querySelector("#TAccountData");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    var tr1 = document.createElement("tr");
    
    var Return = document.createElement("td");
        Return.id = "LogReturn";
        Return.onclick=()=>{AccountPage();};
    var Save = document.createElement("td");
        Save.id = "LogSave";
        Save.onclick=()=>{SaveAccountData(NameInput.value,AccountInput.value,PasswordInput.value);}

    var tr2 = document.createElement("tr");
    var Name = document.createElement("th");
        Name.innerHTML = "Name:";
        Name.id = "label";
    var NameInput = document.createElement("input");
        NameInput.id = "input";

    var tr3 = document.createElement("tr");
    var Account = document.createElement("th");
        Account.innerHTML = "Account:";
        Account.id = "label";
    var AccountInput = document.createElement("input");
        AccountInput.id = "input";
    
    var tr4 = document.createElement("tr");
    var Password = document.createElement("th");
        Password.innerHTML = "Password:";
        Password.id = "label";
    var PasswordInput = document.createElement("input");
        PasswordInput.id = "input";
    var tr5 = document.createElement("tr");

    table.appendChild(tr1);
    tr1.appendChild(Save);
    tr1.appendChild(Return);
    table.appendChild(tr2);
    tr2.appendChild(Name)
    tr2.appendChild(NameInput);
    table.appendChild(tr3);
    tr3.appendChild(Account);
    tr3.appendChild(AccountInput);
    table.appendChild(tr4);
    tr4.appendChild(Password);
    tr4.appendChild(PasswordInput);
}
async function SaveAccountData(Name,Account,Password){
    var Key = await GetKey1();
    var Cipertext;
    if(TwoPhaseLock == "on"){
        Key2 = await GetKey2();
        if(Key2 == ""){
            alert("讀不到Key，請重新匯入Key資料");
            ReturnHome();
        }
        else{
            Cipertext = Aes.Ctr.encrypt(Password, Key, 256);
            var Label = Name + "_"+ Account ; 
            Cipertext = Aes.Ctr.encrypt(Cipertext, Key2, 256);
            var AccountLabel = await GetAccountLabel();
            try{
                AccountLabel.push(Label);
            }catch(err){
                AccountLabel = [];
                AccountLabel.push(Label);
            }
            chrome.storage.local.set({[Label]:[Cipertext]},function(){});
            chrome.storage.local.set({"AccountLabel":AccountLabel},function(){});
            AccountPage();
        }
    }
    else{
        var Label = Name + "_"+ Account ; 
        Cipertext = Aes.Ctr.encrypt(Password, Key, 256);
        var AccountLabel = await GetAccountLabel();
        try{
            AccountLabel.push(Label);
        }catch(err){
            AccountLabel = [];
            AccountLabel.push(Label);
        }
        chrome.storage.local.set({[Label]:[Cipertext]},function(){});
        chrome.storage.local.set({"AccountLabel":AccountLabel},function(){});
        AccountPage();
    }
}
function GetAccountLabel(){
	return new Promise(
		(resolve)=>{
			chrome.storage.local.get("AccountLabel",function(items){
                    resolve(items.AccountLabel);
			})
		}
	);
}