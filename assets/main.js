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
        const respuestaHeader = await fetch('/components/header.html');
        if (!respuestaHeader.ok) throw new Error('No se pudo cargar el header');
        const htmlHeader = await respuestaHeader.text();
        document.getElementById('encabezado-principal').innerHTML = htmlHeader;

        inicializarMenuCuenta();
        // 1.2 Cargar e inyectar el Footer
        const respuestaFooter = await fetch('/components/footer.html');
        if (!respuestaFooter.ok) throw new Error('No se pudo cargar el footer');
        const htmlFooter = await respuestaFooter.text();
        document.getElementById('pie-de-pagina').innerHTML = htmlFooter;

        console.log("Componentes cargados correctamente.");

    } catch (error) {
        console.error("Error en la carga de componentes:", error);
    }
}

function inicializarMenuCuenta() {
    const authButton = document.getElementById('authButton');
    const authMenu = document.getElementById('authMenu');

    if (authButton && authMenu) {
        // Mostrar/ocultar al hacer clic en el botón
        authButton.addEventListener('click', (e) => {
            e.preventDefault(); 
            authMenu.classList.toggle('hidden');
        });

        // Cerrar el menú si se hace clic en cualquier otra parte de la pantalla
        window.addEventListener('click', (e) => {
            if (!authButton.contains(e.target) && !authMenu.contains(e.target)) {
                authMenu.classList.add('hidden');
            }
        });
    }
}

function inicializarEventosLogin() {
    const btnIrRegistro = document.getElementById('ir-a-registro');
    const btnIrLogin = document.getElementById('ir-a-login');
    const bloqueLogin = document.getElementById('bloque-login');
    const bloqueRegistro = document.getElementById('bloque-registro');

    // Comprobación de seguridad: ¿Estamos en la página de login?
    if (btnIrRegistro && btnIrLogin && bloqueLogin && bloqueRegistro) {
        
        // 1. Leer el parámetro de la URL (Ej: ?tab=registro)
        const urlParams = new URLSearchParams(window.location.search);
        const tabActiva = urlParams.get('tab');

        // 2. Si la URL pide registro, ocultamos login y mostramos registro al instante
        if (tabActiva === 'registro') {
            bloqueLogin.classList.remove('block');
            bloqueLogin.classList.add('hidden');
            
            bloqueRegistro.classList.remove('hidden');
            bloqueRegistro.classList.add('block');
        }

        // 3. Evento: Clic en "Regístrate como Cliente"
        btnIrRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            bloqueLogin.classList.remove('block');
            bloqueLogin.classList.add('hidden');
            
            bloqueRegistro.classList.remove('hidden');
            bloqueRegistro.classList.add('block');
            
            // Actualizar la URL en el navegador sin recargar la página
            window.history.pushState({}, '', '?tab=registro');
        });

        // 4. Evento: Clic en "Inicia Sesión aquí"
        btnIrLogin.addEventListener('click', (e) => {
            e.preventDefault();
            bloqueRegistro.classList.remove('block');
            bloqueRegistro.classList.add('hidden');
            
            bloqueLogin.classList.remove('hidden');
            bloqueLogin.classList.add('block');
            
            // Limpiar la URL en el navegador (quitar el ?tab=registro)
            window.history.pushState({}, '', window.location.pathname);
        });
    }
}
// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    cargarComponentes();
    inicializarEventosLogin();
    
});