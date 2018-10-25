chrome.storage.sync.clear();


//------------以上測試用-------------------------
/*
  todo
    cookie.js
      

    source.js


      處理方式
        記錄所有攻擊者的腳本來源
        檢查是否在防禦範圍內?
        是>>
          攔截並檢查腳本是否在白名單內
          是>>
            送出request2 "pass"
          否>>
            檢查腳本是否在黑名單內
            是>>
              送出request2 "block"
            否>>
              送出request2 "pass"
              
    background.js
      
         
*/
/*
  sync area keys
    mainKeyTetData  測設主密碼
    accountData     JSON([JSON[安全等級,網站名稱,帳號,加密後的密碼],JSON[.....]])
    whiteList       {ref1:[url,url,....],ref2:[url,url,....]}
*/

document.write('<script src="js/sha256.js"></script>');
document.write('<script src="js/AES.js"></script>');

var mainKey = "";
var accountData=[];
var records=[];
var whiteList={};

chrome.webRequest.onBeforeRequest.addListener(
	(details)=>{
			var url = details.url;
			var rid = details.requestId.toString();
			var tid = details.tabId;
			if(tid == -1) return;
      chrome.tabs.get(
				tid,
				(items)=>{
          var ref = items.url;
          var refDomain = ref.split("/")[2];
          var urlDomain = url.split("/")[2];
          var pass = checkWhiteList(refDomain,urlDomain);
          if(!pass){
            addToRecords(refDomain,urlDomain);
            //delete coockie, then(()=>{sendRequest2})
          }
        }
			)
      return ;
	},{
    urls: ["<all_urls>"],
		types: ["script"]
  },
    ["blocking"]
);
function checkWhiteList(refDomain,urlDomain){
  var pass = false;
  var samesite = refDomain.match(urlDomain);
  if(samesite){
    pass = true;
  }else if(whiteList[refDomain]){
    var urlList = whiteList[refDomain];
    for(var i=0; i<urlList.length; i++){
      if(urlList[i]==urlDomain) pass = true;
    }
    if(!pass) alert("在"+refDomain+"偵測到新的腳本來源 : "+urlDomain);
  }
  return pass;
}
function addToRecords(refDomain,urlDomain){
  var refExist = false;
  var urlExist = true;
  for(var i=0; i<records.length; i++){
    if(records[i].hasOwnProperty(refDomain)){
      refExist = true;
      urlDomains = records[i][refDomain];
      if(!urlDomains.includes(urlDomain)){
        urlExist = false;
        records[i][refDomain].push(urlDomain);
      }
    }
  }
  if(!refExist){
    urlExist = false;
    var obj = {};
    obj[refDomain] = [urlDomain];
    records.push(obj);
  }
  if(!urlExist){
    console.log("刪除cookie紀錄 : 被刪除cookie的網域",refDomain);
    console.log("                觸發的腳本來源網域",urlDomain);
  }
}

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
        var key = request.value;
        chrome.storage.sync.get(
          "mainKeyTestData",
          (response)=>{
            if(response.mainKeyTestData){//已登入
              data = response.mainKeyTestData;
              var decryptedData = Aes.Ctr.decrypt(data,key,256);
              if(decryptedData=="1234567890"){
                mainKey = key;
                sendResponse({check: "pass"});
                console.log("主密碼驗證 : 嘗試以sha256(mainKey)");
                console.log("           ",key);
                console.log("            對",data,"解密");
                console.log("            預期結果: 1234567890，解密結果:",decryptedData);
                console.log("            密碼驗證通過");
              }else{
                sendResponse({check:"fail"});
                console.log("主密碼驗證 : 嘗試以sha256(mainKey)");
                console.log("           ",key);
                console.log("            對",data,"解密");
                console.log("            預期結果: 1234567890，解密結果:",decryptedData);
                console.log("            密碼驗證失敗");
              }
            }
            else{//第一次登入
              mainKey = key;
              var mainKeyTestData = Aes.Ctr.encrypt("1234567890",key,256);
              chrome.storage.sync.set({"mainKeyTestData":mainKeyTestData});
              sendResponse({check: "pass"});
              console.log("主密碼驗證 : 第一次登入，以sha256(mainKey)");
              console.log("           ",mainKey);
              console.log("            建立新密碼的驗證資料",mainKeyTestData);
            }
           
          }
        )
        return true;
      /*
        登出
      */
      case 'forgetMainKey':
        mainKey = "";
        sendResponse({check:"pass"});
        return true;
      /*
        檔案密碼驗證
        1.  第一次登入，以hash(fileKey)對"1234567890"加密，產生fileKeyTestData並存起來
        2.  第二次起，以hash(fileKey)對mainKeyTestData解密，若解出1234567890表示成功
        3.  驗證完成密碼存在popup，存活週期為popup頁面開啟期間
      */
      case 'confirmFileKey':
        var fileKey = request.value;
        chrome.storage.sync.get(
          "fileKeyTestData",
          (response)=>{
            if(response.fileKeyTestData){//已登入
              data = response.fileKeyTestData;
              var decryptedData = Aes.Ctr.decrypt(data,fileKey,256);
              if(decryptedData=="1234567890"){
                sendResponse({check: "pass"});
                console.log("檔案密碼驗證 : 嘗試以檔案密碼");
                console.log("             ",fileKey);
                console.log("              對",data,"解密");
                console.log("              預期結果: 1234567890，解密結果:",decryptedData);
                console.log("              密碼驗證通過");
              }else{
                sendResponse({check:"fail"});
                console.log("檔案密碼驗證 : 嘗試以檔案密碼");
                console.log("             ",fileKey);
                console.log("              對",data,"解密");
                console.log("              預期結果: 1234567890，解密結果:",decryptedData);
                console.log("              密碼驗證失敗");
              }
            }else{//第一次登入
              var fileKeyTestData = Aes.Ctr.encrypt("1234567890",fileKey,256);
              chrome.storage.sync.set({"fileKeyTestData":fileKeyTestData});
              sendResponse({check: "pass"});
              console.log("檔案密碼驗證 : 第一次上傳，以檔案密碼");
              console.log("             ",fileKey);
              console.log("              建立新密碼的驗證資料",fileKeyTestData);
            }
          });
          return true;
      /*
        新增帳號
      */
      case 'addAccount':
        var thisAcountData = 
        [request.security,request.name,request.account,request.password];
        console.log("新增帳號 :",thisAcountData);
        accountData.push(thisAcountData);
        jAccountData=enJSON2D(accountData);
        chrome.storage.sync.set({
          "accountData":jAccountData
        },()=>{
          sendResponse({check:"pass"});
        });
        return true;
      /*
        回傳帳號
      */
      case 'getAccount':
        jAccountData=enJSON2D(accountData);
        sendResponse({
          check:"pass",
          accountData:jAccountData
        });
        return true;
      /*
        回傳MainKey
      */
      case 'getMainKey':
        if(mainKey){
          console.log("登入狀態 : 已登入");
          sendResponse({
            check:"pass",
            mainKey:mainKey
          });
        }else{
          console.log("登入狀態 : 未登入");
          sendResponse({check:"fail"});
        }
        
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
          console.log("刪除帳號 :",account);
          sendResponse({check:"pass"});
        });
        return true;
      case 'updateAccountData':
        chrome.storage.sync.set({
          "accountData":request.accountData,
          "mainKeyTestData":request.newTestData
        },()=>{
          accountData = deJSON2D(request.accountData)
          console.log("更新帳號資料 :",accountData);
          sendResponse({check:"pass"});
        });
        return true;
      case 'getRecord':
        sendResponse({check:"pass",records:JSON.stringify(records)});
        return true;
      case 'addToWhiteList':
        var url = request.url;
        var scriptDomains = JSON.parse(request.scriptDomains);
        whiteList[url] = scriptDomains;
        console.log("白名單更新 : 避免此網站",url);
        console.log("            因引用以下腳本被刪除cookie");
        console.log("           ",scriptDomains);
        chrome.storage.sync.set({
          "whiteList":whiteList
        },()=>{
          sendResponse({check:"pass"});
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
