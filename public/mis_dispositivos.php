<?php
include 'conexion.php';

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit();
}

$id_cliente = $_SESSION['usuario_id'];

// CONSULTA: Traemos todos los dispositivos
$sql = "SELECT d.idDispositivo, d.marca, d.modelo, d.numSerie, 
               r.idFolio, r.estadoEquipo
        FROM tbldispositivos d
        LEFT JOIN tblregistro r ON d.idDispositivo = r.idDispositivo 
             AND r.idFolio = (
                 SELECT MAX(idFolio) 
                 FROM tblregistro r2 
                 WHERE r2.idDispositivo = d.idDispositivo
             )
        WHERE d.idCliente = $id_cliente
        ORDER BY d.idDispositivo DESC";

$resultado = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mis Dispositivos — PC EXTREME</title>
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body>
    <?php include 'header.php'; ?>
    
    <main class="perfil-main" style="align-items: flex-start;">
        <section class="perfil-contenedor" style="display: block; max-width: 1200px;">
            
            <div style="text-align: center; margin-bottom: 50px;">
                <h2 style="color: white; margin-bottom: 10px; font-size: 36px;">Mis Equipos</h2>
                <p style="color: #aaa; font-size: 18px;">Selecciona un equipo para ver su historial.</p>
            </div>

            <?php if ($resultado && $resultado->num_rows > 0): ?>
                
                <div class="grid-simple">
                    <?php while ($equipo = $resultado->fetch_assoc()): 
                        $estado = $equipo['estadoEquipo'];
                        
                        // Si tiene estado y NO es "Entregado", es ACTIVO (Verde)
                        $es_activo = false;
                        if (!empty($estado) && stripos($estado, 'Entregado') === false) {
                            $es_activo = true;
                        }

                        $clase_borde = $es_activo ? 'borde-activo-verde' : 'borde-inactivo-gris';
                        $texto_estado = $es_activo ? 'En Taller' : 'Historial';
                    ?>
                    
                    <div class="card-simple <?php echo $clase_borde; ?>" onclick="window.location.href='historial_dispositivo.php?id=<?php echo $equipo['idDispositivo']; ?>'">
                        
                        <span class="estado-texto"><?php echo $texto_estado; ?></span>
                        
                        <h3><?php echo htmlspecialchars($equipo['marca']); ?></h3>
                        <div class="modelo-equipo">
                            <?php echo htmlspecialchars($equipo['modelo']); ?>
                        </div>
                        <div class="serie-equipo">
                            SN: <?php echo htmlspecialchars($equipo['numSerie']); ?>
                        </div>
                        
                    </div>

                    <?php endwhile; ?>
                </div>

            <?php else: ?>
                
                <div class="sin-equipos">
                    <h3>Aún no tienes equipos registrados.</h3>
                    <p>Cuando lleves tu equipo a nuestro taller, aparecerá aquí automáticamente.</p>
                </div>

            <?php endif; ?>

        </section>
    </main>
    
    <?php include 'footer.php'; ?>
</body>
</html>