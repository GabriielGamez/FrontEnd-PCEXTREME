<?php
include 'conexion.php';
include 'admin_header.php';

$mensaje = "";
$registro_a_editar = null;

// --- 1. PROCESAR ACTUALIZACIÓN ---
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['actualizar_info'])) {
    $id = $_POST['idInfo'];
    $titulo = $conn->real_escape_string($_POST['titulo']);
    $descripcion = $conn->real_escape_string($_POST['descripcion']);
    
    // Lógica de Imagen (Igual que en productos)
    $sql_extra = ""; // Variable para agregar la parte de la imagen al SQL si es necesario
    
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
        $directorio = "aseets/"; // Guardamos en la carpeta raíz de assets
        $nombre_archivo = basename($_FILES['imagen']['name']);
        $ruta_final = $directorio . $nombre_archivo;
        
        if (move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta_final)) {
            // Si se subió, agregamos esto a la actualización
            $sql_extra = ", imagen = '$nombre_archivo'";
        }
    }

    $sql = "UPDATE tblNosotros SET titulo = '$titulo', descripcion = '$descripcion' $sql_extra WHERE idInfo = $id";
    
    if ($conn->query($sql)) {
        $mensaje = "¡Sección actualizada correctamente!";
    } else {
        $mensaje = "Error: " . $conn->error;
    }
}

// --- 2. CARGAR DATOS PARA EDITAR (Si se dio clic en el botón Editar) ---
if (isset($_GET['editar'])) {
    $id_editar = $_GET['editar'];
    $res = $conn->query("SELECT * FROM tblNosotros WHERE idInfo = $id_editar");
    $registro_a_editar = $res->fetch_assoc();
}

// --- 3. OBTENER LISTADO COMPLETO ---
$lista = $conn->query("SELECT * FROM tblNosotros ORDER BY idInfo ASC");
?>

<h3>Gestión de "Sobre Nosotros"</h3>
<p>Edita las tarjetas de Quiénes Somos, Misión y Visión.</p>

<?php if($mensaje): ?>
    <div style="background: #d4edda; color: #155724; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
        <?php echo $mensaje; ?>
    </div>
<?php endif; ?>

<div style="display: flex; gap: 30px; flex-wrap: wrap;">

    <div style="flex: 1; min-width: 300px;">
        <table class="table-admin">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Título</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <?php while($row = $lista->fetch_assoc()): ?>
                <tr style="<?php echo (isset($_GET['editar']) && $_GET['editar'] == $row['idInfo']) ? 'background-color: #f0f8ff;' : ''; ?>">
                    <td>
                        <img src="./aseets/<?php echo $row['imagen']; ?>" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    </td>
                    <td><strong><?php echo $row['titulo']; ?></strong></td>
                    <td>
                        <a href="admin_nosotros.php?editar=<?php echo $row['idInfo']; ?>" class="btn-action" style="background-color: #333;">Editar</a>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>

    <div style="flex: 1; min-width: 300px;">
        <?php if ($registro_a_editar): ?>
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #76c838;">
                <h4 style="margin-top:0;">Editando: <?php echo $registro_a_editar['titulo']; ?></h4>
                
                <form method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="idInfo" value="<?php echo $registro_a_editar['idInfo']; ?>">

                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Título:</label>
                    <input type="text" name="titulo" value="<?php echo htmlspecialchars($registro_a_editar['titulo']); ?>" required style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd;">

                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Descripción:</label>
                    <textarea name="descripcion" rows="6" required style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd;"><?php echo htmlspecialchars($registro_a_editar['descripcion']); ?></textarea>

                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Imagen Actual:</label>
                    <img src="./aseets/<?php echo $registro_a_editar['imagen']; ?>" style="max-width: 150px; display:block; margin-bottom: 10px; border-radius: 5px;">
                    
                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Cambiar Imagen (Opcional):</label>
                    <input type="file" name="imagen" accept="image/*" style="margin-bottom: 20px;">

                    <div style="display: flex; gap: 10px;">
                        <button type="submit" name="actualizar_info" class="btn-action" style="padding: 10px 20px;">Guardar Cambios</button>
                        <a href="admin_nosotros.php" style="padding: 10px 20px; background: #ccc; color: #333; text-decoration: none; border-radius: 5px; font-weight: bold;">Cancelar</a>
                    </div>
                </form>
            </div>
        <?php else: ?>
            <div style="background: #e9ecef; padding: 30px; border-radius: 8px; text-align: center; color: #666;">
                <p>Selecciona un elemento de la lista para editarlo.</p>
            </div>
        <?php endif; ?>
    </div>

</div>

</main>
</div>
</body>
</html>