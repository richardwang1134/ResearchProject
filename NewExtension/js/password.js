//live while popup page open
var fileKey = "";
var mainKey = "";
var CurrentUrl = "";

//outline of password page
function setPasswordPage(){
    loginOnLoad();
    reloadAccountData();
    $("#newSecurityLV").click(newSecurityLVClick);
    $("#addAccount").click(addAccountClick);
    $("#changeMainKey").click(changeMainKeyClick);
    $("#changeMainKey").mouseenter(()=>{$("#changeMainKey").html("變更");});
    $("#changeMainKey").mouseleave(()=>{$("#changeMainKey").html("主密碼");});
    $("#confirmMainKey").click(confirmMainKeyClick);
    $("#chooseFileKey").click(chooseFileKeyClick);
    $("#logout").click(LogoutWebsite);
    setFileHandler();
    $("#downloadFileKey").click(downloadFileKeyClick);
    $("#downloadFileKey").mouseenter(()=>{$("#downloadFileKey").html("下載");});
    $("#downloadFileKey").mouseleave(()=>{$("#downloadFileKey").html("檔案密碼");});
    
}

function loginOnLoad(){
    chrome.runtime.sendMessage({
        type:"getMainKey"
    },(response)=>{
        if(response.check=="pass"){
            mainKey = response.mainKey;
            $("#mainKeyText").css("background-color","#2196f3");
            $("#mainKeyText").css("color","#E3F2FD");
            $("#mainKeyText").val("*********");
            $("#confirmMainKey").html("登出");
        }
    });  

    chrome.runtime.sendMessage({
        type:"getUrl"
    },(response)=>{
        if(response.check=="pass"){
            CurrentUrl = response.url;
        }
    });
}
// ↓ reloadAccountData ↓ 
function reloadAccountData(){
    $("#accountScroll").empty();
    chrome.runtime.sendMessage({
        type:"getAccount"
    },(response)=>{
        if(response.check=="pass"){
            accountData = deJSON2D(response.accountData);
            for(var i=0; i<accountData.length;i++){
                let account = accountData[i];
                //動態產生帳號資料列表
                let item1 = document.createElement("div");
                item1.className = 'Item Flex2';
                item1.innerHTML = account[0];
                let item2 = document.createElement("div");
                item2.className = 'Item Flex3';
                item2.innerHTML = account[1];
                let item3 = document.createElement("div");
                item3.className = 'Item Flex3 Clickable';
                item3.innerHTML = account[2];
                item3.onclick = ()=>{ copy(account[2]) };
                let item4 = document.createElement("div");
                item4.className = 'Item Flex3 Clickable';
                item4.innerHTML = "複製密碼";
                item4.onclick = ()=>{ copyPassword(account) };
                let item5 = document.createElement("div");
                item5.className = 'Item Flex2 Clickable';
                item5.innerHTML = "刪除";
                item5.onclick = ()=>{ deleteAccount(account) };
                let fixRow = document.createElement("div");
                fixRow.className = "FixRow";
                fixRow.appendChild(item1);
                fixRow.appendChild(item2);
                fixRow.appendChild(item3);
                fixRow.appendChild(item4);
                fixRow.appendChild(item5);
                var scroll = document.getElementById("accountScroll");
                scroll.appendChild(fixRow);
            }
        }
    });
}
function enJSON2D(array){
    var jsonArray = [];
    var json;
    for(var i=0;i<array.length;i++){
      jsonArray.push(JSON.stringify(array[i]));
    }
    json = JSON.stringify(jsonArray);
    return json;
  }
function deJSON2D(json){
    var array =[];
    var jsonArray = JSON.parse(json);
    for(var i=0;i<jsonArray.length;i++){
      array.push(JSON.parse(jsonArray[i]));
    }
    return array;
}
function deleteAccount(account){
    chrome.runtime.sendMessage({
        type:"deleteAccount",
        value:JSON.stringify(account)
    },(response)=>{
        if(response.check=="pass")
            reloadAccountData(); 
        else
            alert("刪除失敗");
    });
}
function copy(str){
    el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}
function copyPassword(account){
    var securityLV = account[0];
    var encryptedPassword = account[3];
    console.log("copy",encryptedPassword);
    var password1 = Aes.Ctr.decrypt(encryptedPassword,mainKey,256);
    console.log("copy",password1);
    console.log("copy",mainKey);
    if(securityLV=="1"){
        copy(password1);
    }else if(!fileKey){
        alert("取得安全等級2帳號的密碼前必須先上傳檔案密碼!");
        return;
    }else if(securityLV=="2"){
        var password2 = Aes.Ctr.decrypt(password1,fileKey,256);
        copy(password2);
    }
}
// ↑ reloadAccountData ↑ 
function newSecurityLVClick(){
    if($("#newSecurityLV").html()=="1") $("#newSecurityLV").html("2");
    else $("#newSecurityLV").html("1");
}
function addAccountClick(){
    var security = $("#newSecurityLV").html();
    var name = $("#newSiteName").val();
    var account =  $("#newAccount").val();
    var password = $("#newPassword").val();
    var encyptedPassword = Aes.Ctr.encrypt(password,mainKey,256);
    if(!(name&&account&&password)){
        alert("請確認所有欄位皆已填寫完成");
        return;
    }
    if(mainKey==""){
        alert("請先輸入主密碼並按「登入」!");
        return;
    }
    if(security=="2"){
        if(!fileKey){
            alert("新增安全等級2帳號前必須先上傳檔案密碼!");
            return;
        }else{
            var fileEnc = Aes.Ctr.encrypt(password,fileKey,256);
            encyptedPassword = Aes.Ctr.encrypt(fileEnc,mainKey,256);
        }
    }
    chrome.runtime.sendMessage({
        type:"addAccount",
        security:security,
        name:name,
        account:account,
        password:encyptedPassword
    },(response)=>{
        if(response.check=="pass"){
            reloadAccountData();
            $("#newSecurityLV").html("1");
            $("#newSiteName").val("");
            $("#newAccount").val("");
            $("#newPassword").val("");
        }else{
            alert("新增失敗");
        }
    })
}
function changeMainKeyClick(){
    if(mainKey==""){
        alert("請先輸入主密碼並按下「登入」!");
        return;
    }
    var newPassword = prompt("請輸入新密碼");
    if(!newPassword){
        alert("新密碼不可為空");
        return;
    }
    newKey = sha256(newPassword);
    newTestData = Aes.Ctr.encrypt("1234567890",newKey,256);
    chrome.runtime.sendMessage({
        type:"getAccount"
    },(response)=>{
        accountData = deJSON2D(response.accountData);
        for(var i = 0; i < accountData.length; i++){
            d = Aes.Ctr.decrypt(accountData[i][3],mainKey,256);
            console.log(d);
            accountData[i][3] = Aes.Ctr.encrypt(d,newKey,256);
            console.log(accountData[i][3]);
            console.log(newKey);
        }
        chrome.runtime.sendMessage({
            type:"updateAccountData",
            accountData:enJSON2D(accountData),
            newTestData:newTestData
        },(response)=>{
            if(response.check=="pass"){
                mainKey = newKey;
                console.log(mainKey);
                reloadAccountData();
                alert("更改成功");
            }else{
                alert("更改失敗");
            }
        });
    });
    //解密
    //加密
    //存入
}

function confirmMainKeyClick(){
    if(mainKey==""){
        var password = sha256($("#mainKeyText").val());
        chrome.runtime.sendMessage({
            type:"confirmMainKey",
            value:password
        },(response)=>{
            if(response.check=="pass"){
                mainKey = password;
                $("#mainKeyText").css("background-color","#2196f3");
                $("#mainKeyText").css("color","#E3F2FD");
                $("#mainKeyText").val("*********");
                $("#confirmMainKey").html("登出");
            }else{
                alert("密碼驗證錯誤");
            }
        });
    }else{
        chrome.runtime.sendMessage({
            type:"forgetMainKey"
        },(response)=>{
            if(response.check=="pass"){
                mainKey = "";
                $("#mainKeyText").css("background-color","#E3F2FD");
                $("#mainKeyText").css("color","#212121");
                $("#mainKeyText").val("");
                $("#confirmMainKey").html("登入");
            }else{
                alert("登出失敗");
            }
        });
    }
}
// ↓ chooseFileKeyClick ↓ 
function chooseFileKeyClick(){
    if($("#chooseFileKey").html()=="選擇"){
        $("#fileInput").click();
        return;
    }else{
        $("#fileStatus").css("background-color","#E3F2FD");
        $("#fileStatus").css("color","#212121");
        $("#fileStatus").html("未上傳");
        $("#chooseFileKey").html('選擇');
        fileKey="";
    }
}
function setFileHandler(){
    var fileInput = document.getElementById("fileInput");
    fileInput.addEventListener("change", fileHandler, false);
}
function fileHandler() {
    var file = this.files[0];
    var fileReader = new FileReader();
    fileReader.onload = (event)=>{
        key = event.target.result;
        confirmFileKey(key);
    };
    fileReader.readAsText(file);
}
function confirmFileKey(key){
    chrome.runtime.sendMessage({
        type:"confirmFileKey",
        value:key
    },(response)=>{
        if(response.check=="pass"){
            fileKey = key;
            $("#fileStatus").css("background-color","#2196f3");
            $("#fileStatus").css("color","#E3F2FD");
            $("#fileStatus").html("已上傳");
            $("#chooseFileKey").html("選擇");
        }else{
            alert("密碼驗證錯誤");
        }
    });
}
// ↑ chooseFileKeyClick ↑ 
function downloadFileKeyClick(){
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 64; i++) {
        s[i] = hexDigits[Math.floor(Math.random() * 0x10)];
    }
    var k = s.join("");
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(k));
    element.setAttribute('download', 'FileKey.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
function LogoutWebsite(){
    var domain = "https://" + CurrentUrl.substring(0,CurrentUrl.length-1);
    chrome.cookies.getAll({url:domain},function(cookies){
        var names = [],
            num = cookies.length;
        if(num > 0){
            for (var i = 0; i < num; i++){
                names.push(cookies[i].name);
            }
            for (var i = 0, num = names.length; i < num; i++){
                chrome.cookies.remove({url:domain,name:names[i]});
            }
        }
    });
    chrome.tabs.reload();
    console.log("已成功登出網站");
}

