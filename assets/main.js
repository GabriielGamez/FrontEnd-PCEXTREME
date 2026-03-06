/**
 * main.js
 * Archivo principal para la lógica del frontend de PC EXTREME.
 * Inyección de componentes y las futuras llamadas a la API.
 */

// ==========================================
// 1. CARGA DE COMPONENTES ESTÁTICOS
// ==========================================

/**
 * Función asíncrona para cargar el Header y el Footer en la página.
 */
async function cargarComponentes() {
    try {
        // 1.1 Cargar e inyectar el Header
        const respuestaHeader = await fetch('./components/header.html');
        if (!respuestaHeader.ok) throw new Error('No se pudo cargar el header');
        const htmlHeader = await respuestaHeader.text();
        document.getElementById('encabezado-principal').innerHTML = htmlHeader;

        // 1.2 Cargar e inyectar el Footer
        const respuestaFooter = await fetch('./components/footer.html');
        if (!respuestaFooter.ok) throw new Error('No se pudo cargar el footer');
        const htmlFooter = await respuestaFooter.text();
        document.getElementById('pie-de-pagina').innerHTML = htmlFooter;

        console.log("Componentes cargados correctamente.");

    } catch (error) {
        console.error("Error en la carga de componentes:", error);
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    cargarComponentes();
    
    
});