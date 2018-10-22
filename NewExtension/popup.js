/*
todo
  addAccountData
  loadFileKey
  changeMainKey
*/

document.addEventListener(
  "DOMContentLoaded",
  ()=>{
    setTopTabs();
    setPasswordPage();
    setSourcePage();
    setCookiePage();
  }
);
// ↓ setTopTabs ↓ 
function setTopTabs(){
  $("#passwordTab").click(passwordTabClick);
  $("#sourceTab").click(sourceTabClick);
  $("#cookieTab").click(cookieTabClick);
}
function passwordTabClick(){
  /* tabs */
  $("#passwordTab.Clickable").removeClass("Clickable");
  $("#sourceTab,#cookieTab").addClass("Clickable");
  /* content */
  $("#password").css("display","flex");
  $("#sourceTabs").css("display","none");
  $("#addSource").css("display","none");
  $("#mngSource").css("display","none");
  $("#cookieTabs").css("display","none");
  $("#setCookie").css("display","none");
  $("#mngCookie").css("display","none");
}
function sourceTabClick(){
  /* tabs */
  $("#sourceTab.Clickable").removeClass("Clickable");
  $("#cookieTab,#passwordTab").addClass("Clickable");
  /* subtabs */
  $("#addSourceTab").removeClass("Clickable");
  $("#mngSourceTab").addClass("Clickable");
  /* content */
  $("#password").css("display","none");
  $("#sourceTabs").css("display","flex");
  $("#addSource").css("display","flex");
  $("#mngSource").css("display","none");
  $("#cookieTabs").css("display","none");
  $("#setCookie").css("display","none");
  $("#mngCookie").css("display","none");
}
function cookieTabClick(){
    /* tabs */
    $("#cookieTab.Clickable").removeClass("Clickable");
    $("#sourceTab,#passwordTab").addClass("Clickable");
    /* subtabs */
    $("#setCookieTab").removeClass("Clickable");
    $("#mngCookieTab").addClass("Clickable");
    /* content */
    $("#password").css("display","none");
    $("#sourceTabs").css("display","none");
    $("#addSource").css("display","none");
    $("#mngSource").css("display","none");
    $("#cookieTabs").css("display","flex");
    $("#setCookie").css("display","flex");
    $("#mngCookie").css("display","none");
}
// ↑ setTopTabs ↑ 


