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
        addCondtions($sql,$data);
        $conn = new PDO('sqlite:C:\SQLiteDB\proxy.sqlite');
        $stmt = $conn->prepare($sql);
        /*if($stmt) echo 'ok';
        else echo 'fail';
        die();*/
        bindValues($stmt,$data);
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        die();
}
echo 'out';
die();

function addCondtions(&$command,$data){
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
    $command = $command.' '.$linking.' (EDITTIME BETWEEN :TrigST AND :TrigED)';
    $linking = 'AND';
    //新增EditTime
    $command = $command.' '.$linking.' (TRIGGERTIME BETWEEN :EditST AND :EditED);';
    //echo $command;
}
function bindValues(&$stmt,$data){
    if($data['Domain']!=""and$data['Domain']!="all") $stmt->bindValue(':Domain',$data['Domain']);
    if($data['Type']!="all") $stmt->bindValue(':Type',$data['Type']);
    if($data['Tag']!="all") $stmt->bindValue(':Tag',$data['Tag']);
    $stmt->bindValue(':TrigST',strtotime($data['TrigST']));
    $stmt->bindValue(':TrigED',strtotime($data['TrigED']));
    $stmt->bindValue(':EditST',strtotime($data['EditST']));
    $stmt->bindValue(':EditED',strtotime($data['EditED']));
}

?>