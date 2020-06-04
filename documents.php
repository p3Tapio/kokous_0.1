<?php
    // error_reporting(E_ERROR | E_PARSE);
    if(!isset($db)) {
        $db = array();
    }

    if(isset($_GET['call'])) {

        switch($_GET['call']) {
            case 'getdoc':
                getDocument();
                break;
            case 'postdoc':
                postDocument(); 
                break; 
            case 'getalldocs':
                getAllDocs();
                break; 
            default:
                info();
            } 
    }
    else {
        info(); 
    }

    function getAllDocs() {
 
        $q = "SELECT * FROM documents";
        $yhteys = connect();
        $tulokset = $yhteys->query($q); 
        echo '[';
        for($i = 0; $i < mysqli_num_rows($tulokset); $i++) {
            echo ($i>0?',':'').json_encode(mysqli_fetch_object($tulokset), JSON_UNESCAPED_UNICODE); 
        }
        echo ']';
        mysqli_close($yhteys);

    }   
    function getDocument() {
        $response ="";

        if(isset($_GET['id'])) {

            $haku = "\"".strip_tags($_GET['id'])."\"";
            $q = "SELECT * FROM documents where id =".$haku;

            $yhteys = connect();
            $tulokset = $yhteys->query($q); 
            $response = '[';
                    
            for($i = 0; $i < mysqli_num_rows($tulokset); $i++) {
                $response .= ($i>0?',':'').json_encode(mysqli_fetch_object($tulokset), JSON_UNESCAPED_UNICODE); 
            }
           
            $response.= ']';
            echo $response;
            $rivit=mysqli_num_rows($tulokset);

            // if($rivit > 0) {
            //     $row = $tulokset->fetch_assoc();
                

                // $response = "{\"id\":\"".$row['id']."\",
                //             \"id_y\":\"".$row['id_y']."\",
                //             \"name\":\"".$row['name']."\",
                //             \"content\":\"".$row['content']."\",
                //             \"draft\":\"".$row['draft']."\",
                //             \"timestamp\":\"".$row['timestamp']."\"}";
            // } else {
            //     $response =  "{\"message\":\"Dokumenttia ei löytynyt\" }";
            //     http_response_code(404);
            // }
    
        } else {
            $response =  "{\"message\":\"Haku epäonnistui. Unohditko ID:n?\" }";
            http_response_code(404);
        }

        mysqli_close($yhteys);
        // echo $response;

    }
    function postDocument() {
        // if löytyy, päivitä if not luo uusi? Mulla millä perusteella? 
        
        $_POST = json_decode(file_get_contents('php://input'), true);
        $response ="";
        
        if(isset($_POST["content"])) {
            if(strlen($_POST["id_y"])>0 && strlen($_POST["content"])>0 && strlen($_POST["draft"])>0) {

                $id_y = $_POST["id_y"];
                $name = $_POST["name"];
                $content = $_POST["content"];
                $draft = $_POST["draft"];

                // id = select where content & id_y ? Vai onko php/sql:ssä valmista funktioo tjsp

                $yhteys = connect();  
                $q = "INSERT INTO documents (id_y,name,content,draft)
                VALUES ('$id_y','$name', '$content','$draft')";

                if($yhteys->query($q)) {
                    $response = 
                    "{
                        \"id\":\"id?\"
                        \"message\":\"dokumentti tallennettu.\" 
                    }";
                } else {
                    $response =  
                    "{                   
                        \"id\":\"\"
                        \"message\":\"Tallennus epäonnistui:\n".$yhteys->error."\" 
                    }";
                    http_response_code(500); 
                }
                mysqli_close($yhteys);
            }
        }
     
        echo $response;
    }

    function connect() {
    
        $yhteys = new mysqli("localhost", "root", "", "kokous_db") or die("Connection fail ".mysqli_connect_error());
        $yhteys->set_charset("utf8");
        return $yhteys;
    }

    class Document {
        // $doc = new Document;
        // $id = sizeof($db)+1;
        // $doc->set_id($id);
        // $doc->set_id_y($_POST["id_y"]);
        // $doc->set_content($_POST["content"]);
        // $doc->set_draft($_POST["draft"]);
        // array_push($db, $doc);
        public $id;
        public $id_y;
        public $content;
        public $draft;

        function set_id($id) {
            $this->id=$id; 
        }
        function get_id() {
           return $this->id; 
        }
        function set_id_y($id_y) {
            $this->id_y=$id_y; 
        }
        function get_id_y() {
            return $this->id_y; 
         }
         function set_content($content) {
            $this->content = $content;
        }
        function get_content() {
            return $this->content;
        }
        function set_draft($draft) {
            $this->draft = $draft;
        }
        function get_draft() {
            return $this->draft;
        }


    }

    function info() {
       
        echo "<br/><strong>Hae pöytäkirja</strong> -----      /kokousapi/documents.php?call=getdoc";

        echo "<br/><br/>-------------------------------------------------------------------------<br/>";
        echo "<br/><strong> Tallenna pöytäkirja</strong>    --      /kokousapi/documents.php?call=postdoc";
        echo "<br/><br/>Post JSON:<br/><br/>
        {<br/>
            &nbsp&nbsp\"id_y\": \"####\",<br/>
            &nbsp&nbsp\"content\": \"editorin sisältö\",<br/>
            &nbsp&nbsp\"draft\": \"true/false\"<br/>
        }<br/>
        
        ";
        echo "<br/><br/>-------------------------------------------------------------------------<br/>";
        echo "<br/><strong>Hae kaikki pöytäkirjat</strong> -----      /documents.php?call=getalldocs";
    }
?>
