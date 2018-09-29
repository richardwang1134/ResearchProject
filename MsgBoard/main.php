<?php
    
    //connect to server
    $db_host = "127.0.0.1";       
    $db_name = "my_msgboard";           
    $db_user = "richard";       
    $db_pass = "1234";       
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user,$db_pass );

    //receive request
    $username = $_GET["username"];
    $password = $_GET["password"];

    //check usernmae and password
    $accounts = $pdo->query("SELECT * FROM account");
    $success = false;
    foreach($accounts as $account){
        if($account['username']==$username AND $account['password']==$password){
            $success = true;
        }
    }
    if($success)    echo "success";
    else            echo "fail";
    $pdo = null;

?>
