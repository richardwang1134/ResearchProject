function addSourceTabClick(){
    $("#addSourceTab").removeClass("Clickable");
    $("#mngSourceTab").addClass("Clickable");
    $("#addSource").css("display","flex");
    $("#mngSource").css("display","none");
  }
  function mngSourceTabClick(){
    $("#addSourceTab").addClass("Clickable");
    $("#mngSourceTab").removeClass("Clickable");
    $("#addSource").css("display","none");
    $("#mngSource").css("display","flex");
  }