<?php
// perfileditar.php
session_start();
require_once 'conexion.php'; 

$cliente = null;
$mensaje_error = '';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}

$user_id = $_SESSION['usuario_id'];

// --- LÓGICA DE GUARDADO ---
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['guardar'])) {
    $nombre = trim($_POST['nombre']);
    $aPaterno = trim($_POST['ap']);
    $aMaterno = trim($_POST['am']);
    $telefono = trim($_POST['telefono']);
    $direccion = trim($_POST['direccion']);
    // El email ya no se recibe del POST para actualización
    
    if ($conn) {
        // CORRECCIÓN: Quitamos 'email' de la lista de campos a actualizar
        $stmt = $conn->prepare("CALL sp_ActualizarPerfil(?, ?, ?, ?, ?, ?)");
        
        
        if ($stmt) {
           // "isssss" -> int para ID, string para el resto
            $stmt->bind_param("isssss", $user_id, $nombre, $aPaterno, $aMaterno, $telefono, $direccion);
            
            if ($stmt->execute()) {
                // Actualizar variables de sesión si cambian
                $_SESSION['usuario_nombre'] = $nombre;
                $_SESSION['usuario_apellido'] = $aPaterno;
                
                header('Location: perfil.php?status=success');
                exit;
            } else {
                $mensaje_error = "Error al guardar: " . $stmt->error;
            }
            $stmt->close();
        }
    }
}

// --- CARGAR DATOS ---
if ($conn) {
    $sql_load = "SELECT nombre, aPaterno, aMaterno, telefono, direccion, email FROM tblclientes WHERE idCliente = ?";
    $stmt_load = $conn->prepare($sql_load);
    if ($stmt_load) {
        $stmt_load->bind_param("i", $user_id);
        $stmt_load->execute();
        $result_load = $stmt_load->get_result();
        if ($result_load->num_rows > 0) {
            $cliente = $result_load->fetch_assoc();
        }
        $stmt_load->close();
    }
}

function display_value($data, $key) {
    return (is_array($data) && isset($data[$key])) ? htmlspecialchars($data[$key]) : '';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Editar Perfil — PC EXTREME</title>
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body>
    <?php include 'header.php'; ?>
    
    <main class="perfil-main">
        
        <section class="perfil-contenedor" style="border-color: #3842c8;"> 
            
            <div class="perfil-lateral">
                <h2>Editando</h2>
                <img src="./aseets/registro.png" alt="Foto de Perfil" class="foto-perfil" style="border-color: #3842c8;">
                <p style="color: #aaa; margin-top: 10px;">Actualiza tus datos</p>
            </div>

            <div class="perfil-datos-area">
                <?php if (!empty($mensaje_error)): ?>
                    <div style="background: #ff4d4d; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
                        <?php echo htmlspecialchars($mensaje_error); ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="perfileditar.php">
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        
                        <div class="grupo-dato">
                            <label>Nombre</label>
                            <input type="text" name="nombre" class="input-perfil" required value="<?php echo display_value($cliente, 'nombre'); ?>">
                        </div>

                        <div class="grupo-dato">
                            <label>Apellido Paterno</label>
                            <input type="text" name="ap" class="input-perfil" required value="<?php echo display_value($cliente, 'aPaterno'); ?>">
                        </div>

                        <div class="grupo-dato">
                            <label>Apellido Materno</label>
                            <input type="text" name="am" class="input-perfil" required value="<?php echo display_value($cliente, 'aMaterno'); ?>">
                        </div>

                        <div class="grupo-dato">
                            <label>Teléfono</label>
                            <input type="tel" name="telefono" class="input-perfil" required value="<?php echo display_value($cliente, 'telefono'); ?>">
                        </div>

                        <div class="grupo-dato" style="grid-column: span 2;">
                            <label>Correo Electrónico (No modificable)</label>
                            <input type="email" name="email" class="input-perfil" readonly 
                                   style="background-color: #1a1a1a; color: #777; cursor: not-allowed; border-color: #333;"
                                   value="<?php echo display_value($cliente, 'email'); ?>">
                        </div>

                        <div class="grupo-dato" style="grid-column: span 2;">
                            <label>Dirección</label>
                            <input type="text" name="direccion" class="input-perfil" required value="<?php echo display_value($cliente, 'direccion'); ?>">
                        </div>

                    </div>

                    <div class="acciones-perfil">
                        <a href="perfil.php" class="btn-cancelar">Cancelar</a>
                        <button type="submit" name="guardar" class="btn-guardar">Guardar Cambios</button>
                    </div>

                </form>
            </div>

        </section>

    </main>
    
    <?php include 'footer.php'; ?>
</body>
</html>