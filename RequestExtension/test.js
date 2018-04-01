var callback = function(details) {
    console.log(details);
};
var filter = {urls: ["<all_urls>"]};
var opt_extraInfoSpec = [];

chrome.webRequest.onBeforeSendHeaders.addListener(
        callback, filter, opt_extraInfoSpec);