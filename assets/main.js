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
        verificarSesion();

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
    
    // ==========================================
    // LÓGICA DE PETICIÓN LOGIN
    // ==========================================
    const formLogin = document.getElementById('formulario-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evitamos que la página se recargue
            
            const email = document.getElementById('correo-login').value;
            const password = document.getElementById('password-login').value;
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerText;

            btnSubmit.innerText = "Verificando...";
            btnSubmit.disabled = true;

            try {
                // 1. Intentamos loguear como Cliente
                let respuesta = await fetch(`${API_BASE_URL}/auth/login/cliente`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                let datos = await respuesta.json();

                // 2. Si falla como cliente, intentamos como Trabajador
                if (!respuesta.ok) {
                    let resTrabajador = await fetch(`${API_BASE_URL}/auth/login/trabajador`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    let datosTrabajador = await resTrabajador.json();
                    
                    if (!resTrabajador.ok) {
                        // Si falla en ambos, disparamos el error
                        throw new Error(datosTrabajador.message || datos.message || "Credenciales inválidas");
                    }
                    
                    // Si funcionó, usamos los datos del trabajador
                    datos = datosTrabajador; 
                }

                // 3. ¡Login exitoso! Guardamos en memoria
                localStorage.setItem('token', datos.token);
                localStorage.setItem('usuario', JSON.stringify(datos.usuario));

                mostrarNotificacion(`¡Bienvenido, ${datos.usuario.nombre}!`, 'exito');

                // 4. Redireccionamos según el tipo de usuario
                setTimeout(() => {
                    if (datos.usuario.tipo === 'trabajador') {
                        window.location.href = '/FrontEnd-PCEXTREME/admin/dashboard.html'; // Redirige al panel de administración
                    } else {
                        window.location.href = '/FrontEnd-PCEXTREME/index.html'; // Redirige a la página principal del cliente
                    }
                }, 1500);

            } catch (error) {
                // Mostramos el toast flotante de error
                mostrarNotificacion(error.message, 'error');
            } finally {
                btnSubmit.innerText = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }
    // ==========================================
    // LÓGICA DE PETICIÓN: REGISTRO DE CLIENTE
    // ==========================================
    const formRegistro = document.getElementById('formulario-registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Obtenemos las contraseñas para validar que sean iguales
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;

            if (password !== passwordConfirm) {
                mostrarNotificacion("Las contraseñas no coinciden. Intenta de nuevo.", "error");
                return; // Detenemos la ejecución aquí
            }

            // 2. Cambiamos el estado del botón
            const btnSubmit = formRegistro.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerText;
            btnSubmit.innerText = "⏳ Creando cuenta...";
            btnSubmit.disabled = true;

            // 3. Juntamos los campos de la dirección en un solo texto
            const calle = document.getElementById('reg-calle').value.trim();
            const colonia = document.getElementById('reg-colonia').value.trim();
            const ciudad = document.getElementById('reg-ciudad').value.trim();
            const estado = document.getElementById('reg-estado').value.trim();
            const cp = document.getElementById('reg-cp').value.trim();
            const direccionCompleta = `${calle}, Col. ${colonia}, ${ciudad}, ${estado}. C.P. ${cp}`;

            // 4. Preparamos los datos para la API
            const datosCliente = {
                nombre: document.getElementById('reg-nombre').value.trim(),
                aPaterno: document.getElementById('reg-ap-paterno').value.trim(),
                aMaterno: document.getElementById('reg-ap-materno').value.trim(),
                telefono: document.getElementById('reg-telefono').value.trim(),
                direccion: direccionCompleta,
                email: document.getElementById('reg-email').value.trim(),
                password: password
            };

            try {
                // Hacemos el POST a tu ruta pública de clientes
                const respuesta = await fetch(`${API_BASE_URL}/clientes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosCliente)
                });

                const datos = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(datos.message || "Error al crear la cuenta");
                }

                // Si todo sale bien
                mostrarNotificacion("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.", "exito");
                
                // Limpiamos el formulario
                formRegistro.reset();
                
                // Simulamos un clic en "Inicia sesión aquí" para cambiar de pestaña mágicamente
                setTimeout(() => {
                    document.getElementById('ir-a-login').click();
                }, 1500);

            } catch (error) {
                mostrarNotificacion(error.message, "error");
            } finally {
                // Restauramos el botón
                btnSubmit.innerText = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }

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
                        <img src="${CLOUD_BASE_IMG}${servicio.imagen}" alt="${servicio.titulo}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
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
// SECCIÓN: CONSULTA DE EQUIPOS (RASTREO)
// ==========================================
async function rastrearEquipo(evento) {
    evento.preventDefault();

    const inputFolio = document.getElementById('input-folio');
    const mensajeError = document.getElementById('mensaje-error');
    const resultadoContenedor = document.getElementById('resultado-consulta');
    
    // 1. Capturamos el botón que disparó el evento para modificarlo
    const btnSubmit = evento.target.querySelector('button[type="submit"]');
    // Guardamos el texto original ("Rastrear") para restaurarlo después
    const textoOriginalBtn = btnSubmit.innerHTML;
    
    const folio = inputFolio.value.trim();

    // Reiniciar la interfaz
    mensajeError.classList.add('hidden');
    resultadoContenedor.classList.add('hidden');
    resultadoContenedor.classList.remove('opacity-100');
    resultadoContenedor.classList.add('opacity-0');

    if (!folio) {
        mostrarError(mensajeError, "Por favor, ingresa un número de folio.");
        return;
    }

    // ==========================================
    // INICIO DE ANIMACIÓN DE CARGA (LOADING)
    // ==========================================
    btnSubmit.disabled = true; // Evita doble clic
    btnSubmit.classList.add('cursor-not-allowed', 'opacity-80');
    btnSubmit.innerHTML = `
        <div class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Buscando...</span>
        </div>
    `;

    try {
        // --- PRIMERA CONSULTA: Traer los datos de la orden ---
        const resConsulta = await fetch(`${API_BASE_URL}/registros/${folio}`);
        
        if (!resConsulta.ok) {
            throw new Error('Equipo no encontrado. Verifica el folio.');
        }

        let datosConsulta = await resConsulta.json();
        
        if (Array.isArray(datosConsulta)) {
            if (datosConsulta.length === 0) throw new Error('Equipo no encontrado.');
            datosConsulta = datosConsulta[0];
        }

        // --- SEGUNDA CONSULTA: Traer los detalles del dispositivo ---
        let nombreMarca = "Información no disponible";
        let nombreModelo = "N/A";

        if (datosConsulta.idDispositivo) {
            try {
                const resDispositivo = await fetch(`${API_BASE_URL}/dispositivos/${datosConsulta.idDispositivo}`);
                if (resDispositivo.ok) {
                    let datosDisp = await resDispositivo.json();
                    if (Array.isArray(datosDisp)) datosDisp = datosDisp[0];

                    const marca = datosDisp.marca || '';
                    const modelo = datosDisp.modelo || '';
                    
                    nombreMarca = `${marca} `.trim() || `Dispositivo #${datosConsulta.idDispositivo}`;
                    nombreModelo = `${modelo} `.trim() || 'N/A';
                }
            } catch (errorDisp) {
                console.warn("Aviso: No se pudo cargar la info detallada del dispositivo.", errorDisp);
                nombreMarca = `Dispositivo ID: ${datosConsulta.idDispositivo}`;
            }
        }

        // --- INYECCIÓN DE DATOS AL HTML ---
        document.getElementById('resultado-folio').innerText = `#${datosConsulta.idFolio || folio}`;
        document.getElementById('resultado-equipo').innerText = nombreMarca;
        document.getElementById('resultado-serie').innerText = nombreModelo;
        document.getElementById('resultado-fecha').innerText = formatearFecha(datosConsulta.fechaIngreso);
        document.getElementById('resultado-problema').innerText = datosConsulta.detalles || 'Sin detalles';
        document.getElementById('resultado-diagnostico').innerText = datosConsulta.diagnostico || 'Pendiente de revisión';
        document.getElementById('resultado-costo').innerText = `$${datosConsulta.costo || '0.00'}`;
        
        // Actualizamos la etiqueta de estado
        actualizarEstadoBadge(datosConsulta.estadoEquipo);

        // --- ANIMACIÓN DE ENTRADA DE LA TARJETA ---
        resultadoContenedor.classList.remove('hidden');
        setTimeout(() => {
            resultadoContenedor.classList.remove('opacity-0');
            resultadoContenedor.classList.add('opacity-100');
        }, 50);

    } catch (error) {
        mostrarError(mensajeError, error.message);
    } finally {
        // ==========================================
        // FIN DE ANIMACIÓN DE CARGA (LOADING)
        // ==========================================
        btnSubmit.disabled = false;
        btnSubmit.classList.remove('cursor-not-allowed', 'opacity-80');
        btnSubmit.innerHTML = textoOriginalBtn;
    }
}
// Funciones Auxiliares para el rastreo
function mostrarError(elemento, mensaje) {
    elemento.innerText = mensaje;
    elemento.classList.remove('hidden');
}

function formatearFecha(fechaCadena) {
    if (!fechaCadena) return '--';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaCadena).toLocaleDateString('es-MX', opciones);
}

function actualizarEstadoBadge(estado) {
    const badge = document.getElementById('resultado-estado');
    badge.innerText = estado || 'Desconocido';
    
    // Limpiamos 
    badge.className = "px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase border";

    // Asignamos colores según el estado (Ajusta estos textos según los que uses en tu BD)
    const estadoLower = (estado || '').toLowerCase();
    
    if (estadoLower.includes('revisión') || estadoLower.includes('pendiente')) {
        badge.classList.add('bg-blue-600/20', 'text-blue-400', 'border-blue-600/50');
    } else if (estadoLower.includes('reparación') || estadoLower.includes('proceso')) {
        badge.classList.add('bg-yellow-600/20', 'text-yellow-400', 'border-yellow-600/50');
    } else if (estadoLower.includes('listo') || estadoLower.includes('entregado')) {
        badge.classList.add('bg-green-600/20', 'text-green-400', 'border-green-600/50');
    } else {
        badge.classList.add('bg-gray-600/20', 'text-gray-400', 'border-gray-600/50');
    }
}

// ==========================================
// SECCIÓN: CATÁLOGO DE PRODUCTOS Y DETALLE
// ==========================================
let productosGlobales = []; // Guardamos los productos en memoria para no saturar la API

async function cargarCatalogoProductos() {
    const contenedorCategorias = document.getElementById('contenedor-categorias');
    const cuadricula = document.getElementById('cuadricula-productos');
    const estado = document.getElementById('estado-productos');

    if (!contenedorCategorias || !cuadricula) return;

    // Mostrar loader
    estado.classList.remove('hidden');
    contenedorCategorias.innerHTML = '';
    cuadricula.innerHTML = '';

    try {
        const respuesta = await fetch(`${API_BASE_URL}/productos`);
        if (!respuesta.ok) throw new Error("Error al cargar los productos");
        
        productosGlobales = await respuesta.json();
        
        if (!Array.isArray(productosGlobales)) productosGlobales = [productosGlobales];

        // Ocultar loader
        estado.classList.add('hidden');

        // Extraer categorías únicas usando Set
        const categoriasSet = new Set(productosGlobales.map(p => p.categoria));
        const categoriasUnicas = ['Todos', ...Array.from(categoriasSet)];

        // 1. Renderizar Botones de Categorías
        categoriasUnicas.forEach((categoria, index) => {
            const btn = document.createElement('button');
            // Estilos para el botón activo (el primero por defecto)
            const esActivo = index === 0;
            btn.className = `px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${esActivo ? 'bg-[#7ed957] text-black border-[#7ed957]' : 'bg-transparent text-gray-400 border-gray-700 hover:border-[#7ed957] hover:text-[#7ed957]'}`;
            btn.innerText = categoria.toUpperCase();
            
            btn.addEventListener('click', () => {
                // Quitar estilo activo a todos y ponérselo al clickeado
                Array.from(contenedorCategorias.children).forEach(b => {
                    b.classList.remove('bg-[#7ed957]', 'text-black', 'border-[#7ed957]');
                    b.classList.add('bg-transparent', 'text-gray-400', 'border-gray-700');
                });
                btn.classList.remove('bg-transparent', 'text-gray-400', 'border-gray-700');
                btn.classList.add('bg-[#7ed957]', 'text-black', 'border-[#7ed957]');
                
                // Filtrar cuadrícula
                renderizarCuadricula(categoria);
            });

            contenedorCategorias.appendChild(btn);
        });

        // 2. Renderizar Cuadrícula inicial (Todos)
        renderizarCuadricula('Todos');

    } catch (error) {
        console.error(error);
        estado.innerHTML = `<p class="text-red-500">Error al cargar el inventario. Intenta más tarde.</p>`;
    }
}

function renderizarCuadricula(filtroCategoria) {
    const cuadricula = document.getElementById('cuadricula-productos');
    cuadricula.innerHTML = ''; // Limpiar

    const productosFiltrados = filtroCategoria === 'Todos' 
        ? productosGlobales 
        : productosGlobales.filter(p => p.categoria === filtroCategoria);

    if(productosFiltrados.length === 0) {
        cuadricula.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">No hay productos en esta categoría.</p>`;
        return;
    }

    productosFiltrados.forEach(prod => {
        // Uso directo de la ruta Cloudinary + carpeta productos 
        const imagenUrl = `${CLOUD_BASE_IMG}/${prod.imagen_url}`;
        
        const tarjeta = `
            <div class="bg-[#151515] border border-gray-800 rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-[#7ed957] hover:shadow-[0_10px_30px_rgba(126,217,87,0.1)] transition-all duration-300 flex flex-col group cursor-pointer" onclick="window.location.href='detalle_producto.html?id=${prod.idProducto}'">
                
                <div class="h-48 w-full bg-black p-4 flex items-center justify-center overflow-hidden">
                    <img src="${imagenUrl}" alt="${prod.nombre}" class="max-h-full max-w-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                </div>
                
                <div class="p-5 flex flex-col flex-grow text-left">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">${prod.categoria}</span>
                    <h3 class="text-white text-md font-semibold mb-3 line-clamp-2 leading-tight">${prod.nombre}</h3>
                    
                    <div class="mt-auto flex justify-between items-end">
                        <div>
                            <span class="text-xs text-gray-500 block mb-1">Precio</span>
                            <span class="text-[#7ed957] font-extrabold text-xl">$${parseFloat(prod.precio).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                        </div>
                        <span class="text-[#7ed957] font-bold">→</span>
                    </div>
                </div>
            </div>
        `;
        cuadricula.innerHTML += tarjeta;
    });
}

async function cargarDetalleProducto() {
    const contenedor = document.getElementById('contenedor-detalle');
    const estado = document.getElementById('estado-detalle');
    if (!contenedor) return;

    // Leer el ID de la URL (ej: detalle.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = urlParams.get('id');

    if (!idProducto) {
        estado.innerHTML = `<p class="text-red-500">Producto no especificado.</p>`;
        return;
    }

    try {
        const respuesta = await fetch(`${API_BASE_URL}/productos/${idProducto}`);
        if (!respuesta.ok) throw new Error("No se encontró el producto");
        
        let datos = await respuesta.json();
        if (Array.isArray(datos)) datos = datos[0]; // Por si devuelve un array

        estado.classList.add('hidden');
        contenedor.classList.remove('hidden');

        const imagenUrl = `${CLOUD_BASE_IMG}/${datos.imagen_url}` ;
        const telefonoEmpresa = datos.telefono_empresa || "7711784044"; 
        const mensajeWa = encodeURIComponent(`Hola PC EXTREME, me interesa el producto: ${datos.nombre}`);

        contenedor.innerHTML = `
            <div class="bg-black border border-gray-800 rounded-2xl p-6 flex items-center justify-center">
                <img src="${imagenUrl}" alt="${datos.nombre}" class="max-w-full max-h-96 object-contain hover:scale-105 transition-transform duration-500">
            </div>

            <div class="flex flex-col justify-center">
                <span class="inline-block bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider w-max mb-4">${datos.categoria}</span>
                
                <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">${datos.nombre}</h1>
                
                <div class="text-[#7ed957] text-4xl font-black mb-6">
                    $${parseFloat(datos.precio).toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>

                <div class="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 mb-8">
                    <p class="text-gray-400 text-sm mb-2">Estado del stock:</p>
                    <div class="flex items-center gap-3">
                        <span class="bg-blue-600/20 text-blue-400 border border-blue-600/50 px-3 py-1 rounded-full text-xs font-bold uppercase">${datos.estado || 'Disponible'}</span>
                        <span class="text-gray-500 text-sm">(Cantidad: ${datos.stock || 1})</span>
                    </div>
                </div>

                <div class="mb-8">
                    <h3 class="text-white font-semibold mb-2 border-b border-gray-800 pb-2">Descripción del producto</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">${datos.descripcion || 'Sin descripción disponible.'}</p>
                </div>

                <a href="https://wa.me/${telefonoEmpresa}?text=${mensajeWa}" target="_blank" 
                   class="w-full bg-[#7ed957] hover:bg-[#6bc148] text-black text-center font-bold py-4 px-8 rounded-full transition duration-300 shadow-[0_0_15px_rgba(126,217,87,0.2)] flex items-center justify-center gap-3">
                   <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                   Me interesa este artículo
                </a>
            </div>
        `;
    } catch (error) {
        console.error(error);
        estado.innerHTML = `<p class="text-red-500">Error al cargar la información del producto.</p>`;
    }
}

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
    // Componentes globales
    cargarComponentes();
    inicializarEventosLogin();
    
    // Funciones específicas del Index
    if(document.getElementById('portada-contenido')) cargarPortada();
    if(document.getElementById('lista-servicios')) cargarServicios();
    if(document.getElementById('graficaCrecimiento')) iniciarModuloCrecimiento();
     
    // Funciones específicas de Consulta de Equipo
    // ==========================================
    // VALIDACIÓN ESTRICTA DEL INPUT DE FOLIO
    // ==========================================
    const inputFolio = document.getElementById('input-folio');
    if (inputFolio) {
        // Bloqueamos el signo menos (-), el símbolo de suma (+), el punto (.) y la letra 'e'
        inputFolio.addEventListener('keydown', (e) => {
            if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    const formConsulta = document.getElementById('formulario-consulta');
    if (formConsulta) {
        formConsulta.addEventListener('submit', rastrearEquipo);
    }

    // Funciones para Productos
    if(document.getElementById('cuadricula-productos')) cargarCatalogoProductos();
    if(document.getElementById('contenedor-detalle')) cargarDetalleProducto();
});
// ==========================================
// SISTEMA DE NOTIFICACIONES FLOTANTES
// ==========================================
function mostrarNotificacion(mensaje, tipo = 'error') {
    // Verificamos si ya existe el contenedor, si no, lo creamos
    let contenedor = document.getElementById('toast-container');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'toast-container';
        contenedor.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-3';
        document.body.appendChild(contenedor);
    }

    // Colores dependiendo de si es error o éxito
    const bgClass = tipo === 'error' ? 'bg-red-600' : 'bg-[#7ed957]';
    const textClass = tipo === 'error' ? 'text-white' : 'text-black';

    const toast = document.createElement('div');
    toast.className = `${bgClass} ${textClass} px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0`;
    toast.innerHTML = `
        <span>${tipo === 'error' ? '❌' : '✅'}</span>
        <span>${mensaje}</span>
    `;

    contenedor.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    // Desaparecer después de 3 segundos
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-10');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
// ==========================================
// MANEJO DE SESIÓN Y HEADER
// ==========================================
function verificarSesion() {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    
    if (!token || !usuarioStr) return; // No hay sesión iniciada

    const usuario = JSON.parse(usuarioStr);

    // 1. Si estamos en la página de login y YA hay sesión, lo sacamos de ahí
    if (window.location.pathname.includes('login.html')) {
        if (usuario.tipo === 'trabajador') {
            window.location.href = '#'; // Redirección admin
        } else {
            window.location.href = 'index.html'; // Redirección cliente
        }
        return;
    }

    // 2. Si es cliente, modificamos el header
    if (usuario.tipo === 'cliente') {
        const authButton = document.getElementById('authButton');
        if (authButton) {
            const contenedorPadre = authButton.parentElement;
            
            // Reemplazamos el botón original por el Dropdown
            contenedorPadre.innerHTML = `
                <div class="relative inline-block text-left">
                    <button id="userMenuButton" class="border border-[#7ed957] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#7ed957] hover:text-black transition">
                        Hola, ${usuario.nombre}
                    </button>
                    <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-[#1f1f1f] rounded-xl shadow-lg border border-gray-700 overflow-hidden z-50">
                        <button class="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition font-semibold">Mi Perfil</button>
                        <button class="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition font-semibold">Mis Dispositivos</button>
                        <button onclick="cerrarSesion()" class="w-full text-left px-4 py-3 text-[#ff4d4d] hover:bg-gray-800 transition font-semibold">Cerrar Sesión</button>
                    </div>
                </div>
            `;

            // Lógica para abrir y cerrar el nuevo dropdown
            const btn = document.getElementById('userMenuButton');
            const drop = document.getElementById('userDropdown');
            btn.addEventListener('click', () => drop.classList.toggle('hidden'));
            window.addEventListener('click', (e) => {
                if (!btn.contains(e.target) && !drop.contains(e.target)) {
                    drop.classList.add('hidden');
                }
            });
        }
    }
}

// Función global para cerrar sesión desde el botón
window.cerrarSesion = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html'; // Recargamos enviándolo al inicio
};