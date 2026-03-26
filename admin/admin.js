/**
 * admin.js
 * Archivo principal del Panel de Administración - PC EXTREME
 */

// ==========================================
// MÓDULO 1: CONFIGURACIÓN GLOBAL
// ==========================================
// Variables para conectar con la base de datos y Cloudinary
const baseUrl = "https://app-web-java.vercel.app/api";
const CLOUD_BASE = 'https://res.cloudinary.com/dswljrmnu/image/upload/';
const CLOUD_NAME_BASE = 'dswljrmnu';
const UPLOAD_PRESET = 'qgnakwni';

// Variables de Cloudinary exclusivas para el Gestor Web
const CLOUD_NAME_WEB = "dbkqbazp7";
const PRESET_WEB = "Pc Extreme Web";


// ==========================================
// MÓDULO 2: UTILIDADES GENERALES
// ==========================================
// Funciones de ayuda que se usan en todo el panel de administración

// Muestra una alerta flotante temporal en la esquina de la pantalla
function mostrarNotificacionAdmin(mensaje, tipo = 'error') {
    let contenedor = document.getElementById('toast-container-admin');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'toast-container-admin';
        contenedor.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-3';
        document.body.appendChild(contenedor);
    }

    const bgClass = tipo === 'error' ? 'bg-red-600' : 'bg-[#7ed957]';
    const textClass = tipo === 'error' ? 'text-white' : 'text-black';

    const toast = document.createElement('div');
    toast.className = `${bgClass} ${textClass} px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0`;
    toast.innerHTML = `<span>${tipo === 'error' ? '❌' : '✅'}</span> <span>${mensaje}</span>`;

    contenedor.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-10');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Muestra un recuadro oscuro para pedir confirmación antes de borrar o editar algo
function mostrarConfirmacionAdmin(mensaje, tipo = 'peligro') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] px-4 opacity-0 transition-opacity duration-300';

        const colorModal = tipo === 'peligro' ? 'border-red-600' : 'border-yellow-500';
        const colorBtn = tipo === 'peligro' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-black';
        const icono = tipo === 'peligro' ? '🗑️' : '✏️';
        const titulo = tipo === 'peligro' ? 'Eliminar Registro' : 'Modificar Datos';

        overlay.innerHTML = `
            <div class="bg-[#1a1c20] border-t-4 ${colorModal} rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] p-6 max-w-sm w-full transform scale-95 transition-transform duration-300 text-center">
                <span class="text-5xl mb-4 block drop-shadow-lg">${icono}</span>
                <h3 class="text-xl font-bold text-white mb-2">${titulo}</h3>
                <p class="text-gray-400 text-sm mb-8 leading-relaxed">${mensaje}</p>
                <div class="flex justify-center gap-4">
                    <button id="btn-cancelar-conf" class="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition text-sm">Cancelar</button>
                    <button id="btn-aceptar-conf" class="px-5 py-2.5 ${colorBtn} rounded-lg font-bold transition text-sm shadow-lg">Sí, continuar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            overlay.querySelector('div').classList.remove('scale-95');
        }, 10);

        const cerrar = (resultado) => {
            overlay.classList.add('opacity-0');
            overlay.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                overlay.remove();
                resolve(resultado);
            }, 300);
        };

        overlay.querySelector('#btn-aceptar-conf').addEventListener('click', () => cerrar(true));
        overlay.querySelector('#btn-cancelar-conf').addEventListener('click', () => cerrar(false));
    });
}

// Activa el botón de "ojito" para ver la contraseña en el formulario
function inicializarOjoPassword() {
    const inputPassword = document.getElementById('emp-password');
    const btnOjo = document.getElementById('btn-ver-password');

    if (inputPassword && btnOjo) {
        btnOjo.addEventListener('mouseenter', () => inputPassword.type = 'text');
        btnOjo.addEventListener('mouseleave', () => inputPassword.type = 'password');
    }
}


// ==========================================
// MÓDULO 3: SESIÓN Y COMPONENTES GLOBALES
// ==========================================
// Verifica que seas empleado para dejarte entrar y carga el menú superior

async function cargarComponentesAdmin() {
    try {
        const headerEl = document.getElementById("encabezado-admin");
        if (headerEl) {
            const resH = await fetch("/FrontEnd-PCEXTREME/admin/admin_header.html");
            if (resH.ok) {
                headerEl.innerHTML = await resH.text();

                const usuarioStr = localStorage.getItem('usuario');

                // Si no hay sesión iniciada, te manda a la página pública
                if (!usuarioStr) {
                    window.location.replace('../index.html');
                    return;
                }

                // Si no eres empleado, no tienes acceso a esta zona
                const usuario = JSON.parse(usuarioStr);
                if (usuario.tipo !== 'trabajador') {
                    window.location.replace('../index.html');
                    return;
                }

                // Ponemos el nombre y rol del empleado en la barra de arriba
                const nombreAdminEl = document.getElementById('admin-nombre-usuario');
                const rolAdminEl = document.getElementById('admin-nombre-rol');

                if (nombreAdminEl) nombreAdminEl.innerText = usuario.nombre;

                if (rolAdminEl) {
                    const idDelRol = usuario.idRol || usuario.rol;
                    const diccionarioRoles = {
                        "1": "Administrador",
                        "2": "Recepcionista",
                        "3": "Técnico"
                    };
                    rolAdminEl.innerText = diccionarioRoles[String(idDelRol)] || "Empleado";
                }
                //reponsiva
                const btnMenuMovil = document.getElementById("btn-menu-admin-movil");
                const menuMovil = document.getElementById("menu-admin-movil");

                if (btnMenuMovil && menuMovil) {
                    btnMenuMovil.addEventListener("click", () => {
                        menuMovil.classList.toggle("hidden");
                    });

                    // Oculta el menú automáticamente si agrandan la ventana (modo PC)
                    window.addEventListener("resize", () => {
                        if (window.innerWidth >= 1024) {
                            menuMovil.classList.add("hidden");
                        }
                    });
                }
                // Activa el botón de salir
                const hacerLogout = () => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuario');
                    window.location.replace('../index.html');
                };

                const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
                const btnCerrarSesionMovil = document.getElementById('btn-cerrar-sesion-movil');

                if (btnCerrarSesion) btnCerrarSesion.addEventListener('click', hacerLogout);
                if (btnCerrarSesionMovil) btnCerrarSesionMovil.addEventListener('click', hacerLogout);
            }
        }

        // Carga la parte de hasta abajo de la página
        const footerEl = document.getElementById("admin-piePagina");
        if (footerEl) {
            const resF = await fetch("/FrontEnd-PCEXTREME/admin/admin_footer.html");
            if (resF.ok) footerEl.innerHTML = await resF.text();
        }
    } catch (error) {
        console.error("Error al cargar header/footer:", error);
    }
}
// ==========================================
// SECCIÓN: GESTIÓN DE REPARACIONES 
// ==========================================
let adminReparacionesData = [];
let paginaActualReparaciones = 1;
const itemsPorPaginaReparaciones = 20;

/**
 * 1. Descarga principal de registros (Lista Plana)
 */
async function cargarTablaAdminReparaciones() {
    const tbody = document.getElementById('lista-reparaciones');
    if (!tbody) return;

    try {
        // Obtenemos todos los registros tal cual llegan
        const respuesta = await fetch(`${baseUrl}/registros`);
        if (!respuesta.ok) throw new Error("Error al obtener los registros");

        adminReparacionesData = await respuesta.json();

        // Como mostrar la página ahora hace peticiones a la API, esperamos a que termine
        await mostrarPaginaReparaciones();
        renderizarControlesPaginacionReparaciones();

    } catch (error) {
        console.error("Error al cargar reparaciones:", error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-red-500 font-semibold">Error al cargar la tabla. Revisa la consola.</td></tr>`;
    }
}

/**
 * 2. Recorre los registros, consume APIs individuales y dibuja la tabla
 */
async function mostrarPaginaReparaciones() {
    const tbody = document.getElementById('lista-reparaciones');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500 animate-pulse">Consultando clientes y equipos </td></tr>`;

    if (adminReparacionesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-500 font-medium">No hay registros de reparación.</td></tr>`;
        return;
    }

    const inicio = (paginaActualReparaciones - 1) * itemsPorPaginaReparaciones;
    const fin = inicio + itemsPorPaginaReparaciones;
    const reparacionesPagina = adminReparacionesData.slice(inicio, fin);

    const promesasDeFilas = reparacionesPagina.map(async (reg) => {
        const idRegistro = reg.idFolio || reg.id || reg.folio;
        const idClienteFk = reg.idCliente || reg.clienteId || reg.cliente_id;
        const idDispositivoFk = reg.idDispositivo || reg.dispositivoId || reg.dispositivo_id;

        const falla = reg.detalles || reg.problema || "Sin descripción";
        const estado = reg.estadoEquipo || "Recibido";

        let nombreCompleto = "Cliente no encontrado";
        let nombreEquipo = "Equipo no encontrado";

        let promesaCliente = null;
        let promesaDispositivo = null;

        if (idClienteFk) {
            promesaCliente = fetch(`${baseUrl}/clientes/${idClienteFk}`)
                .then(res => res.ok ? res.json() : null)
                .catch(() => null);
        }

        if (idDispositivoFk) {
            promesaDispositivo = fetch(`${baseUrl}/dispositivos/${idDispositivoFk}`)
                .then(res => res.ok ? res.json() : null)
                .catch(() => null);
        }

        const [cli, disp] = await Promise.all([promesaCliente, promesaDispositivo]);

        if (cli) {
            nombreCompleto = `${cli.nombre || ''} ${cli.aPaterno || ''}`.trim();
            reg.correoClienteMapeado = cli.email || cli.correo;
        }

        if (disp) {
            nombreEquipo = `${disp.marca || ''} ${disp.modelo || ''}`.trim();
            if (nombreEquipo === "") nombreEquipo = disp.tipo || "Equipo sin marca";
        }

        reg.nombreClienteMapeado = nombreCompleto;
        reg.nombreEquipoMapeado = nombreEquipo;

        // --- CLASES DE ESTADO ---
        let colorEstado = 'bg-gray-900 text-gray-400 border-gray-700';
        if (estado === 'Entregado') colorEstado = 'bg-green-900/40 text-green-400 border-green-800';
        else if (estado === 'Listo para entregar') colorEstado = 'bg-blue-900/40 text-blue-400 border-blue-800';
        else if (estado === 'En Reparación') colorEstado = 'bg-yellow-900/40 text-yellow-500 border-yellow-800';
        else if (estado === 'En Diagnóstico') colorEstado = 'bg-orange-900/40 text-orange-400 border-orange-800';
        else if (estado === 'Sin Reparación') colorEstado = 'bg-red-900/40 text-red-400 border-red-800';

        return `
            <tr class="block md:table-row hover:bg-[#252830] transition border-b border-gray-800 p-4 md:p-0">
                <td class="block md:table-cell md:p-4 text-gray-400 font-medium mb-2 md:mb-0">
                    <span class="inline-block md:hidden font-bold text-gray-500 w-24">Folio:</span> 
                    #${idRegistro}
                </td>
                <td class="block md:table-cell md:p-4 font-semibold text-gray-200 mb-2 md:mb-0">
                    <span class="inline-block md:hidden font-bold text-gray-500 w-24">Cliente:</span> 
                    ${nombreCompleto}
                </td>
                <td class="block md:table-cell md:p-4 text-gray-400 mb-2 md:mb-0">
                    <span class="inline-block md:hidden font-bold text-gray-500 w-24">Equipo:</span> 
                    ${nombreEquipo}
                </td>
                <td class="block md:table-cell md:p-4 text-gray-400 text-sm mb-3 md:mb-0">
                    <span class="inline-block md:hidden font-bold text-gray-500 w-24">Falla:</span> 
                    <span class="truncate max-w-[200px] sm:max-w-xs align-middle inline-block" title="${falla}">${falla}</span>
                </td>
                <td class="flex items-center md:table-cell md:p-4 mb-4 md:mb-0">
                    <span class="inline-block md:hidden font-bold text-gray-500 w-24">Estado:</span>
                    <span class="px-3 py-1 rounded-full text-xs font-bold border ${colorEstado}">${estado}</span>
                </td>
                <td class="block md:table-cell md:p-4 text-center mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-800 md:border-transparent">
                    <button onclick="abrirModalReparacion(${idRegistro})" class="w-full md:w-auto bg-[#3f51b5] hover:bg-blue-600 text-white font-bold transition flex items-center justify-center gap-2 mx-auto px-4 py-2.5 md:py-1.5 rounded shadow-sm text-xs tracking-wider">
                        ✏️ Editar
                    </button>
                </td>
            </tr>
        `;
    });

    const filasHtmlArray = await Promise.all(promesasDeFilas);
    tbody.innerHTML = filasHtmlArray.join('');
}
/**
 * 3. Renderizar controles de paginación
 */
function renderizarControlesPaginacionReparaciones() {
    const contenedor = document.getElementById('controles-paginacion-reparaciones');
    if (!contenedor) return;

    const totalPaginas = Math.ceil(adminReparacionesData.length / itemsPorPaginaReparaciones);
    contenedor.innerHTML = '';

    if (totalPaginas <= 1) return;

    const btnAnteriorDisabled = paginaActualReparaciones === 1 ? 'opacity-50 cursor-not-allowed bg-[#1a1c20]' : 'bg-[#1a1c20] hover:bg-[#252830] hover:text-white';
    const btnSiguienteDisabled = paginaActualReparaciones === totalPaginas ? 'opacity-50 cursor-not-allowed bg-[#1a1c20]' : 'bg-[#1a1c20] hover:bg-[#252830] hover:text-white';

    contenedor.innerHTML = `
        <button onclick="cambiarPaginaReparaciones(-1)" class="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-400 border border-gray-700 rounded-lg transition shadow-sm ${btnAnteriorDisabled}" ${paginaActualReparaciones === 1 ? 'disabled' : ''}>
            ← Anterior
        </button>
        <span class="text-sm font-semibold text-gray-400 text-center w-full sm:w-auto my-1 sm:my-0 block sm:inline">
            Página <span class="text-[#7ed957] font-bold">${paginaActualReparaciones}</span> de <span class="text-white">${totalPaginas}</span>
        </span>
        <button onclick="cambiarPaginaReparaciones(1)" class="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-400 border border-gray-700 rounded-lg transition shadow-sm ${btnSiguienteDisabled}" ${paginaActualReparaciones === totalPaginas ? 'disabled' : ''}>
            Siguiente →
        </button>
    `;
}

// Convertimos esta función a async porque mostrarPaginaReparaciones ahora toma tiempo
async function cambiarPaginaReparaciones(direccion) {
    const totalPaginas = Math.ceil(adminReparacionesData.length / itemsPorPaginaReparaciones);
    const nuevaPagina = paginaActualReparaciones + direccion;

    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActualReparaciones = nuevaPagina;
        await mostrarPaginaReparaciones();
        renderizarControlesPaginacionReparaciones();
    }
}

/* 4. Gestión de Modal */
function abrirModalReparacion(idRegistroBuscado) {
    const modal = document.getElementById('modal-reparacion');

    // ¡AQUÍ ESTÁ LA CORRECCIÓN! Buscamos usando la variable real: r.idFolio
    const reg = adminReparacionesData.find(r => String(r.idFolio) === String(idRegistroBuscado));

    if (!reg) {
        console.error("No se encontró el ID...");
        return mostrarNotificacionAdmin("No se encontró la información del registro en memoria.", "error");
    }

    const nombreClienteRenderizado = reg.nombreClienteMapeado || "Desconocido";
    const nombreEquipoRenderizado = reg.nombreEquipoMapeado || "Equipo sin definir";

    // Inyección visual en el HTML
    document.getElementById('modal-folio-display').innerText = idRegistroBuscado;
    document.getElementById('info-cliente').innerText = nombreClienteRenderizado;
    document.getElementById('info-equipo').innerText = nombreEquipoRenderizado;

    // Inyección del ID oculto para el formulario
    document.getElementById('admin-reparacion-id').value = idRegistroBuscado;

    // ¡CORRECCIÓN! Usamos el nombre real de tu base de datos: reg.estadoEquipo
    document.getElementById('admin-estado-reparacion').value = reg.estadoEquipo || 'En Diagnóstico';

    modal.classList.remove('hidden');
}

function cerrarModalReparacion() {
    document.getElementById('modal-reparacion').classList.add('hidden');
}

/**
 * 5. Envío hacia el backend (Solo actualiza el estado)
 */
async function gestionarSubmitReparacion(evento) {
    evento.preventDefault();

    const btnGuardar = evento.target.querySelector('button[type="submit"]');
    const textoOriginalBtn = btnGuardar.innerText;

    const id = document.getElementById('admin-reparacion-id').value;
    const nuevoEstado = document.getElementById('admin-estado-reparacion').value;

    const quiereNotificar = document.getElementById('admin-notificar-whatsapp').checked;

    btnGuardar.disabled = true;
    btnGuardar.classList.add('opacity-70', 'cursor-not-allowed');
    btnGuardar.innerText = "Actualizando...";

    try {
        // 1. Buscamos el registro original completo en nuestra memoria
        const reg = adminReparacionesData.find(r => String(r.idFolio) === String(id));
        if (!reg) throw new Error("No se encontró el registro en memoria para armar la petición.");

        // 2. Rescatamos las llaves foráneas exactas
        const idClienteFk = reg.idCliente || (reg.cliente ? reg.cliente.idCliente : null);
        const idDispositivoFk = reg.idDispositivo || (reg.dispositivo ? reg.dispositivo.idDispositivo : null);

        // 3. Armamos el payload completo (usamos el spread operator ...reg para conservar fechas, detalles, etc.)
        const payload = {
            ...reg,
            estadoEquipo: nuevoEstado,
            idCliente: idClienteFk,
            idDispositivo: idDispositivoFk
        };

        const token = localStorage.getItem('token');
        const headersAEnviar = { 'Content-Type': 'application/json' };
        if (token) headersAEnviar['Authorization'] = `Bearer ${token}`;

        const respuesta = await fetch(`${baseUrl}/registros/${id}`, {
            method: 'PUT',
            headers: headersAEnviar,
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json().catch(() => ({}));
            // Si el backend envía el detalle del error en su JSON, lo mostramos
            throw new Error(errorData.message || errorData.error || `Error del servidor: código ${respuesta.status}`);
        }

        // ==========================================
        // 4. LÓGICA DE EMAILJS
        // ==========================================
        if (quiereNotificar) {
            const correoCliente = reg.correoClienteMapeado;
            if (correoCliente) {
                const parametrosTemplate = {
                    correo_destino: correoCliente,
                    nombre_cliente: document.getElementById('info-cliente').innerText,
                    equipo: document.getElementById('info-equipo').innerText,
                    nuevo_estado: nuevoEstado
                };

                emailjs.send('service_i4nla5o', 'template_6ltorks', parametrosTemplate)
                    .then(function () {
                        mostrarNotificacionAdmin(`Estado actualizado. Correo enviado al cliente.`, "exito");
                    }, function () {
                        mostrarNotificacionAdmin(`Estado actualizado, pero falló el envío del correo.`, "error");
                    });
            } else {
                mostrarNotificacionAdmin(`Estado actualizado. El cliente no tiene correo registrado.`, "error");
            }
        } else {
            mostrarNotificacionAdmin(`Estado actualizado a "${nuevoEstado}" con éxito.`, "exito");
        }

        cerrarModalReparacion();
        await cargarTablaAdminReparaciones();

    } catch (error) {
        mostrarNotificacionAdmin("Error al actualizar el registro: " + error.message, "error");
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.classList.remove('opacity-70', 'cursor-not-allowed');
        btnGuardar.innerText = textoOriginalBtn;
    }
}

// ==========================================
// MÓDULO 5: GESTIÓN DE CLIENTES
// ==========================================
let cliGlobales = [];
let cliFiltrados = [];
let cliPaginaActual = 1;
const cliPorPagina = 20;

// Descarga la lista de clientes y activa la barra de búsqueda
async function iniciarModuloClientes() {
    const contenedor = document.getElementById("lista-clientes");
    if (!contenedor) return;

    try {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Cargando clientes...</td></tr>`;

        const respuesta = await fetch(`${baseUrl}/clientes`);
        if (!respuesta.ok) throw new Error("Error en la API de clientes");

        cliGlobales = await respuesta.json();
        cliFiltrados = [...cliGlobales];
        cliPaginaActual = 1;
        mostrarPaginaClientes();

        // Buscador automático de clientes (busca por nombre o correo)
        const buscador = document.getElementById("buscador-clientes");
        if (buscador) {
            buscador.addEventListener("input", (e) => {
                const texto = e.target.value.toLowerCase().trim();
                cliFiltrados = cliGlobales.filter((cli) => {
                    const nombreCompleto = `${cli.nombre} ${cli.aPaterno} ${cli.aMaterno}`.toLowerCase();
                    const correo = String(cli.email || "").toLowerCase();
                    return nombreCompleto.includes(texto) || correo.includes(texto);
                });
                cliPaginaActual = 1;
                mostrarPaginaClientes();
            });
        }
    } catch (error) {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error al conectar con la base de datos de clientes.</td></tr>`;
    }
}

// Dibuja las filas de los clientes
function mostrarPaginaClientes() {
    const contenedor = document.getElementById("lista-clientes");
    if (!contenedor) return;

    if (cliFiltrados.length === 0) {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No se encontraron clientes con esa búsqueda.</td></tr>`;
        actualizarPaginacionClientes();
        return;
    }

    const inicio = (cliPaginaActual - 1) * cliPorPagina;
    const cliPagina = cliFiltrados.slice(inicio, inicio + cliPorPagina);
    let html = "";

    cliPagina.forEach((cli) => {
        const phone = cli.telefono ? cli.telefono.replace(/\D/g, "") : "";
        const whatsappLink = phone ? `https://wa.me/52${phone}` : "#";

        html += `
            <tr class="hover:bg-[#252830] transition border-b border-gray-800">
                <td class="px-6 py-5 align-top"><span class="bg-gray-800 text-gray-300 font-bold px-3 py-1 rounded text-sm border border-gray-700">#${cli.idCliente}</span></td>
                <td class="px-6 py-5 font-bold text-gray-200 align-top">${cli.nombre} ${cli.aPaterno} ${cli.aMaterno || ""}</td>
                <td class="px-6 py-5 align-top">
                    <div class="flex flex-col space-y-1 text-sm text-gray-400">
                        <span class="flex items-center"><i class="fa-solid fa-envelope text-blue-400 mr-2 w-4"></i> ${cli.email || "Sin correo"}</span>
                        <span class="flex items-center"><i class="fa-solid fa-phone text-pink-400 mr-2 w-4"></i> ${cli.telefono || "Sin teléfono"}</span>
                    </div>
                </td>
                <td class="px-6 py-5 text-sm text-gray-400 max-w-xs align-top">${cli.direccion || "Sin dirección registrada"}</td>
                <td class="px-6 py-5 text-center align-top">
                    <a href="${whatsappLink}" target="_blank" class="inline-flex items-center bg-[#25D366] hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition shadow-sm"><i class="fa-brands fa-whatsapp mr-2 text-lg"></i> Chat WhatsApp</a>
                </td>
            </tr>
        `;
    });

    contenedor.innerHTML = html;
    actualizarPaginacionClientes();
}

// Crea la barra de paginación para la tabla de clientes
function actualizarPaginacionClientes() {
    let controles = document.getElementById("paginacion-clientes");
    if (!controles) {
        const tabla = document.querySelector("#lista-clientes").closest("table").parentNode;
        controles = document.createElement("div");
        controles.id = "paginacion-clientes";
        controles.className = "flex items-center justify-between px-6 py-3 bg-gray-900 border-t border-gray-800 sm:px-6 rounded-b-lg mt-2";
        tabla.appendChild(controles);
    }

    const total = Math.ceil(cliFiltrados.length / cliPorPagina);
    if (total <= 1) {
        controles.innerHTML = "";
        return;
    }

    controles.innerHTML = `
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p class="text-sm text-gray-400">Mostrando ${(cliPaginaActual - 1) * cliPorPagina + 1} a ${Math.min(cliPaginaActual * cliPorPagina, cliFiltrados.length)} de ${cliFiltrados.length}</p>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm">
                <button onclick="cambiarPaginaClientes('anterior')" ${cliPaginaActual === 1 ? "disabled" : ""} class="px-4 py-2 rounded-l-md border border-gray-700 bg-[#1a1c20] text-sm text-gray-400 hover:bg-gray-800 ${cliPaginaActual === 1 ? "opacity-50 cursor-not-allowed" : ""}">Anterior</button>
                <span class="px-4 py-2 border border-gray-700 bg-[#0f1115] text-gray-200 text-sm">Página ${cliPaginaActual} de ${total}</span>
                <button onclick="cambiarPaginaClientes('siguiente')" ${cliPaginaActual === total ? "disabled" : ""} class="px-4 py-2 rounded-r-md border border-gray-700 bg-[#1a1c20] text-sm text-gray-400 hover:bg-gray-800 ${cliPaginaActual === total ? "opacity-50 cursor-not-allowed" : ""}">Siguiente</button>
            </nav>
        </div>`;
}

window.cambiarPaginaClientes = function (dir) {
    const total = Math.ceil(cliFiltrados.length / cliPorPagina);
    if (dir === "siguiente" && cliPaginaActual < total) cliPaginaActual++;
    else if (dir === "anterior" && cliPaginaActual > 1) cliPaginaActual--;
    mostrarPaginaClientes();
};


// ==========================================
// MÓDULO 6: GESTIÓN DE PRODUCTOS
// ==========================================
let adminProductosData = [];
let prodPaginaActual = 1;
const prodPorPagina = 20;

// Descarga todos los productos del catálogo
async function cargarTablaAdminProductos() {
    const tbody = document.getElementById('tabla-productos-admin');
    if (!tbody) return;

    try {
        const respuesta = await fetch(`${baseUrl}/productos`);
        if (!respuesta.ok) throw new Error("Error al obtener productos");

        adminProductosData = await respuesta.json();
        prodPaginaActual = 1;
        mostrarPaginaProductos();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-red-500">Error al cargar la tabla. Revisa la consola.</td></tr>`;
    }
}

// Dibuja la tabla de productos paginada
function mostrarPaginaProductos() {
    const tbody = document.getElementById('tabla-productos-admin');
    if (!tbody) return;

    if (adminProductosData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-500">No hay productos registrados.</td></tr>`;
        document.getElementById('paginacion-productos').innerHTML = '';
        return;
    }

    const inicio = (prodPaginaActual - 1) * prodPorPagina;
    const prodPagina = adminProductosData.slice(inicio, inicio + prodPorPagina);
    let html = "";

    prodPagina.forEach(prod => {
        const imagenUrl = `${CLOUD_BASE}${prod.imagen_url}`;
        html += `
            <tr class="hover:bg-[#252830] transition border-b border-gray-800">
                <td class="p-4 text-gray-400 font-medium align-middle">#${prod.idProducto}</td>
                <td class="p-4 align-middle">
                    <div class="w-12 h-12 bg-[#0f1115] rounded flex items-center justify-center p-1 border border-gray-700 shadow-sm">
                        <img src="${imagenUrl}" alt="Img" class="max-w-full max-h-full object-contain">
                    </div>
                </td>
                <td class="p-4 font-bold text-white align-middle">${prod.nombre}</td>
                <td class="p-4 align-middle"><span class="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 font-bold border border-gray-700 tracking-wide uppercase">${prod.categoria}</span></td>
                <td class="p-4 text-[#7ed957] font-extrabold align-middle">$${parseFloat(prod.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="p-4 text-gray-300 font-semibold align-middle">${prod.stock}</td>
                <td class="p-4 text-center space-x-3 align-middle">
                    <button onclick="abrirModalProducto(${prod.idProducto})" class="text-blue-400 hover:text-blue-300 font-semibold transition" title="Editar">✏️ Editar</button>
                    <button onclick="eliminarProducto(${prod.idProducto})" class="text-red-500 hover:text-red-400 font-semibold transition ml-2" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    actualizarPaginacionProductos();
}

// Dibuja los controles de paginación de productos
function actualizarPaginacionProductos() {
    const controles = document.getElementById("paginacion-productos");
    if (!controles) return;

    const total = Math.ceil(adminProductosData.length / prodPorPagina);
    if (total <= 1) {
        controles.innerHTML = "";
        return;
    }

    controles.innerHTML = `
        <div class="flex items-center justify-between px-6 py-3 bg-gray-900 border-t border-gray-800 rounded-b-2xl">
            <p class="text-sm text-gray-400">Mostrando ${(prodPaginaActual - 1) * prodPorPagina + 1} a ${Math.min(prodPaginaActual * prodPorPagina, adminProductosData.length)} de ${adminProductosData.length}</p>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm">
                <button onclick="cambiarPaginaProductos('anterior')" ${prodPaginaActual === 1 ? "disabled" : ""} class="px-4 py-2 rounded-l-md border border-gray-700 bg-[#1a1c20] text-sm text-gray-400 hover:bg-gray-800 ${prodPaginaActual === 1 ? "opacity-50 cursor-not-allowed" : ""}">Anterior</button>
                <span class="px-4 py-2 border-t border-b border-gray-700 bg-[#0f1115] text-gray-200 text-sm">Página ${prodPaginaActual} de ${total}</span>
                <button onclick="cambiarPaginaProductos('siguiente')" ${prodPaginaActual === total ? "disabled" : ""} class="px-4 py-2 rounded-r-md border border-gray-700 bg-[#1a1c20] text-sm text-gray-400 hover:bg-gray-800 ${prodPaginaActual === total ? "opacity-50 cursor-not-allowed" : ""}">Siguiente</button>
            </nav>
        </div>`;
}

window.cambiarPaginaProductos = function (dir) {
    const total = Math.ceil(adminProductosData.length / prodPorPagina);
    if (dir === "siguiente" && prodPaginaActual < total) prodPaginaActual++;
    else if (dir === "anterior" && prodPaginaActual > 1) prodPaginaActual--;
    mostrarPaginaProductos();
};

// Abre la ventana de creación/edición de productos y carga la info
window.abrirModalProducto = function (idProducto = null) {
    const modal = document.getElementById('modal-producto');
    const form = document.getElementById('formulario-producto');
    const titulo = document.getElementById('modal-titulo');
    const inputFile = document.getElementById('admin-imagen-file');
    const contenedorImgActual = document.getElementById('contenedor-imagen-actual');
    const nombreImgActual = document.getElementById('nombre-imagen-actual');

    form.reset();
    inputFile.value = '';

    if (idProducto) {
        const prod = adminProductosData.find(p => p.idProducto === idProducto);
        if (!prod) return mostrarNotificacionAdmin("No se encontró el producto.", "error");

        titulo.innerText = "Editar Producto";
        document.getElementById('admin-id').value = prod.idProducto;
        document.getElementById('admin-nombre').value = prod.nombre;
        document.getElementById('admin-categoria').value = prod.categoria;
        document.getElementById('admin-precio').value = prod.precio;
        document.getElementById('admin-stock').value = prod.stock;
        document.getElementById('admin-descripcion').value = prod.descripcion || '';

        if (prod.imagen_url) {
            contenedorImgActual.classList.remove('hidden');
            nombreImgActual.innerText = prod.imagen_url;
        } else {
            contenedorImgActual.classList.add('hidden');
            nombreImgActual.innerText = '';
        }
    } else {
        titulo.innerText = "Añadir Nuevo Producto";
        document.getElementById('admin-id').value = '';
        contenedorImgActual.classList.add('hidden');
        nombreImgActual.innerText = '';
    }
    modal.classList.remove('hidden');
};

window.cerrarModalProducto = function () {
    document.getElementById('modal-producto').classList.add('hidden');
};

// Guarda o actualiza un producto, subiendo primero la foto a Cloudinary
window.gestionarSubmitProducto = async function (evento) {
    evento.preventDefault();
    const btnGuardar = evento.target.querySelector('button[type="submit"]');
    const textoOriginalBtn = btnGuardar.innerText;
    const id = document.getElementById('admin-id').value;
    const inputFile = document.getElementById('admin-imagen-file');
    let nombreImagenFinal = document.getElementById('nombre-imagen-actual').innerText;

    // 1. CAPTURAR EL PRECIO Y VALIDARLO (Espejo de tus Triggers)
    const precioIngresado = parseFloat(document.getElementById('admin-precio').value);

    if (precioIngresado <= 0) {
        return mostrarNotificacionAdmin("Error: No se permiten productos con precio menor o igual a cero.", "error");
    }

    if (id) {
        const confirmado = await mostrarConfirmacionAdmin("¿Estás seguro de que deseas modificar los datos de este producto?", "advertencia");
        if (!confirmado) return;
    }

    btnGuardar.disabled = true;
    btnGuardar.innerText = "Guardando...";

    try {
        if (inputFile.files.length > 0) {
            btnGuardar.innerText = "Subiendo foto...";
            const formData = new FormData();
            formData.append('file', inputFile.files[0]);
            formData.append('upload_preset', UPLOAD_PRESET);

            const resCloudinary = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME_BASE}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!resCloudinary.ok) throw new Error("Fallo al subir a Cloudinary.");
            const dataCloudinary = await resCloudinary.json();
            nombreImagenFinal = dataCloudinary.secure_url.split('/').pop();
        }

        btnGuardar.innerText = "Guardando...";
        const payload = {
            nombre: document.getElementById('admin-nombre').value,
            categoria: document.getElementById('admin-categoria').value,
            precio: precioIngresado, // Usamos la variable que ya validamos arriba
            stock: parseInt(document.getElementById('admin-stock').value),
            descripcion: document.getElementById('admin-descripcion').value,
            imagen_url: nombreImagenFinal
        };

        if (id) payload.idProducto = parseInt(id);

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${baseUrl}/productos/${id}` : `${baseUrl}/productos`;
        const token = localStorage.getItem('token');
        const headersAEnviar = { 'Content-Type': 'application/json' };
        if (token) headersAEnviar['Authorization'] = `Bearer ${token}`;

        const respuesta = await fetch(url, {
            method: metodo,
            headers: headersAEnviar,
            body: JSON.stringify(payload)
        });

        // 2. MANEJO DE ERRORES DEL TRIGGER DESDE EL BACKEND
        // Si por alguna razón el usuario se salta la validación de JS (ej. usando Postman),
        // el trigger de la base de datos se activará y el backend nos devolverá un error.
        if (!respuesta.ok) {
            const dataError = await respuesta.json().catch(() => ({}));
            throw new Error(dataError.message || dataError.error || "Error al guardar el producto");
        }

        mostrarNotificacionAdmin(`Producto ${id ? 'actualizado' : 'creado'} con éxito`, 'exito');
        cerrarModalProducto();
        cargarTablaAdminProductos();
    } catch (error) {
        mostrarNotificacionAdmin(error.message, "error");
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerText = textoOriginalBtn;
    }
};

// Borra un producto del catálogo
window.eliminarProducto = async function (id) {
    const confirmado = await mostrarConfirmacionAdmin("¿Estás seguro de que deseas ELIMINAR este producto? Esta acción lo borrará permanentemente del catálogo.", "peligro");
    if (!confirmado) return;

    try {
        const token = localStorage.getItem('token');
        const headersAEnviar = {};
        if (token) headersAEnviar['Authorization'] = `Bearer ${token}`;

        const respuesta = await fetch(`${baseUrl}/productos/${id}`, {
            method: 'DELETE',
            headers: headersAEnviar
        });

        if (!respuesta.ok) throw new Error("Error al eliminar el producto");

        mostrarNotificacionAdmin("Producto eliminado correctamente", "exito");
        cargarTablaAdminProductos();
    } catch (error) {
        mostrarNotificacionAdmin(error.message, "error");
    }
};


// ==========================================
// MÓDULO 7: GESTIÓN DE PERSONAL
// ==========================================
let personalGlobal = [];
let rolesGlobales = [];

// API Especial para autocompletar la dirección de un empleado con su Código Postal
function inicializarSepomex() {
    const inputCP = document.getElementById('emp-cp');
    if (inputCP) {
        inputCP.addEventListener('input', async (e) => {
            const cp = e.target.value.trim();
            if (cp.length === 5) {
                mostrarNotificacionAdmin("Buscando código postal...", "exito");
                try {
                    const respuesta = await fetch(`https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${cp}`);
                    const datos = await respuesta.json();
                    const lugares = datos.zip_codes;

                    if (!lugares || lugares.length === 0) throw new Error("C.P. no encontrado");

                    document.getElementById('emp-estado').value = lugares[0].d_estado;
                    document.getElementById('emp-municipio').value = lugares[0].d_mnpio;

                    const contenedorasentamiento = document.getElementById('contenedor-asentamiento');
                    let selectHtml = `<select id="emp-asentamiento" required class="w-full bg-[#0f1115] border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-[#7ed957]">`;
                    selectHtml += `<option value="" disabled selected>Selecciona un asentamiento...</option>`;
                    lugares.forEach(lugar => selectHtml += `<option value="${lugar.d_asenta}">${lugar.d_asenta}</option>`);
                    selectHtml += `</select>`;
                    contenedorasentamiento.innerHTML = selectHtml;

                } catch (error) {
                    mostrarNotificacionAdmin("C.P. no válido o no encontrado", "error");
                }
            }
        });
    }
}

// Descarga a todo el equipo y sus roles
async function iniciarModuloPersonal() {
    const contenedor = document.getElementById("lista-personal");
    if (!contenedor) return;

    try {
        contenedor.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">⏳ Cargando personal...</td></tr>`;

        const [resRoles, resPersonal] = await Promise.all([
            fetch(`${baseUrl}/roles`),
            fetch(`${baseUrl}/trabajadores`)
        ]);

        if (!resRoles.ok || !resPersonal.ok) throw new Error("Error al cargar las APIs");

        rolesGlobales = await resRoles.json();
        personalGlobal = await resPersonal.json();
        mostrarListaPersonal();
    } catch (error) {
        contenedor.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-red-500">❌ Error al conectar con la base de datos de personal.</td></tr>`;
    }
}

// Dibuja la tabla del personal (Protege visualmente a los administradores)
function mostrarListaPersonal() {
    const contenedor = document.getElementById("lista-personal");
    if (!contenedor) return;

    if (personalGlobal.length === 0) {
        contenedor.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">No hay personal registrado.</td></tr>`;
        return;
    }

    const mapaRoles = {};
    rolesGlobales.forEach(rol => mapaRoles[rol.idRol || rol.id] = rol.nombreRol || rol.nombre || "Desconocido");

    let html = "";
    personalGlobal.forEach((emp) => {
        const idEmp = emp.idTrabajador || emp.id || emp.idEmpleado;
        const nombreRol = mapaRoles[emp.idRol] || "Sin Rol";
        const correo = emp.email || emp.correo || "Sin correo";
        const tel = emp.telefono || "Sin teléfono";

        let colorRol = "bg-gray-900 text-gray-300 border-gray-700";
        let esAdmin = false;

        if (nombreRol.toLowerCase().includes("admin")) {
            colorRol = "bg-green-900 text-green-300 border-green-700";
            esAdmin = true;
        } else if (nombreRol.toLowerCase().includes("recep")) {
            colorRol = "bg-purple-900 text-purple-300 border-purple-700";
        } else if (nombreRol.toLowerCase().includes("téc") || nombreRol.toLowerCase().includes("tec")) {
            colorRol = "bg-blue-900 text-blue-300 border-blue-700";
        }

        let botonesAccion = esAdmin
            ? `<span class="text-gray-600 text-sm font-semibold flex items-center justify-end gap-1 cursor-not-allowed select-none" title="Cuenta de administrador protegida">🔒 Protegido</span>`
            : `<button onclick="abrirModalPersonal(${idEmp})" class="text-blue-400 hover:text-blue-300 transition font-semibold">Editar</button>
               <button onclick="confirmarEliminacionPersonal(${idEmp})" class="text-red-500 hover:text-red-400 transition font-semibold ml-3">Eliminar</button>`;

        html += `
            <tr class="hover:bg-[#1a1a1a] transition duration-200">
                <td class="p-4 align-top">
                    <strong class="text-white text-base block">${emp.nombre} ${emp.aPaterno} ${emp.aMaterno || ''}</strong>
                    <span class="text-gray-500 text-xs mt-1">ID: ${idEmp}</span>
                </td>
                <td class="p-4 align-top"><span class="${colorRol} border py-1 px-3 rounded-full text-xs font-bold tracking-wide">${nombreRol}</span></td>
                <td class="p-4 text-gray-300 align-top">
                    <div class="mb-1">✉️ ${correo}</div>
                    <div>📞 ${tel}</div>
                </td>
                <td class="p-4 text-right align-top">${botonesAccion}</td>
            </tr>
        `;
    });
    contenedor.innerHTML = html;
}

// Ventana flotante para agregar o editar a un empleado
window.abrirModalPersonal = async function (id = null) {
    const modal = document.getElementById("modal-personal");
    const form = document.getElementById("formulario-personal");
    if (!modal) return;
    if (form) form.reset();

    document.getElementById('contenedor-asentamiento').innerHTML = `<input type="text" id="emp-asentamiento" required placeholder="Escribe el C.P. primero" readonly class="w-full bg-[#1a1c20] border border-gray-700 text-gray-400 px-4 py-2 rounded focus:outline-none cursor-not-allowed">`;

    if (id) {
        const emp = personalGlobal.find(e => (e.idTrabajador || e.id || e.idEmpleado) == id);
        if (emp) {
            document.getElementById('emp-id').value = id;
            document.getElementById('emp-nombre').value = emp.nombre;
            document.getElementById('emp-ap-paterno').value = emp.aPaterno;
            document.getElementById('emp-ap-materno').value = emp.aMaterno || '';
            document.getElementById('emp-rol').value = emp.idRol;
            document.getElementById('emp-telefono').value = emp.telefono || '';
            document.getElementById('emp-calle').value = emp.calle || emp.direccion || '';

            if (emp.email) document.getElementById('emp-email-user').value = emp.email.split('@')[0];

            document.getElementById('emp-cp').value = emp.CPostal || '';
            document.getElementById('emp-estado').value = emp.estado || '';
            document.getElementById('emp-municipio').value = emp.municipio || '';

            if (emp.CPostal && String(emp.CPostal).length === 5) {
                try {
                    const res = await fetch(`https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${emp.CPostal}`);
                    const datos = await res.json();
                    if (datos.zip_codes && datos.zip_codes.length > 0) {
                        let selectHtml = `<select id="emp-asentamiento" required class="w-full bg-[#0f1115] border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-[#7ed957]">`;
                        datos.zip_codes.forEach(lugar => {
                            const seleccionado = (lugar.d_asenta === emp.asentamiento) ? 'selected' : '';
                            selectHtml += `<option value="${lugar.d_asenta}" ${seleccionado}>${lugar.d_asenta}</option>`;
                        });
                        selectHtml += `</select>`;
                        document.getElementById('contenedor-asentamiento').innerHTML = selectHtml;
                    }
                } catch (e) { }
            }
        }
    } else {
        document.getElementById('emp-id').value = '';
    }
    modal.classList.remove("hidden");
};

window.cerrarModalPersonal = function () {
    const modal = document.getElementById("modal-personal");
    if (modal) modal.classList.add("hidden");
};

// Crea o modifica a un empleado en la base de datos
window.guardarEmpleado = async function (evento) {
    evento.preventDefault();

    const idEmp = document.getElementById('emp-id').value;
    const emailUsuario = document.getElementById('emp-email-user').value.trim();
    const password = document.getElementById('emp-password').value;

    if (!idEmp && !password) return mostrarNotificacionAdmin("La contraseña es obligatoria para un nuevo empleado", "error");

    if (idEmp) {
        const confirmado = await mostrarConfirmacionAdmin("¿Estás seguro de que deseas modificar los datos y accesos de este empleado?", "advertencia");
        if (!confirmado) return;
    }

    const btnSubmit = evento.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = "⏳ Guardando...";
    btnSubmit.disabled = true;

    const datosTrabajador = {
        nombre: document.getElementById('emp-nombre').value.trim(),
        aPaterno: document.getElementById('emp-ap-paterno').value.trim(),
        aMaterno: document.getElementById('emp-ap-materno').value.trim(),
        idRol: document.getElementById('emp-rol').value,
        email: `${emailUsuario}@pcextreme.com`,
        telefono: document.getElementById('emp-telefono').value.trim(),
        CPostal: document.getElementById('emp-cp').value.trim(),
        estado: document.getElementById('emp-estado').value.trim(),
        municipio: document.getElementById('emp-municipio').value.trim(),
        asentamiento: document.getElementById('emp-asentamiento').value.trim(),
        calle: document.getElementById('emp-calle').value.trim()
    };

    if (password) datosTrabajador.password = password;

    try {
        let url = idEmp ? `${baseUrl}/trabajadores/${idEmp}` : `${baseUrl}/trabajadores`;
        let method = idEmp ? 'PUT' : 'POST';
        const token = localStorage.getItem('token');

        const respuesta = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datosTrabajador)
        });

        if (!respuesta.ok) throw new Error("Error al guardar el empleado");

        mostrarNotificacionAdmin(`Empleado ${idEmp ? 'actualizado' : 'registrado'} correctamente`, 'exito');
        cerrarModalPersonal();
        iniciarModuloPersonal();

    } catch (error) {
        mostrarNotificacionAdmin(error.message, "error");
    } finally {
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
};

window.confirmarEliminacionPersonal = async function (id) {
    const confirmado = await mostrarConfirmacionAdmin("¿Estás seguro de que deseas ELIMINAR a este empleado?<br><br>Esta acción no se puede deshacer y perderá su acceso al sistema.", "peligro");

    if (confirmado) {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`${baseUrl}/trabajadores/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!respuesta.ok) throw new Error("Error al eliminar el empleado");
            mostrarNotificacionAdmin("Empleado eliminado correctamente", "exito");
            iniciarModuloPersonal();
        } catch (error) {
            mostrarNotificacionAdmin(error.message, "error");
        }
    }
};

// ==========================================
// MÓDULO 8: GESTOR WEB (PORTADA, NOSOTROS, CONTACTO)
// ==========================================
// Permite modificar el texto, fotos e información de la página pública del cliente

window.abrirPestana = function (evento, nombrePestana) {
    const contenidos = document.querySelectorAll(".contenido-pestana");
    contenidos.forEach(c => c.classList.replace("block", "hidden"));

    const botones = document.querySelectorAll(".boton-pestana");
    botones.forEach(b => {
        b.classList.remove("text-[#7ed957]", "border-[#7ed957]");
        b.classList.add("text-gray-500", "border-transparent");
    });

    const pestanaDestino = document.getElementById(nombrePestana);
    if (pestanaDestino) pestanaDestino.classList.replace("hidden", "block");

    const botonActual = evento.currentTarget;
    botonActual.classList.remove("text-gray-500", "border-transparent");
    botonActual.classList.add("text-[#7ed957]", "border-[#7ed957]");
};

// 1. FUNCION AUXILIAR CLOUDINARY 
async function subirACloudinaryWeb(archivo) {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", PRESET_WEB);

    // Usamos auto/upload para que acepte tanto imágenes (Nosotros) como Videos (Portada)
    const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME_WEB}/auto/upload`, {
        method: "POST",
        body: formData,
    });

    if (!respuesta.ok) throw new Error("Error al subir el archivo a Cloudinary");

    const data = await respuesta.json();
    // Extraemos SOLO el nombre del archivo generado, igual que en Productos
    return data.secure_url.split('/').pop();
}

// --- PORTADA (INICIO) ---
async function iniciarModuloWeb() {
    const formPortada = document.getElementById("formulario-portada");
    if (!formPortada) return;

    try {
        const respuesta = await fetch(`${baseUrl}/inicio`);
        if (!respuesta.ok) throw new Error("Error al cargar la información");
        const datos = await respuesta.json();

        if (datos && datos.length > 0) {
            const portada = datos[0];
            document.getElementById("input-titulo-portada").value = portada.titulo || "";
            document.getElementById("input-desc-portada").value = portada.descripcion || "";
            document.getElementById("input-boton-portada").value = portada.texto_boton || "";

            // ¡LÓGICA DE PRODUCTOS! Inyectamos los nombres actuales en los inputs ocultos
            document.getElementById("portada-video-actual").value = portada.video_url || "";
            document.getElementById("portada-imagen-actual").value = portada.imagen_fondo || "";
        }
    } catch (error) { }
}

window.guardarPortada = async function (evento) {
    evento.preventDefault();
    const boton = evento.target.querySelector('button[type="submit"]');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = "Subiendo archivos y guardando...";
    boton.disabled = true;

    // Rescatamos los nombres de los archivos desde los inputs ocultos
    let videoFinal = document.getElementById("portada-video-actual").value;
    let imagenFinal = document.getElementById("portada-imagen-actual").value;

    try {
        const inputVideo = document.getElementById("input-video-portada");
        const inputImagen = document.getElementById("input-imagen-portada");

        if (inputVideo && inputVideo.files.length > 0) {
            videoFinal = await subirACloudinaryWeb(inputVideo.files[0]);
        }
        if (inputImagen && inputImagen.files.length > 0) {
            imagenFinal = await subirACloudinaryWeb(inputImagen.files[0]);
        }

        const datosParaBD = {
            titulo: document.getElementById("input-titulo-portada").value,
            descripcion: document.getElementById("input-desc-portada").value,
            texto_boton: document.getElementById("input-boton-portada").value,
            video_url: videoFinal,
            imagen_fondo: imagenFinal
        };

        const respuesta = await fetch(`${baseUrl}/inicio/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosParaBD),
        });

        if (!respuesta.ok) throw new Error("Error al actualizar la base de datos");

        if (inputVideo) inputVideo.value = "";
        if (inputImagen) inputImagen.value = "";

        document.getElementById("portada-video-actual").value = videoFinal;
        document.getElementById("portada-imagen-actual").value = imagenFinal;

        mostrarNotificacionAdmin("¡Portada actualizada correctamente con éxito!", "exito");
    } catch (error) {
        mostrarNotificacionAdmin("Hubo un error: " + error.message, "error");
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
};

// --- SOBRE NOSOTROS ---
let nosotrosGlobales = [];

window.cargarPestanaNosotros = async function (evento, nombrePestana) {
    if (evento && nombrePestana) abrirPestana(evento, nombrePestana);
    const contenedor = document.getElementById("lista-nosotros");
    if (!contenedor) return;

    try {
        contenedor.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-500">⏳ Cargando información...</td></tr>`;
        const respuesta = await fetch(`${baseUrl}/nosotros`);
        if (!respuesta.ok) throw new Error("Error de conexión");

        nosotrosGlobales = await respuesta.json();
        if (nosotrosGlobales.length === 0) {
            contenedor.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-500">No hay secciones registradas.</td></tr>`;
            return;
        }

        let html = "";
        nosotrosGlobales.forEach((item) => {
            // 1. CORRECCIÓN: Usar la base de Cloudinary (CLOUD_BASE)
            let imagenSegura = item.imagen || item.imagen_url || "https://via.placeholder.com/150?text=Sin+Imagen";
            if (imagenSegura && !imagenSegura.startsWith('http')) {
                imagenSegura = `${CLOUD_BASE}${imagenSegura}`;
            }

            html += `
                <tr class="hover:bg-[#252830] transition duration-200 border-b border-gray-800">
                    <td class="p-4 align-top w-24">
                        <img src="${imagenSegura}" alt="${item.titulo}" class="w-20 h-16 object-cover rounded shadow-sm border border-gray-700">
                    </td>
                    <td class="p-4 align-top">
                        <strong class="text-gray-200 text-sm md:text-base block">${item.titulo}</strong>
                    </td>
                    <td class="p-4 align-middle text-center w-24">
                        <button onclick="abrirModalEditarNosotros('${item.idInfo || item.id}')" class="bg-[#3f51b5] hover:bg-blue-800 text-white font-bold py-2 px-4 rounded text-xs tracking-wider transition shadow-sm">
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        });
        contenedor.innerHTML = html;
    } catch (error) {
        contenedor.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-red-500">❌ Error al conectar con el servidor.</td></tr>`;
    }
};

window.abrirModalEditarNosotros = function (idBuscado) {
    const item = nosotrosGlobales.find(n => String(n.idInfo || n.id) === String(idBuscado));
    if (!item) return;

    document.getElementById("edit-id-nosotros").value = idBuscado;
    document.getElementById("titulo-editando").innerText = "Editando: " + item.titulo;
    document.getElementById("edit-titulo-nosotros").value = item.titulo;
    document.getElementById("edit-desc-nosotros").value = item.descripcion;

    const nombreImagenBD = item.imagen || item.imagen_url || "";
    document.getElementById("edit-imagen-actual-nosotros").value = nombreImagenBD;

    let imagenSegura = `https://res.cloudinary.com/${CLOUD_NAME_WEB}/image/upload/${nombreImagenBD}`;

    const imgPreview = document.getElementById("edit-preview-nosotros");
    if (imgPreview) imgPreview.src = imagenSegura;

    document.getElementById("edit-img-nosotros").value = "";

    const panelEdicion = document.getElementById("panel-edicion-nosotros");
    if (panelEdicion) panelEdicion.classList.remove("hidden");
};

window.guardarEdicionNosotros = async function (evento) {
    evento.preventDefault();
    const boton = evento.target.querySelector('button[type="submit"]');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = "Guardando...";
    boton.disabled = true;

    const id = document.getElementById("edit-id-nosotros").value;

    let imagenFinal = document.getElementById("edit-imagen-actual-nosotros").value;

    try {
        const inputImagen = document.getElementById("edit-img-nosotros");

        if (inputImagen.files.length > 0) {
            imagenFinal = await subirACloudinaryWeb(inputImagen.files[0]);
        }

        const datosBD = {
            titulo: document.getElementById("edit-titulo-nosotros").value,
            descripcion: document.getElementById("edit-desc-nosotros").value,
            imagen: imagenFinal,
            imagen_url: imagenFinal
        };

        const respuesta = await fetch(`${baseUrl}/nosotros/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosBD)
        });
        if (!respuesta.ok) throw new Error("Error al actualizar");

        mostrarNotificacionAdmin("¡Sección actualizada correctamente!", "exito");
        cerrarEdicionNosotros();
        cargarPestanaNosotros();
    } catch (error) {
        mostrarNotificacionAdmin("Ocurrió un error al guardar los cambios.", "error");
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
};
// --- CONTACTO ---
window.cargarPestanaContacto = async function (evento, nombrePestana) {
    if (evento && nombrePestana) abrirPestana(evento, nombrePestana);
    try {
        const resContacto = await fetch(`${baseUrl}/contacto`);
        if (!resContacto.ok) return;
        const datosContacto = await resContacto.json();
        if (datosContacto) {
            const contacto = Array.isArray(datosContacto) ? datosContacto[0] : datosContacto;
            document.getElementById("input-email").value = contacto.email || "";
            document.getElementById("input-telefono").value = contacto.telefono || "";
            document.getElementById("input-whatsapp").value = contacto.whatsapp || "";
            document.getElementById("input-direccion").value = contacto.direccion || "";
            document.getElementById("input-mapa").value = contacto.mapa_url || "";
        }
    } catch (error) { }
};

window.guardarContacto = async function (evento) {
    evento.preventDefault();
    const boton = evento.target.querySelector('button[type="submit"]');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = "⏳ Guardando datos...";
    boton.disabled = true;

    const datosContacto = {
        email: document.getElementById("input-email").value,
        telefono: document.getElementById("input-telefono").value,
        whatsapp: document.getElementById("input-whatsapp").value,
        direccion: document.getElementById("input-direccion").value,
        mapa_url: document.getElementById("input-mapa").value,
    };

    try {
        const respuesta = await fetch(`${baseUrl}/contacto/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosContacto),
        });
        if (!respuesta.ok) throw new Error("Error de BD");
        mostrarNotificacionAdmin("¡Datos de contacto y mapa actualizados con éxito!", "exito");
    } catch (error) {
        mostrarNotificacionAdmin("Hubo un error: " + error.message, "error");
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
};
// ==========================================
// MÓDULO 9: DASHBOARD PRINCIPAL
// ==========================================
async function cargarDashboardAdmin() {
    const statProductos = document.getElementById('stat-productos');
    if (!statProductos) return; // Asegura que solo corra en la página correcta

    const token = localStorage.getItem('token');
    const headersSeguros = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Mandamos el token de seguridad
    };

    try {
        // 1. CARGAMOS LOS TOTALES
        const resTotales = await fetch(`${baseUrl}/dashboard/totales`, { headers: headersSeguros });
        if (resTotales.ok) {
            const totales = await resTotales.json();
            // Asegúrate de que las propiedades (total_productos, etc.) coincidan con el alias que le diste en tu SQL de Java/Node
            document.getElementById('stat-productos').innerText = totales.total_productos || 0;
            document.getElementById('stat-clientes').innerText = totales.total_clientes || 0;
            document.getElementById('stat-reparaciones').innerText = totales.total_registros || 0;
        }

        // 2. CARGAMOS LAS ALERTAS DE STOCK BAJO
        const resStock = await fetch(`${baseUrl}/dashboard/bajo-stock`, { headers: headersSeguros });
        if (resStock.ok) {
            const productosBajoStock = await resStock.json();
            const alertaContenedor = document.getElementById('alerta-stock');
            const listaStock = document.getElementById('lista-stock-bajo');

            if (productosBajoStock.length > 0) {
                // Si hay productos con poco stock, mostramos la alerta
                alertaContenedor.classList.remove('hidden');
                listaStock.innerHTML = ''; // Limpiamos la lista

                productosBajoStock.forEach(prod => {
                    listaStock.innerHTML += `
                        <li>
                            <strong class="text-yellow-500">${prod.nombre}</strong> 
                            <span class="text-gray-400 text-xs ml-1">(Quedan: ${prod.stock})</span>
                        </li>
                    `;
                });
            } else {
                // Si todo el stock está bien, ocultamos la caja
                alertaContenedor.classList.add('hidden');
            }
        }

    } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        mostrarNotificacionAdmin("Error al conectar con las estadísticas", "error");
    }
}

// ==========================================
// MÓDULO 10: GESTIÓN DE MENSAJES (CRM DE SOPORTE)
// ==========================================
let mensajesData = [];

// 1. Descargar los mensajes del Backend
async function iniciarModuloMensajes() {
    // Buscamos el cuerpo de la tabla por su etiqueta en HTML
    const tbody = document.querySelector('tbody.divide-y.divide-gray-800');
    if (!tbody) return;

    try {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500 animate-pulse">Cargando buzón...</td></tr>`;

        const respuesta = await fetch(`${baseUrl}/mensajes`);
        if (!respuesta.ok) throw new Error("Error al obtener los mensajes");

        mensajesData = await respuesta.json();
        dibujarTablaMensajes();

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-red-500 font-semibold">Error al cargar el buzón. Revisa la conexión.</td></tr>`;
    }
}

// 2. Dibujar la bandeja de entrada
function dibujarTablaMensajes() {
    const tbody = document.querySelector('tbody.divide-y.divide-gray-800');
    if (!tbody) return;

    tbody.innerHTML = '';

    // ¡Filtro Universitario! Solo mostramos los mensajes ENTRANTES
    const mensajesEntrantes = mensajesData.filter(m => m.tipo_mensaje !== 'SALIENTE');

    if (mensajesEntrantes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500 font-medium">Bandeja de entrada limpia. No hay mensajes.</td></tr>`;
        return;
    }

    let html = '';
    mensajesEntrantes.forEach(msg => {
        const id = msg.idMensaje || msg.id;
        const correo = msg.correo || msg.email || "Sin correo";
        const asunto = msg.asunto || "Sin asunto";
        const contenido = msg.mensaje || msg.contenido || "";

        // Formateo de fecha seguro
        const fechaObj = msg.fecha ? new Date(msg.fecha) : new Date();
        const fecha = fechaObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const hora = fechaObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Etiqueta visual de estado
        const estado = msg.estado_mensaje || "PENDIENTE";
        const colorEstado = estado === 'RESPONDIDO' ? 'text-green-400 border-green-700' : 'text-orange-400 border-orange-700';

        html += `
            <tr class="hover:bg-[#252830] transition-colors duration-200">
                <td class="px-6 py-5 text-gray-500 font-medium align-top">
                    ${fecha} <br><span class="text-xs">${hora}</span>
                    <br><span class="${colorEstado} border py-0.5 px-2 mt-2 inline-block rounded-full text-[9px] font-bold tracking-wide">${estado}</span>
                </td>
                <td class="px-6 py-5 align-top">
                    <div class="text-gray-400 text-xs mt-1"><i class="fas fa-envelope mr-1 text-blue-400"></i> ${correo}</div>
                </td>
                <td class="px-6 py-5 align-top">
                    <div class="text-[#7ed957] font-bold mb-2 text-base">${asunto}</div>
                    <div class="bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-gray-400 leading-relaxed shadow-inner text-xs">
                        ${contenido}
                    </div>
                </td>
                <td class="px-6 py-5 align-top">
                    <div class="flex flex-col space-y-2 items-center">
                        <button onclick="abrirModalRespuesta(${id})" class="w-full max-w-[120px] bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/50 text-[10px] font-bold py-2 px-3 rounded flex items-center justify-center transition shadow-sm">
                            <i class="fas fa-reply mr-2"></i> RESPONDER
                        </button>
                        <button onclick="eliminarMensajeBuzon(${id})" class="w-full max-w-[120px] bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/50 text-[10px] font-bold py-2 px-3 rounded flex items-center justify-center transition shadow-sm">
                            <i class="fas fa-trash-alt mr-2"></i> ELIMINAR
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// 3. Control del Modal
window.abrirModalRespuesta = function (id) {
    const msg = mensajesData.find(m => (m.idMensaje || m.id) === id);
    if (!msg) return;

    document.getElementById('resp-id-mensaje').value = id;
    document.getElementById('resp-correo').value = msg.correo || msg.email;
    document.getElementById('resp-mensaje-original').value = msg.mensaje || msg.contenido;

    document.getElementById('resp-display-correo').innerText = msg.correo || msg.email;
    document.getElementById('resp-texto').value = '';

    document.getElementById('modal-respuesta').classList.remove('hidden');
};

window.cerrarModalRespuesta = function () {
    document.getElementById('modal-respuesta').classList.add('hidden');
};

// 4. El flujo maestro de envío y guardado
window.enviarRespuestaMensaje = async function (evento) {
    evento.preventDefault();

    const btn = evento.target.querySelector('button[type="submit"]');
    const textoBtn = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `Enviando...`;

    const idOriginal = document.getElementById('resp-id-mensaje').value;
    const correoDestino = document.getElementById('resp-correo').value;
    const msjOriginal = document.getElementById('resp-mensaje-original').value;
    const respuestaAdmin = document.getElementById('resp-texto').value;

    const token = localStorage.getItem('token');
    const headersAEnviar = { 'Content-Type': 'application/json' };
    if (token) headersAEnviar['Authorization'] = `Bearer ${token}`;

    try {
        //  Disparar EmailJS 
        const parametrosEmail = {
            correo_cliente: correoDestino,
            mensaje_original: msjOriginal,
            respuesta_admin: respuestaAdmin
        };

        await emailjs.send('service_i4nla5o', 'template_xvh63sq', parametrosEmail);

        //  Guardar la respuesta en DB 
        const payloadRespuesta = {
            correo: "pcextreme@correo.com",
            asunto: "RE: Mensaje del Cliente",
            mensaje: respuestaAdmin,
            tipo_mensaje: "SALIENTE",
            estado_mensaje: "ENVIADO",
            id_mensaje_padre: parseInt(idOriginal)
        };

        await fetch(`${baseUrl}/mensajes`, {
            method: 'POST',
            headers: headersAEnviar,
            body: JSON.stringify(payloadRespuesta)
        });

        //  Marcar el original como RESPONDIDO
        const payloadActualizacion = { estado_mensaje: "RESPONDIDO" };
        await fetch(`${baseUrl}/mensajes/${idOriginal}`, {
            method: 'PUT',
            headers: headersAEnviar,
            body: JSON.stringify(payloadActualizacion)
        });

        mostrarNotificacionAdmin("Respuesta enviada y guardada en historial", "exito");
        cerrarModalRespuesta();
        await iniciarModuloMensajes();

    } catch (error) {
        console.error("Error:", error);
        mostrarNotificacionAdmin("Error al enviar el mensaje", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoBtn;
    }
};

window.eliminarMensajeBuzon = async function (id) {
    const confirmado = await mostrarConfirmacionAdmin("¿Seguro que deseas eliminar este mensaje?", "peligro");
    if (!confirmado) return;

    try {
        const token = localStorage.getItem('token');
        const headersAEnviar = {};
        if (token) headersAEnviar['Authorization'] = `Bearer ${token}`;

        const respuesta = await fetch(`${baseUrl}/mensajes/${id}`, {
            method: 'DELETE',
            headers: headersAEnviar
        });

        if (!respuesta.ok) throw new Error("Error al eliminar");

        mostrarNotificacionAdmin("Mensaje eliminado", "exito");
        await iniciarModuloMensajes();
    } catch (error) {
        mostrarNotificacionAdmin("Error al eliminar el mensaje", "error");
    }
};

// ==========================================
// ARRANQUE DE LA APLICACIÓN
// ==========================================
// Se encarga de arrancar todas las funciones cuando la página carga
document.addEventListener("DOMContentLoaded", () => {
    // Componentes principales
    cargarComponentesAdmin();
    inicializarSepomex();
    inicializarOjoPassword();
    cargarDashboardAdmin();

    // Módulos según la página en la que te encuentres
    iniciarModuloClientes();
    iniciarModuloWeb();
    iniciarModuloPersonal();
    if (document.querySelector('title').innerText.includes('Buzón')) {
        iniciarModuloMensajes();
        const formResp = document.getElementById('formulario-respuesta');
        if (formResp) formResp.addEventListener('submit', enviarRespuestaMensaje);
    }
    if (document.getElementById('tabla-productos-admin')) {
        cargarTablaAdminProductos();
        document.getElementById('formulario-producto').addEventListener('submit', gestionarSubmitProducto);
    }

    if (document.getElementById('lista-reparaciones')) {
        cargarTablaAdminReparaciones();
        document.getElementById('formulario-reparacion').addEventListener('submit', gestionarSubmitReparacion);
    }
});