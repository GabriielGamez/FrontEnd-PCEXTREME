/**
 * admin.js
 * Archivo principal unificado para PC EXTREME.
 * Contiene la lógica compartida, módulo de reparaciones y módulo de clientes.
 */

// ==========================================
// 1. CARGA DE COMPONENTES GLOBALES (Header/Footer)
// ==========================================
async function cargarComponentesAdmin() {
    try {
        const headerEl = document.getElementById("encabezado-admin");
        if (headerEl) {
            const resH = await fetch("/FrontEnd-PCEXTREME/admin/admin_header.html");
            if (resH.ok) headerEl.innerHTML = await resH.text();
        }

        const footerEl = document.getElementById("pie-admin");
        if (footerEl) {
            const resF = await fetch("/FrontEnd-PCEXTREME/admin/admin_footer.html");
            if (resF.ok) footerEl.innerHTML = await resF.text();
        }
    } catch (error) {
        console.error("Error al cargar header/footer:", error);
    }
}

// ==========================================
// 2. MÓDULO: GESTIÓN DE REPARACIONES
// ==========================================
let repGlobales = [];
let repFiltradas = [];
let repPaginaActual = 1;
const repPorPagina = 20;

async function iniciarModuloReparaciones() {
    const contenedor = document.getElementById("lista-reparaciones");
    if (!contenedor) return; // Si no estamos en la página de reparaciones, ignoramos este código

    try {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Cargando reparaciones...</td></tr>`;
        const respuesta = await fetch("http://localhost:3000/api/registro");
        if (!respuesta.ok) throw new Error("Error en la API");
        
        repGlobales = await respuesta.json();
        repFiltradas = [...repGlobales];
        repPaginaActual = 1;
        mostrarPaginaReparaciones();

        // Configurar buscador
        const buscador = document.getElementById("buscador-reparaciones");
        if (buscador) {
            buscador.addEventListener("input", (e) => {
                const texto = e.target.value.toLowerCase().trim();
                repFiltradas = repGlobales.filter(rep => 
                    String(rep.idFolio).toLowerCase().includes(texto) || 
                    String(rep.idDispositivo).toLowerCase().includes(texto)
                );
                repPaginaActual = 1;
                mostrarPaginaReparaciones();
            });
        }
    } catch (error) {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error al conectar con la base de datos.</td></tr>`;
    }
}

function mostrarPaginaReparaciones() {
    const contenedor = document.getElementById("lista-reparaciones");
    if (!contenedor) return;

    if (repFiltradas.length === 0) {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No se encontraron reparaciones.</td></tr>`;
        actualizarPaginacionReparaciones();
        return;
    }

    const inicio = (repPaginaActual - 1) * repPorPagina;
    const repPagina = repFiltradas.slice(inicio, inicio + repPorPagina);
    let html = "";

    repPagina.forEach((rep) => {
        html += `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="px-4 py-4 align-top">
                    <span class="bg-gray-200 text-gray-800 font-black px-2 py-1 rounded text-sm">#${rep.idFolio}</span>
                </td>
                <td class="px-4 py-4 align-top">
                    <strong class="text-gray-900 block">Disp. ID: ${rep.idDispositivo}</strong>
                </td>
                <td class="px-4 py-4 align-top text-gray-600">${rep.detalles}</td>
                <td class="px-4 py-4 align-top">
                    <form class="flex items-end gap-2" onsubmit="actualizarReparacion(event, ${rep.idFolio})">
                        <div class="flex flex-col gap-2 w-full">
                            <select class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
                                <option value="${rep.estadoEquipo}" selected hidden>${rep.estadoEquipo}</option>
                                <option value="En Diagnóstico">🔵 En Diagnóstico</option>
                                <option value="En Reparación">🟠 En Reparación</option>
                                <option value="Listo para entregar">🟢 Listo para entregar</option>
                                <option value="Entregado">⚫ Entregado</option>
                            </select>
                            <textarea rows="1" class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm resize-none" placeholder="Diagnóstico...">${rep.diagnostico || ''}</textarea>
                            <div class="flex items-center gap-2">
                                <span class="text-gray-500 font-bold">$</span>
                                <input type="number" value="${rep.costo || 0}" class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm no-spinners">
                            </div>
                        </div>
                        <button type="submit" class="text-2xl hover:scale-110 transition pb-1" title="Guardar">💾</button>
                    </form>
                </td>
                <td class="px-4 py-4 align-top text-center">
                    <button onclick="verTicket(${rep.idFolio})" type="button" class="text-gray-400 hover:text-blue-600 transition p-2 border border-gray-200 rounded-md hover:bg-blue-50">📄</button>
                </td>
            </tr>
        `;
    });
    contenedor.innerHTML = html;
    actualizarPaginacionReparaciones();
}

window.cambiarPaginaReparaciones = function(dir) {
    const total = Math.ceil(repFiltradas.length / repPorPagina);
    if (dir === 'siguiente' && repPaginaActual < total) repPaginaActual++;
    else if (dir === 'anterior' && repPaginaActual > 1) repPaginaActual--;
    mostrarPaginaReparaciones();
};

function actualizarPaginacionReparaciones() {
    let controles = document.getElementById("paginacion-reparaciones");
    if (!controles) {
        const tabla = document.querySelector("#lista-reparaciones").closest("table").parentNode;
        controles = document.createElement("div");
        controles.id = "paginacion-reparaciones";
        controles.className = "flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 rounded-b-lg mt-2";
        tabla.appendChild(controles);
    }

    const total = Math.ceil(repFiltradas.length / repPorPagina);
    if (total <= 1) { controles.innerHTML = ""; return; }

    controles.innerHTML = `
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p class="text-sm text-gray-700">Mostrando ${(repPaginaActual - 1) * repPorPagina + 1} a ${Math.min(repPaginaActual * repPorPagina, repFiltradas.length)} de ${repFiltradas.length}</p>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm">
                <button onclick="cambiarPaginaReparaciones('anterior')" ${repPaginaActual === 1 ? 'disabled' : ''} class="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm hover:bg-gray-100 ${repPaginaActual === 1 ? 'opacity-50 cursor-not-allowed' : ''}">Anterior</button>
                <span class="px-4 py-2 border border-gray-300 bg-white text-sm">Página ${repPaginaActual} de ${total}</span>
                <button onclick="cambiarPaginaReparaciones('siguiente')" ${repPaginaActual === total ? 'disabled' : ''} class="px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm hover:bg-gray-100 ${repPaginaActual === total ? 'opacity-50 cursor-not-allowed' : ''}">Siguiente</button>
            </nav>
        </div>`;
}

// ==========================================
// 3. MÓDULO: GESTIÓN DE CLIENTES
// ==========================================
let cliGlobales = [];
let cliFiltrados = [];
let cliPaginaActual = 1;
const cliPorPagina = 20;

async function iniciarModuloClientes() {
    const contenedor = document.getElementById("lista-clientes");
    if (!contenedor) return; // Si no estamos en la página de clientes, ignoramos este bloque

    try {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Cargando clientes...</td></tr>`;
        
        // Llamada a tu API de clientes
        const respuesta = await fetch("http://localhost:3000/api/clientes");
        if (!respuesta.ok) throw new Error("Error en la API de clientes");
        
        cliGlobales = await respuesta.json();
        cliFiltrados = [...cliGlobales];
        cliPaginaActual = 1;
        mostrarPaginaClientes();

        // Configurar buscador de clientes
        const buscador = document.getElementById("buscador-clientes");
        if (buscador) {
            buscador.addEventListener("input", (e) => {
                const texto = e.target.value.toLowerCase().trim();
                cliFiltrados = cliGlobales.filter(cli => {
                    const nombreCompleto = `${cli.nombre} ${cli.aPaterno} ${cli.aMaterno}`.toLowerCase();
                    const correo = String(cli.email || '').toLowerCase();
                    return nombreCompleto.includes(texto) || correo.includes(texto);
                });
                cliPaginaActual = 1;
                mostrarPaginaClientes();
            });
        }
    } catch (error) {
        console.error("Error al cargar clientes:", error);
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error al conectar con la base de datos de clientes.</td></tr>`;
    }
}

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
        // Formatear el enlace de WhatsApp (quitamos espacios del teléfono por si acaso)
        const phone = cli.telefono ? cli.telefono.replace(/\D/g, '') : '';
        const whatsappLink = phone ? `https://wa.me/52${phone}` : '#';

        html += `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-5">
                    <span class="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded text-sm border border-gray-200">#${cli.idCliente}</span>
                </td>
                <td class="px-6 py-5 font-bold text-gray-800">
                    ${cli.nombre} ${cli.aPaterno} ${cli.aMaterno || ''}
                </td>
                <td class="px-6 py-5">
                    <div class="flex flex-col space-y-1 text-sm text-gray-600">
                        <span class="flex items-center"><i class="fa-solid fa-envelope text-blue-400 mr-2 w-4"></i> ${cli.email || 'Sin correo'}</span>
                        <span class="flex items-center"><i class="fa-solid fa-phone text-pink-400 mr-2 w-4"></i> ${cli.telefono || 'Sin teléfono'}</span>
                    </div>
                </td>
                <td class="px-6 py-5 text-sm text-gray-500 max-w-xs">
                    ${cli.direccion || 'Sin dirección registrada'}
                </td>
                <td class="px-6 py-5 text-center">
                    <a href="${whatsappLink}" target="_blank" class="inline-flex items-center bg-[#25D366] hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition shadow-sm">
                        <i class="fa-brands fa-whatsapp mr-2 text-lg"></i> Chat WhatsApp
                    </a>
                </td>
            </tr>
        `;
    });

    contenedor.innerHTML = html;
    actualizarPaginacionClientes();
}

window.cambiarPaginaClientes = function(dir) {
    const total = Math.ceil(cliFiltrados.length / cliPorPagina);
    if (dir === 'siguiente' && cliPaginaActual < total) cliPaginaActual++;
    else if (dir === 'anterior' && cliPaginaActual > 1) cliPaginaActual--;
    mostrarPaginaClientes();
};

function actualizarPaginacionClientes() {
    let controles = document.getElementById("paginacion-clientes");
    if (!controles) {
        const tabla = document.querySelector("#lista-clientes").closest("table").parentNode;
        controles = document.createElement("div");
        controles.id = "paginacion-clientes";
        controles.className = "flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 rounded-b-lg mt-2";
        tabla.appendChild(controles);
    }

    const total = Math.ceil(cliFiltrados.length / cliPorPagina);
    if (total <= 1) { controles.innerHTML = ""; return; }

    controles.innerHTML = `
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p class="text-sm text-gray-700">Mostrando ${(cliPaginaActual - 1) * cliPorPagina + 1} a ${Math.min(cliPaginaActual * cliPorPagina, cliFiltrados.length)} de ${cliFiltrados.length}</p>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm">
                <button onclick="cambiarPaginaClientes('anterior')" ${cliPaginaActual === 1 ? 'disabled' : ''} class="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm hover:bg-gray-100 ${cliPaginaActual === 1 ? 'opacity-50 cursor-not-allowed' : ''}">Anterior</button>
                <span class="px-4 py-2 border border-gray-300 bg-white text-sm">Página ${cliPaginaActual} de ${total}</span>
                <button onclick="cambiarPaginaClientes('siguiente')" ${cliPaginaActual === total ? 'disabled' : ''} class="px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm hover:bg-gray-100 ${cliPaginaActual === total ? 'opacity-50 cursor-not-allowed' : ''}">Siguiente</button>
            </nav>
        </div>`;
}

// ==========================================
// INICIALIZADOR GENERAL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    cargarComponentesAdmin();
    
    // El navegador intentará encender ambos módulos. 
    // Gracias a los "if" que pusimos arriba, solo se ejecutará el módulo 
    // de la página en la que estés actualmente, evitando errores.
    iniciarModuloReparaciones();
    iniciarModuloClientes();
});