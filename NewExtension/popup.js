/*
todo
  addAccountData
  loadFileKey
  changeMainKey
*/

document.addEventListener(
  "DOMContentLoaded",
  ()=>{
    setClickEvents();
    setMouseEvents();
    reloadAccountData();
    setFileHandler();
    loginOnLoad();
  }
);
function setClickEvents(){
  $("#passwordTab").click(passwordTabClick);
  $("#sourceTab").click(sourceTabClick);
  $("#cookieTab").click(cookieTabClick);
  $("#addSourceTab").click(addSourceTabClick);
  $("#mngSourceTab").click(mngSourceTabClick);
  $("#setCookieTab").click(setCookieTabClick);
  $("#mngCookieTab").click(mngCookieTabClick);
  //password
  $("#newSecurityLV").click(newSecurityLVClick);
  $("#addAccount").click(addAccountClick);
  $("#changeMainKey").click(changeMainKeyClick);
  $("#confirmMainKey").click(confirmMainKeyClick);
  $("#chooseFileKey").click(chooseFileKeyClick);
  $("#downloadFileKey").click(downloadFileKeyClick);
}
function setMouseEvents(){
  $("#changeMainKey").mouseenter(()=>{
    $("#changeMainKey").html("變更");
  });
  $("#changeMainKey").mouseleave(()=>{
    $("#changeMainKey").html("主密碼");
  });
  $("#downloadFileKey").mouseenter(()=>{
    $("#downloadFileKey").html("下載");
  });
  $("#downloadFileKey").mouseleave(()=>{
      $("#downloadFileKey").html("檔案密碼");
  });
}
//top tabs
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

//可移動到cookie.js與source.js

