<?php

    $SQliteDB = 'sqlite:/root/ResearchProject/SQLiteDB/injected.sqlite';
    
    $pdo = new PDO($SQliteDB);

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
        header("Location: http://192.168.0.104/msgBoard.php");
    }else{
?>
<html>
    <head>
        <meta charset="UTF-8">
        <title>測試</title> 
        <link rel="stylesheet" type="text/css" href="main.css">
        <script src="jquery-3.3.1.js" type="text/javascript"></script>
        <script src="main.js" type="text/javascript"></script>
    </head>
    <body>
        <div class = "backdark item"></div>
        <div class = "row flex3 skyblue">
            <div class = "backdark item"></div>
            <div class = "column skyblue">
                <div class = "blue item"> 「網頁跨站防禦系統」測試網站 </div>
                <div class = "row flex15">
                    <div class = "blue item">帳號</div>
                    <div class = "flex3 item">
                        <input type="textarea" class="inputArea" id="username">
                    </div>
                </div>
                <div class = "row flex15">
                    <div class = "blue item">密碼</div>
                    <div class = "flex3 item">
                        <input type="textarea" class="inputArea" id="password">
                    </div>
                </div>
                <div class = "blue item"  id="message"></div>
                <div class = "row">
                    <div class = "dark item" onclick="login()">登入</div>
                    <div class = "dark item" onclick="register()">註冊</div>
                </div>
                
            </div>
            <div class = "backdark item"></div>
        </div>
        <div class = "backdark item"></div>
    </body> 
</html>
<?php
    }
?>
