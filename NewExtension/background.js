chrome.storage.sync.clear();


//------------以上測試用-------------------------
/*
  todo
    刪除資料
    複製密碼
    複製帳號
    改變MainKey
      password產生click事件
        檢查登入狀態 含一階二階
        檢查完成跳出輸入視窗
        送出新密碼到後端
        收到後端回覆後自動登出
        提醒重新登入
      背景
        收到新密碼
        讀accountData
        轉成陣列
        針對陣列中每個帳號的密碼解密再加密
        把accountData轉回去
        把accountData存起來

    
    
*/
/*
  sync area keys
    mainKeyTetData  測設主密碼
    accountData     JSON([JSON[安全等級,網站名稱,帳號,加密後的密碼],JSON[.....]])
*/

document.write('<script src="js/sha256.js"></script>');
document.write('<script src="js/AES.js"></script>');

var mainKey = "";
var accountData=[];

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse)=>{
    switch(request.type){
      /*
        密碼驗證
        1.  第一次登入，以hash(mainKey)對"1234567890"加密，產生mainKeyTestData並存起來
        2.  第二次起，以hash(mainKey)對mainKeyTestData解密，若解出1234567890表示成功
        3.  驗證完成密碼存在background，存活週期為重開瀏覽器或重開擴充功能
      */
      case 'confirmMainKey':
        var key = sha256(request.value);
        chrome.storage.sync.get(
          "mainKeyTestData",
          (response)=>{
            if(response.mainKeyTestData){//已登入
              data = response.mainKeyTestData;
              var decryptedData = Aes.Ctr.decrypt(data,key,256);
              if(decryptedData=="1234567890"){
                mainKey = key;
                sendResponse({response: "pass"});
                console.log("主密碼驗證 : 嘗試對",data,"解密");
                console.log("            預期結果: 1234567890");
                console.log("            解密結果:",decryptedData);
                console.log("            密碼驗證通過");
              }else{
                sendResponse({response:"fail"});
                console.log("主密碼驗證 : 嘗試對",data,"解密");
                console.log("            預期結果: 1234567890");
                console.log("            解密結果:",decryptedData);
                console.log("            密碼驗證失敗");
              }
            }
            else{//第一次登入
              mainKey = key;
              var mainKeyTestData = Aes.Ctr.encrypt("1234567890",key,256);
              chrome.storage.sync.set({"mainKeyTestData":mainKeyTestData});
              sendResponse({response: "pass"});
              console.log("主密碼驗證 : 第一次登入，已建立新密碼的驗證資料");
            }
           
          }
        )
        return true;
      /*
        檔案密碼驗證
        1.  第一次登入，以hash(fileKey)對"1234567890"加密，產生fileKeyTestData並存起來
        2.  第二次起，以hash(fileKey)對mainKeyTestData解密，若解出1234567890表示成功
        3.  驗證完成密碼存在popup，存活週期為popup頁面開啟期間
      */
      case 'confirmFileKey':
        var key = sha256(request.value);
        chrome.storage.sync.get(
          "fileKeyTestData",
          (response)=>{
            if(response.fileKeyTetData){//已登入
              data = response.fileKeyTestData;
              var decryptedData = Aes.Ctr.decrypt(data,key,256);
              if(decryptedData=="1234567890"){
                sendResponse({response: "pass"});
                console.log("檔案密碼驗證 : 嘗試對",data,"解密");
                console.log("              預期結果: 1234567890");
                console.log("              解密結果:",decryptedData);
                console.log("              密碼驗證通過");
              }else{
                sendResponse({response:"fail"});
                console.log("檔案密碼驗證 : 嘗試對",data,"解密");
                console.log("              預期結果: 1234567890");
                console.log("              解密結果:",decryptedData);
                console.log("              密碼驗證失敗");
              }
            }else{//第一次登入
              var fileKeyTestData = Aes.Ctr.encrypt("1234567890",key,256);
              chrome.storage.sync.set({"fileKeyTestData":fileKeyTestData});
              sendResponse({response: "pass"});
              console.log("檔案密碼驗證 : 第一次登入，已建立新密碼的驗證資料");
            }
          });
          return true;
      /*
        新增帳號
      */
      case 'addAccount':
        var shaMainKey = sha256(request.mainKey);
        var encryptedPassword = Aes.Ctr.encrypt(request.password,shaMainKey,256);
        var thisAcountData = [request.secure,request.name,request.account,encryptedPassword];
        console.log("新增帳號 : 加密等級:",request.secure,"網站名稱:",request.name,"帳號:",request.account);
        if(request.secure=="1")
        console.log("          以sha256(mainKey)對該帳號的密碼進行AES加密");
        else
        console.log("          以sha256(mainKey)與fileKey對該帳號的密碼各進行一次AES加密");
        accountData.push(thisAcountData);
        console.log(accountData);
        jAccountData=enJSON2D(accountData);
        console.log(jAccountData);
        chrome.storage.sync.set({
          "accountData":jAccountData
        },()=>{
          sendResponse({response:"success"});
        });
        /*chrome.storage.sync.get(
          "accountData",
          (response)=>{
            if(response.accountData){
              accountData = deJSON2D(response.accountData);
            }else accountData = [];
            accountData.push(thisAcountData);
            accountData=enJSON2D(accountData);
            chrome.storage.sync.set({"accountData":accountData});
            sendResponse({response:"success"});
          }
        );*/
        return true;
      /*
        回傳帳號
      */
      case 'getAccount':
        jAccountData=enJSON2D(accountData);
        chrome.storage.sync.set({"accountData":jAccountData});
        sendResponse({response:jAccountData});
        return true;
      /*
        回傳MainKey
      */
      case 'getMainKey':
        if(mainKey) console.log("登入狀態 : 已登入")
        else console.log("登入狀態 : 未登入")
        sendResponse({response:mainKey});
        return true;
      /*
        刪除帳號
      */
      case 'deleteAccount':
        var account = JSON.parse(request.value);
        var newAccountData = [];
        for(var i=0;i<accountData.length;i++){
            var match = true;
            for(var j=0;j<4;j++){
                if(accountData[i][j]!=account[j]){
                    match = false;
                }
            }
            if(!match) newAccountData.push(accountData[i]);
        }
        accountData = newAccountData;
        jAccountData=enJSON2D(accountData);
        chrome.storage.sync.set({
          "accountData":jAccountData
        },()=>{
          sendResponse({response:"success"});
        });
        return true;
    }
  }
);

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

