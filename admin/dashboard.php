<?php 
include 'conexion.php';
include 'admin_header.php';

$rol_usuario = $_SESSION['rol_id'];

// Contadores
$total_productos = $conn->query("SELECT COUNT(*) as total FROM tblproductos")->fetch_assoc()['total'];
$total_clientes = $conn->query("SELECT COUNT(*) as total FROM tblclientes")->fetch_assoc()['total'];
$total_reparaciones = $conn->query("SELECT COUNT(*) as total FROM tblregistro")->fetch_assoc()['total'];

// --- ALERTA DE STOCK BAJO (Menos de 5 unidades) ---
$sql_stock = "SELECT nombre, stock FROM tblproductos WHERE stock <= 5";
$res_stock = $conn->query($sql_stock);
?>

<div class="page-header">
    <h2>Panel de Control</h2>
    <a href="index.php" target="_blank" class="btn-primary" style="background:#333">Ver Sitio Web ↗</a>
</div>

<?php if ($res_stock->num_rows > 0): ?>
    <div class="stock-alert-card">
        <h4 style="margin-top:0; display:flex; align-items:center; gap:10px;">
            ⚠️ Atención: Productos con Stock Bajo
        </h4>
        <ul style="margin:0; padding-left:20px;">
            <?php while($prod = $res_stock->fetch_assoc()): ?>
                <li>
                    <strong><?php echo $prod['nombre']; ?></strong> 
                    (Quedan: <?php echo $prod['stock']; ?>)
                </li>
            <?php endwhile; ?>
        </ul>
        <?php if($rol_usuario == 1): ?>
            <div style="margin-top:10px;">
                <a href="admin_productos.php" style="color:#856404; font-weight:bold; text-decoration:underline;">Ir a reabastecer →</a>
            </div>
        <?php endif; ?>
    </div>
<?php endif; ?>

<div class="card-grid">
    <div class="stat-card">
        <h3>Productos</h3>
        <p style="font-size: 36px; font-weight: bold; margin: 10px 0;"><?php echo $total_productos; ?></p>
        <small>En catálogo</small>
    </div>
    <div class="stat-card" style="border-top-color: #3842c8;">
        <h3>Clientes</h3>
        <p style="font-size: 36px; font-weight: bold; margin: 10px 0;"><?php echo $total_clientes; ?></p>
        <small>Registrados</small>
    </div>
    <div class="stat-card" style="border-top-color: #ff6b6b;">
        <h3>Reparaciones</h3>
        <p style="font-size: 36px; font-weight: bold; margin: 10px 0;"><?php echo $total_reparaciones; ?></p>
        <small>Histórico total</small>
    </div>
</div>

<?php include 'admin_footer.php'; ?>