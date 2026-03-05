<?php
include 'conexion.php';

// 1. Validar que recibimos un ID
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header("Location: productos.php");
    exit();
}

$id = $conn->real_escape_string($_GET['id']);

// Llamamos a la función personalizada directamente en la consulta
$sql = "SELECT *, fn_EstadoStock(idProducto) AS estado_visual FROM tblproductos WHERE idProducto = $id";
$resultado = $conn->query($sql);

if ($resultado->num_rows == 0) {
    echo "<h1 style='color:white; text-align:center; margin-top:50px;'>Producto no encontrado</h1>";
    exit();
}

$producto = $resultado->fetch_assoc();
$img = !empty($producto['imagen_url']) ? $producto['imagen_url'] : './aseets/default.webp';

// 3. Contacto para WhatsApp
$contacto = $conn->query("SELECT whatsapp FROM tbl_contacto LIMIT 1")->fetch_assoc();
$telefono_empresa = $contacto['whatsapp'] ?? '0000000000';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php echo htmlspecialchars($producto['nombre']); ?> — Detalle</title>
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />

    <link rel="stylesheet" href="styles.css?v=<?php echo time(); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body>
    <?php include 'header.php'; ?>

    <main class="detalle-main">
        <div class="detalle-contenedor">

            <a href="productos.php" class="btn-volver">← Volver al Catálogo</a>

            <div class="detalle-grid">
                <div class="detalle-imagen-box">
                    <img src="<?php echo $img; ?>" alt="<?php echo htmlspecialchars($producto['nombre']); ?>">
                </div>

                <div class="detalle-info-box">
                    <span class="etiqueta-categoria"><?php echo $producto['categoria']; ?></span>

                    <h1><?php echo htmlspecialchars($producto['nombre']); ?></h1>

                    <div class="precio-grande">$<?php echo number_format($producto['precio'], 2); ?></div>

                    <p class="stock-info">
                        Estado: <span class="badge-estado"><?php echo $producto['estado_visual']; ?></span>
                        <br>
                        <small>(Cant. exacta: <?php echo htmlspecialchars($producto['stock']); ?>)</small>
                    </p>
                    
                    <div class="descripcion-completa">
                        <h3>Descripción:</h3>
                        <p><?php echo nl2br(htmlspecialchars($producto['descripcion'])); ?></p>
                    </div>

                    <a href="https://wa.me/<?php echo $telefono_empresa; ?>?text=Hola PC EXTREME, me interesa el producto: <?php echo urlencode($producto['nombre']); ?>"
                        target="_blank" class="btn-comprar">
                        <img src="./aseets/WhatsApp.svg.webp" style="width:24px; filter: brightness(0) invert(1);">
                        Me interesa este artículo
                    </a>
                </div>
            </div>

        </div>
    </main>

    <?php include 'footer.php'; ?>
</body>

</html>