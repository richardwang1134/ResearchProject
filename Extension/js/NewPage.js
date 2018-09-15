async function NewPage(){

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
        Save.onclick=()=>{SaveAccountData(NameInput.value,AccountInput.value,PasswordInput.value,TwoPhaseLockCheckBox.id);}

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
    var StartTwoPhaseLock = document.createElement("th")
            StartTwoPhaseLock.id = "label";
            StartTwoPhaseLock.innerHTML = "TwoPhaseLock"
    var TwoPhaseLockCheckBox = document.createElement("th");
        TwoPhaseLockCheckBox.id = "uncheckbox";
        TwoPhaseLockCheckBox.onclick=()=>{
            if(TwoPhaseLockCheckBox.id == "uncheckbox"){
                TwoPhaseLockCheckBox.id = "checkbox";
            }
            else{
                TwoPhaseLockCheckBox.id = "uncheckbox";
            }
        }

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

    table.appendChild(tr5);
    tr5.appendChild(StartTwoPhaseLock);
    tr5.appendChild(TwoPhaseLockCheckBox);
    
}
async function SaveAccountData(Name,Account,Password,Phase){
    var Key = await GetKey1();
    var SHAPassword = await GetPassword();
    var Label = Name + "_" + Account ;
    var AccountLabel = await GetAccountLabel();
    var PhaseLabel = Label + "_" + "Phase";  
    var Cipertext;
    
    if(Phase == "checkbox"){
        Key2 = await GetKey2();
        if(Key2 == ""){
            alert("目前讀不到KEY2，請重新匯入");
        }
        else{
            Cipertext = Aes.Ctr.encrypt(Password,SHAPassword, 256);
            Cipertext = Aes.Ctr.encrypt(Cipertext,Key, 256);
            Cipertext = Aes.Ctr.encrypt(Cipertext,Key2, 256);

            try{
                AccountLabel.push(Label);
            }catch(err){
                AccountLabel = [];
                AccountLabel.push(Label);
            }

            chrome.storage.sync.set({[Label]:[Cipertext]},function(){});
            chrome.storage.sync.set({[PhaseLabel]:[Phase]},function(){});
            chrome.storage.sync.set({"AccountLabel":AccountLabel},function(){});

            AccountPage();
        }
    }
    else{
        Cipertext = Aes.Ctr.encrypt(Password,SHAPassword, 256);
        Cipertext = Aes.Ctr.encrypt(Cipertext,Key, 256);
        
        try{
            AccountLabel.push(Label);
        }catch(err){
            AccountLabel = [];
            AccountLabel.push(Label);
        }

        chrome.storage.sync.set({[Label]:[Cipertext]},function(){});
        chrome.storage.sync.set({[PhaseLabel]:[Phase]},function(){});
        chrome.storage.sync.set({"AccountLabel":AccountLabel},function(){});

        AccountPage();
    }
}

function GetAccountLabel(){
	return new Promise(
		(resolve)=>{
			chrome.storage.sync.get("AccountLabel",function(items){
                    resolve(items.AccountLabel);
			})
		}
	);
}