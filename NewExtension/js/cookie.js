function setCookiePage(){
  reloadCookieData();
  $("#setCookieTab").click(setCookieTabClick);
  $("#mngCookieTab").click(mngCookieTabClick);
}

function reloadCookieData(){
  chrome.tabs.getSelected(null,(tab)=>{
    chrome.cookies.getAll({
      url:tab.url
    },(cookie)=>{
      if(cookie){
        //console.log(cookie);
      }
    });
  });

}

function setCookieTabClick(){
    $("#setCookieTab").removeClass("Clickable");
    $("#mngCookieTab").addClass("Clickable");
  }
function mngCookieTabClick(){
$("#setCookieTab").addClass("Clickable");
$("#mngCookieTab").removeClass("Clickable");
}