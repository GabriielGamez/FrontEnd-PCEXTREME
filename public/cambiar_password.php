<?php
include 'conexion.php';

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Verificar que el usuario esté logueado
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit();
}

$mensaje = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nueva_pass = $_POST['password_nueva'];
    $conf_pass  = $_POST['password_confirmar'];
    $idCliente  = $_SESSION['usuario_id'];

    if ($nueva_pass !== $conf_pass) {
        $mensaje = "<script>alert('Las contraseñas no coinciden.');</script>";
    } else {
        // Encriptar nueva contraseña
        $password_hash = password_hash($nueva_pass, PASSWORD_DEFAULT);

        // Actualizar password y poner cambiarPassword en 0
        $sql = "UPDATE tblclientes SET password = '$password_hash', cambiarPassword = 0 WHERE idCliente = $idCliente";

        if ($conn->query($sql) === TRUE) {
            echo "<script>alert('Contraseña actualizada correctamente. ¡Bienvenido!'); window.location.href='index.php';</script>";
            exit();
        } else {
            $mensaje = "<script>alert('Error al actualizar: " . $conn->error . "');</script>";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cambiar Contraseña — PC Extreme</title>
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body class="pagina-login"> 
    <?php include 'header.php'; ?>

    <main class="login-main">
        <div class="login-contenedor contenido-login-card">
            
            <div id="bloque-cambio">
                <h2 style="color: #76c838;">Actualización Requerida</h2>
                <p style="text-align: center; margin-bottom: 20px; color: #ccc;">
                    Hemos detectado que tu cuenta fue registrada por nuestro personal de recepción. Por seguridad, necesitas establecer una nueva contraseña para continuar accediendo a los servicios de PCEXTREME.
                </p>
                
                <?php echo $mensaje; ?>

                <form action="" method="POST">
                    
                    <div style="position: relative; margin-bottom: 20px;">
                        <label>Nueva Contraseña:</label>
                        <input type="password" id="reg-pass" name="password_nueva" required placeholder="Ingresa tu nueva clave" />
                        
                        <div id="mensaje-requisitos" class="requisitos-box oculto">
                            <p>Requisitos:</p>
                            <ul>
                                <li id="req-longitud" class="pendiente">Min 8 car.</li>
                                <li id="req-mayus" class="pendiente">1 Mayúscula</li>
                                <li id="req-num" class="pendiente">1 Número</li>
                            </ul>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label>Confirmar Nueva Contraseña:</label>
                        <input type="password" id="reg-pass-confirm" name="password_confirmar" required placeholder="Repite la contraseña" />
                        <small id="mensaje-coincidencia" class="msg-coincidencia"></small>
                    </div>

                    <button type="submit" class="btn-login-submit">Actualizar y Continuar</button>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="logout.php" style="color: #ff6b6b; text-decoration: none; font-size: 14px;">Cancelar y Cerrar Sesión</a>
                    </div>
                </form>
            </div>

        </div>
    </main>

    <?php include 'footer.php'; ?>
</body>
</html>