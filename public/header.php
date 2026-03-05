<?php
// Verificamos si la sesión no está iniciada antes de iniciarla
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>
<header>
    <div class="top-bar">
        
        <a href="index.php" class="logo">
            <img src="./aseets/logo.png" alt="Logo PC Extreme" class="logo-img">
            <h1>PC EXTREME</h1>
        </a>

        <button id="menu-toggle" class="hamburger-btn" aria-label="Abrir menú">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <div id="mobile-menu" class="menu-container">
            
            <nav class="main-nav">
                <ul>
                    <li><a href="index.php">Inicio</a></li>
                    <li><a href="consultaequipo.php">Consulta tu equipo</a></li>
                    <li><a href="productos.php">Productos</a></li>
                    <li><a href="misionyvision.php">Sobre nosotros</a></li>
                </ul>
            </nav>

            <div class="user-area">
                <div class="auth-dropdown">
                    
                    <?php 
                    // CASO 1: CLIENTE
                    if (isset($_SESSION['usuario_id'])): ?>
                        <a href="#" class="login-button" id="authButton" style="background-color: #2d2d2d; border: 1px solid #76c838;"> 
                            Hola, <?php echo htmlspecialchars($_SESSION['usuario_nombre']); ?> 
                        </a>
                        
                        <div class="auth-dropdown-menu" id="authMenu">
                            <a href="perfil.php">Mi Perfil</a>
                            <a href="mis_dispositivos.php">Mis Dispositivos</a>
                            <a href="logout.php" style="color: #ff6b6b;">Cerrar Sesión</a>
                        </div>

                    <?php 
                    // CASO 2: ADMINISTRADOR / STAFF
                    elseif (isset($_SESSION['admin_id'])): ?>
                        <a href="#" class="login-button" id="authButton" style="background-color: #3842c8; border: 1px solid #fff;"> 
                            ADMIN: <?php echo htmlspecialchars($_SESSION['admin_nombre']); ?> 
                        </a>
                        
                        <div class="auth-dropdown-menu" id="authMenu">
                            <a href="dashboard.php" style="color: #ffffffff; font-weight: bold;">Panel de Administración</a>
                            <a href="logout.php" style="color: #ff6b6b;">Cerrar Sesión</a>
                        </div>

                    <?php 
                    // CASO 3: VISITANTE (NO LOGUEADO)
                    else: ?>
                        <a href="#" class="login-button" id="authButton"> Cuenta </a>
                        
                        <div class="auth-dropdown-menu" id="authMenu">
                            <a href="./login.php">Iniciar Sesión</a>
                            <a href="login.php?mode=registro">Registrarse</a>
                        </div>
                    <?php endif; ?>

                </div>
            </div>

        </div> 
    </div>
</header>

<button id="btn-voz" class="voice-btn" aria-label="Escuchar el contenido de la página">
    🔊 Escuchar Contenido
</button>
  
<script src="archivosJS/lector_voz.js"></script>
<script src="archivosJS/accesibilidad.js"></script>

<div class="accessibility-panel">
    <button id="btn-zoom-in" aria-label="Aumentar tamaño">A+</button>
    <button id="btn-zoom-reset" aria-label="Restablecer tamaño">↺</button>
    <button id="btn-zoom-out" aria-label="Disminuir tamaño">A-</button>

    <button id="btn-contrast" aria-label="Cambiar modo de color" style="margin-top: 5px; border-color: #2a9d8f; color: #2a9d8f">
        🌗
    </button>
</div>