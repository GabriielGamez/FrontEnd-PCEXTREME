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
            video.innerHTML = `<source src="/FrontEnd-PCEXTREME/${datos.video_url}" type="video/mp4">`;
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
                        ${servicio.imagen || '🔧'}
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-white">${servicio.titulo}</h3>
                    <p class="text-gray-400 text-sm mb-4">${servicio.descripcion}</p>
                </div>
            `;
            contenedor.innerHTML += tarjeta;
        });

    } catch (error) {
        console.error("Error al cargar servicios desde la API:", error);
        contenedor.innerHTML = `<p class="text-red-500 col-span-3 text-center">No se pudieron cargar los servicios.</p>`;
    }
}

async function consultarEquipo(evento) {
    evento.preventDefault(); // Evitamos que el formulario recargue la página

    const inputFolio = document.getElementById('input-folio');
    const mensajeError = document.getElementById('mensaje-error');
    const resultadoConsulta = document.getElementById('resultado-consulta');

    if (!inputFolio || !mensajeError || !resultadoConsulta) return;

    const folio = inputFolio.value.trim();

    // 1. Resetear estados visuales (ocultar errores y resultados previos)
    mensajeError.classList.add('hidden');
    resultadoConsulta.classList.add('opacity-0');
    setTimeout(() => resultadoConsulta.classList.add('hidden'), 500); // Respetar la transición de Tailwind

    if (!folio) {
        mostrarErrorConsulta("Por favor ingresa un número de folio.");
        return;
    }

    try {
        // 2. Consumo de la API (Asumiendo un endpoint tipo /consulta/{folio})
        const respuesta = await fetch(`${API_BASE_URL}/registros/${folio}`);

        if (!respuesta.ok) {
            // Manejo del caso donde el folio no existe (equivalente al num_rows == 0 en PHP)
            if (respuesta.status === 404) {
                throw new Error(`No encontramos ninguna orden con el folio #${folio}. Verifica el número.`);
            }
            throw new Error("Error en el servidor al consultar el equipo.");
        }

        const datos = await respuesta.json();

        // 3. Inyección de datos en el DOM
        // Formateo del folio (Agrega ceros a la izquierda, ej: 00105)
        document.getElementById('resultado-folio').innerText = `#${String(datos.idFolio).padStart(5, '0')}`;
        document.getElementById('resultado-estado').innerText = datos.estadoEquipo;
        
        // Concatenación de Marca y Modelo
        document.getElementById('resultado-equipo').innerText = `${datos.marca} ${datos.modelo}`;
        document.getElementById('resultado-serie').innerText = datos.numSerie;

        // Formateo de fecha (Convierte "YYYY-MM-DD" a "DD/MM/YYYY")
        const fecha = new Date(datos.fechaIngreso);
        // Ajuste para evitar desfases de zona horaria al instanciar la fecha
        const fechaFormateada = `${String(fecha.getDate() + 1).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
        document.getElementById('resultado-fecha').innerText = fechaFormateada;

        document.getElementById('resultado-problema').innerText = datos.detalles;
        document.getElementById('resultado-diagnostico').innerText = datos.diagnostico;

        // Formateo de moneda para el costo (ej: 1500.5 -> 1,500.50)
        const costoFormateado = parseFloat(datos.costo).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('resultado-costo').innerText = `$${costoFormateado}`;

        // 4. Mostrar la tarjeta de resultados con transición
        resultadoConsulta.classList.remove('hidden');
        // Pequeño retardo para que la clase opacity-0 se elimine después de quitar el display:none
        setTimeout(() => resultadoConsulta.classList.remove('opacity-0'), 50);

    } catch (error) {
        console.error("Error en la consulta de equipo:", error);
        mostrarErrorConsulta(error.message);
    }
}

/* Función auxiliar para mostrar mensajes de error en la vista de consulta */
function mostrarErrorConsulta(mensaje) {
    const mensajeError = document.getElementById('mensaje-error');
    if (mensajeError) {
        mensajeError.innerText = ` ${mensaje}`;
        mensajeError.classList.remove('hidden');
    }
}

// MODIFICACIÓN DE LA INICIALIZACIÓN GLOBAL
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar la estructura (Nav y Footer)
    cargarComponentes();
    
    // 2. Consumir las APIs para llenar el contenido de Inicio
    cargarPortada();
    cargarServicios();

    const formularioConsulta = document.getElementById('formulario-consulta');
    if (formularioConsulta) {
        formularioConsulta.addEventListener('submit', consultarEquipo);
    }
});