
document.addEventListener(
  "DOMContentLoaded",
  ()=>{
    setTopTabs();
    setPasswordPage();
    setAddTargetPage();
    setMngTargetPage();
  }
);
function setTopTabs(){
  $("#passwordTab").click(passwordTabClick);
  $("#addTab").click(addTabClick);
  $("#mngTab").click(mngTabClick);
}
function passwordTabClick(){
  /* tabs */
  $("#passwordTab.Clickable").removeClass("Clickable");
  $("#mngTab,#addTab").addClass("Clickable");
  /* content */
  $("#password").css("display","flex");
  $("#addTarget").css("display","none");
  $("#mngTarget").css("display","none");
}
function addTabClick(){
  /* tabs */
  $("#addTab.Clickable").removeClass("Clickable");
  $("#mngTab,#passwordTab").addClass("Clickable");
  /* content */
  $("#password").css("display","none");
  $("#addTarget").css("display","flex");
  $("#mngTarget").css("display","none");
}
function mngTabClick(){
    /* tabs */
    $("#mngTab.Clickable").removeClass("Clickable");
    $("#addTab,#passwordTab").addClass("Clickable");
    /* content */
    $("#password").css("display","none");
    $("#addTarget").css("display","none");
    $("#mngTarget").css("display","flex");
}


