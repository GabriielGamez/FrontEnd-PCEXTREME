<?php
//Datos de conexion
$host="localhost";
$user="u138650717_gamez";
$pass="Hesoyam4278.";//Se agrega la contraseña si el susuario o lla base de datos esta bloqueada
$db="u138650717_bdNetflix";//Se agrega el nombre de la base de datos

$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexión
if ($conn->connect_error) {
    
    die("Error en la conexión: " . $conn->connect_error);
}
?>