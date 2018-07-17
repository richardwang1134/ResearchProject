function SettingPage(){
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
        Save.onclick=()=>{ReturnHome();}

    var tr2 = document.createElement("tr");
    var CurrentPassword = document.createElement("th");
        CurrentPassword.innerHTML = "CurrentPassword:";
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
    
}