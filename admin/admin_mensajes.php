<?php
include 'conexion.php';
include 'admin_header.php';

// SEGURIDAD: Solo Admin (1) y Recepción (2)
if ($_SESSION['rol_id'] == 3) {
    echo "<script>window.location.href='dashboard.php';</script>";
    exit();
}

// --- LÓGICA: ELIMINAR ---
if (isset($_GET['borrar'])) {
    $id_borrar = $conn->real_escape_string($_GET['borrar']);
    $conn->query("DELETE FROM tbl_mensajes WHERE id = '$id_borrar'");
    echo "<script>window.location.href='admin_mensajes.php';</script>";
}

// --- CONSULTA ---
$sql = "SELECT * FROM tbl_mensajes ORDER BY fecha DESC";
$resultado = $conn->query($sql);
?>

<div class="page-header">
    <h2>Buzón de Mensajes Web</h2>
</div>

<div class="table-responsive-cards">
    <table class="table-admin table-mensajes">
        <thead>
            <tr>
                <th width="150">Fecha</th>
                <th width="200">De (Cliente)</th>
                <th>Asunto / Mensaje</th>
                <th width="180" style="text-align:center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php if ($resultado && $resultado->num_rows > 0): ?>
                <?php while($row = $resultado->fetch_assoc()): ?>
                <tr>
                    <td data-label="Fecha" style="font-size:13px; color:#666;">
                        <?php echo date("d M h:i A", strtotime($row['fecha'])); ?>
                    </td>
                    
                    <td data-label="De">
                        <strong><?php echo htmlspecialchars($row['correo']); ?></strong>
                    </td>
                    
                    <td data-label="Mensaje">
                        <div style="font-weight:bold; color:#3842c8; margin-bottom:5px;">
                            <?php echo htmlspecialchars($row['asunto']); ?>
                        </div>
                        <div style="font-size:13px; color:#555; line-height:1.5; background:#f9f9f9; padding:10px; border-radius:5px; border:1px solid #eee;">
                            <?php echo nl2br(htmlspecialchars($row['mensaje'])); ?>
                        </div>
                    </td>
                    
                    <td data-label="Acciones" style="text-align:center; white-space:nowrap;">
                        
                        <a href="mailto:<?php echo $row['correo']; ?>?subject=RE: <?php echo $row['asunto']; ?>" 
                           class="btn-table btn-info" title="Responder por Correo">
                           📧 Responder
                        </a>

                        <a href="admin_mensajes.php?borrar=<?php echo $row['id']; ?>" 
                           onclick="return confirm('¿Ya atendiste este mensaje? Se eliminará permanentemente.')"
                           class="btn-table btn-delete" title="Eliminar Mensaje">
                           🗑️ Eliminar
                        </a>
                        
                    </td>
                </tr>
                <?php endwhile; ?>
            <?php else: ?>
                <tr>
                    <td colspan="4" style="text-align:center; padding:40px; color:#888;">
                        📭 No hay mensajes nuevos.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php include 'admin_footer.php'; ?>