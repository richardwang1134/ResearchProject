async function SettingPage(){
    TwoPhaseLock = await GetTwoPhase();
    Status = await GetStatus();
    if(Status == "Login"){
        var table = document.querySelector("#Tsetting");
        while(table.firstChild){
            table.removeChild(table.lastChild);
        }
        var tr1 = document.createElement("tr");
        var Return = document.createElement("td");
            Return.id = "LogReturn";
            Return.onclick=()=>{ReturnHome();};
        var Save = document.createElement("td");
            Save.id = "LogSave";
            Save.onclick=()=>{SaveSetting(CurrentPasswordInput.value,ChangePasswordInput.value,AssurePasswordInput.value,TwoPhaseLockCheckBox.id);}

        var tr2 = document.createElement("tr");
        var CurrentPassword = document.createElement("th");
            CurrentPassword.innerHTML = "Password:";
            CurrentPassword.id = "label";
        var CurrentPasswordInput = document.createElement("input");
            CurrentPasswordInput.id = "input";

        var tr3 = document.createElement("tr");
        var ChangePassword = document.createElement("th");
            ChangePassword.innerHTML = "ChangePassword:";
            ChangePassword.id = "label";
        var ChangePasswordInput = document.createElement("input");
            ChangePasswordInput.id = "input";
    
        var tr4 = document.createElement("tr");
        var AssurePassword = document.createElement("th");
            AssurePassword.innerHTML = "AssurePassword:";
            AssurePassword.id = "label";
        var AssurePasswordInput = document.createElement("input");
            AssurePasswordInput.id = "input";

        var tr5 = document.createElement("tr");
        var StartTwoPhaseLock = document.createElement("th")
            StartTwoPhaseLock.id = "label";
            StartTwoPhaseLock.innerHTML = "TwoPhaseLock"
        var TwoPhaseLockCheckBox = document.createElement("th");
        if(TwoPhaseLock == "off"){
            TwoPhaseLockCheckBox.id = "uncheckbox";
        }else{
            TwoPhaseLockCheckBox.id = "checkbox";
        }
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
        tr2.appendChild(CurrentPassword)
        tr2.appendChild(CurrentPasswordInput);
        table.appendChild(tr3);
        tr3.appendChild(ChangePassword);
        tr3.appendChild(ChangePasswordInput);
        table.appendChild(tr4);
        tr4.appendChild(AssurePassword);
        tr4.appendChild(AssurePasswordInput);
        table.appendChild(tr5);
        tr5.appendChild(StartTwoPhaseLock);
        tr5.appendChild(TwoPhaseLockCheckBox);
    }else{
        ReturnHome();
    }   
}
function GetTwoPhase(){
	return new Promise(
		(resolve)=>{
			chrome.runtime.sendMessage(
                {get:"TwoPhase"},
                (response)=>{
                    resolve(JSON.parse(response.TwoPhaseLock));
                }
            );
		}
	);
}
function updateTwoPhase(){
    var json_str = JSON.stringify(TwoPhaseLock);
    chrome.runtime.sendMessage(
        {Twophaseupdate: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
            }else{
                console("login update failed");
            }
        }
    );
}
async function SaveSetting(CurrentPassword,ChangePassword,AssurePassword,TwoPhaseID){
    var correct = await GetPassword();
    if(sha256(CurrentPassword) == correct){
        if(TwoPhaseID == "uncheckbox"){
            if(TwoPhaseLock == "on"){
                DecryptAllData();
            }
            TwoPhaseLock = "off";
            updateTwoPhase();
        }
        else if(TwoPhaseID == "checkbox"){
            if(TwoPhaseLock == "off"){
                EncryptAllData();
            }
            TwoPhaseLock = "on";
            updateTwoPhase();
        }
        else{
            console.log("error");
        }
        if(ChangePassword != "" && AssurePassword != ""){
            if(ChangePassword == AssurePassword){
                chrome.storage.sync.set({"password":sha256(ChangePassword)},function(){});
                console.log("成功改變密碼");
                ReturnHome();
            }
            else{
                alert("請重新確認欲改變的密碼");
            }
        }
        else{
            ReturnHome();
        }
    }
    else{
        alert("密碼錯誤!");
    }
}
async function DecryptAllData(){
    //將所有現有資料讀取出來並解密
    Key2 = await GetKey2();
    if(Key2 == ""){
        alert("讀不到Key，請重新匯入KEY");
        ReturnHome();
    }else{
        var AccountLabels = await GetAccountLabel();
        try{
            for(var i = 0 ; i < AccountLabels.length; i++){
                var passwd = await GetAccountPassword(AccountLabels[i]);
                var Cipertext = Aes.Ctr.decrypt(passwd,Key2, 256);
                chrome.storage.sync.set({[AccountLabels[i]]:[Cipertext]},function(){});
            }
        }catch(error){
            ;
        }
    }
}
async function EncryptAllData(){
    Key2 = GenerateKey();
    saveTextAsFile("Key2",Key2);
    //將所有現有資料讀取出來並加密
    var AccountLabels = await GetAccountLabel();
    try{
        for(var i = 0 ; i < AccountLabels.length; i++){
            var passwd = await GetAccountPassword(AccountLabels[i]);
            var Cipertext = Aes.Ctr.encrypt(passwd,Key2, 256);
            chrome.storage.sync.set({[AccountLabels[i]]:[Cipertext]},function(){});
        }
    }catch(error){

    }
    await updateKey2();
}
function saveTextAsFile( _fileName, _text ) {
    var textFileAsBlob = new Blob([_text], {type:'text/plain'});

    var downloadLink = document.createElement("a");
    downloadLink.download = _fileName;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

function updateKey2(){
    var json_str = JSON.stringify(Key2);
    chrome.runtime.sendMessage(
        {Key2update: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
            }else{
                console("Key update failed");
            }
        }
    );
}
function GetKey2(){
	return new Promise(
		(resolve)=>{
			chrome.runtime.sendMessage(
                {get:"Key2"},
                (response)=>{
                    resolve(JSON.parse(response.Key2));
                }
            );
		}
	);
}