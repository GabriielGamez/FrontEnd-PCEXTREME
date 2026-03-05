<?php
// admin_login.php
include 'conexion.php';
session_start();

if (isset($_SESSION['admin_id'])) {
    header("Location: dashboard.php");
    exit();
}

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $conn->real_escape_string($_POST['email']);
    $password = $_POST['password'];

    // CAMBIO IMPORTANTE: Permitimos idRol 1 (Admin) O idRol 3 (Técnico)
    $sql = "SELECT idTrabajador, nombre, password, idRol FROM tbltrabajadores WHERE email = '$email' AND (idRol = 1 OR idRol = 2 OR idRol = 3)";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        
        if (password_verify($password, $row['password'])) {
            // Guardamos los datos en sesión
            $_SESSION['admin_id'] = $row['idTrabajador'];
            $_SESSION['admin_nombre'] = $row['nombre'];
            $_SESSION['rol_id'] = $row['idRol']; // <--- ESTO ES LA CLAVE DE LOS PERMISOS

            header("Location: dashboard.php");
            exit();
        } else {
            $error = "Contraseña incorrecta";
        }
    } else {
        $error = "Usuario no encontrado o sin permisos de acceso.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Acceso al Sistema - PC Extreme</title>
    <link rel="stylesheet" href="styles.css?v=6">
    <style>
        .admin-login-wrapper { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #111; }
        .admin-card { background: #222; padding: 40px; border-radius: 10px; border: 1px solid #76c838; width: 100%; max-width: 400px; text-align: center; color: white; }
        .admin-card input { width: 100%; margin-bottom: 15px; padding: 10px; background: #333; border: 1px solid #555; color: white; }
        .admin-card button { width: 100%; padding: 10px; background: #76c838; border: none; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
    <div class="admin-login-wrapper">
        <div class="admin-card">
            <img src="./aseets/logo.png" style="height: 60px; margin-bottom: 20px;">
            <h2>Sistema Interno</h2>
            <?php if($error) echo "<p style='color:#ff6b6b; font-size:14px;'>$error</p>"; ?>
            <form method="POST">
                <input type="email" name="email" placeholder="Correo" required>
                <input type="password" name="password" placeholder="Contraseña" required>
                <button type="submit">Entrar</button>
            </form>
            <p style="margin-top:10px;"><a href="index.php" style="color:#aaa; font-size:12px;">← Volver al sitio web</a></p>
        </div>
    </div>
</body>
</html>