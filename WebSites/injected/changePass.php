<?php

    $SQliteDB = 'sqlite:C:\SQLiteDB\injected.sqlite';
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
?>

<html>
    <head>
        <title>測試</title> 
        <link rel="stylesheet" type="text/css" href="main.css">
        <script src="jquery-3.3.1.js" type="text/javascript"></script>
        <script src="main.js" type="text/javascript"></script>
    </head>
    <body>
        <div class = "item backdark"></div>
        <div class = "row flex3">
            <div class = "item backdark"></div>
            <div class = "column skyblue">
                <div class = "item blue">update password</div>
                <div class = "row flex3">
                    <div class = "item blue">new password</div>
                    <div class = "item flex3">
                        <input type="textarea" class="inputArea" id="newPass">
                    </div>
                </div>
                <div class = "item blue" id="message">&nbsp;</div>
                <div class = "row">
                    <div class = "item dark" onclick ="changePass()">confirm</div>
                    <div class = "item dark" onclick ="goBack()">logout</div>
                </div>
            </div>
            <div class = "item backdark"></div>
        </div>
        <div class = "item backdark"></div>
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