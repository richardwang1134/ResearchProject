document.addEventListener(
  "DOMContentLoaded",
  ()=>{
    $("#passwordTab").click(()=>{
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
    });
    $("#sourceTab").click(()=>{
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
    });
    $("#addSourceTab").click(()=>{
      $("#addSourceTab").removeClass("Clickable");
      $("#mngSourceTab").addClass("Clickable");
    });
    $("#mngSourceTab").click(()=>{
      $("#addSourceTab").addClass("Clickable");
      $("#mngSourceTab").removeClass("Clickable");
    });
    $("#cookieTab").click(()=>{
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
    });
    $("#setCookieTab").click(()=>{
      $("#setCookieTab").removeClass("Clickable");
      $("#mngCookieTab").addClass("Clickable");
    });
    $("#mngCookieTab").click(()=>{
      $("#setCookieTab").addClass("Clickable");
      $("#mngCookieTab").removeClass("Clickable");
    });
  }
);