<?php

    //connect to server
    $db_host = "127.0.0.1";       
    $db_name = "my_msgboard";           
    $db_user = "richard";       
    $db_pass = "1234";       
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user,$db_pass );

    //get cookie
    if(isset($_COOKIE["username"])&&isset($_COOKIE["password"])){
        $username = $_COOKIE["username"];
        $password = $_COOKIE["password"];
    }else{
        $username = null;
        $password = null;
    }
    
    //check usernmae and password
    $accounts = $pdo->query("SELECT * FROM account");
    $success = false;
    foreach($accounts as $account){
        if($account['username']==$username AND $account['password']==$password){
            $success = true;
        }
    }
    if($success){
        header("Location: http://cs051.csie.ncyu.edu.tw/msgBoard.php");
    }else{
?>
<html>
    <head>
        <meta charset="UTF-8">
        <title>嘉大留言板</title> 
        <link rel="stylesheet" type="text/css" href="main.css">
        <script src="jquery-3.3.1.js" type="text/javascript"></script>
        <script src="main.js" type="text/javascript"></script>
    </head>
    <body>
        <div>
            <p>歡迎使用嘉大留言板</p>
        </div>
        <div>
            <form>
                <a>帳號&nbsp</a><input type="text" id="username"><br><br>
                <a>密碼&nbsp</a><input type="text" id="password">
            </form>
        </div>
        <div>
            <button type="button" onclick="login()">登入</button>
            <button type="button" onclick="register()">註冊</button>
        </div>
        <p id="message">&nbsp;</p>
    </body> 
</html>
<?php
    }
?>