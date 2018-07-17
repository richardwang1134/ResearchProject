function AccountPage(){
    var table = document.querySelector("#TAccountData");
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
    var Password = document.createElement("td");
        Password.id = "label1";
        Password.innerHTML = "Password";

    table.appendChild(tr1);
    tr1.appendChild(Return);
    tr1.appendChild(Save);
    tr1.appendChild(Add);
    tr1.appendChild(space);
    table.appendChild(tr2);
    tr2.appendChild(Name);
    tr2.appendChild(Account);
    tr2.appendChild(Password);
    tr2.appendChild(space);

    }