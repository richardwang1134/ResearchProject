chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    var newHeader = {
      name : "Proxy-Mode",
      value : "Default"
    };
    var headers = details.requestHeaders;
    headers.push(newHeader);
    console.log(headers);
    return {requestHeaders: headers};
  },
  {urls: ["<all_urls>"]},
  ["blocking", "requestHeaders"]);