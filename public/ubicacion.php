<?php
include 'conexion.php';

// Obtenemos la dirección y el link de la BD
$sql = "SELECT direccion, mapa_url FROM tbl_contacto LIMIT 1";
$res = $conn->query($sql);
$datos = $res->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ubicación — PC EXTREME</title>
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>
<body>
    <?php include 'header.php'; ?>
    
    <main class="contacto-main"> <section class="contacto-contenedor">
            
            <h2>Nuestra Ubicación</h2>
            
            <div class="ubicacion-texto">
                <p>Visítanos en nuestras instalaciones para un diagnóstico profesional.</p>
                <strong style="color: #76c838; font-size: 20px;">
                    <?php echo $datos['direccion']; ?>
                </strong>
                <br>
                <a href="<?php echo $datos['mapa_url']; ?>" target="_blank" class="btn-como-llegar">
                    📍 Cómo llegar (Google Maps)
                </a>
            </div>

            <div class="mapa-contenedor">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d465.1467560861666!2d-98.40775952749752!3d21.145470707643465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d72743bde5a96d%3A0xba1c25b82bb327e0!2sPc%20Extreme!5e0!3m2!1ses-419!2smx!4v1764579123853!5m2!1ses-419!2smx"
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>

        </section>
    </main>
    
    <?php include 'footer.php'; ?>
</body>
</html>