function SignPage(){
    var table = document.querySelector("#Tsign");
    while(table.firstChild){
        table.removeChild(table.lastChild);
    }
    var tr1 = document.createElement("tr");
    var Return = document.createElement("td");
        Return.id = "SignReturn";
        Return.onclick=()=>{ReturnHome();};
    var Save = document.createElement("td");
        Save.id = "SignSave";
        Save.onclick=()=>{ReturnHome();}
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
    table.appendChild(tr3);
    tr3.appendChild(Verify);
    tr3.appendChild(VerifyInput);
}