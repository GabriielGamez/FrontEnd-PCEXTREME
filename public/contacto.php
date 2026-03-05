<?php
include 'conexion.php';

// CONSULTA INFO EMPRESA
$sql = "SELECT * FROM tbl_contacto LIMIT 1";
$resultado = $conn->query($sql);
$contacto = $resultado->fetch_assoc();

if (!$contacto) {
    $contacto = ['email' => 'correo@default.com', 'telefono' => '0000000000', 'whatsapp' => '0000000000', 'direccion' => '', 'mapa_url' => '#'];
}

// PROCESAR FORMULARIO (GUARDAR EN BD)
$mensaje_enviado = false;
$error_envio = "";

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['enviar_mensaje'])) {
    
    $correo = $conn->real_escape_string($_POST['correo_cliente']);
    $asunto = $conn->real_escape_string($_POST['asunto']);
    $mensaje = $conn->real_escape_string($_POST['mensaje']);

    $sql_insert = "INSERT INTO tbl_mensajes (correo, asunto, mensaje) VALUES ('$correo', '$asunto', '$mensaje')";

    if ($conn->query($sql_insert) === TRUE) {
        $mensaje_enviado = true;
    } else {
        $error_envio = "Error al enviar: " . $conn->error;
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Contáctanos — PC EXTREME</title>
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="icon" type="image/png" href="./aseets/logo.png">
    <link rel="stylesheet" href="styles.css?v=<?php echo filemtime('styles.css'); ?>" />
    <link rel="stylesheet" href="accesibilidad.css?v=3.6" />
</head>

<body>
    <?php include 'header.php'; ?>
    
    <main class="contacto-main">
        <section class="contacto-contenedor">
            
            <h2>Contáctanos</h2>

            <?php if ($mensaje_enviado): ?>
                <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                    ✅ <strong>¡Mensaje Recibido!</strong> Tu mensaje ha sido guardado en nuestro sistema. Te contactaremos pronto.
                </div>
            <?php endif; ?>

            <?php if ($error_envio): ?>
                <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                    ❌ <?php echo $error_envio; ?>
                </div>
            <?php endif; ?>

            <div class="contacto-grid">
                
                <ul class="contacto-lista">
                    <li class="contacto-item">
                        <div class="gmail-imagen"><img src="./aseets/email.png" alt="email"></div>
                        <strong>Email:</strong>
                        <a href="mailto:<?php echo $contacto['email']; ?>"><?php echo $contacto['email']; ?></a>
                    </li>

                    <li class="contacto-item">
                        <div class="teléfono-imgen"><img src="./aseets/iconotel.png" alt="telefono"></div>
                        <strong>Teléfono:</strong>
                        <a href="tel:<?php echo $contacto['telefono']; ?>"><?php echo $contacto['telefono']; ?></a>
                    </li>

                    <li class="contacto-item">
                        <div class="whatsapp-img"><img src="./aseets/iconowhats.webp" alt="whats"></div>
                        <strong>WhatsApp:</strong>
                        <a href="https://wa.me/<?php echo $contacto['whatsapp']; ?>" target="_blank" class="whatsapp-link">Enviar mensaje</a>
                    </li>
                </ul>

                <div class="form-contacto">
                    <h3 style="margin-top:0; color:#333; text-align:center; margin-bottom:20px;">Envíanos un mensaje</h3>
                    
                    <form method="POST">
                        <label>Tu Correo Electrónico:</label>
                        <input type="email" name="correo_cliente" placeholder="ejemplo@correo.com" required>

                        <label>Asunto:</label>
                        <input type="text" name="asunto" placeholder="Ej: Cotización de PC" required>

                        <label>Detalles del Mensaje:</label>
                        <textarea name="mensaje" rows="5" placeholder="Escribe aquí tus dudas..." required></textarea>

                        <button type="submit" name="enviar_mensaje" class="btn-enviar-mensaje">Enviar Mensaje</button>
                    </form>
                </div>

            </div>

        </section>
    </main>
    
    <?php include 'footer.php'; ?>
</body>
</html>