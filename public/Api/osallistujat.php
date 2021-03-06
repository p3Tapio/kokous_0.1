<?php 
$_POST = json_decode(file_get_contents('php://input'), true); 

if(isset($_POST["call"])) {
    $call = htmlspecialchars(strip_tags($_POST["call"])); 
    switch ($call) {
        case 'getosallistujat':
            getOsallistujat(); 
            break; 
        case 'poistaosallistuja':
            poistaOsallistuja();
            break; 
        case 'lisaaosallistuja':
            lisaaOsallistuja();
            break; 
    }
} else if (implode(array_column($_POST, 'call')) == 'postosallistujat') {
    postOsallistujat(); 
} else {
    http_response_code(400);
}
function getOsallistujat() {

    $response = array( "message"=> "Osallistujien haku epäonnistui.");
    http_response_code(400);

    if(isset($_POST['id'])) {
        $kokousId = (int)$_POST['id'];
        $q = "CALL osallistujat_getosallistujat($kokousId)";
        $yhteys = connect(); 
       
        $res = $yhteys->query($q);
        $rows = []; 
        while($row = mysqli_fetch_assoc($res)) {
            $rows[] = $row; 
        }
        echo json_encode($rows, JSON_UNESCAPED_UNICODE); 
        http_response_code(200);
        mysqli_close($yhteys);
        exit(); 
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE); 
}
function postOsallistujat() {
    
    $response = array( "message"=> "Osallistujien tallennus epäonnistui.");
    http_response_code(400);

    if(isset($_POST[0]['id_y']) && isset($_POST[0]['kokousnro'])) {
   
        $id_y = (int)$_POST[0]['id_y'];
        $kokousnro =  (int)$_POST[0]['kokousnro'];
        $x = array_shift($_POST);
        
        $yhteys = connect(); 
        $sql = "CALL osallistujat_poistakaikkiosallistujat($id_y, $kokousnro)";
        // echo $sql; 
        if($yhteys->query($sql)) {
           
            foreach($_POST as $item) {
                $role = htmlspecialchars(strip_tags($item['rooli']));
                $email =  htmlspecialchars(strip_tags($item['email']));
                
                $q = "CALL osallistujat_insertosallistujat($id_y, $kokousnro, '$role', '$email')";
                $yhteys = connect(); 
        
                if($yhteys->query($q)) {
                    $response = array( "message"=> "Osallistujien tiedot tallennettu.");
                    http_response_code(200);
                } else { 
                    $response = array( "message"=> "Osallistujien tallennus epäonnistui.");
                    http_response_code(400);
                }
                mysqli_close($yhteys);
            }
        }
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE); 
}
function poistaOsallistuja() { // {"call":"poistaosallistuja","kokousid":"33","email":"esco@mail.com"}
    $response = array( "message"=> "Osallistujan poistaminen epäonnistui.");
    http_response_code(400);

    if(isset($_POST['kokousid']) && isset($_POST['email'])) {
        $kokousid = (int)$_POST['kokousid']; 
        $email = htmlspecialchars(strip_tags($_POST['email']));
        
        $q = "CALL osallistujat_poistaosallistuja($kokousid, '$email')"; 
        $yhteys = connect(); 

        if($yhteys->query($q)) {
            $response = array( "message"=> "Osallistuja poistettu.");
            http_response_code(200);
        }
        mysqli_close($yhteys);
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE); 
}
function lisaaOsallistuja() {   // {"call":"lisaaosallistuja","kokousid":"33","yhdistys":"Kissaklubi","email":"testeri@mail.com"}

    $response = array( "message"=> "Osallistujan lisääminen epäonnistui.");
    http_response_code(400);
    
    if(isset($_POST['kokousid']) && isset($_POST['email']) && isset($_POST['yhdistys'])) {
        $kokousid = (int)$_POST['kokousid']; 
        $yhdistys = htmlspecialchars(strip_tags($_POST['yhdistys']));
        $email = htmlspecialchars(strip_tags($_POST['email']));
       
        $q = "CALL osallistujat_lisaaosallistuja($kokousid, '$email','$yhdistys')"; 
        $yhteys = connect(); 

        if($yhteys->query($q)) {
            $response = array( "message"=> "Osallistuja lisätty.");
            http_response_code(200);
        }
        mysqli_close($yhteys);
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE); 
}
function connect() {
    include("dbdetails.php");
    $yhteys = new mysqli($host, $user, $password, $db) or die("Connection fail ".mysqli_connect_error());
    $yhteys->set_charset("utf8");
    return $yhteys;
}
?> 