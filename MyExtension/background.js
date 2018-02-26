var whiteList = ["www.google.com","www.facebook.com"];
var obj = {"whiteList":whiteList};
var chromeContentSettings = chrome.contentSettings;

//chrome.storage.local.set(obj,()=>{console.log('Saved', key,whiteList);});
chrome.browserAction.onClicked.addListener(ChangeSettings);

if (chromeContentSettings) {

    var incognito,
      url,
      setting,
      tabId;
}

chrome.tabs.onUpdated.addListener(function (tabId, props, tab) {
  // Prevent multiple calls
  if (props.status == "loading" && tab.selected) {
    //console.info("onUpdated");
    getSettings();
  }
});

chrome.tabs.onHighlighted.addListener(function () {
  //console.info("onHighlighted");
  getSettings();
});

chrome.windows.onFocusChanged.addListener(function () {
  //console.info("onFocusChanged");
  getSettings();
});

chrome.windows.getCurrent(function () {
  getSettings();
});

function getSettings() {
    chrome.tabs.query({
      'active': true,
      'windowId': chrome.windows.WINDOW_ID_CURRENT
    }, function (tabs) {
      var tab = tabs[0];
  
      if (tab) {
        //console.log(tab);
        incognito = tab.incognito;
        url = tab.url;
        tabId = tab.id;
        tabIndex = tab.index;
        //console.info("Current tab settings : "+url);
        chromeContentSettings.javascript.get({
            'primaryUrl': url,
            'incognito': incognito
          },
          function (details) {

          });
      };
    });
  }

function ChangeSettings(){
    //console.info("Current tab settings : "+url);
    chromeContentSettings.javascript.get({
        'primaryUrl': url,
        'incognito': incognito
      },
      function (details) {
        setting = details.setting;
        console.log('now setting->',setting);
        if (setting) {

          var newSetting = (setting == 'allow' ? 'block' : 'allow');
          console.log('new setting->',newSetting);     
          chromeContentSettings.javascript.set({
            'primaryPattern': '<all_urls>',
            'setting': newSetting,
            'scope': (incognito ? 'incognito_session_only' : 'regular')
          }, 
          function () {
              //console.log(newSetting);
              UpdateIcon(newSetting);
          });   
        };     
    });
}

function UpdateIcon(NewSetting){
    chrome.browserAction.setIcon({
        path: NewSetting + ".png"
    });
}