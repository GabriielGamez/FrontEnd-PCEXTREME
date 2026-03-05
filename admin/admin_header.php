<?php
if (session_status() == PHP_SESSION_NONE) session_start();

// Seguridad General
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit();
}

$rol = $_SESSION['rol_id']; 
$nombre_rol = "Personal";
$color_badge = "#333";

if ($rol == 1) { $nombre_rol = "Administrador"; $color_badge = "#76c838"; }
if ($rol == 2) { $nombre_rol = "Recepción"; $color_badge = "#e040fb"; }
if ($rol == 3) { $nombre_rol = "Técnico"; $color_badge = "#3842c8"; }

$pagina_actual = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel PC Extreme</title>
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="admin.css?v=<?php echo filemtime('admin.css'); ?>">
</head>
<body>

    <header class="admin-header">
        
        <div class="header-top-mobile">
            <div class="admin-logo">
                <img src="./aseets/logo.png" alt="Logo">
                <span>PC EXTREME</span>
            </div>
            
            <button class="menu-toggle" onclick="toggleMenu()">☰</button>
        </div>

        <div class="header-content-wrapper" id="adminMenu">
            <nav class="admin-nav">
                <a href="dashboard.php" class="<?php echo ($pagina_actual == 'dashboard.php') ? 'active' : ''; ?>">Inicio</a>
                <a href="admin_reparaciones.php" class="<?php echo ($pagina_actual == 'admin_reparaciones.php') ? 'active' : ''; ?>">Reparaciones</a>
                
                <?php if ($rol == 1 || $rol == 2): ?>
                    <a href="admin_clientes.php" class="<?php echo ($pagina_actual == 'admin_clientes.php') ? 'active' : ''; ?>">Clientes</a>
                    <a href="admin_mensajes.php" class="<?php echo ($pagina_actual == 'admin_mensajes.php') ? 'active' : ''; ?>">Mensajes</a>
                <?php endif; ?>

                <?php if ($rol == 1): ?>
                    <a href="admin_productos.php" class="<?php echo ($pagina_actual == 'admin_productos.php') ? 'active' : ''; ?>">Productos</a>
                    <a href="admin_web.php" class="<?php echo ($pagina_actual == 'admin_web.php') ? 'active' : ''; ?>">Gestionar Web</a>
                    <a href="admin_personal.php" class="<?php echo ($pagina_actual == 'admin_personal.php') ? 'active' : ''; ?>">Personal</a>
                <?php endif; ?>
            </nav>

            <div class="admin-user-info">
                <span class="badge-rol" style="background-color: <?php echo $color_badge; ?>"><?php echo $nombre_rol; ?></span>
                <span style="font-size: 14px; font-weight: 500; color: #ccc;"><?php echo $_SESSION['admin_nombre']; ?></span>
                
                <a href="admin_logout.php" class="btn-logout-header" title="Salir del sistema">
                    Cerrar Sesión
                </a>
            </div>
        </div>
    </header>

    <script>
        function toggleMenu() {
            var menu = document.getElementById("adminMenu");
            if (menu.style.display === "flex") {
                menu.style.display = "none";
            } else {
                menu.style.display = "flex";
            }
        }
    </script>

    <div class="admin-container">