var domainList = {
  "block" : [],
  "trust" : [],
  "csrf" : []
};


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "get"){
      sendResponse({domainList: domainList});
    }
    if (request.type == "sync"){
      domainList = request.domainList;
    }
  }
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  async (details)=>{
    //取得請求的目標網域與來源網域
    var target = new URL(details.url).hostname;
    var referer = await getReferer();
    //判斷是否將該請求設為Strict-Cookie
    if(strictCookie()){
      details.requestHeaders.push({name:"Strict-Cookie",value:"on"});
    }else{
      details.requestHeaders.push({name:"Strict-Cookie",value:"off"});
    }
    //設置請求的處理方式
    if(domainList["block"].includes(target))
      return newHeaders("Block");
    else if(domainList["trust"].includes(target))
      return newHeaders("Pass");
    else
      return newHeaders("Default");
    
    function getReferer(){
      return new Promise(
        (resolve,reject)=>{
          details.requestHeaders.forEach(
            (item)=>{
              if(item.name == "Referer"){
                resolve(new URL(item.value).hostname);
              }
            }
          );
          resolve("No Referer");
        }
      )
      
    }

    function strictCookie(){
      var result = false;
      domainList["csrf"].forEach(
        (item)=>{
          if(referer!=target && target.includes(item)){
            if(item.length==target.length){
                result = true;
            } 
            if(target.length>item.length){
              if(item[target.length-item.length-1]==".")
                result = true;
            }
          }
        }
      );
      return result;
    }
    
    function newHeaders(mode){
      var newHeader = {name:"Proxy-Mode",value:mode};
      details.requestHeaders.push(newHeader);
      return {requestHeaders: details.requestHeaders};
    }
  },
  {urls:["<all_urls>"]},
  ["blocking", "requestHeaders","extraHeaders"]
);

