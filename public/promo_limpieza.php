<?php
// promo_limpieza.php
include 'conexion.php';

// 1. OBTENER EL PRODUCTO PROMOCIONAL (ID 15)
$id_promo = 15;
$sql_producto = "SELECT * FROM tblproductos WHERE idProducto = $id_promo";
$resultado = $conn->query($sql_producto);
$producto = $resultado->fetch_assoc();

// Seguridad: Si por alguna razón borras el producto 15, mostramos datos genéricos
if (!$producto) {
    $producto = [
        'nombre' => 'Producto No Disponible',
        'precio' => 0,
        'descripcion' => 'Lo sentimos, esta oferta ha expirado o el producto no existe.',
        'imagen_url' => './aseets/default.webp'
    ];
}

// Calcular un "Precio Anterior" ficticio para que se vea como oferta (Precio real + 30%)
$precio_anterior = $producto['precio'] * 1.35;

// 2. OBTENER DATOS DE CONTACTO (Para el botón de WhatsApp)
$sql_contacto = "SELECT whatsapp FROM tbl_contacto LIMIT 1";
$res_contacto = $conn->query($sql_contacto);
$contacto_empresa = $res_contacto->fetch_assoc();
$telefono_whatsapp = $contacto_empresa['whatsapp'] ?? '0000000000';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oferta: <?php echo htmlspecialchars($producto['nombre']); ?> — PC EXTREME</title>
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>">
    <link rel="stylesheet" href="accesibilidad.css?v=3.6">
</head>
<body>
    <?php include 'header.php'; ?>

    <main class="promo-main">
        <a href="productos.php" style="color: #aaa; text-decoration: none; position: absolute; top: 100px; left: 20px; font-size: 14px;">
            ← Volver al Catálogo
        </a>

        <div class="promo-container">
            <div class="promo-image">
                <img src="<?php echo !empty($producto['imagen_url']) ? $producto['imagen_url'] : './aseets/default.webp'; ?>" 
                     alt="<?php echo htmlspecialchars($producto['nombre']); ?>" 
                     onerror="this.src='./aseets/default.webp'">
            </div>

            <div class="promo-info">
                <span class="etiqueta-oferta">🔥 ¡El más vendido!</span>
                
                <h1><?php echo htmlspecialchars($producto['nombre']); ?></h1>
                
                <p class="precio-promo">
                    $<?php echo number_format($producto['precio'], 2); ?> 
                    <span class="precio-anterior">$<?php echo number_format($precio_anterior, 2); ?></span>
                </p>
                
                <div class="promo-description">
                    <p><?php echo nl2br(htmlspecialchars($producto['descripcion'])); ?></p>
                    
                    <ul class="promo-lista">
                        <li>✅ Garantía de calidad PC Extreme.</li>
                        <li>✅ Envío o entrega inmediata en tienda.</li>
                        <li>✅ Asesoría técnica incluida.</li>
                    </ul>
                </div>

                <div class="ar-box">
                    <div class="ar-icon">📱🧊</div>
                    <div class="ar-content">
                        <h4>¡Velo en Realidad Aumentada!</h4>
                        <p>Descarga la App PC Status y pruébalo en 3D.</p>
                        <a href="#" class="btn-download-app">⬇ Descargar App</a>
                    </div>
                </div>

                <div class="promo-actions">
                    <a href="https://wa.me/<?php echo $telefono_whatsapp; ?>?text=Hola PC EXTREME, me interesa la oferta especial: <?php echo urlencode($producto['nombre']); ?>" 
                       target="_blank" class="btn-comprar-promo">
                        Comprar ahora por WhatsApp
                    </a>
                    <a href="productos.php" class="btn-volver-promo">Ver más productos</a>
                </div>
            </div>
        </div>
    </main>

    <?php include 'footer.php'; ?>
</body>
</html>