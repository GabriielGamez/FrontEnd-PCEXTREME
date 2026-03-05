<?php
include 'conexion.php';
include 'admin_header.php';

$mensaje = "";

// --- 1. GUARDAR PORTADA ---
if (isset($_POST['guardar_portada'])) {
    $titulo = $conn->real_escape_string($_POST['titulo']);
    $descripcion = $conn->real_escape_string($_POST['descripcion']);
    $texto_boton = $conn->real_escape_string($_POST['texto_boton']);
    
    $sql_extra = "";
    
    // Video
    if (isset($_FILES['video_fondo']) && $_FILES['video_fondo']['error'] == 0) {
        $nombre = basename($_FILES['video_fondo']['name']);
        move_uploaded_file($_FILES['video_fondo']['tmp_name'], "aseets/$nombre");
        $sql_extra .= ", video_url = '$nombre'";
    }
    // Imagen
    if (isset($_FILES['imagen_fondo']) && $_FILES['imagen_fondo']['error'] == 0) {
        $nombre_img = basename($_FILES['imagen_fondo']['name']);
        move_uploaded_file($_FILES['imagen_fondo']['tmp_name'], "aseets/$nombre_img");
        $sql_extra .= ", imagen_fondo = '$nombre_img'";
    }

    $conn->query("UPDATE tbl_inicio SET titulo='$titulo', descripcion='$descripcion', texto_boton='$texto_boton' $sql_extra WHERE id=1");
    $mensaje = "<div class='alert-success' style='background:#d4edda; color:#155724; padding:10px; border-radius:5px; margin-bottom:20px;'>✅ Portada actualizada correctamente.</div>";
}

// --- 2. GUARDAR CONTACTO ---
if (isset($_POST['guardar_contacto'])) {
    $email = $conn->real_escape_string($_POST['email']);
    $tel = $conn->real_escape_string($_POST['telefono']);
    $whats = $conn->real_escape_string($_POST['whatsapp']);
    $dir = $conn->real_escape_string($_POST['direccion']);
    $mapa = $conn->real_escape_string($_POST['mapa_url']);

    $conn->query("UPDATE tbl_contacto SET email='$email', telefono='$tel', whatsapp='$whats', direccion='$dir', mapa_url='$mapa' WHERE id=1");
    $mensaje = "<div class='alert-success' style='background:#d4edda; color:#155724; padding:10px; border-radius:5px; margin-bottom:20px;'>✅ Datos de contacto actualizados.</div>";
}

// CARGAR DATOS
$portada = $conn->query("SELECT * FROM tbl_inicio LIMIT 1")->fetch_assoc();
$contacto = $conn->query("SELECT * FROM tbl_contacto LIMIT 1")->fetch_assoc();
$nosotros = $conn->query("SELECT * FROM tblNosotros");
?>

<div class="page-header">
    <h2>Gestor de Contenido Web</h2>
</div>

<?php echo $mensaje; ?>

<div class="tabs-header">
    <button class="tab-btn active" onclick="openTab(event, 'tab-portada')">🏠 Portada Inicio</button>
    <button class="tab-btn" onclick="openTab(event, 'tab-nosotros')">🏢 Sobre Nosotros</button>
    <button class="tab-btn" onclick="openTab(event, 'tab-contacto')">📞 Contacto y Mapa</button>
</div>

<div class="tab-content-box">
    
    <div id="tab-portada" class="tab-pane" style="display:block;">
        <form method="POST" enctype="multipart/form-data">
            <div class="config-grid">
                <div>
                    <div class="config-section">
                        <h4>Textos Principales</h4>
                        <label style="font-weight:bold;">Título Principal (H1)</label>
                        <input type="text" name="titulo" value="<?php echo htmlspecialchars($portada['titulo']); ?>" required>
                        
                        <label style="font-weight:bold;">Descripción / Subtítulo</label>
                        <textarea name="descripcion" rows="4" required><?php echo htmlspecialchars($portada['descripcion']); ?></textarea>
                        
                        <label style="font-weight:bold;">Texto del Botón</label>
                        <input type="text" name="texto_boton" value="<?php echo htmlspecialchars($portada['texto_boton']); ?>" required style="width: 200px;">
                    </div>
                    <button type="submit" name="guardar_portada" class="btn-action" style="width: 100%; padding: 15px;">💾 Guardar Cambios Portada</button>
                </div>

                <div>
                    <div class="config-section">
                        <h4>Video de Fondo (Prioridad)</h4>
                        <?php if(!empty($portada['video_url'])): ?>
                            <video class="preview-media" autoplay muted loop>
                                <source src="./aseets/<?php echo $portada['video_url']; ?>" type="video/mp4">
                            </video>
                            <div style="font-size:11px; color:#3842c8; margin-bottom:5px;">Archivo actual: <?php echo $portada['video_url']; ?></div>
                        <?php else: ?>
                            <div class="preview-media">Sin video</div>
                        <?php endif; ?>
                        <input type="file" name="video_fondo" accept="video/mp4">
                    </div>

                    <div class="config-section">
                        <h4>Imagen de Respaldo</h4>
                        <?php if(!empty($portada['imagen_fondo'])): ?>
                            <img src="./aseets/<?php echo $portada['imagen_fondo']; ?>" class="preview-media">
                        <?php else: ?>
                            <div class="preview-media">Sin imagen</div>
                        <?php endif; ?>
                        <input type="file" name="imagen_fondo" accept="image/*">
                    </div>
                </div>
            </div>
        </form>
    </div>

    <div id="tab-nosotros" class="tab-pane">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="margin:0;">Secciones Informativas</h3>
            <small style="color:#666;">Edita el contenido de Misión, Visión y Quiénes Somos.</small>
        </div>

        <div class="table-responsive-cards">
            <table class="table-admin table-nosotros">
                <thead>
                    <tr>
                        <th width="120">Imagen</th>
                        <th>Título y Descripción</th>
                        <th width="100">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while($row = $nosotros->fetch_assoc()): ?>
                    <tr>
                        <td data-label="Imagen">
                            <img src="./aseets/<?php echo $row['imagen']; ?>" style="width: 100px; height: 70px; object-fit: cover; border-radius: 6px;">
                        </td>
                        
                        <td data-label="Contenido">
                            <strong style="font-size:16px; display:block; margin-bottom:5px; color:#333;"><?php echo $row['titulo']; ?></strong>
                            <p style="font-size:13px; color:#666; margin:0; line-height:1.4;">
                                <?php echo substr($row['descripcion'], 0, 120) . '...'; ?>
                            </p>
                        </td>
                        
                        <td data-label="Acción" style="text-align:center;">
                            <a href="admin_nosotros.php?editar=<?php echo $row['idInfo']; ?>" class="btn-table btn-edit" style="width:100%; justify-content:center; padding:10px;">Editar</a>
                        </td>
                    </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
        <p style="margin-top:15px; font-size:13px; color:#888; text-align:center;">* Para agregar más secciones, contacta al desarrollador.</p>
    </div>

    <div id="tab-contacto" class="tab-pane">
        <form method="POST">
            
            <div class="config-section">
                <h4>Información de Contacto Directo</h4>
                <div class="contact-grid">
                    <div>
                        <label style="font-weight:bold; font-size:12px;">Email</label>
                        <input type="text" name="email" value="<?php echo htmlspecialchars($contacto['email']); ?>">
                    </div>
                    <div>
                        <label style="font-weight:bold; font-size:12px;">Teléfono</label>
                        <input type="text" name="telefono" value="<?php echo htmlspecialchars($contacto['telefono']); ?>">
                    </div>
                    <div>
                        <label style="font-weight:bold; font-size:12px;">WhatsApp</label>
                        <input type="text" name="whatsapp" value="<?php echo htmlspecialchars($contacto['whatsapp']); ?>">
                    </div>
                </div>
            </div>

            <div class="config-grid">
                <div class="config-section">
                    <h4>Ubicación Física</h4>
                    <label style="font-weight:bold;">Dirección Completa</label>
                    <textarea name="direccion" rows="4" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;"><?php echo htmlspecialchars($contacto['direccion']); ?></textarea>
                </div>

                <div class="config-section">
                    <h4>Mapa (Google Maps)</h4>
                    <label style="font-weight:bold;">Enlace Embed (src)</label>
                    <input type="text" name="mapa_url" value="<?php echo htmlspecialchars($contacto['mapa_url']); ?>" style="font-family:monospace; color:#3842c8;">
                    <small style="display:block; margin-top:5px; color:#666;">Pega aquí solo la URL que está dentro de src="..." del código de compartir de Google.</small>
                </div>
            </div>
            
            <div style="text-align:right;">
                <button type="submit" name="guardar_contacto" class="btn-action" style="padding: 12px 30px; font-size:16px;">💾 Guardar Datos de Contacto</button>
            </div>
        </form>
    </div>

</div>

<script>
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-pane");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
</script>

<?php include 'admin_footer.php'; ?>