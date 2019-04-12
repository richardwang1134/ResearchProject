function login(){
    $.ajax({
        url: 'main.php',
        type: 'GET',
        async: 'false',
        data: {
            type:"login",
            username: $('#username').val(),
            password: $('#password').val()
        },
        error: function(xhr) {
            alert('Ajax request 發生錯誤');
        },
        success: function(response) {
            $("#message").html(response);
            if(response=="success"){
                location.href = "msgBoard.php";
            }
        }
    });
}
function register(){
    $.ajax({
        url: 'main.php',
        type: 'GET',
        async: 'false',
        data: {
            type:"register",
            username: $('#username').val(),
            password: $('#password').val()
        },
        error: function(xhr) {
            alert('Ajax request 發生錯誤');
        },
        success: function(response) {
            $("#message").html(response);
        }
    });
}
function goChangePass(){
    $.ajax({
        url: 'main.php',
        type: 'GET',
        async: 'false',
        data: {
            type:"goChangePass"
        },
        error: function(xhr) {
            alert('Ajax request 發生錯誤');
        },
        success: function(response) {
            location.href = "changePass.php";
        }
    });
}
function changePass(){
    $.ajax({
        url: 'main.php',
        type: 'GET',
        async: 'false',
        data: {
            type:"changePass",
            password: $('#newPass').val()
        },
        error: function(xhr) {
            alert('Ajax request 發生錯誤');
        },
        success: function(response) {
            $("#message").html(response);
            /*if(response=="success"){
                location.href = " welcome.php";
            }*/
        }
    });
}
function goBack(){
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    location.href = "welcome.php";
}
function addMsg(){
    var msg = $("#message").val();
    $.ajax({
        url: 'main.php',
        type: 'POST',
        async: 'false',
        data: {
            type:"addMsg",
            message: msg
        },
        error: function(xhr) {
            alert('Ajax request 發生錯誤');
        },
        success: function(response) {
            if(response=="success"){
                location.reload();
            }else{
                $("#message").html(response);
            }
        }
    });
}
function logout(){
    $.ajax({
        url: 'main.php',
        type: 'GET',
        async: 'false',
        data: {
            type:"logout"
        },
        error: function(xhr) {
            alert('Ajax request 發生錯誤');
        },
        success: function(response) {
            $("#message").html(response);
            if(response=="success"){
                location.href = "welcome.php";
            }
        }
    });
}