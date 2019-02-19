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
  (details)=>{
    var url = new URL(details.url);
    var domain = url.hostname;
    if(domainList["block"].includes(domain))
      return newHeaders("Block");
    if(domainList["trust"].includes(domain))
      return newHeaders("Pass");
    if(domainList["csrf"].includes(domain))
      return newHeaders("NoCookie");
    return newHeaders("Default");

    function newHeaders(mode){
      var newHeader = {name:"Proxy-Mode",value:mode};
      details.requestHeaders.push(newHeader);
      console.log(details.requestHeaders);
      return {requestHeaders: details.requestHeaders};
    }
  },
  {urls:["<all_urls>"]},
  ["blocking", "requestHeaders"]
);

