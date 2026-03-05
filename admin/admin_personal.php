<?php
include 'conexion.php';
include 'admin_header.php';

// SEGURIDAD: Solo Admin (Rol 1)
if ($_SESSION['rol_id'] != 1) {
    echo "<script>window.location.href='dashboard.php';</script>";
    exit();
}

$mensaje = "";
$usuario_a_editar = null;
$abrir_modal = false; 

// --- 1. GUARDAR USUARIO ---
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['guardar_usuario'])) {
    
    $id = $_POST['id_trabajador'];
    $nombre = $conn->real_escape_string($_POST['nombre']);
    $paterno = $conn->real_escape_string($_POST['aPaterno']);
    $materno = $conn->real_escape_string($_POST['aMaterno']);
    $email = $conn->real_escape_string($_POST['email']);
    $telefono = $conn->real_escape_string($_POST['telefono']);
    $direccion = $conn->real_escape_string($_POST['direccion']);
    $rol = $_POST['idRol'];
    $password_nueva = $_POST['password'];

    // Validar duplicados (Solo nuevo)
    if (empty($id)) {
        $check = $conn->query("SELECT idTrabajador FROM tbltrabajadores WHERE email = '$email'");
        if ($check->num_rows > 0) {
            $mensaje = "<div style='background:#f8d7da; color:#721c24; padding:10px; border-radius:5px;'>Error: El correo ya existe.</div>";
            $abrir_modal = true;
        }
    }

    if (empty($mensaje) || strpos($mensaje, 'Error') === false) {
        if (!empty($id)) {
            // UPDATE
            $sql = "UPDATE tbltrabajadores SET 
                    nombre='$nombre', aPaterno='$paterno', aMaterno='$materno', 
                    email='$email', telefono='$telefono', direccion='$direccion', idRol='$rol' 
                    WHERE idTrabajador='$id'";
            
            if ($conn->query($sql)) {
                $mensaje = "<div style='background:#d4edda; color:#155724; padding:10px; border-radius:5px;'>Usuario actualizado.</div>";
                if (!empty($password_nueva)) {
                    $hash = password_hash($password_nueva, PASSWORD_DEFAULT);
                    $conn->query("UPDATE tbltrabajadores SET password='$hash' WHERE idTrabajador='$id'");
                }
            } else {
                $mensaje = "Error SQL: " . $conn->error;
                $abrir_modal = true;
            }

        } else {
            // INSERT
            if (empty($password_nueva)) {
                $mensaje = "<div style='background:#f8d7da; color:#721c24; padding:10px; border-radius:5px;'>La contraseña es obligatoria.</div>";
                $abrir_modal = true;
            } else {
                $hash = password_hash($password_nueva, PASSWORD_DEFAULT);
                $sql = "INSERT INTO tbltrabajadores (nombre, aPaterno, aMaterno, email, telefono, direccion, idRol, password) 
                        VALUES ('$nombre', '$paterno', '$materno', '$email', '$telefono', '$direccion', '$rol', '$hash')";
                
                if ($conn->query($sql)) {
                    $mensaje = "<div style='background:#d4edda; color:#155724; padding:10px; border-radius:5px;'>Usuario creado.</div>";
                } else {
                    $mensaje = "Error SQL: " . $conn->error;
                    $abrir_modal = true;
                }
            }
        }
    }
}

// --- 2. PREPARAR EDICIÓN ---
if (isset($_GET['editar'])) {
    $id_edit = $_GET['editar'];
    $res = $conn->query("SELECT * FROM tbltrabajadores WHERE idTrabajador = $id_edit");
    $usuario_a_editar = $res->fetch_assoc();
    $abrir_modal = true;
}

// --- 3. ELIMINAR ---
if (isset($_GET['borrar'])) {
    $id_borrar = $_GET['borrar'];
    if ($id_borrar == $_SESSION['admin_id']) {
        echo "<script>alert('No puedes eliminar tu propia cuenta.'); window.location.href='admin_personal.php';</script>";
    } else {
        $conn->query("DELETE FROM tbltrabajadores WHERE idTrabajador = $id_borrar");
        echo "<script>window.location.href='admin_personal.php';</script>";
    }
}

// --- 4. LISTA ---
$lista = $conn->query("SELECT t.*, r.nombreRol FROM tbltrabajadores t JOIN tblroles r ON t.idRol = r.idRol ORDER BY t.idRol ASC");
?>

<div class="page-header">
    <h2>Gestión de Personal</h2>
    <button onclick="abrirModal()" class="btn-primary">+ Nuevo Empleado</button>
</div>

<?php echo $mensaje; ?>

<div id="modalPersonal" class="modal-overlay">
    <div class="modal-content">
        <span class="close-modal" onclick="cerrarModal()">&times;</span>
        <h3 style="margin-top:0; color:#3842c8; border-bottom:1px solid #eee; padding-bottom:10px;">
            <?php echo $usuario_a_editar ? 'Editar Empleado' : 'Registrar Nuevo Empleado'; ?>
        </h3>

        <form method="POST" style="margin-top:20px;">
            <input type="hidden" name="id_trabajador" value="<?php echo $usuario_a_editar ? $usuario_a_editar['idTrabajador'] : ''; ?>">

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <label style="font-weight:bold; font-size:13px;">Nombre(s)</label>
                    <input type="text" name="nombre" value="<?php echo $usuario_a_editar ? $usuario_a_editar['nombre'] : ''; ?>" required>
                </div>
                <div>
                    <label style="font-weight:bold; font-size:13px;">Apellido Paterno</label>
                    <input type="text" name="aPaterno" value="<?php echo $usuario_a_editar ? $usuario_a_editar['aPaterno'] : ''; ?>" required>
                </div>
                <div>
                    <label style="font-weight:bold; font-size:13px;">Apellido Materno</label>
                    <input type="text" name="aMaterno" value="<?php echo $usuario_a_editar ? $usuario_a_editar['aMaterno'] : ''; ?>">
                </div>
                <div>
                    <label style="font-weight:bold; font-size:13px;">Rol de Acceso</label>
                    <select name="idRol" required style="background-color:#f0f8ff; border-color:#3842c8;">
                        <option value="" disabled selected>Selecciona...</option>
                        <option value="1" <?php echo ($usuario_a_editar && $usuario_a_editar['idRol'] == 1) ? 'selected' : ''; ?>>Administrador</option>
                        <option value="2" <?php echo ($usuario_a_editar && $usuario_a_editar['idRol'] == 2) ? 'selected' : ''; ?>>Recepcionista</option>
                        <option value="3" <?php echo ($usuario_a_editar && $usuario_a_editar['idRol'] == 3) ? 'selected' : ''; ?>>Técnico</option>
                    </select>
                </div>
                <div style="grid-column: span 2;">
                    <label style="font-weight:bold; font-size:13px;">Correo (Usuario)</label>
                    <input type="email" name="email" value="<?php echo $usuario_a_editar ? $usuario_a_editar['email'] : ''; ?>" required>
                </div>
                <div style="grid-column: span 2;">
                    <label style="font-weight:bold; font-size:13px;">Teléfono</label>
                    <input type="text" name="telefono" value="<?php echo $usuario_a_editar ? $usuario_a_editar['telefono'] : ''; ?>" required>
                </div>
                <div style="grid-column: span 2;">
                    <label style="font-weight:bold; font-size:13px;">Dirección</label>
                    <input type="text" name="direccion" value="<?php echo $usuario_a_editar ? $usuario_a_editar['direccion'] : ''; ?>">
                </div>
                <div style="grid-column: span 2; background: #fff3cd; padding: 15px; border-radius: 6px; border: 1px solid #ffeeba;">
                    <label style="font-weight:bold; font-size:13px; display:block; margin-bottom:5px;">Contraseña</label>
                    <input type="password" name="password" placeholder="<?php echo $usuario_a_editar ? 'Dejar vacío para NO cambiar' : 'Obligatoria para nuevo usuario'; ?>" style="margin-bottom:0;">
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" onclick="cerrarModal()" class="btn-modal btn-cancelar-modal">Cancelar</button>
                <button type="submit" name="guardar_usuario" class="btn-modal btn-guardar-modal">Guardar Datos</button>
            </div>
        </form>
    </div>
</div>

<div class="table-responsive-cards">
    <table class="table-admin table-personal">
        <thead>
            <tr>
                <th>Nombre / ID</th>
                <th>Rol</th>
                <th>Contacto</th>
                <th style="text-align:right;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php while($row = $lista->fetch_assoc()): 
                $bg_badge = "#6c757d";
                if($row['idRol'] == 1) $bg_badge = "#28a745"; // Verde
                if($row['idRol'] == 2) $bg_badge = "#e040fb"; // Morado
                if($row['idRol'] == 3) $bg_badge = "#3842c8"; // Azul
            ?>
            <tr style="<?php echo ($usuario_a_editar && $usuario_a_editar['idTrabajador'] == $row['idTrabajador']) ? 'background-color: #e8f5e9;' : ''; ?>">
                
                <td data-label="Nombre">
                    <strong><?php echo $row['nombre'] . " " . $row['aPaterno']; ?></strong>
                    <div style="font-size:11px; color:#888; margin-top:3px;">ID: <?php echo $row['idTrabajador']; ?></div>
                </td>
                
                <td data-label="Rol">
                    <span class="badge-rol" style="background-color: <?php echo $bg_badge; ?>;">
                        <?php echo $row['nombreRol']; ?>
                    </span>
                </td>
                
                <td data-label="Contacto">
                    <div style="font-size:13px; margin-bottom:4px;">✉️ <?php echo $row['email']; ?></div>
                    <div style="font-size:13px;">📞 <?php echo $row['telefono']; ?></div>
                </td>
                
                <td data-label="Acciones" style="text-align:right; white-space: nowrap;">
                    <a href="admin_personal.php?editar=<?php echo $row['idTrabajador']; ?>" class="btn-table btn-edit">Editar</a>
                    
                    <?php if($row['idTrabajador'] != $_SESSION['admin_id']): ?>
                        <a href="admin_personal.php?borrar=<?php echo $row['idTrabajador']; ?>" onclick="return confirm('¿Eliminar acceso a este empleado?')" class="btn-table btn-delete">Eliminar</a>
                    <?php endif; ?>
                </td>

            </tr>
            <?php endwhile; ?>
        </tbody>
    </table>
</div>

<script>
    var modal = document.getElementById("modalPersonal");
    function abrirModal() { modal.style.display = "block"; }
    function cerrarModal() { 
        modal.style.display = "none"; 
        if (window.location.search.includes('editar')) { window.location.href = 'admin_personal.php'; }
    }
    window.onclick = function(event) { if (event.target == modal) cerrarModal(); }
    <?php if ($abrir_modal): ?> abrirModal(); <?php endif; ?>
</script>

<?php include 'admin_footer.php'; ?>