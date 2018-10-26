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
    setXSSPage();
    setCookiePage();
  }
);
// ↓ setTopTabs ↓ 
function setTopTabs(){
  $("#passwordTab").click(passwordTabClick);
  $("#XSSTab").click(XSSTabClick);
  $("#cookieTab").click(cookieTabClick);
}
function passwordTabClick(){
  /* tabs */
  $("#passwordTab.Clickable").removeClass("Clickable");
  $("#XSSTab,#cookieTab").addClass("Clickable");
  /* content */
  $("#password").css("display","flex");
  $("#XSSTabs").css("display","none");
  $("#addXSS").css("display","none");
  $("#mngXSS").css("display","none");
  $("#cookieTabs").css("display","none");
  $("#setCookie").css("display","none");
  $("#mngCookie").css("display","none");
}
function XSSTabClick(){
  /* tabs */
  $("#XSSTab.Clickable").removeClass("Clickable");
  $("#cookieTab,#passwordTab").addClass("Clickable");
  /* subtabs */
  $("#addXSSTab").removeClass("Clickable");
  $("#mngXSSTab").addClass("Clickable");
  /* content */
  $("#password").css("display","none");
  $("#XSSTabs").css("display","flex");
  $("#addXSS").css("display","flex");
  $("#mngXSS").css("display","none");
  $("#cookieTabs").css("display","none");
  $("#setCookie").css("display","none");
  $("#mngCookie").css("display","none");
}
function cookieTabClick(){
    /* tabs */
    $("#cookieTab.Clickable").removeClass("Clickable");
    $("#XSSTab,#passwordTab").addClass("Clickable");
    /* subtabs */
    $("#setCookieTab").removeClass("Clickable");
    $("#mngCookieTab").addClass("Clickable");
    /* content */
    $("#password").css("display","none");
    $("#XSSTabs").css("display","none");
    $("#addXSS").css("display","none");
    $("#mngXSS").css("display","none");
    $("#cookieTabs").css("display","flex");
    $("#setCookie").css("display","flex");
    $("#mngCookie").css("display","none");
}
// ↑ setTopTabs ↑ 


