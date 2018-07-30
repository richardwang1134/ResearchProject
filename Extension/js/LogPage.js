async function LogPage(){

    Status = await GetStatus();
    TwoPhaseLock = await GetTwoPhase();

    if(Status=="Login"){
        Status = "Logout";
        console.log("成功登出!");
        updateStatus();
        ReturnHome();
    }
    else{
        var table = document.querySelector("#TLog");
        while(table.firstChild){
            table.removeChild(table.lastChild);
        }
        var tr1 = document.createElement("tr");
        var Return = document.createElement("td");
            Return.id = "LogReturn";
            Return.onclick=()=>{ReturnHome();};
        var Save = document.createElement("td");
            Save.id = "LogSave";
            Save.onclick=()=>{DataVerify(PasswordInput.value,VerifyInput.value);}
        var tr2 = document.createElement("tr");
        var Password = document.createElement("th");
            Password.innerHTML = "Password:";
            Password.id = "label";
        var PasswordInput = document.createElement("input");
            PasswordInput.id = "input";

        var tr3 = document.createElement("tr");
        var Verify = document.createElement("th");
            Verify.innerHTML = "Verify:";
            Verify.id = "label";
        var VerifyInput = document.createElement("input");
            VerifyInput.id = "input";

        table.appendChild(tr1);
        tr1.appendChild(Save);
        tr1.appendChild(Return);
        table.appendChild(tr2);
        tr2.appendChild(Password)
        tr2.appendChild(PasswordInput);

        if(TwoPhaseLock == "on"){
            table.appendChild(tr3);
            tr3.appendChild(Verify);
            tr3.appendChild(VerifyInput);
        }
    }
}

async function DataVerify(Password){
    var correct = await GetPassword();
    Password = sha256(Password);
    //缺開2階情況下的認證
        if(Password == correct){
            Status = "Login";
            updateStatus();
            console.log("成功登入!");
            ReturnHome();
        }else{
            alert("密碼錯誤");
        }
}
function GetPassword(){
	return new Promise(
		(resolve)=>{
			chrome.storage.local.get("password",function(items){
				resolve(items["password"]);
			})
		}
	);
}
function GetStatus(){
	return new Promise(
		(resolve)=>{
			chrome.runtime.sendMessage(
                {get:"Status"},
                (response)=>{
                    resolve(JSON.parse(response.status));
                }
            );
		}
	);
}
function updateStatus(){
    var json_str = JSON.stringify(Status);
    chrome.runtime.sendMessage(
        {Statusupdate: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
            }else{
                console("login update failed");
            }
        }
    );
}