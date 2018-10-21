function setCookieTabClick(){
    $("#setCookieTab").removeClass("Clickable");
    $("#mngCookieTab").addClass("Clickable");
  }
function mngCookieTabClick(){
$("#setCookieTab").addClass("Clickable");
$("#mngCookieTab").removeClass("Clickable");
}