var fileKey="";

function reloadAccountData(){
    $("#accountScroll").empty();
    chrome.runtime.sendMessage({
        type:"getAccount"
    },(response)=>{
        if(response.response){
            jAccountData = JSON.parse(response.response);
            for(var i=0; i<jAccountData.length;i++){
                var account = JSON.parse(jAccountData[i]);
                $("#accountScroll").append(
                    "<div class='FixRow'>"+
                        "<div class='Item Flex2'>"+account[0]+"</div>"+
                        "<div class='Item Flex3'>"+account[1]+"</div>"+
                        "<div class='Item Flex3 Clickable' onclick='copyAccount()'>"+account[2]+"</div>"+
                        "<div class='Item Flex3 Clickable' onclick='copyPassword()'>複製密碼</div>"+
                        "<div class='Item Flex2 Clickable' onclick='removeAccount()'>刪除</div>"+
                    "</div>"
                )
            }
        }
    });
}
function loginOnLoad(){
    chrome.runtime.sendMessage({
        type:"getMainKey"
    },(response)=>{
        if(response.response){
            $("#mainKeyText").css("background-color","#2196f3");
            $("#mainKeyText").css("color","#E3F2FD");
            $("#mainKeyText").val("已登入");
            $("#confirmMainKey").html("登出");
        }
    });
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
        if(response.response=="pass"){
            fileKey = key;
            console.log(fileKey)
            $("#fileStatus").css("background-color","#2196f3");
            $("#fileStatus").css("color","#E3F2FD");
            $("#fileStatus").html("已上傳");
            $("#chooseFileKey").html("取消");
        }else{
            alert("密碼驗證錯誤");
        }
    });
}

//click events

function newSecurityLVClick(){
    if($("#newSecurityLV").html()=="1") $("#newSecurityLV").html("2");
    else $("#newSecurityLV").html("1");
}
function addAccountClick(){
    if($("#confirmMainKey").html()=="確定"){
        alertMainKey();
        return;
    }
    if($("#addAccountRow div:first-child").html=="2"){
        alert("檔案密碼待製作")
    }
    var mainKey = $("#mainKeyText").val();
    var secure = $("#newSecurityLV").html();
    var name = $("#newSiteName").val();
    var account =  $("#newAccount").val();
    var password = $("#newPassword").val();
    if(emptyString(name)||emptyString(account)||emptyString(password)){
        alertEmptyInput();
        return;
    }
    chrome.runtime.sendMessage({
        type:"addAccount",
        secure:secure,
        name:name,
        account:account,
        password:password,
        mainKey:mainKey
    },(response)=>{
        if(response.response=="success"){
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
    if($("#confirmMainKey").html()=="確定"){
        alertMainKey();
        return;
    }
    var newPassword = prompt("請輸入新密碼");
    if(emptyString(newPassword)){
    alertEmptyInput();
    return;
    }
    //從資料庫取得帳號資料
    //解密
    //加密
    //存入
}
function confirmMainKeyClick(){
    if($("#confirmMainKey").html()=="登入"){
        var password = $("#mainKeyText").val();
        chrome.runtime.sendMessage({
            type:"confirmMainKey",
            value:password
        },(response)=>{
            if(response.response=="pass"){
                $("#mainKeyText").css("background-color","#2196f3");
                $("#mainKeyText").css("color","#E3F2FD");
                $("#mainKeyText").val("已登入");
                $("#confirmMainKey").html("登出");
            }else{
                alert("密碼驗證錯誤");
            }
        });
    }else{
        $("#mainKeyText").css("background-color","#E3F2FD");
        $("#mainKeyText").css("color","#212121");
        $("#mainKeyText").val("");
        $("#confirmMainKey").html("登入");
    }
}
function chooseFileKeyClick(){
    if($("#chooseFileKey").html()=="選擇"){
        $("#fileInput").click();
        return;
    }else{
        $("#fileStatus").css("background-color","#E3F2FD");
        $("#fileStatus").css("color","#212121");
        $("#fileStatus").html("未上傳");
        $("#chooseFileKey").html('選擇');
    }
}
function downloadFileKeyClick(){
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 64; i++) {
        s[i] = hexDigits[Math.floor(Math.random() * 0x10)];
    }
    var FileKey = s.join("");
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(FileKey));
    element.setAttribute('download', 'FileKey.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

//reuse codes
function alertMainKey(){
alert("請先輸入主密碼並按下「登入」!");
}
function alertEmptyInput(){
alert("請確認所有欄位皆已填寫完成");
}
function emptyString(s){
if(s==null||s=="") return true;
else return false;
}