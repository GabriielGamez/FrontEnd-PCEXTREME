<?php
// 1. Iniciar sesión al principio para evitar errores de cabecera
session_start();
require_once 'conexion.php';

// Función para obtener productos agrupados por categoría
function obtenerProductosPorCategoria($conn)
{
    // CORRECCIÓN: Se añadió 'descripcion' a la consulta SQL
    $sql = "SELECT idProducto, nombre, precio, categoria, imagen_url, descripcion, fn_EstadoStock(idProducto) AS estado 
            FROM tblproductos ORDER BY categoria, idProducto";
    $resultado = $conn->query($sql);

    $productosAgrupados = [];

    if ($resultado && $resultado->num_rows > 0) {
        while ($producto = $resultado->fetch_assoc()) {
            $categoria = $producto['categoria'];

            $rutaImagen = !empty($producto['imagen_url']) ? $producto['imagen_url'] : './aseets/default.webp';

            $productosAgrupados[$categoria][] = [
                'id' => $producto['idProducto'],
                'descripcion' => $producto['descripcion'], // Ahora sí existe en el SELECT
                'precio' => $producto['precio'],
                'imagen' => $rutaImagen,
                'nombre' => $producto['nombre'],
                'estado' => $producto['estado'] // Agregamos el estado de la UDF
            ];
        }
    }
    return $productosAgrupados;
}

$productosPorCategoria = obtenerProductosPorCategoria($conn);
$categorias = array_keys($productosPorCategoria);
// No cerramos la conexión aquí si el footer.php la necesita
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Productos — PC EXTREME</title>
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />

    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body>
    <?php include 'header.php'; ?>

    <main class="tienda-main">

        <h2>¡PC Extreme te ofrece productos de alta calidad!</h2>

        <div class="layout-tienda">

            <aside class="sidebar-categorias">
                <h3 class="titulo-sidebar">Categorías</h3>
                <nav class="tabs-nav-vertical">
                    <?php foreach ($categorias as $index => $categoria): ?>
                        <?php
                        $categoriaId = str_replace(' ', '_', $categoria);
                        $activeClass = ($index === 0) ? 'active' : '';
                        ?>
                        <button id="btn-<?= $categoriaId ?>" class="productos-button btn-vertical <?= $activeClass ?>">
                            <?= strtoupper($categoria) ?> <span class="flecha">›</span>
                        </button>
                    <?php endforeach; ?>
                </nav>
            </aside>

            <section class="area-grid-productos">
                <?php foreach ($productosPorCategoria as $categoria => $productos): ?>
                    <?php
                    $categoriaId = str_replace(' ', '_', $categoria);
                    $activeClass = (array_keys($productosPorCategoria)[0] === $categoria) ? 'active' : '';
                    ?>
                    <div id="contenido-<?= $categoriaId ?>" class="contenedor-productos <?= $activeClass ?>">

                        <?php foreach ($productos as $producto): ?>

                            <a href="detalle_producto.php?id=<?= $producto['id'] ?>" class="producto"
                                style="text-decoration: none;">
                                <img src="<?= htmlspecialchars($producto['imagen']) ?>"
                                    alt="Imagen de <?= htmlspecialchars($producto['nombre']) ?>">

                                <div class="contenido-producto">
                                    <h3><?= htmlspecialchars($producto['nombre']) ?></h3>
                                    <p style="color: #aaa; font-size: 13px; margin: 5px 0;">Ver detalles</p>
                                    <h3 style="color: #76c838; margin-top: auto;">$<?= number_format($producto['precio'], 2) ?>
                                    </h3>
                                </div>
                            </a>

                        <?php endforeach; ?>

                    </div>
                <?php endforeach; ?>
            </section>

        </div>
    </main>

    <?php include 'footer.php'; ?>
</body>

</html>