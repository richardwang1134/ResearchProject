<?php

    //connect to server
    $db_host = file_get_contents("host.txt");       
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
?>

<html>
    <head>
        <title>嘉大留言板</title> 
        <link rel="stylesheet" type="text/css" href="main.css">
        <script src="jquery-3.3.1.js" type="text/javascript"></script>
        <script src="main.js" type="text/javascript"></script>
    </head>
    <body>
        <div>
            <form>
                <a>新密碼&nbsp</a><input type="text" id="newPass">
            </form>
        </div>
        <div>
            <button type="button" onclick ="changePass()">確認更改</button>
            <button type="button" onclick ="goBack()">重新登入</button>
        </div>
        <p id="message">&nbsp;</p>
    </body> 
</html>

<?php
    }else{
        echo "<script>";
        echo "alert('您已登出，請重新登入');\n";
        echo "location.href = 'http://".$db_host."/welcome.php';";
        echo "</script>";
        $pdo = null;
        exit();
    }
?>