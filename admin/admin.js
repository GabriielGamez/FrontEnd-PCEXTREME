/**
 * admin.js
 * Archivo principal para la lógica del panel de administración de PC EXTREME.
 * Separado de main.js por seguridad y limpieza de arquitectura.
 */

// ==========================================
// 1. CARGA DE COMPONENTES DEL ADMINISTRADOR
// ==========================================

async function cargarComponentesAdmin() {
    try {
        // 1.1 Cargar e inyectar el Header del Admin
        const respuestaHeader = await fetch('./components/admin_header.html');
        if (!respuestaHeader.ok) throw new Error('No se pudo cargar el header del admin');
        const htmlHeader = await respuestaHeader.text();
        document.getElementById('encabezado-admin').innerHTML = htmlHeader;

        // 1.2 Cargar e inyectar el Footer del Admin
        const respuestaFooter = await fetch('./components/admin_footer.html');
        if (!respuestaFooter.ok) throw new Error('No se pudo cargar el footer del admin');
        const htmlFooter = await respuestaFooter.text();
        document.getElementById('pie-admin').innerHTML = htmlFooter;

        console.log("Componentes de Administración cargados correctamente.");

    } catch (error) {
        console.error("Error en la carga de componentes del admin:", error);
    }
}

// ==========================================
// INICIALIZACIÓN DEL PANEL DE CONTROL
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    cargarComponentesAdmin();
    
    // Aquí más adelante pondremos las funciones para llenar la tabla de reparaciones
});