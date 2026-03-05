<?php
// perfil.php
session_start(); //
require_once 'conexion.php'; //

$cliente = null;
$mensaje_error = '';

// 1. Verificar sesión
if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php'); 
    exit;
}

$user_id = $_SESSION['usuario_id']; //

// 2. Consultar datos
if ($conn) {
    // CORRECCIÓN: Solicitamos los campos individuales Y la función personalizada
    $sql = "SELECT fn_NombreCompleto(idCliente) AS nombre_completo, nombre, aPaterno, aMaterno, telefono, direccion, email FROM tblclientes WHERE idCliente = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("i", $user_id); //
        $stmt->execute(); //
        $result = $stmt->get_result(); //

        if ($result->num_rows > 0) {
            $cliente = $result->fetch_assoc(); //
        } else {
            $mensaje_error = "Error: No se encontraron datos.";
        }
        $stmt->close(); //
    }
}

function display_value($data, $key)
{
    return (is_array($data) && isset($data[$key])) ? htmlspecialchars($data[$key]) : ''; //
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mi Perfil — PC EXTREME</title>
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body>
    <?php include 'header.php'; ?>

    <main class="perfil-main">

        <section class="perfil-contenedor">

            <div class="perfil-lateral">
                <h2>Mi Perfil</h2>
                <img src="./aseets/registro.png" alt="Foto de Perfil" class="foto-perfil">
                <p style="color: #aaa; margin-top: 10px;">Cliente Registrado</p>
            </div>

            <div class="perfil-datos-area">
                <?php if (!empty($mensaje_error)): ?>
                    <div style="background: #ff4d4d; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
                        <?php echo htmlspecialchars($mensaje_error); ?>
                    </div>
                <?php endif; ?>

                <?php if (isset($_GET['status']) && $_GET['status'] == 'success'): ?>
                    <div style="background: #76c838; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
                        ¡Datos actualizados correctamente!
                    </div>
                <?php endif; ?>                 

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">

                    <div class="grupo-dato" style="grid-column: span 2; margin-bottom: 15px;">
                        <label style="color: #76c838; font-weight: bold;">Identidad Estandarizada (UDF)</label>
                        <input type="text" class="input-perfil" disabled 
                               style="border-color: #76c838; background: rgba(118, 200, 56, 0.05);"
                               value="<?php echo display_value($cliente, 'nombre_completo'); ?>">
                    </div>

                    <div class="grupo-dato">
                        <label>Nombre</label>
                        <input type="text" class="input-perfil" disabled
                            value="<?php echo display_value($cliente, 'nombre'); ?>">
                    </div>

                    <div class="grupo-dato">
                        <label>Apellido Paterno</label>
                        <input type="text" class="input-perfil" disabled
                            value="<?php echo display_value($cliente, 'aPaterno'); ?>">
                    </div>

                    <div class="grupo-dato">
                        <label>Apellido Materno</label>
                        <input type="text" class="input-perfil" disabled
                            value="<?php echo display_value($cliente, 'aMaterno'); ?>">
                    </div>

                    <div class="grupo-dato">
                        <label>Teléfono</label>
                        <input type="text" class="input-perfil" disabled
                            value="<?php echo display_value($cliente, 'telefono'); ?>">
                    </div>

                    <div class="grupo-dato" style="grid-column: span 2;">
                        <label>Correo Electrónico</label>
                        <input type="text" class="input-perfil" disabled
                            value="<?php echo display_value($cliente, 'email'); ?>">
                    </div>

                    <div class="grupo-dato" style="grid-column: span 2;">
                        <label>Dirección</label>
                        <input type="text" class="input-perfil" disabled
                            value="<?php echo display_value($cliente, 'direccion'); ?>">
                    </div>

                </div>

                <div class="acciones-perfil">
                    <a href="perfileditar.php" class="btn-editar">Editar Información</a>
                </div>

            </div>

        </section>

    </main>

    <?php include 'footer.php'; ?>
</body>

</html>