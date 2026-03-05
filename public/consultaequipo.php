<?php
require_once 'conexion.php'; 

$resultado = null;
$error = null;
$mostrar = false;

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['folio'])) {
    
    $folio = trim($_POST['folio']);

    // Validamos que no esté vacío
    if (!empty($folio)) {
        $sql = "SELECT r.*, d.numSerie, d.modelo, d.marca 
                FROM tblregistro r
                JOIN tbldispositivos d ON r.idDispositivo = d.idDispositivo
                WHERE r.idFolio = ?";
                
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $folio); 
        $stmt->execute();
        $res_query = $stmt->get_result();

        if ($res_query->num_rows > 0) {
            $resultado = $res_query->fetch_assoc();
            $mostrar = true;
        } else {
            $error = "No encontramos ninguna orden con el folio #$folio. Verifica el número.";
        }
        $stmt->close();
    } else {
        $error = "Por favor ingresa un número de folio.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Rastreo de Servicio — PC EXTREME</title>
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body>
    <?php include 'header.php'; ?>
    
    <main class="consulta-main">
        <section class="consulta-contenedor">
            
            <h2>Consulta tu Equipo</h2>
            <p class="consulta-subtitulo">Ingresa tu número de folio para ver el estado de tu reparación.</p>

            <form method="POST" action="consultaequipo.php" class="busqueda-wrapper">
                <input type="number" name="folio" class="input-busqueda" placeholder="Ej: 105" required value="<?php echo isset($_POST['folio']) ? htmlspecialchars($_POST['folio']) : ''; ?>">
                <button type="submit" class="btn-buscar">Rastrear</button>
            </form>

            <?php if ($error): ?>
                <div class="mensaje-error-consulta">
                    ⚠️ <?php echo $error; ?>
                </div>
            <?php endif; ?>

            <div class="resultado-card <?php echo $mostrar ? 'show-results' : ''; ?>">
                
                <?php if ($mostrar): ?>
                    <div class="resultado-header">
                        <span>ORDEN DE SERVICIO <strong>#<?php echo str_pad($resultado['idFolio'], 5, "0", STR_PAD_LEFT); ?></strong></span>
                        <span class="estado-badge"><?php echo $resultado['estadoEquipo']; ?></span>
                    </div>

                    <div class="resultado-body">
                        
                        <div class="columna-resultado">
                            <h3>💻 Datos del Equipo</h3>
                            
                            <div class="dato-fila">
                                <span class="dato-label">Equipo</span>
                                <span class="dato-valor"><?php echo $resultado['marca'] . " " . $resultado['modelo']; ?></span>
                            </div>
                            
                            <div class="dato-fila">
                                <span class="dato-label">Número de Serie</span>
                                <span class="dato-valor"><?php echo $resultado['numSerie']; ?></span>
                            </div>

                            <div class="dato-fila">
                                <span class="dato-label">Fecha de Ingreso</span>
                                <span class="dato-valor"><?php echo date("d/m/Y", strtotime($resultado['fechaIngreso'])); ?></span>
                            </div>
                        </div>

                        <div class="columna-resultado">
                            <h3>🔧 Detalle del Servicio</h3>
                            
                            <div class="dato-fila">
                                <span class="dato-label">Problema Reportado</span>
                                <span class="dato-valor"><?php echo $resultado['detalles']; ?></span>
                            </div>

                            <div class="dato-fila">
                                <span class="dato-label">Diagnóstico Técnico</span>
                                <span class="dato-valor" style="color: #3842c8;"><?php echo $resultado['diagnostico']; ?></span>
                            </div>
                        </div>

                    </div>

                    <div class="costo-final">
                        <span style="font-size: 14px; color: #666; margin-right: 10px;">Total Estimado:</span>
                        <span class="costo-valor">$<?php echo number_format($resultado['costo'], 2); ?></span>
                    </div>
                <?php endif; ?>

            </div>

        </section>
    </main>
    
    <?php include 'footer.php'; ?>
</body>
</html>