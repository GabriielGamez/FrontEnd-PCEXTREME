<?php
include 'conexion.php';
include 'admin_header.php'; // Solo un header aquí
include_once 'fcm_send.php'; 

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// --- 1. LÓGICA DE PROCESAMIENTO ---
if (isset($_POST['actualizar_estado'])) {
    $idFolio = $_POST['id_folio'];
    $nuevo_estado = $_POST['nuevo_estado'];
    $nuevo_diagnostico = $_POST['nuevo_diagnostico'];
    $nuevo_costo = $_POST['nuevo_costo'];
    
    $idProductoUsado = !empty($_POST['id_producto']) ? $_POST['id_producto'] : null;
    $cantidadUsada = 1;
    $idTrabajador = $_SESSION['admin_id']; 

    $transaccion_necesaria = ($nuevo_estado == 'Listo para entregar' || $nuevo_estado == 'Entregado') && $idProductoUsado != null;

    
    if ($transaccion_necesaria) {
        $conn->query("SET @p_res = 0");
        $sql_transac = "CALL sp_RegistrarSalidaComponente($idProductoUsado, $cantidadUsada, $idTrabajador, @p_res)";
        
        if ($conn->query($sql_transac)) {
            $res_t = $conn->query("SELECT @p_res AS resultado")->fetch_assoc();
            if ($res_t['resultado'] == 0) {
                $updateSuccess = $conn->query("UPDATE tblregistro SET estadoEquipo='$nuevo_estado', diagnostico='$nuevo_diagnostico', costo='$nuevo_costo' WHERE idFolio='$idFolio'");
                $texto_aviso = "✅ [COMMIT] Stock descontado y reparación actualizada.";
            } else {
                $updateSuccess = false;
                $texto_aviso = "❌ [ROLLBACK] Stock insuficiente. La reparación no se modificó.";
            }
        }
    } else {
        $updateSuccess = $conn->query("UPDATE tblregistro SET estadoEquipo='$nuevo_estado', diagnostico='$nuevo_diagnostico', costo='$nuevo_costo' WHERE idFolio='$idFolio'");
        $texto_aviso = "✅ Datos actualizados correctamente.";
    }

    $_SESSION['mensaje_flash'] = $texto_aviso;
    echo "<script>window.location.href='admin_reparaciones.php';</script>";
    exit();
}

// --- 2. CONSULTAS ---
$registros_por_pagina = 10;
$pagina_actual = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($pagina_actual - 1) * $registros_por_pagina;
$busqueda = isset($_GET['q']) ? $conn->real_escape_string($_GET['q']) : '';
$where_sql = !empty($busqueda) ? "WHERE r.idFolio LIKE '%$busqueda%' OR d.marca LIKE '%$busqueda%'" : "";

$sql_lista = "SELECT r.idFolio, r.fechaIngreso, r.estadoEquipo, r.detalles, r.diagnostico, r.costo, 
                     d.marca, d.modelo, d.numSerie 
              FROM tblregistro r 
              JOIN tbldispositivos d ON r.idDispositivo = d.idDispositivo 
              $where_sql ORDER BY r.idFolio DESC LIMIT $offset, $registros_por_pagina";
$lista = $conn->query($sql_lista);

$productos_db = $conn->query("SELECT idProducto, nombre, stock FROM tblproductos WHERE stock >= 0");
?>

<div class="page-header">
    <h2>Gestión de Reparaciones</h2>
</div>

<?php if (isset($_SESSION['mensaje_flash'])): ?>
    <div style="background-color: #28a745; color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-weight: 500;">
        <?php echo $_SESSION['mensaje_flash']; ?>
    </div>
    <?php unset($_SESSION['mensaje_flash']); ?>
<?php endif; ?>

<div class="table-responsive">
    <table class="table-admin">
        <thead>
            <tr>
                <th width="80">Folio</th>
                <th width="200">Equipo</th>
                <th>Falla Reportada</th>
                <th width="350">Actualizar Estado / Inventario</th>
                <th width="100" style="text-align: center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php while($row = $lista->fetch_assoc()): ?>
            <tr>
                <td>
                    <span style="font-weight:900; font-size:16px; color:#333; background:#e9ecef; padding:4px 8px; border-radius:4px;">
                        #<?php echo $row['idFolio']; ?>
                    </span>
                </td>
                <td>
                    <strong><?php echo $row['marca'] . " " . $row['modelo']; ?></strong>
                </td>
                <td style="font-size:13px; color:#555;">
                    <?php echo $row['detalles']; ?>
                </td>
                
                <td class="celda-edicion">
                    <form method="POST">
                        <input type="hidden" name="id_folio" value="<?php echo $row['idFolio']; ?>">
                        <div class="form-grid-repair">
                            <div class="inputs-wrapper" style="display: flex; flex-direction: column; gap: 8px;">
                                <select name="nuevo_estado" class="input-moderno">
                                    <option value="<?php echo $row['estadoEquipo']; ?>" selected hidden><?php echo $row['estadoEquipo']; ?></option>
                                    <option value="En Diagnóstico">🔵 En Diagnóstico</option>
                                    <option value="En Reparación">🟠 En Reparación</option>
                                    <option value="Listo para entregar">🟢 Listo para entregar</option>
                                    <option value="Entregado">⚫ Entregado</option>
                                </select>

                                <select name="id_producto" class="input-moderno" style="border: 1px solid #007bff; background: #f8fbff;">
                                    <option value="">-- ¿Usó algún componente? --</option>
                                    <?php 
                                    $productos_db->data_seek(0);
                                    while($p = $productos_db->fetch_assoc()): ?>
                                        <option value="<?php echo $p['idProducto']; ?>">
                                            <?php echo $p['nombre']; ?> (Stock: <?php echo $p['stock']; ?>)
                                        </option>
                                    <?php endwhile; ?>
                                </select>
                                
                                <textarea name="nuevo_diagnostico" rows="1" class="input-moderno" placeholder="Diagnóstico..."><?php echo $row['diagnostico']; ?></textarea>
                                
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <span>$</span>
                                    <input type="number" name="nuevo_costo" value="<?php echo $row['costo']; ?>" class="input-moderno" style="width: 100%;">
                                </div>
                            </div>

                            <button type="submit" name="actualizar_estado" class="btn-save-icon" style="border:none; background:none; cursor:pointer; font-size: 24px;">
                                💾
                            </button>
                        </div>
                    </form>
                </td>
                
                <td style="text-align:center;">
                    <a href="ticket.php?folio=<?php echo $row['idFolio']; ?>" target="_blank" class="btn-ticket-outline">📄</a>
                </td>
            </tr>
            <?php endwhile; ?>
        </tbody>
    </table>
</div>

<?php include 'admin_footer.php'; ?>