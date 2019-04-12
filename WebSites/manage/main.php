<?php

$SQliteDB = 'sqlite:C:\SQLiteDB\proxy.sqlite';

session_start();

$data = json_decode(file_get_contents("php://input"), true);

switch($data["type"])
{
    case 'check':
        if(isset($_SESSION["account"]))
            echo 'pass';
        else
            echo 'fail';
        die();
    case "login":
        try{
            $conn = new PDO($SQliteDB);
            $account = $data['account'];
            $password = hash('sha256',$data['password']);


            foreach($conn->query("SELECT * FROM account") as $row){
                if( $row['account']==$account and
                    $row['password']==$password){
                    $_SESSION["account"] = $account;
                    $conn = null;
                    echo 'pass';
                    die();
                }
            }
            echo 'fail';
        }catch(PDOException $e){
            echo 'error';
        }
        $conn = null;
        die;

    case "logout":
        session_unset();
        session_destroy();
        echo 'complete';
        die();

    case 'search':
        if(!isset($_SESSION['account'])) die();
        $sql = 'SELECT * FROM list';
        addSearchCondtions($sql,$data);
        $conn = new PDO($SQliteDB);
        $stmt = $conn->prepare($sql);
        /*if($stmt) echo 'ok';
        else echo 'fail';
        die();*/
        bindSearchValues($stmt,$data);
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        die();
    case 'insert':
        if(!isset($_SESSION['account'])) die();
        $sql = "INSERT or REPLACE INTO list ('DOMAINNAME','TAG','SECURITY','EDITTIME','TRIGGERTIME')
                VALUES ";
        addInsertValues($sql,$data);
        try{
            $conn = new PDO($SQliteDB);
            $stmt = $conn->prepare($sql);
            bindInsertValues($stmt,$data);
            $stmt->execute();
            echo 'complete';
        }catch(PDOException $e){
            echo($e->getMessage());
        }
        die();
    case 'modify':
        if(!isset($_SESSION['account'])) die();
        $sql = "UPDATE list
                SET TAG=:TAG,
                    SECURITY=:SECURITY
                WHERE DOMAINNAME = :DOMAINNAME";
        try{
            $conn = new PDO($SQliteDB);
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':DOMAINNAME',$data['DOMAINNAME']);
            $stmt->bindValue(':TAG',$data['TAG']);
            $stmt->bindValue(':SECURITY',$data['SECURITY']);
            $stmt->execute();
            echo 'complete';
        }catch(PDOException $e){
            echo($e->getMessage());
        }
        die();
    case 'delete':
        if(!isset($_SESSION['account'])) die();
        $sql = "DELETE FROM list
                WHERE DOMAINNAME = :DOMAINNAME";
        try{
            $conn = new PDO($SQliteDB);
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':DOMAINNAME',$data['DOMAINNAME']);
            $stmt->execute();
            echo 'complete';
        }catch(PDOException $e){
            echo($e->getMessage());
        }
        die();
    default:
        echo 'unexpected post';
}
die();

function bindInsertValues(&$stmt,$data){
    for($i=0; $i<count($data['DOMAINNAME']); $i++){
        if( $data['TAG'][$i]!='static'&&
            $data['TAG'][$i]!='dynamic'&&
            $data['TAG'][$i]!='delete'){
            echo 'TAG not TAG';
            return false;
        }
        if( $data['TYPE'][$i]!='block'&&
            $data['TYPE'][$i]!='pass'){
            echo 'TYPE not TYPE';
            return false;
        }
        $stmt->bindValue(':DOMAINNAME_'.$i,$data['DOMAINNAME'][$i]);
        $stmt->bindValue(':TAG_'.$i,$data['TAG'][$i]);
        $stmt->bindValue(':TYPE_'.$i,$data['TYPE'][$i]);
        $stmt->bindValue(':EDITTIME_'.$i,time());
        $stmt->bindValue(':TRIGGERTIME_'.$i,0);
    }
    return true;
}

function addInsertValues(&$sql,$data){
    
    for($i=0; $i<count($data['DOMAINNAME']); $i++){
        $sql = $sql.'(';
        $sql = $sql.':DOMAINNAME_'.$i.',';
        $sql = $sql.':TAG_'.$i.',';
        $sql = $sql.':TYPE_'.$i.',';
        $sql = $sql.':EDITTIME_'.$i.',';
        $sql = $sql.':TRIGGERTIME_'.$i.')';
        if($i<count($data['DOMAINNAME'])-1){
            $sql = $sql.',';
        }else{
            $sql = $sql.';';
        }
    }
    
}

function addSearchCondtions(&$command,$data){
    //新增Domain
    $linking = 'WHERE';
    if($data['Domain']!=""and$data['Domain']!="all"){
        $command = $command.' '.$linking.' DOMAINNAME = :Domain';
        $linking = 'AND';
    }
    //新增Type
    if($data['Type']!="all"){
        $command = $command.' '.$linking.' SECURITY = :Type';
        $linking = 'AND';
    }
    //新增Tag
    if($data['Tag']!="all"){
        $command = $command.' '.$linking.' TAG = :Tag';
        $linking = 'AND';
    }
    //新增TrigTime
    $command = $command.' '.$linking.' (EDITTIME BETWEEN :EditST AND :EditED)';
    $linking = 'AND';
    //新增EditTime
    $command = $command.' '.$linking.' (TRIGGERTIME BETWEEN :TrigST AND :TrigED);';
    //echo $command;
}
function bindSearchValues(&$stmt,$data){
    if($data['Domain']!=""and$data['Domain']!="all") $stmt->bindValue(':Domain',$data['Domain']);
    if($data['Type']!="all") $stmt->bindValue(':Type',$data['Type']);
    if($data['Tag']!="all") $stmt->bindValue(':Tag',$data['Tag']);
    $stmt->bindValue(':TrigST',strtotime($data['TrigST']));
    $stmt->bindValue(':TrigED',strtotime($data['TrigED']));
    $stmt->bindValue(':EditST',strtotime($data['EditST']));
    $stmt->bindValue(':EditED',strtotime($data['EditED']));
}

?>