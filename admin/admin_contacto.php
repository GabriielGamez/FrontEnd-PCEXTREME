<?php
// admin_contacto.php
include 'conexion.php';
include 'admin_header.php';

$mensaje = "";

// 1. PROCESAR EL GUARDADO (UPDATE)
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['actualizar_contacto'])) {
    $email = $conn->real_escape_string($_POST['email']);
    $telefono = $conn->real_escape_string($_POST['telefono']);
    $whatsapp = $conn->real_escape_string($_POST['whatsapp']);
    $direccion = $conn->real_escape_string($_POST['direccion']);
    $mapa_url = $conn->real_escape_string($_POST['mapa_url']);

    // Actualizamos el registro con ID 1 (asumimos que solo hay 1 fila de configuración)
    $sql = "UPDATE tbl_contacto SET 
            email = '$email', 
            telefono = '$telefono', 
            whatsapp = '$whatsapp', 
            direccion = '$direccion', 
            mapa_url = '$mapa_url' 
            WHERE id = 1";

    if ($conn->query($sql)) {
        $mensaje = "¡Datos de contacto actualizados correctamente!";
    } else {
        $mensaje = "Error al actualizar: " . $conn->error;
    }
}

// 2. OBTENER LOS DATOS ACTUALES
$sql_datos = "SELECT * FROM tbl_contacto LIMIT 1";
$resultado = $conn->query($sql_datos);

// Si la tabla está vacía (por si acaso), creamos un array vacío o insertamos uno por defecto
if ($resultado->num_rows > 0) {
    $contacto = $resultado->fetch_assoc();
} else {
    // Insertamos una fila inicial si no existe
    $conn->query("INSERT INTO tbl_contacto (email, telefono, whatsapp, direccion, mapa_url) VALUES ('admin@example.com', '0000000000', '0000000000', 'Dirección pendiente', '#')");
    $contacto = ['email'=>'', 'telefono'=>'', 'whatsapp'=>'', 'direccion'=>'', 'mapa_url'=>''];
    echo "<script>window.location.reload();</script>";
}
?>

<h3>Editar Información de Contacto</h3>
<p>Aquí puedes modificar los datos que aparecen en la página pública de "Contáctanos".</p>

<?php if($mensaje): ?>
    <div style="background: #d4edda; color: #155724; padding: 15px; margin-bottom: 20px; border-radius: 5px; border: 1px solid #c3e6cb;">
        <?php echo $mensaje; ?>
    </div>
<?php endif; ?>

<div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
    <form method="POST">
        
        <div style="margin-bottom: 20px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">Correo Electrónico (Gmail):</label>
            <input type="email" name="email" value="<?php echo htmlspecialchars($contacto['email']); ?>" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <label style="display:block; font-weight:bold; margin-bottom:5px;">Teléfono (Llamadas):</label>
                <input type="text" name="telefono" value="<?php echo htmlspecialchars($contacto['telefono']); ?>" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <label style="display:block; font-weight:bold; margin-bottom:5px;">WhatsApp (Número con lada):</label>
                <input type="text" name="whatsapp" value="<?php echo htmlspecialchars($contacto['whatsapp']); ?>" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                <small style="color:#888;">Ejemplo: 527714579875 (Sin espacios ni guiones)</small>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">Dirección Física:</label>
            <textarea name="direccion" rows="3" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"><?php echo htmlspecialchars($contacto['direccion']); ?></textarea>
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">Enlace de Google Maps:</label>
            <input type="text" name="mapa_url" value="<?php echo htmlspecialchars($contacto['mapa_url']); ?>" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <button type="submit" name="actualizar_contacto" class="btn-action" style="padding: 12px 25px; font-size: 16px;">Guardar Cambios</button>
    </form>
</div>

</main>
</div>
</body>
</html>