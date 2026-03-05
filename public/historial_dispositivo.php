<?php
include 'conexion.php';

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['usuario_id']) || !isset($_GET['id'])) {
    header("Location: mis_dispositivos.php");
    exit();
}

$id_dispositivo = $conn->real_escape_string($_GET['id']);
$id_cliente = $_SESSION['usuario_id'];

// Verificar propiedad del equipo
$sql_check = "SELECT * FROM tbldispositivos WHERE idDispositivo = '$id_dispositivo' AND idCliente = '$id_cliente'";
$check = $conn->query($sql_check);

if ($check->num_rows == 0) {
    header("Location: mis_dispositivos.php");
    exit();
}

$info = $check->fetch_assoc();

// Obtener TODO el historial
$sql_hist = "SELECT * FROM tblregistro WHERE idDispositivo = '$id_dispositivo' ORDER BY fechaIngreso DESC";
$res_hist = $conn->query($sql_hist);

// Buscar si hay orden activa
$orden_activa = null;
if ($res_hist && $res_hist->num_rows > 0) {
    $res_hist->data_seek(0);
    $primera = $res_hist->fetch_assoc();
    if (stripos($primera['estadoEquipo'], 'Entregado') === false) {
        $orden_activa = $primera;
    }
    $res_hist->data_seek(0); // Resetear puntero
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Detalles - <?php echo htmlspecialchars($info['modelo']); ?></title>
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body>
    <?php include 'header.php'; ?>
    
    <main class="perfil-main">
        <section class="perfil-contenedor" style="display: block; max-width: 900px;">
            
            <div style="border-bottom: 1px solid #444; padding-bottom: 20px; margin-bottom: 30px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 style="margin: 0; color: white;"><?php echo htmlspecialchars($info['marca'] . " " . $info['modelo']); ?></h2>
                    <span style="color: #aaa;">No. Serie: <?php echo htmlspecialchars($info['numSerie']); ?></span>
                </div>
                <a href="mis_dispositivos.php" class="btn-cancelar" style="width: auto; padding: 10px 20px; font-size: 14px;">Volver</a>
            </div>

            <?php if ($orden_activa): 
                 $est = $orden_activa['estadoEquipo'];
                 $color_borde = '#76c838';
                 if (stripos($est, 'Diagnóstico') !== false) $color_borde = '#17a2b8';
                 if (stripos($est, 'Reparación') !== false) $color_borde = '#fd7e14';
                 if (stripos($est, 'Recibido') !== false) $color_borde = '#ffc107';
            ?>
                <h3 class="subtitulo-limpio">Estado Actual</h3>
                
                <div class="card-estado-actual" style="border-left-color: <?php echo $color_borde; ?>;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <span style="font-weight: bold; font-size: 18px; color: #333;">Orden #<?php echo str_pad($orden_activa['idFolio'], 5, "0", STR_PAD_LEFT); ?></span>
                        <span class="badge-status" style="background: #333; font-size: 14px;"><?php echo $est; ?></span>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <span class="dato-label">Problema Reportado</span>
                            <p style="margin-top: 5px; color: #333;"><?php echo htmlspecialchars($orden_activa['detalles']); ?></p>
                        </div>
                        <div>
                            <span class="dato-label">Diagnóstico / Avance</span>
                            <p style="margin-top: 5px; color: <?php echo $color_borde; ?>; font-weight: bold;"><?php echo htmlspecialchars($orden_activa['diagnostico']); ?></p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 20px; font-weight: 800; color: #333;">$<?php echo number_format($orden_activa['costo'], 2); ?></span>
                        <a href="ticket.php?folio=<?php echo $orden_activa['idFolio']; ?>" target="_blank" class="btn-ticket-mini" style="background: #333; color: white; padding: 10px 15px;">Descargar Ticket</a>
                    </div>
                </div>
            <?php endif; ?>

            <h3 class="subtitulo-limpio">Historial de Reparaciones</h3>
            
            <?php if ($res_hist && $res_hist->num_rows > 0): ?>
                <div class="contenedor-historial">
                    <?php while ($orden = $res_hist->fetch_assoc()): 
                        $es_entregado = (stripos($orden['estadoEquipo'], 'Entregado') !== false);
                        $borde = $es_entregado ? '#6c757d' : '#76c838';
                    ?>
                        <div class="item-historial">
                            <div class="cabecera-historial" onclick="toggleDetalles(<?php echo $orden['idFolio']; ?>)" style="border-left-color: <?php echo $borde; ?>;">
                                <div>
                                    <strong style="color: #333;">Orden #<?php echo str_pad($orden['idFolio'], 5, "0", STR_PAD_LEFT); ?></strong>
                                    <span style="color: #666; font-size: 13px; margin-left: 10px;"><?php echo date("d/m/Y", strtotime($orden['fechaIngreso'])); ?></span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span class="badge-status" style="background: <?php echo $es_entregado ? '#ccc' : '#333'; ?>; color: <?php echo $es_entregado ? '#333' : '#fff'; ?>;">
                                        <?php echo $orden['estadoEquipo']; ?>
                                    </span>
                                    <span id="icon-<?php echo $orden['idFolio']; ?>" style="font-size: 12px; color: #555;">▼</span>
                                </div>
                            </div>

                            <div id="detalles-<?php echo $orden['idFolio']; ?>" class="detalles-historial">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                                    <div>
                                        <span class="dato-label">Falla:</span>
                                        <div style="color: #333;"><?php echo htmlspecialchars($orden['detalles']); ?></div>
                                    </div>
                                    <div>
                                        <span class="dato-label">Solución:</span>
                                        <div style="color: #333; font-weight: 500;"><?php echo htmlspecialchars($orden['diagnostico']); ?></div>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 10px;">
                                    <span style="font-weight: bold; color: #333;">Total: $<?php echo number_format($orden['costo'], 2); ?></span>
                                    <a href="ticket.php?folio=<?php echo $orden['idFolio']; ?>" target="_blank" style="color: #3842c8; font-size: 13px; font-weight: bold;">Ver Ticket</a>
                                </div>
                            </div>
                        </div>
                    <?php endwhile; ?>
                </div>
            <?php else: ?>
                <p style="color: #ccc;">No hay registros disponibles.</p>
            <?php endif; ?>

        </section>
    </main>
    
    <?php include 'footer.php'; ?>
    
    <script>
        // Pequeño script local para manejar la rotación del icono ▼ / ▲ en esta página
        const originalToggle = window.toggleDetalles;
        window.toggleDetalles = function(id) {
            if(typeof originalToggle === 'function') originalToggle(id);
            
            const icon = document.getElementById('icon-' + id);
            const detalles = document.getElementById('detalles-' + id);
            if (icon && detalles) {
                icon.innerHTML = detalles.classList.contains('mostrar') ? "▲" : "▼";
            }
        };
    </script>
</body>
</html>