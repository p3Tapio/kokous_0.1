<?php

 $_POST = json_decode(file_get_contents('php://input'), true); 

 if(isset($_POST["call"])) {
    $call = htmlspecialchars(strip_tags($_POST["call"])); 
    switch ($call) {
        case 'getkokoukset':
            getKokoukset(); 
            break; 
        case 'kokousnro':
            getKokousNro(); 
            break; 
        case 'luokokous':
            luoKokous();
            break; 
        default:
            http_response_code(404);
    }
 } else {
    http_response_code(400);
 }
function getKokoukset() {

    $response = array("message"=> "error");

    if(isset($_POST["name"])) {
        $name = htmlspecialchars(strip_tags($_POST["name"])); 
        $sql= "CALL kokous_getkokoukset('$name')";
        $yhteys = connect(); 
        $res = $yhteys->query($sql);
        $rows = []; 
        while($row = mysqli_fetch_assoc($res)) {
            $rows[] = $row; 
        }
        echo json_encode($rows, JSON_UNESCAPED_UNICODE); 
        mysqli_close($yhteys);
        exit(); 
    } else {
        $response = array("message"=> "Tiedot puuttuu");
        http_response_code(400); 
    }
    echo json_encode($response);
}

function getKokousNro() {

    $response = array("message"=> "error");

    if(isset($_POST['name'])) {

        $name = htmlspecialchars(strip_tags($_POST['name'])); 
        $yhteys = connect(); 
        
        if($yhteys->multi_query("CALL kokous_getNoId('$name', @no, @id_y); SELECT @no as no; SELECT @id_y as id_y;")) {

            $yhteys->next_result(); 
            $tulos = $yhteys->store_result(); 
            $lkm = $tulos->fetch_object()->no +1; 
            $yhteys->next_result(); 
            $tulos = $yhteys->store_result(); 
            $id_y = $tulos->fetch_object()->id_y; 
            
            $tulos->free();      

            $response['message'] = "Haku onnistui";
            $response['kokousnro'] = $lkm;
            $response['id_y'] = $id_y;

        } else {
            $response['message'] = "Haku epäonnistui";
            http_response_code(400);
        }
        mysqli_close($yhteys);
    } 
    echo json_encode($response, JSON_UNESCAPED_UNICODE); 

}
function luoKokous() {

    $response = array( "message"=> "error");

    if(isset($_POST['id_y']) && isset($_POST['email']) && isset($_POST['otsikko']) && isset($_POST['kokousNro']) && isset($_POST['startDate']) && isset($_POST['endDate'])) {
       
        $id_y = (int)($_POST['id_y']); 
        $email = htmlspecialchars(strip_tags($_POST['email']));
        $otsikko = htmlspecialchars(strip_tags($_POST['otsikko']));
        $kokousnro = (int)($_POST['kokousNro']);
        $startDate = htmlspecialchars(strip_tags($_POST['startDate'])); 
        $startDate = date('Y-m-d', strtotime($startDate));
        $endDate = htmlspecialchars(strip_tags($_POST['endDate'])); 
        $endDate = date('Y-m-d', strtotime($endDate));

        $sql = "CALL kokous_insert($id_y, '$email', '$otsikko', $kokousnro, '$startDate', '$endDate')";
        $yhteys = connect(); 

        if($yhteys->query($sql)) {
            $response['message'] = "Kokous tallennettu";
        } else {
            $response['message'] = "Tallennus epäonnistui";
            http_response_code(400);
        }
        mysqli_close($yhteys);
    }

    echo json_encode($response);
}

function connect() {

    $yhteys = new mysqli("localhost", "root", "", "kokous_db") or die("Connection fail ".mysqli_connect_error());
    $yhteys->set_charset("utf8");
    return $yhteys;
}
?>