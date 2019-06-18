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
    //get message
    $accounts = $pdo->query("SELECT * FROM account");
    $success = false;
    $message = "";
    foreach($accounts as $account){
        if($account['username']==$username AND $account['password']==$password){
            $success = true;
        }
        if(!empty($account['message'])){
            $message .= $account['username'].' : '.$account['message']."</p><p>";
        }
    }
    if($success){
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
        <div class = "row">
            <div class = "item backdark"></div>
            <div class = "column">
                <div class = "item blue">Message Board</div>
                <div class = "item skyblue">
                    <input type="textarea" class="inputArea" id="message">
                </div>
                <div class = "row">
                    <div class = "item dark" onclick="addMsg()">update message</div>
                    <div class = "item dark" onclick="goChangePass()">update password</div>
                    <div class = "item dark" onclick="logout()">logout</div>
                </div>
                <div class = "item blue">messages</div>
                <div class = "column skyblue flex7">
                    <div class = "scroll">

            <!--
            <p>留言輸入區</p>
            <div id="input">
                <form>
                    <input type="text" id="message">
                </form>
            </div>
            <div>
                <button type="button" onclick="addMsg()" id="add">更新留言</button>
                <button type="button" onclick="changePass()">更改密碼</button>
                <button type="button" onclick="logout()">登出</button>
            </div>
            <p id="response">&nbsp</p>
            <p>留言顯示區</p>
        -->

<?php
    echo "<p>".$message."</p>";
?>
                        </div>
                    </div>
                </div>
            <div class = "item backdark"></div>
        </div>
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

