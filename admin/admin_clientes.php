<?php
include 'conexion.php';
include 'admin_header.php';

// Búsqueda simple de clientes
$busqueda = isset($_GET['q']) ? $conn->real_escape_string($_GET['q']) : '';
$where = "";
if($busqueda){
    $where = "WHERE nombre LIKE '%$busqueda%' OR email LIKE '%$busqueda%' OR telefono LIKE '%$busqueda%'";
}

$sql = "SELECT * FROM tblclientes $where ORDER BY idCliente DESC";
$resultado = $conn->query($sql);
?>

<div class="page-header">
    <h2>Gestión de Clientes</h2>
</div>

<div class="toolbar">
    <form method="GET" class="search-box">
        <input type="text" name="q" value="<?php echo htmlspecialchars($busqueda); ?>" placeholder="Buscar cliente por nombre, correo..." style="margin:0;">
        <button type="submit" class="btn-action" style="margin-left:5px;">Buscar</button>
        <?php if($busqueda): ?>
            <a href="admin_clientes.php" style="color: #dc3545; font-size:14px; margin-left:10px;">Limpiar</a>
        <?php endif; ?>
    </form>
</div>

<div class="table-responsive-cards">
    <table class="table-admin table-clientes">
        <thead>
            <tr>
                <th width="50">ID</th>
                <th>Nombre Completo</th>
                <th>Contacto</th>
                <th>Dirección</th>
                <th width="120" style="text-align:center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php if ($resultado && $resultado->num_rows > 0): ?>
                <?php while($row = $resultado->fetch_assoc()): ?>
                <tr>
                    <td data-label="ID">
                        <span class="badge-folio">#<?php echo $row['idCliente']; ?></span>
                    </td>
                    
                    <td data-label="Cliente">
                        <strong><?php echo $row['nombre'] . ' ' . $row['aPaterno'] . ' ' . $row['aMaterno']; ?></strong>
                    </td>
                    
                    <td data-label="Contacto">
                        <div style="display:flex; flex-direction:column; gap:5px; font-size:13px;">
                            <span>📧 <?php echo $row['email']; ?></span>
                            <span>📞 <?php echo $row['telefono']; ?></span>
                        </div>
                    </td>
                    
                    <td data-label="Dirección" style="font-size: 13px; color: #666;">
                        <?php echo $row['direccion']; ?>
                    </td>
                    
                    <td data-label="Acciones" style="text-align:center;">
                        <a href="https://wa.me/52<?php echo $row['telefono']; ?>" target="_blank" class="btn-whatsapp">
                            💬 Chat WhatsApp
                        </a>
                    </td>
                </tr>
                <?php endwhile; ?>
            <?php else: ?>
                <tr>
                    <td colspan="5" style="text-align:center; padding: 40px; color:#888;">
                        No se encontraron clientes.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php include 'admin_footer.php'; ?>