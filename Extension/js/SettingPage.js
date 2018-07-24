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
    if(CurrentPassword == correct){
        if(TwoPhaseID == "uncheckbox"){
            TwoPhaseLock = "off";
            updateTwoPhase();
        }
        else if(TwoPhaseID == "checkbox"){
            TwoPhaseLock = "on";
            var Key = await GetKey2();
            QRcode(Key);
            updateTwoPhase();
        }
        else{
            console.log("error");
        }
        if(ChangePassword != "" && AssurePassword != ""){
            if(ChangePassword == AssurePassword){
                chrome.storage.local.set({"password":ChangePassword},function(){});
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


