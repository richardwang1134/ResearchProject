<?php
    //receive request
    if(isset($_GET["type"]))        $type = $_GET["type"];
    elseif(isset($_POST["type"]))   $type = $_POST["type"];
    else                            exit();
    if(isset($_POST["message"]))    $message = $_POST["message"];
    if(isset($_GET["username"]))    $username = $_GET["username"];
    if(isset($_GET["password"]))    $password = $_GET["password"];
    if(isset($_COOKIE["username"])) $c_username = $_COOKIE["username"];
    if(isset($_COOKIE["password"])) $c_password = $_COOKIE["password"];

    //connect to server
    $SQliteDB = 'sqlite:C:\SQLiteDB\injected.sqlite';
    $db_conn = new PDO($SQliteDB);     

    //login
    if($type == "login"){
        $accounts = $db_conn->query("SELECT * FROM account");
        $match = false;
        foreach($accounts as $account){
            if($account['username']==$username AND $account['password']==$password){
                $match = true;
            }
        }
        if($match){
            setcookie("username",$username);
            setcookie("password",$password);
            echo "success";
        }else{
            echo "帳號密碼錯誤";
        }            
    }

    //logout
    if($type == "logout"){
        setcookie("username","X",time() - 3600);
        setcookie("password","X",time() - 3600);
        echo "success";       
    }

    //register
    if($type == "register"){
        $accounts = $db_conn->query("SELECT * FROM account");
        $exist = false;
        foreach($accounts as $account){
            if($account['username']==$username){
                $exist = true;
            }
        }
        if($exist){
            echo "使用者名稱已存在";
        }else{
            $statement = $db_conn->prepare("
                INSERT INTO account (username, password) 
                VALUES ('$username', '$password')
            ");
            $statement->execute();
            echo "註冊成功";
        }
    }

    //change password
    if($type == "changePass"){
        if(match($db_conn,$c_username,$c_password)){
            $statement = $db_conn->prepare("
                UPDATE account 
                SET password = '$password'
                WHERE username = '$c_username'
            ");
            $statement->execute();
            echo "密碼已更新，請重新登入";
        }else{
            echo "not login";
        }
    }

    //add message
    if($type == "addMsg"){
        if(match($db_conn,$c_username,$c_password)){
            $statement = $db_conn->prepare("
                UPDATE account 
                SET message = '$message'
                WHERE username = '$c_username'
            ");
            $statement->execute();
            echo "success";
        }else{
            echo "您尚未登入";
        }
    }



    //close
    $db_conn = null;
    exit();

    function match($db_conn,$username,$password){
        $accounts = $db_conn->query("SELECT * FROM account");
        $match = false;
        foreach($accounts as $account){
            if($account['username']==$username AND $account['password']==$password){
                $match = true;
            }
        }
        return $match;
    }
?>
