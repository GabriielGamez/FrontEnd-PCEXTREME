<?php
// ticket.php
include 'conexion.php';
session_start();

// Verificar si recibimos el folio
if (!isset($_GET['folio'])) {
    die("Error: No se especificó un número de folio.");
}

$folio = $conn->real_escape_string($_GET['folio']);

// 1. OBTENER DATOS DE LA REPARACIÓN
$sql = "SELECT r.*, d.marca, d.modelo, d.numSerie 
        FROM tblregistro r 
        JOIN tbldispositivos d ON r.idDispositivo = d.idDispositivo 
        WHERE r.idFolio = '$folio'";
$resultado = $conn->query($sql);

if ($resultado->num_rows == 0) {
    die("Orden no encontrada.");
}

$orden = $resultado->fetch_assoc();

// 2. OBTENER DATOS DE LA EMPRESA (Contacto)
$empresa = $conn->query("SELECT * FROM tbl_contacto LIMIT 1")->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ticket de Servicio #<?php echo $folio; ?></title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace; /* Fuente tipo ticket */
            width: 80mm; /* Ancho estándar de impresora térmica o media carta */
            margin: 0 auto;
            padding: 20px;
            background: #fff;
            color: #000;
        }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .logo { max-width: 150px; filter: grayscale(100%); } /* Logo en B/N para ahorrar tinta */
        h2, h3 { margin: 5px 0; }
        .info-empresa { font-size: 12px; margin-bottom: 10px; }
        
        .datos-orden { width: 100%; margin-bottom: 15px; }
        .etiqueta { font-weight: bold; }
        
        .seccion { margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; }
        
        .terminos { font-size: 10px; text-align: justify; margin-top: 20px; }
        
        .firmas { margin-top: 40px; text-align: center; }
        .linea-firma { border-top: 1px solid #000; width: 80%; margin: 0 auto; margin-top: 30px; }
        
        /* Botón para imprimir (se oculta al imprimir) */
        .btn-print {
            display: block; width: 100%; padding: 10px; background: #000; color: #fff; 
            text-align: center; text-decoration: none; margin-bottom: 20px; cursor: pointer;
        }
        
        @media print {
            .btn-print { display: none; }
            body { width: 100%; margin: 0; padding: 0; }
        }
    </style>
</head>
<body>

    <a onclick="window.print()" class="btn-print">🖨️ IMPRIMIR TICKET</a>

    <div class="header">
        <img src="./aseets/logo.png" class="logo"> 
        <h3>PC EXTREME</h3>
        <div class="info-empresa">
            <?php echo $empresa['direccion']; ?><br>
            Tel: <?php echo $empresa['telefono']; ?><br>
            <?php echo $empresa['email']; ?>
        </div>
        <h2>ORDEN #<?php echo str_pad($folio, 5, "0", STR_PAD_LEFT); ?></h2>
        <small>Fecha: <?php echo date("d/m/Y", strtotime($orden['fechaIngreso'])); ?></small>
    </div>

    <div class="datos-orden">
        <div><span class="etiqueta">Equipo:</span> <?php echo $orden['marca'] . " " . $orden['modelo']; ?></div>
        <div><span class="etiqueta">No. Serie:</span> <?php echo $orden['numSerie']; ?></div>
        <div><span class="etiqueta">Estado Inicial:</span> <?php echo $orden['estadoEquipo']; ?></div>
    </div>

    <div class="seccion">
        <span class="etiqueta">PROBLEMA REPORTADO:</span><br>
        <?php echo $orden['detalles']; ?>
    </div>

    <?php if($orden['costo'] > 0): ?>
    <div class="seccion">
        <span class="etiqueta">COSTO ESTIMADO:</span><br>
        $<?php echo number_format($orden['costo'], 2); ?>
    </div>
    <?php endif; ?>

    <div class="terminos">
        <strong>TÉRMINOS Y CONDICIONES:</strong><br>
        1. El diagnóstico tiene un costo si no se acepta la reparación.<br>
        2. PC EXTREME no se hace responsable por pérdida de información (haga respaldo).<br>
        3. Después de 30 días de notificado, si el equipo no es retirado, pasará a reciclaje sin responsabilidad para la empresa.<br>
        4. La garantía aplica solo sobre la reparación realizada.
    </div>

    <div class="firmas">
        <div class="linea-firma">Firma del Cliente (Acepto términos)</div>
        <br>
        <small>Consulta el estado de tu equipo en:<br>www.pcextreme.com/consultaequipo.php</small>
    </div>

    <script>
        // Opcional: Imprimir automáticamente al abrir
        // window.print();
    </script>
</body>
</html>