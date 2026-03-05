<?php
// login.php (Versión Unificada con Procedimiento Almacenado)
include 'conexion.php';

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Si ya hay sesión, redirigir al inicio
if (isset($_SESSION['usuario_id']) || isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // --- LÓGICA DE REGISTRO (Uso de Procedimiento Almacenado) ---
    if (isset($_POST['accion']) && $_POST['accion'] == 'registro') {
        $nombre = $conn->real_escape_string($_POST['nombre']);
        $aPaterno = $conn->real_escape_string($_POST['ap_paterno']);
        $aMaterno = $conn->real_escape_string($_POST['ap_materno']);
        $telefono = $conn->real_escape_string($_POST['telefono']);
        $email = $conn->real_escape_string($_POST['email']);
        $password = $_POST['password'];
        $password_confirm = $_POST['password_confirm'];

        if ($password !== $password_confirm) {
            echo "<script>alert('Las contraseñas no coinciden.');</script>";
        } else {
            // Preparar datos para el procedimiento
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $calle = $_POST['calle'];
            $colonia = $_POST['colonia'];
            $ciudad = $_POST['ciudad'];
            $estado = $_POST['estado'];
            $cp = $_POST['cp'];
            $direccion_completa = $conn->real_escape_string("$calle, Col. $colonia, $ciudad, $estado, CP $cp");

            // LLAMADA AL PROCEDIMIENTO
            $conn->query("SET @p_resultado = 0");
            $sql_call = "CALL sp_RegistrarClienteValidado('$nombre', '$aPaterno', '$aMaterno', '$telefono', '$direccion_completa', '$email', '$password_hash', @p_resultado)";
            
            if ($conn->query($sql_call)) {
                $res_status = $conn->query("SELECT @p_resultado AS resultado");
                $row_status = $res_status->fetch_assoc();
                $resultado = $row_status['resultado'];

                if ($resultado == 0) {
                    echo "<script>alert('¡Registro exitoso! Por favor inicia sesión.'); window.location.href='login.php';</script>";
                } elseif ($resultado == 1) {
                    echo "<script>alert('Error: Este correo ya está registrado en PC EXTREME.');</script>";
                } else {
                    echo "<script>alert('Error interno en el servidor de base de datos.');</script>";
                }
            } else {
                echo "<script>alert('Error al ejecutar el procedimiento: " . $conn->error . "');</script>";
            }
        }
    }

    // --- LÓGICA DE LOGIN UNIFICADO ---
    if (isset($_POST['accion']) && $_POST['accion'] == 'login') {
        $email = $conn->real_escape_string($_POST['username']); 
        $password = $_POST['password'];
        
        // 1. BUSCAR EN CLIENTES
        $sql_cliente = "SELECT idCliente, nombre, aPaterno, password, cambiarPassword FROM tblclientes WHERE email = '$email'";
        $res_cliente = $conn->query($sql_cliente);

        if ($res_cliente->num_rows == 1) {
            $row = $res_cliente->fetch_assoc();
            if (password_verify($password, $row['password'])) {
                $_SESSION['usuario_id'] = $row['idCliente'];
                $_SESSION['usuario_nombre'] = $row['nombre'];
                $_SESSION['usuario_apellido'] = $row['aPaterno'];
                $_SESSION['rol'] = 'cliente';

                if ($row['cambiarPassword'] == 1) {
                    header("Location: cambiar_password.php");
                } else {
                    header("Location: index.php");
                }
                exit();
            } else {
                echo "<script>alert('Contraseña incorrecta.');</script>";
            }
        } else {
            // 2. BUSCAR EN PERSONAL (ADMIN/STAFF)
            $sql_admin = "SELECT idTrabajador, nombre, password, idRol FROM tbltrabajadores WHERE email = '$email'";
            $res_admin = $conn->query($sql_admin);

            if ($res_admin->num_rows == 1) {
                $row = $res_admin->fetch_assoc();
                if (password_verify($password, $row['password'])) {
                    $_SESSION['admin_id'] = $row['idTrabajador'];
                    $_SESSION['admin_nombre'] = $row['nombre'];
                    $_SESSION['rol_id'] = $row['idRol']; 
                    header("Location: dashboard.php");
                    exit();
                } else {
                    echo "<script>alert('Contraseña incorrecta.');</script>";
                }
            } else {
                echo "<script>alert('No existe una cuenta con ese correo.');</script>";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Acceso — PC Extreme</title>
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body class="pagina-login">
    
    <?php include 'header.php'; ?>

    <main class="login-main">
        <div class="login-contenedor contenido-login-card">

            <div id="bloque-login">
                <h2>Bienvenido</h2>
                <form action="" method="POST">
                    <input type="hidden" name="accion" value="login">
                    <label>Correo Electrónico:</label>
                    <input type="email" name="username" required placeholder="ejemplo@correo.com" />
                    <label>Contraseña:</label>
                    <input type="password" name="password" required placeholder="••••••••" />
                    <button type="submit" class="btn-login-submit">Entrar</button>
                    <div class="link-cambio">
                        ¿No tienes cuenta? <a href="#" id="ir-a-registro">Regístrate como Cliente</a>
                    </div>
                </form>
            </div>

            <div id="bloque-registro" class="oculto">
                <h2>Crear Cuenta</h2>
                <form action="" method="POST">
                    <input type="hidden" name="accion" value="registro">
                    
                    <div class="registro-grid">
                        <div class="subtitulo-registro">Datos Personales</div>
                        <div class="col-full"><label>Nombre(s):</label><input type="text" name="nombre" required /></div>
                        <div><label>Apellido Paterno:</label><input type="text" name="ap_paterno" required /></div>
                        <div><label>Apellido Materno:</label><input type="text" name="ap_materno" required /></div>
                        <div class="col-full"><label>Teléfono:</label><input type="tel" name="telefono" required /></div>

                        <div class="subtitulo-registro">Dirección</div>
                        <div style="grid-column: span 2; display:grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                            <div><label>Calle y Número:</label><input type="text" name="calle" required /></div>
                            <div><label>Colonia:</label><input type="text" name="colonia" required /></div>
                        </div>
                        <div><label>Ciudad:</label><input type="text" name="ciudad" required /></div>
                        <div><label>Estado:</label><input type="text" name="estado" required /></div>
                        <div><label>C.P.:</label><input type="text" name="cp" required /></div>

                        <div class="subtitulo-registro">Cuenta</div>
                        <div class="col-full"><label>Correo Electrónico:</label><input type="email" name="email" required /></div>

                        <div style="position: relative;">
                            <label>Contraseña:</label>
                            <input type="password" id="reg-pass" name="password" required />
                        </div>

                        <div>
                            <label>Confirmar:</label>
                            <input type="password" id="reg-pass-confirm" name="password_confirm" required />
                        </div>
                    </div>

                    <button type="submit" class="btn-login-submit" style="margin-top: 20px;">Registrarse</button>

                    <div class="link-cambio">
                        ¿Ya tienes cuenta? <a href="#" id="ir-a-login">Inicia Sesión aquí</a>
                    </div>
                </form>
            </div>

        </div>
    </main>

    <?php include 'footer.php'; ?>

    <script>
        // Lógica para alternar entre Login y Registro
        document.getElementById('ir-a-registro').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('bloque-login').classList.add('oculto');
            document.getElementById('bloque-registro').classList.remove('oculto');
        });

        document.getElementById('ir-a-login').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('bloque-registro').classList.add('oculto');
            document.getElementById('bloque-login').classList.remove('oculto');
        });
    </script>
</body>
</html>