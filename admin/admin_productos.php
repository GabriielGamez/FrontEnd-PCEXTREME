<?php
// admin_productos.php
include 'conexion.php'; //
include 'admin_header.php'; //

$mensaje = ""; //
$producto_a_editar = null; //
$abrir_modal = false; //

// --- 1. LÓGICA DE GUARDADO (CREAR O EDITAR PRODUCTO) ---
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['guardar_producto'])) { //

    $id = $_POST['id_producto']; //
    $nombre = $conn->real_escape_string($_POST['nombre']); //
    $precio = $conn->real_escape_string($_POST['precio']); //
    $stock = $conn->real_escape_string($_POST['stock']); //
    $categoria = $conn->real_escape_string($_POST['categoria']); //
    $descripcion = $conn->real_escape_string($_POST['descripcion']); //
    $ruta_imagen_final = $_POST['imagen_actual']; //

    // Manejo de carga de imágenes
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) { //
        $directorio = "aseets/Productos/" . strtoupper($categoria) . "/"; //
        if (!file_exists($directorio)) { //
            mkdir($directorio, 0777, true); //
        }
        $nombre_archivo = str_replace(' ', '_', basename($_FILES['imagen']['name'])); //
        $ruta_imagen_final = "./" . $directorio . $nombre_archivo; //
        move_uploaded_file($_FILES['imagen']['tmp_name'], $directorio . $nombre_archivo); //
    }

    if (!empty($id)) { //
        $sql = "UPDATE tblproductos SET nombre='$nombre', precio='$precio', stock='$stock', categoria='$categoria', descripcion='$descripcion', imagen_url='$ruta_imagen_final' WHERE idProducto='$id'"; //
        $accion_texto = "actualizado"; //
    } else {
        $sql = "INSERT INTO tblproductos (nombre, stock, precio, descripcion, categoria, imagen_url) VALUES ('$nombre', '$stock', '$precio', '$descripcion', '$categoria', '$ruta_imagen_final')"; //
        $accion_texto = "agregado"; //
    }

    if ($conn->query($sql)) { //
        $mensaje = "<div style='background:#d4edda; color:#155724; padding:10px; border-radius:5px;'>Producto $accion_texto correctamente.</div>"; //
    } else {
        $mensaje = "<div style='background:#f8d7da; color:#721c24; padding:10px; border-radius:5px;'>Error: " . $conn->error . "</div>"; //
    }
}

// --- 2. LÓGICA DE REPOSICIÓN RÁPIDA (PROCEDIMIENTO ALMACENADO) ---
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['reponer_stock'])) { //
    $id_p = $_POST['id_producto']; //
    $cantidad = (int) $_POST['cantidad_nueva']; //

    // Ejecución del procedimiento almacenado para PC EXTREME
    $sql_sp = "CALL sp_GestionarInventario($id_p, $cantidad, 'SUMAR')"; //

    if ($conn->query($sql_sp)) { //
        $mensaje = "<div style='background:#d4edda; color:#155724; padding:10px; border-radius:5px;'>Stock actualizado vía Procedimiento Almacenado.</div>"; //
    } else {
        $mensaje = "<div style='background:#f8d7da; color:#721c24; padding:10px; border-radius:5px;'>Error en SP: " . $conn->error . "</div>"; //
    }
}

// --- 3. PREPARAR EDICIÓN (Cargar datos en el modal) ---
if (isset($_GET['editar'])) { //
    $id_editar = $_GET['editar']; //
    $res = $conn->query("SELECT * FROM tblproductos WHERE idProducto = $id_editar"); //
    $producto_a_editar = $res->fetch_assoc(); //
    $abrir_modal = true; //
}

// --- 4. ELIMINAR PRODUCTO ---
if (isset($_GET['borrar'])) { //
    $id = $_GET['borrar']; //
    $conn->query("DELETE FROM tblproductos WHERE idProducto = $id"); //
    echo "<script>window.location.href='admin_productos.php';</script>"; //
}

// --- 5. BÚSQUEDA Y PAGINACIÓN ---
$registros_por_pagina = 10; //
$pagina_actual = isset($_GET['page']) ? (int) $_GET['page'] : 1; //
$offset = ($pagina_actual - 1) * $registros_por_pagina; //

$busqueda = isset($_GET['q']) ? $conn->real_escape_string($_GET['q']) : ''; //
$where_sql = !empty($busqueda) ? "WHERE nombre LIKE '%$busqueda%' OR categoria LIKE '%$busqueda%'" : ""; //

$total_registros = $conn->query("SELECT COUNT(*) as total FROM tblproductos $where_sql")->fetch_assoc()['total']; //
$total_paginas = ceil($total_registros / $registros_por_pagina); //

$productos = $conn->query("SELECT * FROM tblproductos $where_sql ORDER BY idProducto DESC LIMIT $offset, $registros_por_pagina"); //
?>

<div class="page-header">
    <h2>Gestión de Productos</h2> </div>

<?php echo $mensaje; ?> <div class="toolbar"> <form method="GET" class="search-box">
        <input type="text" name="q" value="<?php echo htmlspecialchars($busqueda); ?>" placeholder="Buscar producto...">
        <button type="submit" class="btn-action">Buscar</button>
        <?php if (!empty($busqueda)): ?>
            <a href="admin_productos.php" style="color: #dc3545; margin-left:10px;">Limpiar</a>
        <?php endif; ?>
    </form>
    <button onclick="abrirModal()" class="btn-primary">+ Nuevo Producto</button>
</div>

<div id="modalProducto" class="modal-overlay"> <div class="modal-content">
        <span class="close-modal" onclick="cerrarModal()">&times;</span>
        <h3 style="color:#3842c8; border-bottom:1px solid #eee; padding-bottom:10px;">
            <?php echo $producto_a_editar ? 'Editar Producto' : 'Registrar Nuevo Producto'; ?>
        </h3>
        <form method="POST" enctype="multipart/form-data" style="margin-top:20px;">
            <input type="hidden" name="id_producto" value="<?php echo $producto_a_editar ? $producto_a_editar['idProducto'] : ''; ?>">
            <input type="hidden" name="imagen_actual" value="<?php echo $producto_a_editar ? $producto_a_editar['imagen_url'] : ''; ?>">

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <label>Nombre del Producto</label>
                    <input type="text" name="nombre" value="<?php echo $producto_a_editar ? htmlspecialchars($producto_a_editar['nombre']) : ''; ?>" required>
                </div>
                <div>
                    <label>Categoría</label>
                    <select name="categoria" required>
                        <?php
                        $cat_actual = $producto_a_editar ? $producto_a_editar['categoria'] : '';
                        $categorias_list = ['PERIFERICOS', 'COMPONENTES', 'MONITORES', 'LIMPIEZA']; //
                        foreach ($categorias_list as $cat) {
                            $selected = ($cat == $cat_actual) ? 'selected' : '';
                            echo "<option value='$cat' $selected>$cat</option>";
                        }
                        ?>
                    </select>
                </div>
                <div>
                    <label>Precio ($)</label>
                    <input type="number" name="precio" step="0.01" value="<?php echo $producto_a_editar ? $producto_a_editar['precio'] : ''; ?>" required>
                </div>
                <div>
                    <label>Stock Inicial</label>
                    <input type="number" name="stock" value="<?php echo $producto_a_editar ? $producto_a_editar['stock'] : ''; ?>" required>
                </div>
                <div style="grid-column: span 2;">
                    <label>Descripción Detallada</label>
                    <textarea name="descripcion" rows="3" required><?php echo $producto_a_editar ? htmlspecialchars($producto_a_editar['descripcion']) : ''; ?></textarea>
                </div>
                <div style="grid-column: span 2;">
                    <label>Imagen del Producto</label>
                    <input type="file" name="imagen" accept="image/*">
                </div>
            </div>
            <div style="margin-top:20px; text-align:right;">
                <button type="button" onclick="cerrarModal()" class="btn-action" style="background:#666; margin-right:10px;">Cancelar</button>
                <button type="submit" name="guardar_producto" class="btn-action">Guardar Cambios</button>
            </div>
        </form>
    </div>
</div>

<div class="table-responsive-cards"> <table class="table-admin table-productos">
        <thead>
            <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock (Control SP)</th>
                <th>Categoría</th>
                <th style="text-align:right;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php if ($productos->num_rows > 0): ?>
                <?php while ($row = $productos->fetch_assoc()): ?> <tr>
                        <td data-label="ID">#<?php echo $row['idProducto']; ?></td>
                        <td data-label="Imagen">
                            <img src="<?php echo !empty($row['imagen_url']) ? $row['imagen_url'] : './aseets/default.webp'; ?>" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                        </td>
                        <td data-label="Producto">
                            <strong><?php echo $row['nombre']; ?></strong>
                            <?php if ($row['stock'] <= 5): ?>
                                <br><span style="color:#dc3545; font-size:11px; font-weight:bold;">⚠️ Stock Bajo</span>
                            <?php endif; ?>
                        </td>
                        <td data-label="Precio" style="color:#76c838; font-weight:bold;">
                            $<?php echo number_format($row['precio'], 2); ?>
                        </td>
                        <td data-label="Stock">
                            <strong><?php echo $row['stock']; ?></strong>
                            <form method="POST" style="display:flex; gap:5px; margin-top:5px;">
                                <input type="hidden" name="id_producto" value="<?php echo $row['idProducto']; ?>">
                                <input type="number" name="cantidad_nueva" placeholder="+" style="width:45px; padding:2px;" required>
                                <button type="submit" name="reponer_stock" class="btn-table" style="background:#3842c8; color:white; padding:2px 5px;">Ok</button>
                            </form>
                        </td>
                        <td data-label="Categoría"><?php echo $row['categoria']; ?></td>
                        <td data-label="Acciones" style="text-align:right; white-space: nowrap;">
                            <a href="admin_productos.php?editar=<?php echo $row['idProducto']; ?>&page=<?php echo $pagina_actual; ?>" class="btn-table btn-edit">Editar</a>
                            <a href="admin_productos.php?borrar=<?php echo $row['idProducto']; ?>" onclick="return confirm('¿Eliminar producto?')" class="btn-table btn-delete">Borrar</a>
                        </td>
                    </tr>
                <?php endwhile; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php if ($total_paginas > 1): ?>
    <div class="pagination">
        <?php for ($i = 1; $i <= $total_paginas; $i++): ?>
            <a href="?page=<?php echo $i; ?>&q=<?php echo $busqueda; ?>" class="<?php echo ($i == $pagina_actual) ? 'active' : ''; ?>"><?php echo $i; ?></a>
        <?php endfor; ?>
    </div>
<?php endif; ?>

<script>
    var modal = document.getElementById("modalProducto"); //
    function abrirModal() { modal.style.display = "block"; } //
    function cerrarModal() { 
        modal.style.display = "none"; 
        if (window.location.search.includes('editar')) { window.location.href = 'admin_productos.php'; }
    }
    <?php if ($abrir_modal): ?> abrirModal(); <?php endif; ?> //
</script>

<?php include 'admin_footer.php'; ?> ```

