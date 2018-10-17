async function LogPage(){
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
            Save.onclick=()=>{KeyChange(PasswordInput.value);}
        var tr2 = document.createElement("tr");
        var Password = document.createElement("th");
            Password.innerHTML = "KeyValue:";
            Password.id = "label";
        var PasswordInput = document.createElement("input");
            PasswordInput.id = "input";

        table.appendChild(tr1);
        tr1.appendChild(Save);
        tr1.appendChild(Return);
        table.appendChild(tr2);
        tr2.appendChild(Password)
        tr2.appendChild(PasswordInput);
}

async function KeyChange(password){
    Password = sha256(password);

    updatePassword();
    ReturnHome();
}
function GetPassword(){
	return new Promise(
		(resolve)=>{
			chrome.runtime.sendMessage(
                {get:"Password"},
                (response)=>{
                    Password = JSON.parse(response.password);
                    resolve(Password);
                }
            );
		}
	);
}
function updatePassword(){
    var json_str = JSON.stringify(Password);
    chrome.runtime.sendMessage(
        {Passwordupdate: json_str },
        (response)=>{
            var ack = JSON.parse(response.ack);
            if(ack == "OK"){
            }else{
                console("login update failed");
            }
        }
    );
}