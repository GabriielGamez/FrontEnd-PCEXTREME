<?php
require_once 'conexion.php';

// Consulta SQL para obtener Quienes Somos, Misión y Visión
$sql = "SELECT titulo, descripcion, imagen FROM tblNosotros ORDER BY idInfo ASC";
$resultado = $conn->query($sql);

$data = [];
if ($resultado && $resultado->num_rows > 0) {
    while ($fila = $resultado->fetch_assoc()) {
        $data[] = $fila;
    }
}
$conn->close();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sobre Nosotros — PC EXTREME</title>
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body>
    <?php include 'header.php'; ?>
    
    <main>
        <div class="logomision">
            <img src="./aseets/logomision.png" alt="logoMision" class="logo-mision">
        </div>

        <section class="misionyvision">
            
            <?php if (!empty($data)): ?>
                <?php
                // 1. LOS 3 BLOQUES DE LA BASE DE DATOS
                foreach ($data as $index => $item):
                    // Alternar izquierda/derecha
                    $clase_orden = ($index % 2 == 0) ? '' : 'reverse';
                ?>
                <div class="info-block <?= $clase_orden ?>">
                    <div class="text-content">
                        <h3><?= htmlspecialchars($item['titulo']) ?></h3>
                        <p><?= nl2br(htmlspecialchars($item['descripcion'])) ?></p>
                    </div>
                    <div class="img-container">
                        <img src="./aseets/<?= htmlspecialchars($item['imagen']) ?>" alt="<?= htmlspecialchars($item['titulo']) ?>">
                    </div>
                </div>
                <?php endforeach; ?>
            <?php endif; ?>

            <div class="info-block reverse">
                <div class="text-content">
                    <h3>¡Únete a la Experiencia PC Extreme!</h3>
                    <p>Ya conoces nuestra historia y nuestros objetivos. Ahora déjanos ayudarte a llevar tu equipo al siguiente nivel. Contamos con los mejores expertos listos para atenderte.</p>
                    
                    <a href="contacto.php" class="boton-contacto-mision">
                        <img src="./aseets/WhatsApp.svg.webp" alt="WhatsApp" style="width: 24px; height: 24px;">
                        Contáctanos
                    </a>
                </div>
                
                <div class="img-container">
                    <img src="./aseets/pc5.webp" alt="Únete a nosotros">
                </div>
            </div>

        </section>
    </main>
    
    <?php include 'footer.php'; ?>
</body>
</html>