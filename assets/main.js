/**
 * main.js
 * Lógica principal del Frontend - PC EXTREME
 */

// CONFIGURACIÓN GLOBAL
const API_BASE_URL = 'https://app-web-java.vercel.app/api';

// 1. CARGA DE COMPONENTES ESTÁTICOS
async function cargarComponentes() {
    try {
        // Rutas absolutas 
        const resHeader = await fetch('/FrontEnd-PCEXTREME/components/header.html');
        if (!resHeader.ok) throw new Error('Error al cargar header');
        document.getElementById('encabezado-principal').innerHTML = await resHeader.text();

        inicializarMenuCuenta();

        const resFooter = await fetch('/FrontEnd-PCEXTREME/components/footer.html');
        if (!resFooter.ok) throw new Error('Error al cargar footer');
        document.getElementById('pie-de-pagina').innerHTML = await resFooter.text();

    } catch (error) {
        console.error("Error en componentes estáticos:", error);
    }
}

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

/* Función asíncrona para traer los datos de la sección "Inicio" (Portada)*/
async function cargarPortada() {
    const contenedor = document.getElementById('portada-contenido');
    const video = document.getElementById('video-portada');
    
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/inicio`);
        const datos = await respuesta.json();

        // Se inyecta la información en el contenedor
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

        // Si la API trae la ruta del video, la inyectamos en el DOM
        if (datos.enlace_video && video) {
            video.innerHTML = `<source src="/FrontEnd-PCEXTREME/${datos.enlace_video}" type="video/mp4">`;
            video.load(); // Fuerza al navegador a cargar el nuevo archivo inyectado
        }

    } catch (error) {
        console.error("Error al cargar la portada desde la API:", error);
        contenedor.innerHTML = `<p class="text-red-500">Error al conectar con el servidor.</p>`;
    }
}

/* Función asíncrona para traer y listar los "Servicios" */
async function cargarServicios() {
    const contenedor = document.getElementById('lista-servicios');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/servicios`);
        const servicios = await respuesta.json(); // Se espera un Array de objetos

        contenedor.innerHTML = ''; // Limpiamos el contenedor

        if (servicios.length === 0) {
            contenedor.innerHTML = `<p class="text-gray-400">No hay servicios disponibles por el momento.</p>`;
            return;
        }

        // diseño de cada tarjeta
        servicios.forEach(servicio => {
            const tarjeta = `
                <div class="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-[#7ed957] transition duration-300 flex flex-col items-center text-center shadow-lg">
                    <div class="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4 text-3xl">
                        ${servicio.icono || '🔧'}
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-white">${servicio.nombre}</h3>
                    <p class="text-gray-400 text-sm mb-4">${servicio.descripcion}</p>
                    <span class="text-[#7ed957] font-bold mt-auto">Desde $${servicio.precio_base}</span>
                </div>
            `;
            contenedor.innerHTML += tarjeta;
        });

    } catch (error) {
        console.error("Error al cargar servicios desde la API:", error);
        contenedor.innerHTML = `<p class="text-red-500 col-span-3 text-center">No se pudieron cargar los servicios.</p>`;
    }
}

// INICIALIZACIÓN GLOBAL
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar la estructura (Nav y Footer)
    cargarComponentes();
    
    // 2. Consumir las APIs para llenar el contenido
    cargarPortada();
    cargarServicios();
});