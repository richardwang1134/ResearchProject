chrome.storage.sync.clear();


//------------以上測試用-------------------------
/*
  todo
    更新cookie的資料
    新增確定欄位 <<

    一開始讀取資料到記憶體
    之後從記憶體讀取
    確保所有更新資料動作都有set
    確保一開始讀取資料是get讀出來的
    重新命名    
*/
/*
  block inline 筆記
    偵測關鍵字document.cookie
    偵測eval
*/
/*
  sync area keys
    mainKeyTestData   主密碼測試資料
    accoountDat       帳號資料
    recordData        引用跨站腳本的紀錄 [ref1:[url,url,....],ref2:[url,url,....],...]
    targets           信任與不信任的名單 [ref1:[url/block,url/pass,....],....]
    cookieData        針對特定網域的cookie特殊設定 [ref1:[name,samesite]] samesite = strict lax default
*/

document.write('<script src="js/sha256.js"></script>');
document.write('<script src="js/AES.js"></script>');

var mainKey = "";
var accountData=[];
var recordData=[];
var targets=[];
var cookieData=[];
var CurrentUrl;

loadDatas();

function loadDatas(){

}
//
chrome.webRequest.onBeforeRequest.addListener(
	(details)=>{
      //get info
			var url = details.url;
			var rid = details.requestId.toString();
      var tid = details.tabId;
      var ref = details.initiator;
      if(tid == -1 || ref == null) return;
      var refDomain = ref.split("/")[2];
      var urlDomain = url.split("/")[2];
      //check
      var result = checkTargets(refDomain,urlDomain);
      //reaction
      if(result == "stranger"){
        return {cancel: true};
        if(confirm("發現未知的跨站腳本，來自"+urlDomain+"，是否預覽內容?")){
          window.open(url);
        }
      }else if(result == "block"){
        return {cancel: true};
      }
      //record
      var samesite = refDomain.match(urlDomain);
      if(!samesite) addToRecord(refDomain,urlDomain);
      else addRecord(refDomain);
      return ;
	},{
    urls: ["<all_urls>"],
		types: ["script"]
  },
    ["blocking"]
);
chrome.tabs.onSelectionChanged.addListener(
	function (tabId,selectinfo) {
	chrome.tabs.getSelected(null,
		async function(tab){
      CurrentUrl = tab.url.split("/")[2];
  });
});
function checkTargets(refDomain,urlDomain){
  var result = "pass";
  var samesite = refDomain.match(urlDomain);
  if(!samesite){
    for(var i=0; i<targets.length; i++){
      var key = Object.keys(targets[i])[0];
      if(key == refDomain){//和目標網域相同
        var match = false;
        for(var j=0; j<targets[i][key].length; j++){
          var arr = targets[i][key][j].split('/');
          if(arr[0]==urlDomain){
            match = true;
            result = arr[1];
          }
        }
        if(!match)  result = "stranger";
      }
    }
  }
  return result;
}
function addRecord(refDomain){
  var refExist = false;
  for(var i=0; i<recordData.length; i++){
    if(recordData[i].hasOwnProperty(refDomain)){
      refExist = true;
      urlDomains = recordData[i][refDomain];
      break;
    }
  }
  if(!refExist){
    var obj = {};
    obj[refDomain] = [];
    recordData.push(obj);
  }
}
function addToRecord(refDomain,urlDomain){
  var refExist = false;
  var urlExist = true;
  for(var i=0; i<recordData.length; i++){
    if(recordData[i].hasOwnProperty(refDomain)){
      refExist = true;
      urlDomains = recordData[i][refDomain];
      if(!urlDomains.includes(urlDomain)){
        urlExist = false;
        recordData[i][refDomain].push(urlDomain);
        break;
      }
    }
  }
  if(!refExist){
    urlExist = false;
    var obj = {};
    obj[refDomain] = [urlDomain];
    recordData.push(obj);
  }
  if(!urlExist){
    console.log("跨站腳本紀錄 : 發出的網域",refDomain);
    console.log("              腳本來源網域",urlDomain);
  }
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse)=>{
    switch(request.type){
      case 'confirmMainKey':
        confirmMainKey(request,sendResponse);
        return true;
      case 'forgetMainKey':
        mainKey = "";
        sendResponse({check:"pass"});
        return true;
      case 'confirmFileKey':
        confirmFileKey(request,sendResponse);
        return true;
      case 'addAccount':
        addAccount(request,sendResponse);
        return true;
      case 'getAccount':
        sendResponse({check:"pass",accountData:enJSON2D(accountData)});
        return true;
      case 'getMainKey':
        getMainKey(sendResponse);
        return true
      case 'deleteAccount':
        deleteAccount(request,sendResponse);
        return true;
      case 'updateAccountData':
        updateAccountData(request,sendResponse)
        return true;
      case 'getRecord':
        sendResponse({check:"pass",recordData:JSON.stringify(recordData)});
        return true;
      case 'addTarget':
        addTarget(request,sendResponse);
        return true;
      case 'getTargets':
        sendResponse({check:"pass",targets:JSON.stringify(targets)});
        return true;
      case 'deleteTarget':
        deleteTarget(request,sendResponse);
        return true;
      case 'updateTarget':
        updateTarget(request,sendResponse);
        return true;
      case 'getUrl':
        sendResponse({check:"pass",url:JSON.stringify(CurrentUrl)});
        return true;
    }
  }
);
function updateTarget(request,sendResponse){
  var target = request.target;
  var key = Object.keys(target)[0];
  for(var i=0;i<targets.length;i++){
    if(Object.keys(targets[i])[0]==key){
      targets[i]=target;
    }
  }
  console.log("更新目標 :",key);
  console.log("         ",target[key]);
}

function confirmMainKey(request,sendResponse){
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
}
function confirmFileKey(request,sendResponse){
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
}
function addAccount(request,sendResponse){
  var thisAcountData = [request.security,request.name,request.account,request.password];
  console.log("新增帳號 :",thisAcountData);
  accountData.push(thisAcountData);
  jAccountData=enJSON2D(accountData);
  chrome.storage.sync.set({
    "accountData":jAccountData
  },()=>{
    sendResponse({check:"pass"});
  });
}
function getMainKey(sendResponse){
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
  
}
function deleteAccount(request,sendResponse){
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
}
function updateAccountData(request,sendResponse){
  chrome.storage.sync.set({
    "accountData":request.accountData,
    "mainKeyTestData":request.newTestData
  },()=>{
    accountData = deJSON2D(request.accountData)
    console.log("更新帳號資料 :",accountData);
    sendResponse({check:"pass"});
  });
}
function addTarget(request,sendResponse){
  var key = request.key;
  var list = request.list;
  var exist = false;
  var newTarget = {};
  newTarget[key] = list;
  for(var i=0;i<targets.length;i++){
    if(Object.keys(targets[i])[0]==key){
      targets[i] = newTarget;
      exist = true;
      console.log("更新防禦目標 :",key);
      console.log("             ",list);
      break;
    }    
  }
  if(!exist){
    targets.push(newTarget);
    console.log("新增防禦目標 :",key);
    console.log("             ",list);
  }
  
  chrome.cookies.getAll({
    url:"https://"+key
  },(cookies)=>{
    for(var i =0;i<cookies.length;i++){
      setCookieStrict(cookies[i],key);
    }
  });

  chrome.storage.sync.set({
    targets:targets
  },()=>{
    sendResponse({check:"pass"});
  });
  
}
function deleteTarget(request,sendResponse){
  var url = request.target;
  var match = false;
  for(var i=0;i<targets.length;i++){
    var key = Object.keys(targets[i])[0];
    if(key == url){
      targets.splice(i,1);
    }
  }
  chrome.storage.sync.set({
    targets:targets
  },()=>{
    sendResponse({check:"pass"});
    console.log("刪除防禦目標 :",url);
  });
}
function setCookieStrict(cookie,url){
  console.log(cookie);
  chrome.cookies.remove({
    url:"https://"+url
    ,name:cookie.name
  },(detailis)=>{
    chrome.cookies.set({
      url:"https://"+url
      ,name:cookie.name
      ,value:cookie.value
      ,path:cookie.path
      ,secure:cookie.secure
      ,httpOnly:cookie.httpOnly
      ,sameSite:"strict"
      ,expirationDate:cookie.expirationDate
      ,storeId:cookie.storeId
    },(c)=>{
      console.log(c);
    })
  })
  
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