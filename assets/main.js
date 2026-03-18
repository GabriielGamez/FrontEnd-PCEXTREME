/**
 * main.js
 * Lógica principal del Frontend - PC EXTREME
 */

// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================
const API_BASE_URL = 'https://app-web-java.vercel.app/api';
const CLOUD_NAME = 'dswljrmnu';

// Rutas base de Cloudinary
const CLOUD_BASE_IMG = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
const CLOUD_BASE_VID = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/`;

// Rutas específicas por directorio
const RUTA_MARCAS = `${CLOUD_BASE_IMG}logos-grises/`;
const RUTA_PRODUCTOS = `${CLOUD_BASE_IMG}productos/`;

// ==========================================
// CARGA DE COMPONENTES ESTÁTICOS
// ==========================================
async function cargarComponentes() {
    try {
        const resHeader = await fetch('/FrontEnd-PCEXTREME/components/header.html');
        if (!resHeader.ok) throw new Error('Error al cargar header');
        document.getElementById('encabezado-principal').innerHTML = await resHeader.text();

        inicializarMenuCuenta();

        const resFooter = await fetch('/FrontEnd-PCEXTREME/components/footer.html');
        if (!resFooter.ok) throw new Error('Error al cargar footer');
        document.getElementById('pie-de-pagina').innerHTML = await resFooter.text();

    } catch (error) {
        console.error("Error en carga de componentes estáticos:", error);
    }
}

// ==========================================
// EVENTOS DE INTERFAZ
// ==========================================
function inicializarMenuCuenta() {
    const authButton = document.getElementById('authButton');
    const authMenu = document.getElementById('authMenu');

    if (authButton && authMenu) {
        authButton.addEventListener('click', (e) => {
            e.preventDefault();
            authMenu.classList.toggle('hidden');
        });

        window.addEventListener('click', (e) => {
            if (!authButton.contains(e.target) && !authMenu.contains(e.target)) {
                authMenu.classList.add('hidden');
            }
        });
    }
}

// 2. CONSUMO DE APIS (LÓGICA DINÁMICA)
function inicializarEventosLogin() {
    const btnIrRegistro = document.getElementById('ir-a-registro');
    const btnIrLogin = document.getElementById('ir-a-login');
    const bloqueLogin = document.getElementById('bloque-login');
    const bloqueRegistro = document.getElementById('bloque-registro');
    try {
        if (btnIrRegistro && btnIrLogin && bloqueLogin && bloqueRegistro) {
            const urlParams = new URLSearchParams(window.location.search);
            const tabActiva = urlParams.get('tab');

            if (tabActiva === 'registro') {
                bloqueLogin.classList.remove('block');
                bloqueLogin.classList.add('hidden');
                bloqueRegistro.classList.remove('hidden');
                bloqueRegistro.classList.add('block');
            }

            btnIrRegistro.addEventListener('click', (e) => {
                e.preventDefault();
                bloqueLogin.classList.remove('block');
                bloqueLogin.classList.add('hidden');
                bloqueRegistro.classList.remove('hidden');
                bloqueRegistro.classList.add('block');
                window.history.pushState({}, '', '?tab=registro');
            });

            btnIrLogin.addEventListener('click', (e) => {
                e.preventDefault();
                bloqueRegistro.classList.remove('block');
                bloqueRegistro.classList.add('hidden');
                bloqueLogin.classList.remove('hidden');
                bloqueLogin.classList.add('block');
                window.history.pushState({}, '', window.location.pathname);
            });

        }

    } catch (error) {
        console.error("Error al cargar servicios desde la API:", error);
        contenedor.innerHTML = `<p class="text-red-500 col-span-3 text-center">No se pudieron cargar los servicios.</p>`;
    }

}
// ==========================================
// CONSUMO DE APIS (LÓGICA DINÁMICA)
// ==========================================
async function cargarPortada() {
    const contenedor = document.getElementById('portada-contenido');
    const video = document.getElementById('video-empresa');

    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/inicio`);
        const arrayDatos = await respuesta.json();

        const datos = arrayDatos[0];

        contenedor.innerHTML = `
            <h2 class="text-5xl md:text-6xl font-extrabold leading-tight">
                ${datos.titulo || '¿Tu PC necesita<br>mantenimiento?'}
            </h2>
            <p class="text-gray-300 text-lg max-w-lg">
                ${datos.descripcion || '¡Recupérala al máximo rendimiento!'}
            </p>
            <button class="bg-[#7ed957] hover:bg-[#6bc148] text-black font-bold py-3 px-8 rounded-full transition duration-300 shadow-[0_0_15px_rgba(126,217,87,0.3)]">
                Contáctanos
            </button>
        `;

        if (datos.video_url && video) {
            video.innerHTML = `<source src="${CLOUD_BASE_VID}${datos.video_url}.mp4" type="video/mp4">`;
            video.load();
        }
    } catch (error) {
        console.error("Error al cargar la portada desde la API:", error);
        contenedor.innerHTML = `<p class="text-red-500">Error al conectar con el servidor.</p>`;
    }
}

async function cargarServicios() {
    const contenedor = document.getElementById('lista-servicios');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/servicios`);
        let servicios = await respuesta.json();

        if (!Array.isArray(servicios)) {
            servicios = [servicios];
        }

        contenedor.innerHTML = '';

        if (servicios.length === 0) {
            contenedor.innerHTML = `<p class="text-gray-400">No hay servicios disponibles por el momento.</p>`;
            return;
        }

        servicios.forEach(servicio => {
            const tarjeta = `
                <div class="bg-[#1f1f1f] rounded-xl overflow-hidden shadow-lg flex flex-col group border border-transparent hover:border-[#7ed957] transition-all duration-300">
                    
                    <div class="h-52 w-full overflow-hidden">
                        <img src="${RUTA_ASSETS}${servicio.imagen}" alt="${servicio.titulo}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                    </div>
                    
                    <div class="p-6 flex flex-col flex-grow text-left">
                        <h3 class="text-[#7ed957] text-lg font-bold mb-3 uppercase tracking-wide">
                            ${servicio.titulo}
                        </h3>
                        <p class="text-gray-300 text-sm leading-relaxed">
                            ${servicio.descripcion}
                        </p>
                    </div>

                </div>
            `;
            contenedor.innerHTML += tarjeta;
        });

    } catch (error) {
        console.error("Error al cargar servicios desde la API:", error);
        contenedor.innerHTML = `<p class="text-red-500 col-span-3 text-center">No se pudieron cargar los servicios.</p>`;
    }
}

/*/ ==========================================
// SECCIÓN: MARCAS (CARRUSEL INFINITO)
// ==========================================
async function cargarMarcas() {
    const contenedor = document.getElementById('carrusel-marcas');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/marcas`);
        
        if (!respuesta.ok) {
            console.warn("La ruta /api/marcas aún no está disponible en el backend.");
            return; 
        }
        const marcas = await respuesta.json();
        const marcasDuplicadas = [...marcas, ...marcas];

        contenedor.innerHTML = ''; 
        contenedor.className = "animacion-carrusel items-center gap-16 py-4";

        marcasDuplicadas.forEach(marca => {
            contenedor.innerHTML += `
                <img src="${RUTA_MARCAS}${marca.logo}" alt="${marca.nombre}" 
                     class="h-8 md:h-12 w-auto object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
            `;
        });

    } catch (error) {
        console.error("Error al cargar el carrusel de marcas:", error);
    }
}
*/

// ==========================================
// 9. MÓDULO: ANÁLISIS DE CRECIMIENTO (ED)
// ==========================================
// Variables globales del problema matemático
const P0 = 12;          // Clientes iniciales (Enero 2024, t=0)
const t_actual = 2.2;   // Años transcurridos hasta hoy (Marzo 2026)
const P_actual = 975;   // Clientes actuales
const k = Math.log(P_actual / P0) / t_actual; // Tasa de crecimiento continuo
let miGraficoCrecimiento;

// Función principal que se activa con el botón
window.calcularCrecimiento = function () {
    const inputTiempo = document.getElementById('input-tiempo');
    if (!inputTiempo) return; // Si no estamos en la página, ignoramos

    const t_futuro = parseFloat(inputTiempo.value);

    if (isNaN(t_futuro) || t_futuro < 0) {
        alert("Por favor ingresa un tiempo válido mayor o igual a 0.");
        return;
    }

    // Mostramos la tasa k en pantalla
    document.getElementById('resultado-k').innerText = k.toFixed(4);

    // Calculamos la proyección: P(t) = P0 * e^(k * t)
    const clientesProyectados = P0 * Math.exp(k * t_futuro);

    document.getElementById('resultado-p').innerText = Math.round(clientesProyectados).toLocaleString();

    // Llamamos a la gráfica
    dibujarGraficaCrecimiento(t_futuro);
};

// Función para renderizar Chart.js
function dibujarGraficaCrecimiento(t_max) {
    const canvas = document.getElementById('graficaCrecimiento');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Destruimos el gráfico anterior si el usuario vuelve a calcular
    if (miGraficoCrecimiento) {
        miGraficoCrecimiento.destroy();
    }

    let etiquetasTiempo = [];
    let datosClientes = [];

    const pasos = 20;
    for (let i = 0; i <= pasos; i++) {
        let t_punto = (t_max / pasos) * i;
        let clientes_punto = P0 * Math.exp(k * t_punto);

        etiquetasTiempo.push("Año " + t_punto.toFixed(1));
        datosClientes.push(Math.round(clientes_punto));
    }

    miGraficoCrecimiento = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetasTiempo,
            datasets: [{
                label: 'Número de Clientes Registrados',
                data: datosClientes,
                borderColor: '#7ed957',
                backgroundColor: 'rgba(126, 217, 87, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#3f51b5',
                pointBorderColor: '#fff',
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#a1a1aa' } }
            },
            scales: {
                x: { ticks: { color: '#a1a1aa' }, grid: { color: '#27272a' } },
                y: { ticks: { color: '#a1a1aa' }, grid: { color: '#27272a' } }
            }
        }
    });
}

// Función de arranque (solo se activa si el canvas existe en el HTML actual)
function iniciarModuloCrecimiento() {
    const canvas = document.getElementById('graficaCrecimiento');
    if (canvas) {
        window.calcularCrecimiento(); // Hace el primer cálculo por defecto al entrar a la página
    }
}
// ==========================================
// INICIALIZACIÓN GLOBAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar la estructura (Nav y Footer)
    cargarComponentes();
    cargarPortada();
    cargarServicios();
    iniciarModuloCrecimiento();
    inicializarEventosLogin();
});
