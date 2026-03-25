// --- CONFIGURACIÓN GLOBAL ---
const baseUrl = "https://app-web-java.vercel.app/api";
const CLOUD_BASE = 'https://res.cloudinary.com/dswljrmnu/image/upload/';
const CLOUD_NAME_BASE = 'dswljrmnu'; 
const UPLOAD_PRESET = 'qgnakwni'; 
const CLOUD_NAME_WEB = "dbkqbazp7";
const PRESET_WEB = "Pc Extreme Web";

// --- UTILIDADES ---
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

function inicializarOjoPassword() {
    const inputPassword = document.getElementById('emp-password');
    const btnOjo = document.getElementById('btn-ver-password');
    if (inputPassword && btnOjo) {
        btnOjo.addEventListener('mouseenter', () => inputPassword.type = 'text');
        btnOjo.addEventListener('mouseleave', () => inputPassword.type = 'password');
    }
}

// --- SESIÓN Y LAYOUT ---
async function cargarComponentesAdmin() {
    try {
        const headerEl = document.getElementById("encabezado-admin");
        if (headerEl) {
            // GET: Componente Header
            const resH = await fetch("/FrontEnd-PCEXTREME/admin/admin_header.html");
            if (resH.ok) {
                headerEl.innerHTML = await resH.text();
                const usuarioStr = localStorage.getItem('usuario');
                if (!usuarioStr) return window.location.replace('../index.html'); 
                
                const usuario = JSON.parse(usuarioStr);
                if (usuario.tipo !== 'trabajador') return window.location.replace('../index.html');

                const nombreAdminEl = document.getElementById('admin-nombre-usuario');
                const rolAdminEl = document.getElementById('admin-nombre-rol');
                if (nombreAdminEl) nombreAdminEl.innerText = usuario.nombre;
                if (rolAdminEl) {
                    const idDelRol = usuario.idRol || usuario.rol;
                    const diccionarioRoles = { "1": "Administrador", "2": "Recepcionista", "3": "Técnico" };
                    rolAdminEl.innerText = diccionarioRoles[String(idDelRol)] || "Empleado";
                }

                const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
                if (btnCerrarSesion) {
                    btnCerrarSesion.addEventListener('click', () => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('usuario');
                        window.location.replace('../index.html'); 
                    });
                }
            }
        }
        const footerEl = document.getElementById("admin-piePagina");
        if (footerEl) {
            // GET: Componente Footer
            const resF = await fetch("/FrontEnd-PCEXTREME/admin/admin_footer.html");
            if (resF.ok) footerEl.innerHTML = await resF.text();
        }
    } catch (error) {
        console.error(error);
    }
}

// --- REPARACIONES ---
let adminReparacionesData = [];
let paginaActualReparaciones = 1;
const itemsPorPaginaReparaciones = 20;

async function cargarTablaAdminReparaciones() {
    const tbody = document.getElementById('lista-reparaciones');
    try {
        // GET: /api/registros
        const respuesta = await fetch(`${baseUrl}/registros`);
        if (!respuesta.ok) throw new Error("Error API Registros");
        adminReparacionesData = await respuesta.json();
        await mostrarPaginaReparaciones();
        renderizarControlesPaginacionReparaciones();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-red-500 font-semibold">Error al cargar la tabla.</td></tr>`;
    }
}

async function mostrarPaginaReparaciones() {
    const tbody = document.getElementById('lista-reparaciones');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500 animate-pulse">Consultando APIs...</td></tr>`;

    if(adminReparacionesData.length === 0) {
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
            // GET: /api/clientes/:id
            promesaCliente = fetch(`${baseUrl}/clientes/${idClienteFk}`).then(res => res.ok ? res.json() : null).catch(() => null);
        }
        if (idDispositivoFk) {
            // GET: /api/dispositivos/:id
            promesaDispositivo = fetch(`${baseUrl}/dispositivos/${idDispositivoFk}`).then(res => res.ok ? res.json() : null).catch(() => null);
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

        let colorEstado = 'bg-gray-900 text-gray-400 border-gray-700'; 
        if (estado === 'Entregado') colorEstado = 'bg-green-900/40 text-green-400 border-green-800';
        else if (estado === 'Listo para entregar') colorEstado = 'bg-blue-900/40 text-blue-400 border-blue-800';
        else if (estado === 'En Reparación') colorEstado = 'bg-yellow-900/40 text-yellow-500 border-yellow-800';
        else if (estado === 'En Diagnóstico') colorEstado = 'bg-orange-900/40 text-orange-400 border-orange-800';
        else if (estado === 'Sin Reparación') colorEstado = 'bg-red-900/40 text-red-400 border-red-800';

        return `
            <tr class="hover:bg-[#252830] transition border-b border-gray-800">
                <td class="p-4 text-gray-400 font-medium">#${idRegistro}</td>
                <td class="p-4 font-semibold text-gray-200">${nombreCompleto}</td>
                <td class="p-4 text-gray-400">${nombreEquipo}</td>
                <td class="p-4 text-gray-400 text-sm truncate max-w-xs" title="${falla}">${falla}</td>
                <td class="p-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold border ${colorEstado}">${estado}</span>
                </td>
                <td class="p-4 text-center">
                    <button onclick="abrirModalReparacion(${idRegistro})" class="bg-[#3f51b5] hover:bg-blue-600 text-white font-bold transition mx-auto px-4 py-2 rounded shadow-sm text-xs tracking-wider">Editar</button>
                </td>
            </tr>
        `;
    });

    const filasHtmlArray = await Promise.all(promesasDeFilas);
    tbody.innerHTML = filasHtmlArray.join('');
}

function renderizarControlesPaginacionReparaciones() {
    const contenedor = document.getElementById('controles-paginacion-reparaciones');
    if(!contenedor) return;
    const totalPaginas = Math.ceil(adminReparacionesData.length / itemsPorPaginaReparaciones);
    contenedor.innerHTML = ''; 
    if (totalPaginas <= 1) return; 

    const btnAnteriorDisabled = paginaActualReparaciones === 1 ? 'opacity-50 cursor-not-allowed bg-[#1a1c20]' : 'bg-[#1a1c20] hover:bg-[#252830] hover:text-white';
    const btnSiguienteDisabled = paginaActualReparaciones === totalPaginas ? 'opacity-50 cursor-not-allowed bg-[#1a1c20]' : 'bg-[#1a1c20] hover:bg-[#252830] hover:text-white';

    contenedor.innerHTML = `
        <button onclick="cambiarPaginaReparaciones(-1)" class="px-4 py-2 text-sm font-semibold text-gray-400 border border-gray-700 rounded-lg transition shadow-sm ${btnAnteriorDisabled}" ${paginaActualReparaciones === 1 ? 'disabled' : ''}>← Anterior</button>
        <span class="text-sm font-semibold text-gray-400">Página <span class="text-[#7ed957] font-bold">${paginaActualReparaciones}</span> de <span class="text-white">${totalPaginas}</span></span>
        <button onclick="cambiarPaginaReparaciones(1)" class="px-4 py-2 text-sm font-semibold text-gray-400 border border-gray-700 rounded-lg transition shadow-sm ${btnSiguienteDisabled}" ${paginaActualReparaciones === totalPaginas ? 'disabled' : ''}>Siguiente →</button>
    `;
}

window.cambiarPaginaReparaciones = async function(direccion) {
    const totalPaginas = Math.ceil(adminReparacionesData.length / itemsPorPaginaReparaciones);
    const nuevaPagina = paginaActualReparaciones + direccion;
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActualReparaciones = nuevaPagina;
        await mostrarPaginaReparaciones();          
        renderizarControlesPaginacionReparaciones();   
    }
};

window.abrirModalReparacion = function(idRegistroBuscado) {
    const modal = document.getElementById('modal-reparacion');
    const reg = adminReparacionesData.find(r => String(r.idFolio) === String(idRegistroBuscado));
    if (!reg) return mostrarNotificacionAdmin("No se encontró el registro.", "error");

    document.getElementById('modal-folio-display').innerText = idRegistroBuscado;
    document.getElementById('info-cliente').innerText = reg.nombreClienteMapeado || "Desconocido";
    document.getElementById('info-equipo').innerText = reg.nombreEquipoMapeado || "Equipo sin definir";
    document.getElementById('admin-reparacion-id').value = idRegistroBuscado;
    document.getElementById('admin-estado-reparacion').value = reg.estadoEquipo || 'En Diagnóstico'; 
    modal.classList.remove('hidden');
};

window.cerrarModalReparacion = function() {
    document.getElementById('modal-reparacion').classList.add('hidden');
};

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
        const reg = adminReparacionesData.find(r => String(r.idFolio) === String(id));
        const payload = {
            ...reg,
            estadoEquipo: nuevoEstado,
            idCliente: reg.idCliente || (reg.cliente ? reg.cliente.idCliente : null),
            idDispositivo: reg.idDispositivo || (reg.dispositivo ? reg.dispositivo.idDispositivo : null)
        };

        const token = localStorage.getItem('token');
        const headersAEnviar = { 'Content-Type': 'application/json' };
        if (token) headersAEnviar['Authorization'] = `Bearer ${token}`;

        // PUT: /api/registros/:id
        const respuesta = await fetch(`${baseUrl}/registros/${id}`, {
            method: 'PUT',
            headers: headersAEnviar,
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json().catch(() => ({})); 
            throw new Error(errorData.message || errorData.error || `Error: ${respuesta.status}`);
        }

        // POST: API EmailJS
        if (quiereNotificar && reg.correoClienteMapeado) {
            await emailjs.send('service_i4nla5o', 'template_6ltorks', {
                correo_destino: reg.correoClienteMapeado,
                nombre_cliente: document.getElementById('info-cliente').innerText,
                equipo: document.getElementById('info-equipo').innerText,
                nuevo_estado: nuevoEstado
            });
            mostrarNotificacionAdmin(`Actualizado. Correo enviado al cliente.`, "exito");
        } else {
            mostrarNotificacionAdmin(`Estado actualizado a "${nuevoEstado}".`, "exito");
        }

        cerrarModalReparacion();
        await cargarTablaAdminReparaciones(); 
    } catch (error) {
        mostrarNotificacionAdmin("Error al actualizar: " + error.message, "error");
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.classList.remove('opacity-70', 'cursor-not-allowed');
        btnGuardar.innerText = textoOriginalBtn;
    }
}

// --- CLIENTES ---
let cliGlobales = [];
let cliFiltrados = [];
let cliPaginaActual = 1;
const cliPorPagina = 20;

async function iniciarModuloClientes() {
    const contenedor = document.getElementById("lista-clientes");
    try {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Cargando...</td></tr>`;
        // GET: /api/clientes
        const respuesta = await fetch(`${baseUrl}/clientes`);
        if (!respuesta.ok) throw new Error("Error API");

        cliGlobales = await respuesta.json();
        cliFiltrados = [...cliGlobales];
        cliPaginaActual = 1;
        mostrarPaginaClientes();

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
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error en API Clientes.</td></tr>`;
    }
}

function mostrarPaginaClientes() {
    const contenedor = document.getElementById("lista-clientes");
    if (cliFiltrados.length === 0) {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Sin resultados.</td></tr>`;
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
                <td class="px-6 py-5 text-sm text-gray-400 max-w-xs align-top">${cli.direccion || "Sin dirección"}</td>
                <td class="px-6 py-5 text-center align-top">
                    <a href="${whatsappLink}" target="_blank" class="inline-flex items-center bg-[#25D366] hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition"><i class="fa-brands fa-whatsapp mr-2 text-lg"></i> Chat</a>
                </td>
            </tr>
        `;
    });
    contenedor.innerHTML = html;
    actualizarPaginacionClientes();
}

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
    if (total <= 1) return controles.innerHTML = "";

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

// --- PRODUCTOS ---
let adminProductosData = [];
let prodPaginaActual = 1;
const prodPorPagina = 20;

async function cargarTablaAdminProductos() {
    const tbody = document.getElementById('tabla-productos-admin');
    try {
        // GET: /api/productos
        const respuesta = await fetch(`${baseUrl}/productos`);
        if (!respuesta.ok) throw new Error("Error API");
        adminProductosData = await respuesta.json();
        prodPaginaActual = 1;
        mostrarPaginaProductos();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-red-500">Error al cargar productos.</td></tr>`;
    }
}

function mostrarPaginaProductos() {
    const tbody = document.getElementById('tabla-productos-admin');
    if(adminProductosData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-500">Catálogo vacío.</td></tr>`;
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
                        <img src="${imagenUrl}" class="max-w-full max-h-full object-contain">
                    </div>
                </td>
                <td class="p-4 font-bold text-white align-middle">${prod.nombre}</td>
                <td class="p-4 align-middle"><span class="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 font-bold border border-gray-700 uppercase">${prod.categoria}</span></td>
                <td class="p-4 text-[#7ed957] font-extrabold align-middle">$${parseFloat(prod.precio).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="p-4 text-gray-300 font-semibold align-middle">${prod.stock}</td>
                <td class="p-4 text-center space-x-3 align-middle">
                    <button onclick="abrirModalProducto(${prod.idProducto})" class="text-blue-400 hover:text-blue-300 font-semibold transition">✏️ Editar</button>
                    <button onclick="eliminarProducto(${prod.idProducto})" class="text-red-500 hover:text-red-400 font-semibold transition ml-2">🗑️</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
    actualizarPaginacionProductos();
}

function actualizarPaginacionProductos() {
    const controles = document.getElementById("paginacion-productos");
    const total = Math.ceil(adminProductosData.length / prodPorPagina);
    if (total <= 1) return controles.innerHTML = "";

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

window.abrirModalProducto = function(idProducto = null) {
    const modal = document.getElementById('modal-producto');
    const form = document.getElementById('formulario-producto');
    const contenedorImgActual = document.getElementById('contenedor-imagen-actual');
    const nombreImgActual = document.getElementById('nombre-imagen-actual');

    form.reset(); 
    document.getElementById('admin-imagen-file').value = ''; 

    if (idProducto) {
        const prod = adminProductosData.find(p => p.idProducto === idProducto);
        document.getElementById('modal-titulo').innerText = "Editar Producto";
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
        document.getElementById('modal-titulo').innerText = "Añadir Nuevo Producto";
        document.getElementById('admin-id').value = '';
        contenedorImgActual.classList.add('hidden');
        nombreImgActual.innerText = '';
    }
    modal.classList.remove('hidden');
};

window.cerrarModalProducto = function() {
    document.getElementById('modal-producto').classList.add('hidden');
};

window.gestionarSubmitProducto = async function(evento) {
    evento.preventDefault();
    const btnGuardar = evento.target.querySelector('button[type="submit"]');
    const textoOriginalBtn = btnGuardar.innerText;
    const id = document.getElementById('admin-id').value;
    const inputFile = document.getElementById('admin-imagen-file');
    let nombreImagenFinal = document.getElementById('nombre-imagen-actual').innerText;
    const precioIngresado = parseFloat(document.getElementById('admin-precio').value);
    
    if (precioIngresado <= 0) return mostrarNotificacionAdmin("Precio inválido.", "error");
    if (id) {
        const confirmado = await mostrarConfirmacionAdmin("¿Modificar producto?", "advertencia");
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
            
            // POST: Cloudinary API
            const resCloudinary = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME_BASE}/image/upload`, { method: 'POST', body: formData });
            if (!resCloudinary.ok) throw new Error("Fallo en Cloudinary.");
            const dataCloudinary = await resCloudinary.json();
            nombreImagenFinal = dataCloudinary.secure_url.split('/').pop(); 
        }

        btnGuardar.innerText = "Guardando...";
        const payload = {
            nombre: document.getElementById('admin-nombre').value,
            categoria: document.getElementById('admin-categoria').value,
            precio: precioIngresado,
            stock: parseInt(document.getElementById('admin-stock').value),
            descripcion: document.getElementById('admin-descripcion').value,
            imagen_url: nombreImagenFinal 
        };
        if (id) payload.idProducto = parseInt(id); 

        const token = localStorage.getItem('token');
        const headersAEnviar = { 'Content-Type': 'application/json' };
        if (token) headersAEnviar['Authorization'] = `Bearer ${token}`;

        // POST/PUT: /api/productos/:id
        const respuesta = await fetch(id ? `${baseUrl}/productos/${id}` : `${baseUrl}/productos`, {
            method: id ? 'PUT' : 'POST',
            headers: headersAEnviar,
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) {
            const dataError = await respuesta.json().catch(() => ({}));
            throw new Error(dataError.message || dataError.error || "Error de API");
        }

        mostrarNotificacionAdmin(`Producto guardado`, 'exito');
        cerrarModalProducto();
        cargarTablaAdminProductos(); 
    } catch (error) {
        mostrarNotificacionAdmin(error.message, "error");
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerText = textoOriginalBtn;
    }
};

window.eliminarProducto = async function(id) {
    const confirmado = await mostrarConfirmacionAdmin("¿ELIMINAR este producto?", "peligro");
    if(!confirmado) return;

    try {
        const token = localStorage.getItem('token');
        // DELETE: /api/productos/:id
        const respuesta = await fetch(`${baseUrl}/productos/${id}`, { 
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!respuesta.ok) throw new Error("Error API");
        mostrarNotificacionAdmin("Producto eliminado", "exito");
        cargarTablaAdminProductos(); 
    } catch (error) {
        mostrarNotificacionAdmin(error.message, "error");
    }
};

// --- PERSONAL ---
let personalGlobal = [];
let rolesGlobales = [];

function inicializarSepomex() {
    const inputCP = document.getElementById('emp-cp');
    if (inputCP) {
        inputCP.addEventListener('input', async (e) => {
            const cp = e.target.value.trim();
            if (cp.length === 5) {
                try {
                    // GET: API Externa SEPOMEX
                    const respuesta = await fetch(`https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${cp}`);
                    const datos = await respuesta.json();
                    const lugares = datos.zip_codes;
                    if (!lugares || lugares.length === 0) throw new Error("C.P. no encontrado");

                    document.getElementById('emp-estado').value = lugares[0].d_estado;
                    document.getElementById('emp-municipio').value = lugares[0].d_mnpio;

                    let selectHtml = `<select id="emp-asentamiento" required class="w-full bg-[#0f1115] border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-[#7ed957]">`;
                    selectHtml += `<option value="" disabled selected>Selecciona un asentamiento...</option>`;
                    lugares.forEach(lugar => selectHtml += `<option value="${lugar.d_asenta}">${lugar.d_asenta}</option>`);
                    selectHtml += `</select>`;
                    document.getElementById('contenedor-asentamiento').innerHTML = selectHtml;
                } catch (error) {
                    mostrarNotificacionAdmin("C.P. inválido", "error");
                }
            }
        });
    }
}

async function iniciarModuloPersonal() {
    const contenedor = document.getElementById("lista-personal");
    try {
        contenedor.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">Cargando...</td></tr>`;
        // GET: /api/roles & /api/trabajadores
        const [resRoles, resPersonal] = await Promise.all([ fetch(`${baseUrl}/roles`), fetch(`${baseUrl}/trabajadores`) ]);
        if (!resRoles.ok || !resPersonal.ok) throw new Error("Error API");
        rolesGlobales = await resRoles.json();
        personalGlobal = await resPersonal.json();
        mostrarListaPersonal();
    } catch (error) {
        contenedor.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-red-500">Error API Personal.</td></tr>`;
    }
}

function mostrarListaPersonal() {
    const contenedor = document.getElementById("lista-personal");
    if (personalGlobal.length === 0) return contenedor.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">Vacío.</td></tr>`;

    const mapaRoles = {};
    rolesGlobales.forEach(rol => mapaRoles[rol.idRol || rol.id] = rol.nombreRol || rol.nombre || "Desconocido");

    let html = "";
    personalGlobal.forEach((emp) => {
        const idEmp = emp.idTrabajador || emp.id || emp.idEmpleado;
        const nombreRol = mapaRoles[emp.idRol] || "Sin Rol";
        let colorRol = "bg-gray-900 text-gray-300 border-gray-700";
        let esAdmin = false; 

        if (nombreRol.toLowerCase().includes("admin")) { colorRol = "bg-green-900 text-green-300 border-green-700"; esAdmin = true; }
        else if (nombreRol.toLowerCase().includes("recep")) colorRol = "bg-purple-900 text-purple-300 border-purple-700";
        else if (nombreRol.toLowerCase().includes("tec")) colorRol = "bg-blue-900 text-blue-300 border-blue-700";

        let botonesAccion = esAdmin ? `<span class="text-gray-600 font-semibold cursor-not-allowed select-none">🔒 Protegido</span>`
            : `<button onclick="abrirModalPersonal(${idEmp})" class="text-blue-400 font-semibold">Editar</button> <button onclick="confirmarEliminacionPersonal(${idEmp})" class="text-red-500 font-semibold ml-3">Eliminar</button>`;

        html += `
            <tr class="hover:bg-[#1a1a1a] transition duration-200">
                <td class="p-4 align-top"><strong class="text-white block">${emp.nombre} ${emp.aPaterno}</strong><span class="text-gray-500 text-xs mt-1">ID: ${idEmp}</span></td>
                <td class="p-4 align-top"><span class="${colorRol} border py-1 px-3 rounded-full text-xs font-bold">${nombreRol}</span></td>
                <td class="p-4 text-gray-300 align-top">✉️ ${emp.email || "N/A"}<br>📞 ${emp.telefono || "N/A"}</td>
                <td class="p-4 text-right align-top">${botonesAccion}</td>
            </tr>
        `;
    });
    contenedor.innerHTML = html;
}

window.abrirModalPersonal = async function(id = null) {
    const modal = document.getElementById("modal-personal");
    document.getElementById("formulario-personal")?.reset(); 
    document.getElementById('contenedor-asentamiento').innerHTML = `<input type="text" id="emp-asentamiento" required placeholder="Escribe C.P." readonly class="w-full bg-[#1a1c20] border border-gray-700 text-gray-400 px-4 py-2 rounded focus:outline-none cursor-not-allowed">`;

    if (id) {
        const emp = personalGlobal.find(e => (e.idTrabajador || e.id || e.idEmpleado) == id);
        document.getElementById('emp-id').value = id;
        document.getElementById('emp-nombre').value = emp.nombre;
        document.getElementById('emp-ap-paterno').value = emp.aPaterno;
        document.getElementById('emp-rol').value = emp.idRol;
        document.getElementById('emp-cp').value = emp.CPostal || '';
        if (emp.email) document.getElementById('emp-email-user').value = emp.email.split('@')[0];

        if (emp.CPostal && String(emp.CPostal).length === 5) {
            try {
                // GET: API Externa SEPOMEX
                const res = await fetch(`https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${emp.CPostal}`);
                const datos = await res.json();
                if (datos.zip_codes && datos.zip_codes.length > 0) {
                    let selectHtml = `<select id="emp-asentamiento" required class="w-full bg-[#0f1115] border border-gray-700 text-white px-4 py-2 rounded">`;
                    datos.zip_codes.forEach(lugar => selectHtml += `<option value="${lugar.d_asenta}" ${lugar.d_asenta === emp.asentamiento ? 'selected' : ''}>${lugar.d_asenta}</option>`);
                    document.getElementById('contenedor-asentamiento').innerHTML = selectHtml + `</select>`;
                }
            } catch (e) {}
        }
    } else {
        document.getElementById('emp-id').value = '';
    }
    modal.classList.remove("hidden");
};

window.cerrarModalPersonal = () => document.getElementById("modal-personal")?.classList.add("hidden");

window.guardarEmpleado = async function(evento) {
    evento.preventDefault();
    const idEmp = document.getElementById('emp-id').value;
    const password = document.getElementById('emp-password').value;

    if (!idEmp && !password) return mostrarNotificacionAdmin("Contraseña obligatoria", "error");
    if (idEmp) {
        const conf = await mostrarConfirmacionAdmin("¿Modificar empleado?", "advertencia");
        if (!conf) return; 
    }

    const btnSubmit = evento.target.querySelector('button[type="submit"]');
    const txtOrig = btnSubmit.innerHTML;
    btnSubmit.innerHTML = "Guardando..."; btnSubmit.disabled = true;

    const datosTrabajador = {
        nombre: document.getElementById('emp-nombre').value.trim(),
        aPaterno: document.getElementById('emp-ap-paterno').value.trim(),
        idRol: document.getElementById('emp-rol').value,
        email: `${document.getElementById('emp-email-user').value.trim()}@pcextreme.com`,
        CPostal: document.getElementById('emp-cp').value.trim(),
        estado: document.getElementById('emp-estado').value.trim(),
        municipio: document.getElementById('emp-municipio').value.trim(),
        asentamiento: document.getElementById('emp-asentamiento').value.trim()     
    };
    if (password) datosTrabajador.password = password;

    try {
        const token = localStorage.getItem('token');
        // POST/PUT: /api/trabajadores/:id
        const respuesta = await fetch(idEmp ? `${baseUrl}/trabajadores/${idEmp}` : `${baseUrl}/trabajadores`, {
            method: idEmp ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datosTrabajador)
        });
        if (!respuesta.ok) throw new Error("Error API");

        mostrarNotificacionAdmin(`Empleado guardado`, 'exito');
        cerrarModalPersonal();
        iniciarModuloPersonal(); 
    } catch (error) { mostrarNotificacionAdmin(error.message, "error"); } 
    finally { btnSubmit.innerHTML = txtOrig; btnSubmit.disabled = false; }
};

window.confirmarEliminacionPersonal = async function(id) {
    const conf = await mostrarConfirmacionAdmin("¿ELIMINAR empleado?", "peligro");
    if (conf) {
        try {
            // DELETE: /api/trabajadores/:id
            const respuesta = await fetch(`${baseUrl}/trabajadores/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            if (!respuesta.ok) throw new Error("Error API");
            mostrarNotificacionAdmin("Empleado eliminado", "exito");
            iniciarModuloPersonal(); 
        } catch (error) { mostrarNotificacionAdmin(error.message, "error"); }
    }
};

// --- GESTOR WEB ---
window.abrirPestana = function (evento, nombrePestana) {
    document.querySelectorAll(".contenido-pestana").forEach(c => c.classList.replace("block", "hidden"));
    document.querySelectorAll(".boton-pestana").forEach(b => {
        b.classList.remove("text-[#7ed957]", "border-[#7ed957]");
        b.classList.add("text-gray-500", "border-transparent");
    });
    const pestanaDestino = document.getElementById(nombrePestana);
    if (pestanaDestino) pestanaDestino.classList.replace("hidden", "block");
    evento.currentTarget.classList.add("text-[#7ed957]", "border-[#7ed957]");
    evento.currentTarget.classList.remove("text-gray-500", "border-transparent");
};

async function subirACloudinaryWeb(archivo) {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", PRESET_WEB); 
    // POST: Cloudinary Web API
    const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME_WEB}/auto/upload`, { method: "POST", body: formData });
    if (!respuesta.ok) throw new Error("Error Cloudinary");
    const data = await respuesta.json();
    return data.secure_url.split('/').pop();
}

async function iniciarModuloWeb() {
    if (!document.getElementById("formulario-portada")) return;
    try {
        // GET: /api/inicio
        const respuesta = await fetch(`${baseUrl}/inicio`);
        if (!respuesta.ok) throw new Error("Error API");
        const datos = await respuesta.json();
        if (datos && datos.length > 0) {
            document.getElementById("input-titulo-portada").value = datos[0].titulo || "";
            document.getElementById("input-desc-portada").value = datos[0].descripcion || "";
            document.getElementById("input-boton-portada").value = datos[0].texto_boton || "";
            document.getElementById("portada-video-actual").value = datos[0].video_url || "";
            document.getElementById("portada-imagen-actual").value = datos[0].imagen_fondo || "";
        }
    } catch (error) {}
}

window.guardarPortada = async function (evento) {
    evento.preventDefault();
    const boton = evento.target.querySelector('button[type="submit"]');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = "Guardando..."; boton.disabled = true;

    let videoFinal = document.getElementById("portada-video-actual").value;
    let imagenFinal = document.getElementById("portada-imagen-actual").value;
    const inputVideo = document.getElementById("input-video-portada");
    const inputImagen = document.getElementById("input-imagen-portada");

    try {
        if (inputVideo && inputVideo.files.length > 0) videoFinal = await subirACloudinaryWeb(inputVideo.files[0]);
        if (inputImagen && inputImagen.files.length > 0) imagenFinal = await subirACloudinaryWeb(inputImagen.files[0]);

        const datosParaBD = {
            titulo: document.getElementById("input-titulo-portada").value,
            descripcion: document.getElementById("input-desc-portada").value,
            texto_boton: document.getElementById("input-boton-portada").value,
            video_url: videoFinal, imagen_fondo: imagenFinal
        };

        // PUT: /api/inicio/1
        const respuesta = await fetch(`${baseUrl}/inicio/1`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datosParaBD) });
        if (!respuesta.ok) throw new Error("Error API");
        
        if (inputVideo) inputVideo.value = "";
        if (inputImagen) inputImagen.value = "";
        document.getElementById("portada-video-actual").value = videoFinal;
        document.getElementById("portada-imagen-actual").value = imagenFinal;
        mostrarNotificacionAdmin("Portada actualizada", "exito");
    } catch (error) { mostrarNotificacionAdmin(error.message, "error"); } 
    finally { boton.innerHTML = textoOriginal; boton.disabled = false; }
};

let nosotrosGlobales = [];
window.cargarPestanaNosotros = async function (evento, nombrePestana) {
    if (evento && nombrePestana) abrirPestana(evento, nombrePestana);
    const contenedor = document.getElementById("lista-nosotros");
    if (!contenedor) return;

    try {
        // GET: /api/nosotros
        const respuesta = await fetch(`${baseUrl}/nosotros`);
        if (!respuesta.ok) throw new Error("Error API");
        nosotrosGlobales = await respuesta.json();

        let html = "";
        nosotrosGlobales.forEach((item) => {
            let img = item.imagen;
            if (img && !img.startsWith('http')) img = `https://res.cloudinary.com/${CLOUD_NAME_WEB}/image/upload/${img}`;
            html += `
                <tr class="hover:bg-[#252830] transition border-b border-gray-800">
                    <td class="p-4 w-24"><img src="${img}" class="w-20 h-16 object-cover rounded shadow border border-gray-700"></td>
                    <td class="p-4 text-gray-200 font-bold">${item.titulo}</td>
                    <td class="p-4 text-center"><button onclick="abrirModalEditarNosotros('${item.idInfo || item.id}')" class="bg-[#3f51b5] text-white px-4 py-2 rounded text-xs font-bold">Editar</button></td>
                </tr>`;
        });
        contenedor.innerHTML = html;
    } catch (error) { contenedor.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-red-500">Error API.</td></tr>`; }
};

window.abrirModalEditarNosotros = function (id) {
    const item = nosotrosGlobales.find(n => String(n.idInfo || n.id) === String(id));
    if (!item) return;
    document.getElementById("edit-id-nosotros").value = id;
    document.getElementById("edit-titulo-nosotros").value = item.titulo;
    document.getElementById("edit-desc-nosotros").value = item.descripcion;

    const nombreImg = item.imagen || item.imagen_url || "";
    document.getElementById("edit-imagen-actual-nosotros").value = nombreImg;
    document.getElementById("edit-preview-nosotros").src = `https://res.cloudinary.com/${CLOUD_NAME_WEB}/image/upload/${nombreImg}`;
    document.getElementById("edit-img-nosotros").value = ""; 
    document.getElementById("panel-edicion-nosotros").classList.remove("hidden");
};

window.cerrarEdicionNosotros = () => document.getElementById("panel-edicion-nosotros").classList.add("hidden");

window.guardarEdicionNosotros = async function (evento) {
    evento.preventDefault();
    const id = document.getElementById("edit-id-nosotros").value;
    let imagenFinal = document.getElementById("edit-imagen-actual-nosotros").value;
    const inputImagen = document.getElementById("edit-img-nosotros");

    try {
        if (inputImagen.files.length > 0) imagenFinal = await subirACloudinaryWeb(inputImagen.files[0]);
        // PUT: /api/nosotros/:id
        const respuesta = await fetch(`${baseUrl}/nosotros/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                titulo: document.getElementById("edit-titulo-nosotros").value, 
                descripcion: document.getElementById("edit-desc-nosotros").value,
                imagen: imagenFinal, imagen_url: imagenFinal
            })
        });
        if (!respuesta.ok) throw new Error("Error API");
        mostrarNotificacionAdmin("Sección actualizada", "exito");
        cerrarEdicionNosotros();
        cargarPestanaNosotros();
    } catch (error) { mostrarNotificacionAdmin(error.message, "error"); }
};

window.cargarPestanaContacto = async function (evento, nombrePestana) {
    if (evento && nombrePestana) abrirPestana(evento, nombrePestana);
    try {
        // GET: /api/contacto
        const resContacto = await fetch(`${baseUrl}/contacto`);
        if (!resContacto.ok) return;
        const contacto = Array.isArray(await resContacto.json()) ? (await resContacto.json())[0] : await resContacto.json();
        document.getElementById("input-email").value = contacto.email || "";
        document.getElementById("input-telefono").value = contacto.telefono || "";
        document.getElementById("input-whatsapp").value = contacto.whatsapp || "";
        document.getElementById("input-direccion").value = contacto.direccion || "";
        document.getElementById("input-mapa").value = contacto.mapa_url || "";
    } catch (error) {}
};

window.guardarContacto = async function (evento) {
    evento.preventDefault();
    try {
        // PUT: /api/contacto/1
        const respuesta = await fetch(`${baseUrl}/contacto/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("input-email").value,
                telefono: document.getElementById("input-telefono").value,
                whatsapp: document.getElementById("input-whatsapp").value,
                direccion: document.getElementById("input-direccion").value,
                mapa_url: document.getElementById("input-mapa").value,
            }),
        });
        if (!respuesta.ok) throw new Error("Error API");
        mostrarNotificacionAdmin("Contacto actualizado", "exito");
    } catch (error) { mostrarNotificacionAdmin(error.message, "error"); }
};

// --- DASHBOARD ---
async function cargarDashboardAdmin() {
    try {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        // GET: /api/dashboard/totales
        const resTotales = await fetch(`${baseUrl}/dashboard/totales`, { headers });
        if (resTotales.ok) {
            const totales = await resTotales.json();
            document.getElementById('stat-productos').innerText = totales.total_productos || 0;
            document.getElementById('stat-clientes').innerText = totales.total_clientes || 0;
            document.getElementById('stat-reparaciones').innerText = totales.total_registros || 0;
        }

        // GET: /api/dashboard/bajo-stock
        const resStock = await fetch(`${baseUrl}/dashboard/bajo-stock`, { headers });
        if (resStock.ok) {
            const productosBajoStock = await resStock.json();
            const alerta = document.getElementById('alerta-stock');
            const lista = document.getElementById('lista-stock-bajo');
            if (productosBajoStock.length > 0) {
                alerta.classList.remove('hidden');
                lista.innerHTML = productosBajoStock.map(p => `<li><strong class="text-yellow-500">${p.nombre}</strong> <span class="text-gray-400 text-xs">(Quedan: ${p.stock})</span></li>`).join('');
            } else {
                alerta.classList.add('hidden');
            }
        }
    } catch (error) { console.error(error); }
}

// --- MENSAJES (CRM) ---
let mensajesData = [];

async function iniciarModuloMensajes() {
    const tbody = document.querySelector('tbody.divide-y.divide-gray-800'); 
    if (!tbody) return;
    try {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">Cargando buzón...</td></tr>`;
        // GET: /api/mensajes
        const respuesta = await fetch(`${baseUrl}/mensajes`);
        if (!respuesta.ok) throw new Error("Error API");
        mensajesData = await respuesta.json();
        dibujarTablaMensajes();
    } catch (error) { tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-red-500">Error API Mensajes.</td></tr>`; }
}

function dibujarTablaMensajes() {
    const tbody = document.querySelector('tbody.divide-y.divide-gray-800');
    if (!tbody) return;
    const msjs = mensajesData.filter(m => m.tipo_mensaje !== 'SALIENTE');
    if(msjs.length === 0) return tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">Bandeja limpia.</td></tr>`;

    let html = '';
    msjs.forEach(msg => {
        const estado = msg.estado_mensaje || "PENDIENTE";
        const colorEstado = estado === 'RESPONDIDO' ? 'text-green-400 border-green-700' : 'text-orange-400 border-orange-700';
        html += `
            <tr class="hover:bg-[#252830] transition border-b border-gray-800">
                <td class="p-4 text-gray-500 font-medium">
                    ${new Date(msg.fecha || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}<br>
                    <span class="${colorEstado} border py-0.5 px-2 mt-2 inline-block rounded-full text-[9px] font-bold">${estado}</span>
                </td>
                <td class="p-4 text-gray-400 text-sm"><i class="fas fa-envelope mr-1 text-blue-400"></i> ${msg.correo || msg.email}</td>
                <td class="p-4">
                    <div class="text-[#7ed957] font-bold mb-1">${msg.asunto || "Sin asunto"}</div>
                    <div class="bg-[#0f1115] border border-gray-700 rounded-lg p-2 text-gray-400 text-xs">${msg.mensaje || msg.contenido}</div>
                </td>
                <td class="p-4 text-center">
                    <button onclick="abrirModalRespuesta(${msg.idMensaje || msg.id})" class="bg-blue-600/20 text-blue-400 font-bold py-1 px-3 rounded text-[10px] mb-2 w-full">RESPONDER</button>
                    <button onclick="eliminarMensajeBuzon(${msg.idMensaje || msg.id})" class="bg-red-600/20 text-red-400 font-bold py-1 px-3 rounded text-[10px] w-full">ELIMINAR</button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;
}

window.abrirModalRespuesta = function(id) {
    const msg = mensajesData.find(m => (m.idMensaje || m.id) === id);
    if (!msg) return;
    document.getElementById('resp-id-mensaje').value = id;
    document.getElementById('resp-correo').value = msg.correo || msg.email;
    document.getElementById('resp-mensaje-original').value = msg.mensaje || msg.contenido;
    document.getElementById('resp-display-correo').innerText = msg.correo || msg.email;
    document.getElementById('resp-texto').value = '';
    document.getElementById('modal-respuesta').classList.remove('hidden');
};

window.cerrarModalRespuesta = () => document.getElementById('modal-respuesta').classList.add('hidden');

window.enviarRespuestaMensaje = async function(evento) {
    evento.preventDefault();
    const idOriginal = document.getElementById('resp-id-mensaje').value;
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    try {
        // POST: API EmailJS 
        await emailjs.send('service_i4nla5o', 'template_xvh63sq', {
            correo_cliente: document.getElementById('resp-correo').value,
            mensaje_original: document.getElementById('resp-mensaje-original').value,
            respuesta_admin: document.getElementById('resp-texto').value
        });

        // POST: /api/mensajes
        await fetch(`${baseUrl}/mensajes`, {
            method: 'POST', headers,
            body: JSON.stringify({ correo: "pcextreme@correo.com", asunto: "RE: Mensaje del Cliente", mensaje: document.getElementById('resp-texto').value, tipo_mensaje: "SALIENTE", estado_mensaje: "ENVIADO", id_mensaje_padre: parseInt(idOriginal) })
        });

        // PUT: /api/mensajes/:id
        await fetch(`${baseUrl}/mensajes/${idOriginal}`, { method: 'PUT', headers, body: JSON.stringify({ estado_mensaje: "RESPONDIDO" }) });
        
        mostrarNotificacionAdmin("Respuesta enviada y guardada", "exito");
        cerrarModalRespuesta();
        await iniciarModuloMensajes();
    } catch (error) { mostrarNotificacionAdmin("Error al enviar", "error"); }
};

window.eliminarMensajeBuzon = async function(id) {
    if(await mostrarConfirmacionAdmin("¿Eliminar este mensaje?", "peligro")) {
        try {
            // DELETE: /api/mensajes/:id
            await fetch(`${baseUrl}/mensajes/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            mostrarNotificacionAdmin("Mensaje eliminado", "exito");
            await iniciarModuloMensajes(); 
        } catch (error) { mostrarNotificacionAdmin("Error API", "error"); }
    }
};

// --- ROUTER & INICIALIZADOR PRINCIPAL ---
document.addEventListener("DOMContentLoaded", () => {
    // Componentes que se necesitan en todas las páginas del panel
    cargarComponentesAdmin();
    inicializarOjoPassword();

    // Verificación estricta de contenedores para no consumir recursos innecesarios
    if (document.getElementById('stat-productos')) {
        cargarDashboardAdmin();
    }
    
    if (document.getElementById('lista-reparaciones')) {
        cargarTablaAdminReparaciones();
        document.getElementById('formulario-reparacion').addEventListener('submit', gestionarSubmitReparacion);
    }
    
    if (document.getElementById('lista-clientes')) {
        iniciarModuloClientes();
    }
    
    if (document.getElementById('tabla-productos-admin')) {
        cargarTablaAdminProductos();
        document.getElementById('formulario-producto').addEventListener('submit', gestionarSubmitProducto);
    }
    
    if (document.getElementById('lista-personal')) {
        iniciarModuloPersonal();
        inicializarSepomex(); // Solo activamos el buscador de Códigos Postales en esta página
    }
    
    if (document.getElementById('contenedor-gestor-contenido')) {
        iniciarModuloWeb();
    }
    
    if (document.querySelector('title')?.innerText.includes('Buzón')) {
        iniciarModuloMensajes();
        const formResp = document.getElementById('formulario-respuesta');
        if (formResp) formResp.addEventListener('submit', enviarRespuestaMensaje);
    }
});