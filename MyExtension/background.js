var whiteList = ["www.google.com","www.facebook.com","www.youtube.com"];
var obj = {"whiteList":whiteList};
var chromeContentSettings = chrome.contentSettings;

if (chromeContentSettings) {
    var url,
      setting,
      tabId;
}

chrome.tabs.onUpdated.addListener(
  async function (tabId, props, tab) {
    var WL;
    TabDomain = tab.url.split("/")[2];
    for(var i = 0; i < whiteList.length ; i++){
      if(whiteList[i] == TabDomain){
        await ChangeSettings("allow");
        WL = true;
      }
    }
    if (props.status == "loading" && !WL) {
      await ChangeSettings("block");
      console.log("--------------------------------------");
    }
});
function ChangeSettings(status){
  return new Promise(
    (resolve)=>{
      var newSetting = status;
      //console.log('new setting->',newSetting);
      chromeContentSettings.javascript.set({
        'primaryPattern': '<all_urls>',
        'setting': newSetting,
      },
      function () {
        UpdateIcon(newSetting);
        resolve();   
    });    
  });
}

function UpdateIcon(NewSetting){
    chrome.browserAction.setIcon({
        path: NewSetting + ".png"
    });
}