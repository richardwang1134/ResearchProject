var whiteList = ["www.google.com","www.facebook.com"];
var obj = {"whiteList":whiteList};
chrome.storage.local.set(obj,()=>{console.log('Saved', key,whiteList);});