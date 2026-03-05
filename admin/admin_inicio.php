<?php
include 'conexion.php';
include 'admin_header.php';

$mensaje = "";

// --- 1. PROCESAR ACTUALIZACIÓN ---
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['actualizar_inicio'])) {
    $titulo = $conn->real_escape_string($_POST['titulo']);
    $descripcion = $conn->real_escape_string($_POST['descripcion']);
    $texto_boton = $conn->real_escape_string($_POST['texto_boton']);
    
    $sql_extra_img = ""; 
    $sql_extra_video = "";
    $directorio = "aseets/"; // Carpeta de destino

    // A. Lógica de IMAGEN
    if (isset($_FILES['imagen_fondo']) && $_FILES['imagen_fondo']['error'] == 0) {
        $nombre_img = basename($_FILES['imagen_fondo']['name']);
        if (move_uploaded_file($_FILES['imagen_fondo']['tmp_name'], $directorio . $nombre_img)) {
            $sql_extra_img = ", imagen_fondo = '$nombre_img'";
        }
    }

    // B. Lógica de VIDEO (ESTO ES LO NUEVO QUE TE FALTA)
    if (isset($_FILES['video_fondo']) && $_FILES['video_fondo']['error'] == 0) {
        $nombre_vid = basename($_FILES['video_fondo']['name']);
        // Validar extensión básica
        $ext = strtolower(pathinfo($nombre_vid, PATHINFO_EXTENSION));
        if($ext == "mp4" || $ext == "webm") {
            if (move_uploaded_file($_FILES['video_fondo']['tmp_name'], $directorio . $nombre_vid)) {
                $sql_extra_video = ", video_url = '$nombre_vid'";
            }
        } else {
            $mensaje = "Error: Solo se permiten videos MP4 o WebM.";
        }
    }

    // Actualizamos el registro si no hubo error de formato
    if (empty($mensaje) || strpos($mensaje, 'Error') === false) {
        $sql = "UPDATE tbl_inicio SET titulo = '$titulo', descripcion = '$descripcion', texto_boton = '$texto_boton' $sql_extra_img $sql_extra_video WHERE id = 1";
        
        if ($conn->query($sql)) {
            $mensaje = "¡Portada actualizada correctamente!";
        } else {
            $mensaje = "Error SQL: " . $conn->error;
        }
    }
}

// --- 2. OBTENER DATOS ACTUALES ---
$res = $conn->query("SELECT * FROM tbl_inicio LIMIT 1");
$portada = $res->fetch_assoc();
?>

<h3>Gestor de Portada (Inicio)</h3>
<p>Edita el contenido principal. Puedes elegir entre mostrar una Imagen o un Video.</p>

<?php if($mensaje): ?>
    <div style="background: #d4edda; color: #155724; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
        <?php echo $mensaje; ?>
    </div>
<?php endif; ?>

<div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 800px;">
    
    <form method="POST" enctype="multipart/form-data">
        
        <div style="margin-bottom: 20px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">Título Principal:</label>
            <input type="text" name="titulo" value="<?php echo htmlspecialchars($portada['titulo']); ?>" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">Descripción:</label>
            <textarea name="descripcion" rows="4" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"><?php echo htmlspecialchars($portada['descripcion']); ?></textarea>
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">Texto del Botón:</label>
            <input type="text" name="texto_boton" value="<?php echo htmlspecialchars($portada['texto_boton']); ?>" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
                <label style="display:block; font-weight:bold; margin-bottom:10px;">Imagen de Fondo:</label>
                <?php if(!empty($portada['imagen_fondo'])): ?>
                    <img src="./aseets/<?php echo $portada['imagen_fondo']; ?>" style="max-width: 100%; height: 100px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;">
                <?php endif; ?>
                <input type="file" name="imagen_fondo" accept="image/*">
                <small style="color: #666; display: block; margin-top: 5px;">Se usará si no hay video cargado o en móviles antiguos.</small>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; border: 1px solid #bbdefb;">
                <label style="display:block; font-weight:bold; margin-bottom:10px;">Video de Portada (Prioridad):</label>
                <?php if(!empty($portada['video_url'])): ?>
                    <div style="margin-bottom: 10px; color: #0d47a1; font-size: 12px;">
                        ✅ Video actual: <strong><?php echo $portada['video_url']; ?></strong>
                    </div>
                <?php endif; ?>
                <input type="file" name="video_fondo" accept="video/mp4,video/webm">
                <small style="color: #666; display: block; margin-top: 5px;">Sube un MP4. Si subes uno, reemplazará visualmente a la imagen.</small>
            </div>

        </div>

        <button type="submit" name="actualizar_inicio" class="btn-action" style="margin-top: 30px; padding: 12px 25px; font-size: 16px; width: 100%;">Guardar Cambios</button>
    </form>
</div>

</main>
</div>
</body>
</html>