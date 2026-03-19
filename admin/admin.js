/**
 * admin.js
 * Archivo principal unificado para PC EXTREME.
 * Contiene la lógica compartida, módulo de reparaciones, clientes y gestor web.
 */
const baseUrl = "https://app-web-java.vercel.app/api";
const CLOUD_BASE = 'https://res.cloudinary.com/dswljrmnu/image/upload/';
const CLOUD_NAME_BASE = 'dswljrmnu'; 
const UPLOAD_PRESET = 'qgnakwni'; 
// ==========================================
// 1. CARGA DE COMPONENTES GLOBALES Y SESIÓN
// ==========================================
async function cargarComponentesAdmin() {
    try {
        const headerEl = document.getElementById("encabezado-admin");
        if (headerEl) {
            const resH = await fetch("/FrontEnd-PCEXTREME/admin/admin_header.html");
            if (resH.ok) {
                headerEl.innerHTML = await resH.text();

                // --- NUEVA LÓGICA DE SESIÓN ADMIN ---
                
                // 1. Recuperar datos del trabajador logueado
                const usuarioStr = localStorage.getItem('usuario');
                if (usuarioStr) {
                    const usuario = JSON.parse(usuarioStr);
                    
                    // Verificamos por seguridad que sea un trabajador (opcional pero recomendado)
                    if (usuario.tipo !== 'trabajador') {
                        window.location.href = '/FrontEnd-PCEXTREME/index.html';
                        return;
                    }

                    // Colocamos su nombre en el Header
                    const nombreAdminEl = document.getElementById('admin-nombre-usuario');
                    if (nombreAdminEl) {
                        nombreAdminEl.innerText = usuario.nombre;
                    }
                } else {
                    // Si no hay sesión, lo expulsamos al login
                    window.location.href = '/FrontEnd-PCEXTREME/index.html';
                    return;
                }

                // 2. Configurar el botón de Cerrar Sesión
                const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
                if (btnCerrarSesion) {
                    btnCerrarSesion.addEventListener('click', () => {
                        // Borramos los datos de la memoria
                        localStorage.removeItem('token');
                        localStorage.removeItem('usuario');
                        
                        // Redirigimos al inicio de sesión
                        window.location.href = '/FrontEnd-PCEXTREME/index.html'; 
                    });
                }
            }
        }

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
// 2. CONTROLADOR DE PESTAÑAS GLOBALES
// ==========================================
window.abrirPestana = function (evento, nombrePestana) {
    // 1. Ocultar todo el contenido de las pestañas
    const contenidos = document.querySelectorAll(".contenido-pestana");
    contenidos.forEach((contenido) => {
        contenido.classList.add("hidden");
        contenido.classList.remove("block");
    });

    // 2. Resetear el estilo de todos los botones
    const botones = document.querySelectorAll(".boton-pestana");
    botones.forEach((boton) => {
        boton.classList.remove("text-[#7ed957]", "border-[#7ed957]");
        boton.classList.add("text-gray-500", "border-transparent");
    });

    // 3. Mostrar el contenido de la pestaña actual
    const pestanaDestino = document.getElementById(nombrePestana);
    if (pestanaDestino) {
        pestanaDestino.classList.remove("hidden");
        pestanaDestino.classList.add("block");
    }

    // 4. Aplicar estilo activo al botón clickeado
    const botonActual = evento.currentTarget;
    botonActual.classList.remove("text-gray-500", "border-transparent");
    botonActual.classList.add("text-[#7ed957]", "border-[#7ed957]");
};

// ==========================================
// 3. MÓDULO: GESTIÓN DE REPARACIONES
// ==========================================
let repGlobales = [];
let repFiltradas = [];
let repPaginaActual = 1;
const repPorPagina = 20;

async function iniciarModuloReparaciones() {
    const contenedor = document.getElementById("lista-reparaciones");
    if (!contenedor) return;

    try {
        contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Cargando reparaciones...</td></tr>`;
        const respuesta = await fetch(`${baseUrl}/registros`);
        if (!respuesta.ok) throw new Error("Error en la API");

        repGlobales = await respuesta.json();
        repFiltradas = [...repGlobales];
        repPaginaActual = 1;
        mostrarPaginaReparaciones();

        const buscador = document.getElementById("buscador-reparaciones");
        if (buscador) {
            buscador.addEventListener("input", (e) => {
                const texto = e.target.value.toLowerCase().trim();
                repFiltradas = repGlobales.filter((rep) =>
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
        // ACTUALIZADO: Colores oscuros para las filas, inputs y textarea
        html += `
            <tr class="hover:bg-[#252830] transition border-b border-gray-800">
                <td class="px-4 py-4 align-top">
                    <span class="bg-gray-800 text-gray-300 font-black px-2 py-1 rounded text-sm">#${rep.idFolio}</span>
                </td>
                <td class="px-4 py-4 align-top">
                    <strong class="text-gray-200 block">Disp. ID: ${rep.idDispositivo}</strong>
                </td>
                <td class="px-4 py-4 align-top text-gray-400">${rep.detalles}</td>
                <td class="px-4 py-4 align-top">
                    <form class="flex items-end gap-2" onsubmit="actualizarReparacion(event, ${rep.idFolio})">
                        <div class="flex flex-col gap-2 w-full">
                            <select class="w-full border border-gray-700 rounded px-3 py-1.5 text-sm bg-[#0f1115] text-gray-200 focus:outline-none focus:border-[#7ed957]">
                                <option value="${rep.estadoEquipo}" selected hidden>${rep.estadoEquipo}</option>
                                <option value="En Diagnóstico">🔵 En Diagnóstico</option>
                                <option value="En Reparación">🟠 En Reparación</option>
                                <option value="Listo para entregar">🟢 Listo para entregar</option>
                                <option value="Entregado">⚫ Entregado</option>
                            </select>
                            <textarea rows="1" class="w-full border border-gray-700 rounded px-3 py-1.5 text-sm bg-[#0f1115] text-gray-200 resize-none focus:outline-none focus:border-[#7ed957]" placeholder="Diagnóstico...">${rep.diagnostico || ""}</textarea>
                            <div class="flex items-center gap-2">
                                <span class="text-gray-500 font-bold">$</span>
                                <input type="number" value="${rep.costo || 0}" class="w-full border border-gray-700 rounded px-3 py-1.5 text-sm bg-[#0f1115] text-gray-200 no-spinners focus:outline-none focus:border-[#7ed957]">
                            </div>
                        </div>
                        <button type="submit" class="text-2xl hover:scale-110 transition pb-1" title="Guardar">💾</button>
                    </form>
                </td>
                <td class="px-4 py-4 align-top text-center">
                    <button onclick="verTicket(${rep.idFolio})" type="button" class="text-gray-400 hover:text-[#7ed957] transition p-2 border border-gray-700 rounded-md hover:bg-gray-800">📄</button>
                </td>
            </tr>
        `;
    });
    contenedor.innerHTML = html;
    actualizarPaginacionReparaciones();
}

function actualizarPaginacionReparaciones() {
    let controles = document.getElementById("paginacion-reparaciones");
    if (!controles) {
        const tabla = document.querySelector("#lista-reparaciones").closest("table").parentNode;
        controles = document.createElement("div");
        controles.id = "paginacion-reparaciones";
        // ACTUALIZADO: Fondo oscuro para la barra de paginación
        controles.className = "flex items-center justify-between px-4 py-3 bg-gray-900 border-t border-gray-800 sm:px-6 rounded-b-lg mt-2";
        tabla.appendChild(controles);
    }

    const total = Math.ceil(repFiltradas.length / repPorPagina);
    if (total <= 1) {
        controles.innerHTML = "";
        return;
    }

    // ACTUALIZADO: Botones oscuros para "Anterior" y "Siguiente"
    controles.innerHTML = `
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p class="text-sm text-gray-400">Mostrando ${(repPaginaActual - 1) * repPorPagina + 1} a ${Math.min(repPaginaActual * repPorPagina, repFiltradas.length)} de ${repFiltradas.length}</p>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm">
                <button onclick="cambiarPaginaReparaciones('anterior')" ${repPaginaActual === 1 ? "disabled" : ""} class="px-4 py-2 rounded-l-md border border-gray-700 bg-[#1a1c20] text-sm text-gray-400 hover:bg-gray-800 ${repPaginaActual === 1 ? "opacity-50 cursor-not-allowed" : ""}">Anterior</button>
                <span class="px-4 py-2 border border-gray-700 bg-[#0f1115] text-gray-200 text-sm">Página ${repPaginaActual} de ${total}</span>
                <button onclick="cambiarPaginaReparaciones('siguiente')" ${repPaginaActual === total ? "disabled" : ""} class="px-4 py-2 rounded-r-md border border-gray-700 bg-[#1a1c20] text-sm text-gray-400 hover:bg-gray-800 ${repPaginaActual === total ? "opacity-50 cursor-not-allowed" : ""}">Siguiente</button>
            </nav>
        </div>`;
}

window.cambiarPaginaReparaciones = function (dir) {
    const total = Math.ceil(repFiltradas.length / repPorPagina);
    if (dir === "siguiente" && repPaginaActual < total) repPaginaActual++;
    else if (dir === "anterior" && repPaginaActual > 1) repPaginaActual--;
    mostrarPaginaReparaciones();
};
// ==========================================
// 4. MÓDULO: GESTIÓN DE CLIENTES
// ==========================================
let cliGlobales = [];
let cliFiltrados = [];
let cliPaginaActual = 1;
const cliPorPagina = 20;

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
        const phone = cli.telefono ? cli.telefono.replace(/\D/g, "") : "";
        const whatsappLink = phone ? `https://wa.me/52${phone}` : "#";

        // ACTUALIZADO: Colores oscuros para el hover de las filas y textos
        html += `
            <tr class="hover:bg-[#252830] transition border-b border-gray-800">
                <td class="px-6 py-5 align-top">
                    <span class="bg-gray-800 text-gray-300 font-bold px-3 py-1 rounded text-sm border border-gray-700">#${cli.idCliente}</span>
                </td>
                <td class="px-6 py-5 font-bold text-gray-200 align-top">
                    ${cli.nombre} ${cli.aPaterno} ${cli.aMaterno || ""}
                </td>
                <td class="px-6 py-5 align-top">
                    <div class="flex flex-col space-y-1 text-sm text-gray-400">
                        <span class="flex items-center"><i class="fa-solid fa-envelope text-blue-400 mr-2 w-4"></i> ${cli.email || "Sin correo"}</span>
                        <span class="flex items-center"><i class="fa-solid fa-phone text-pink-400 mr-2 w-4"></i> ${cli.telefono || "Sin teléfono"}</span>
                    </div>
                </td>
                <td class="px-6 py-5 text-sm text-gray-400 max-w-xs align-top">
                    ${cli.direccion || "Sin dirección registrada"}
                </td>
                <td class="px-6 py-5 text-center align-top">
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

function actualizarPaginacionClientes() {
    let controles = document.getElementById("paginacion-clientes");
    if (!controles) {
        const tabla = document.querySelector("#lista-clientes").closest("table").parentNode;
        controles = document.createElement("div");
        controles.id = "paginacion-clientes";
        // ACTUALIZADO: Fondo oscuro para la barra de paginación
        controles.className = "flex items-center justify-between px-6 py-3 bg-gray-900 border-t border-gray-800 sm:px-6 rounded-b-lg mt-2";
        tabla.appendChild(controles);
    }

    const total = Math.ceil(cliFiltrados.length / cliPorPagina);
    if (total <= 1) {
        controles.innerHTML = "";
        return;
    }

    // ACTUALIZADO: Botones oscuros para "Anterior" y "Siguiente"
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
// 5. MÓDULO: GESTOR WEB (PORTADA INICIO Y CLOUDINARY)
// ==========================================
const CLOUD_NAME = "dbkqbazp7";
const PRESET = "Pc Extreme Web";

async function subirACloudinary(archivo) {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", PRESET);

    const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: formData,
    });

    if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.error.message || "Error al subir el archivo a Cloudinary");
    }

    const data = await respuesta.json();
    return data.secure_url;
}

// Se ejecuta al cargar la página del Gestor (Solo carga Inicio)
async function iniciarModuloWeb() {
    const formPortada = document.getElementById("formulario-portada");
    if (!formPortada) return;

    try {
        const respuesta = await fetch(`${baseUrl}/inicio`);
        if (!respuesta.ok) throw new Error("Error al cargar la información de inicio");

        const datos = await respuesta.json();

        if (datos && datos.length > 0) {
            const portada = datos[0];
            document.getElementById("input-titulo-portada").value = portada.titulo || "";
            document.getElementById("input-desc-portada").value = portada.descripcion || "";
            document.getElementById("input-boton-portada").value = portada.texto_boton || "";
        }
    } catch (error) {
        console.error("Error al cargar configuración web:", error);
    }
}

// Guardar textos y archivos de la Portada
window.guardarPortada = async function (evento) {
    evento.preventDefault();

    const boton = evento.target.querySelector('button[type="submit"]');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = "⏳ Subiendo archivos y guardando...";
    boton.disabled = true;

    const titulo = document.getElementById("input-titulo-portada").value;
    const descripcion = document.getElementById("input-desc-portada").value;
    const texto_boton = document.getElementById("input-boton-portada").value;
    const inputVideo = document.getElementById("input-video-portada");
    const inputImagen = document.getElementById("input-imagen-portada");

    const datosParaBD = {
        titulo,
        descripcion,
        texto_boton,
        video_url: null,
        imagen_fondo: null,
    };

    try {
        if (inputVideo && inputVideo.files.length > 0) {
            datosParaBD.video_url = await subirACloudinary(inputVideo.files[0]);
        }

        if (inputImagen && inputImagen.files.length > 0) {
            datosParaBD.imagen_fondo = await subirACloudinary(inputImagen.files[0]);
        }

        const respuesta = await fetch(`${baseUrl}/inicio/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosParaBD),
        });

        if (!respuesta.ok) throw new Error("Error al actualizar la base de datos");

        if (inputVideo) inputVideo.value = "";
        if (inputImagen) inputImagen.value = "";

        alert("✅ ¡Portada actualizada correctamente con éxito!");
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("❌ Hubo un error: " + error.message);
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
};

// ==========================================
// 6. MÓDULO: GESTOR WEB (SOBRE NOSOTROS)
// ==========================================
let nosotrosGlobales = [];

window.cargarPestanaNosotros = async function (evento, nombrePestana) {
    if (evento && nombrePestana) {
        abrirPestana(evento, nombrePestana);
    }

    const contenedor = document.getElementById("lista-nosotros");
    if (!contenedor) return;

    try {
        contenedor.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-500">⏳ Cargando información...</td></tr>`;

        const respuesta = await fetch(`${baseUrl}/nosotros`);
        if (!respuesta.ok) throw new Error("Error al cargar la información de nosotros");

        nosotrosGlobales = await respuesta.json();

        if (nosotrosGlobales.length === 0) {
            contenedor.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-500">No hay secciones registradas en la base de datos.</td></tr>`;
            return;
        }

        let html = "";
        nosotrosGlobales.forEach((item) => {
            const idCorrecto = item.idInfo;

            let imagenSegura = item.imagen || "https://via.placeholder.com/150?text=Sin+Imagen";
            if (imagenSegura && !imagenSegura.startsWith('http')) {
                imagenSegura = `/FrontEnd-PCEXTREME/assets/${imagenSegura}`;
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
                        <button onclick="abrirModalEditarNosotros('${idCorrecto}')" class="bg-[#3f51b5] hover:bg-blue-800 text-white font-bold py-2 px-4 rounded text-xs tracking-wider transition shadow-sm">
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        });

        contenedor.innerHTML = html;

    } catch (error) {
        console.error("Error en la pestaña Nosotros:", error);
        contenedor.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-red-500">❌ Error al conectar con el servidor.</td></tr>`;
    }
};

window.abrirModalEditarNosotros = function (idBuscado) {
    const item = nosotrosGlobales.find(n => String(n.idInfo) === String(idBuscado));

    if (!item) {
        console.error("No se encontró el registro con ID:", idBuscado);
        return;
    }

    document.getElementById("edit-id-nosotros").value = idBuscado;
    document.getElementById("titulo-editando").innerText = "Editando: " + item.titulo;
    document.getElementById("edit-titulo-nosotros").value = item.titulo;
    document.getElementById("edit-desc-nosotros").value = item.descripcion;

    let imagenSegura = item.imagen || "https://via.placeholder.com/150?text=Sin+Imagen";
    if (imagenSegura && !imagenSegura.startsWith('http')) {
        imagenSegura = `/FrontEnd-PCEXTREME/assets/${imagenSegura}`;
    }
    document.getElementById("edit-preview-nosotros").src = imagenSegura;

    document.getElementById("edit-img-nosotros").value = "";
    document.getElementById("panel-edicion-nosotros").classList.remove("hidden");
};

window.cerrarEdicionNosotros = function () {
    document.getElementById("panel-edicion-nosotros").classList.add("hidden");
};

window.guardarEdicionNosotros = async function (evento) {
    evento.preventDefault();

    const boton = evento.target.querySelector('button[type="submit"]');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = "⏳ Guardando...";
    boton.disabled = true;

    const id = document.getElementById("edit-id-nosotros").value;
    const titulo = document.getElementById("edit-titulo-nosotros").value;
    const descripcion = document.getElementById("edit-desc-nosotros").value;
    const inputImagen = document.getElementById("edit-img-nosotros");

    const datosBD = { titulo, descripcion };

    try {
        if (inputImagen.files.length > 0) {
            // Nota: Aquí el backend puede estar esperando "imagen" o "imagen_url", lo enviamos como imagen_url
            datosBD.imagen_url = await subirACloudinary(inputImagen.files[0]);
        }

        const respuesta = await fetch(`${baseUrl}/nosotros/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosBD)
        });

        if (!respuesta.ok) throw new Error("Error al actualizar la base de datos");

        alert("✅ ¡Sección actualizada correctamente!");
        cerrarEdicionNosotros();
        cargarPestanaNosotros();

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("❌ Ocurrió un error al guardar los cambios.");
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
};

// ==========================================
// 7. MÓDULO: GESTOR WEB (CONTACTO Y MAPA)
// ==========================================
window.cargarPestanaContacto = async function (evento, nombrePestana) {
    if (evento && nombrePestana) {
        abrirPestana(evento, nombrePestana);
    }

    try {
        const resContacto = await fetch(`${baseUrl}/contacto`);
        if (!resContacto.ok) throw new Error("Error al cargar datos de contacto");

        const datosContacto = await resContacto.json();

        if (datosContacto) {
            const contacto = Array.isArray(datosContacto) ? datosContacto[0] : datosContacto;

            document.getElementById("input-email").value = contacto.email || "";
            document.getElementById("input-telefono").value = contacto.telefono || "";
            document.getElementById("input-whatsapp").value = contacto.whatsapp || "";
            document.getElementById("input-direccion").value = contacto.direccion || "";
            document.getElementById("input-mapa").value = contacto.mapa_url || "";
        }
    } catch (error) {
        console.error("Error al cargar la pestaña de contacto:", error);
    }
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

        if (!respuesta.ok) throw new Error("Error al actualizar la base de datos de contacto");

        alert("✅ ¡Datos de contacto y mapa actualizados con éxito!");
    } catch (error) {
        console.error("Error al guardar contacto:", error);
        alert("❌ Hubo un error: " + error.message);
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
};
// ==========================================
// 8. MÓDULO: GESTIÓN DE PERSONAL
// ==========================================
let personalGlobal = [];
let rolesGlobales = [];

async function iniciarModuloPersonal() {
    const contenedor = document.getElementById("lista-personal");
    if (!contenedor) return;

    try {
        contenedor.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">⏳ Cargando personal...</td></tr>`;

        // Llamamos a las dos APIs al mismo tiempo para mayor velocidad
        const [resRoles, resPersonal] = await Promise.all([
            fetch(`${baseUrl}/roles`),
            fetch(`${baseUrl}/trabajadores`) // Ajusta esta ruta si tu endpoint se llama diferente (ej: /personal)
        ]);

        if (!resRoles.ok || !resPersonal.ok) throw new Error("Error al cargar las APIs");

        rolesGlobales = await resRoles.json();
        personalGlobal = await resPersonal.json();

        mostrarListaPersonal();
    } catch (error) {
        console.error("Error al cargar personal:", error);
        contenedor.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-red-500">❌ Error al conectar con la base de datos de personal.</td></tr>`;
    }
}

function mostrarListaPersonal() {
    const contenedor = document.getElementById("lista-personal");
    if (!contenedor) return;

    if (personalGlobal.length === 0) {
        contenedor.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">No hay personal registrado.</td></tr>`;
        return;
    }

    // Creamos el diccionario de roles
    const mapaRoles = {};
    rolesGlobales.forEach(rol => {
        mapaRoles[rol.idRol || rol.id] = rol.nombreRol || rol.nombre || "Desconocido";
    });

    let html = "";
    personalGlobal.forEach((emp) => {
        const idEmp = emp.idTrabajador || emp.id || emp.idEmpleado;
        const nombreRol = mapaRoles[emp.idRol] || "Sin Rol";
        const correo = emp.email || emp.correo || "Sin correo";
        const tel = emp.telefono || "Sin teléfono";

        // Lógica de colores y detección de Admin
        let colorRol = "bg-gray-900 text-gray-300 border-gray-700";
        let esAdmin = false; // Variable para saber si es administrador

        if (nombreRol.toLowerCase().includes("admin")) {
            colorRol = "bg-green-900 text-green-300 border-green-700";
            esAdmin = true; // Confirmamos que es admin
        } else if (nombreRol.toLowerCase().includes("recep")) {
            colorRol = "bg-purple-900 text-purple-300 border-purple-700";
        } else if (nombreRol.toLowerCase().includes("téc") || nombreRol.toLowerCase().includes("tec")) {
            colorRol = "bg-blue-900 text-blue-300 border-blue-700";
        }

        // CONDICIONAL PARA LOS BOTONES
        let botonesAccion = "";
        if (esAdmin) {
            // Si es administrador, mostramos un texto de "Protegido" sin botones
            botonesAccion = `
                <span class="text-gray-600 text-sm font-semibold flex items-center justify-end gap-1 cursor-not-allowed select-none" title="Cuenta de administrador protegida">
                    🔒 Protegido
                </span>
            `;
        } else {
            // Si es recepcionista o técnico, mostramos los botones normales
            botonesAccion = `
                <button onclick="abrirModalPersonal(${idEmp})" class="text-blue-400 hover:text-blue-300 transition font-semibold">Editar</button>
                <button onclick="confirmarEliminacionPersonal(${idEmp})" class="text-red-500 hover:text-red-400 transition font-semibold ml-3">Eliminar</button>
            `;
        }

        // Construimos la fila
        html += `
            <tr class="hover:bg-[#1a1a1a] transition duration-200">
                <td class="p-4 align-top">
                    <strong class="text-white text-base block">${emp.nombre} ${emp.aPaterno} ${emp.aMaterno || ''}</strong>
                    <span class="text-gray-500 text-xs mt-1">ID: ${idEmp}</span>
                </td>
                <td class="p-4 align-top">
                    <span class="${colorRol} border py-1 px-3 rounded-full text-xs font-bold tracking-wide">
                        ${nombreRol}
                    </span>
                </td>
                <td class="p-4 text-gray-300 align-top">
                    <div class="mb-1">✉️ ${correo}</div>
                    <div>📞 ${tel}</div>
                </td>
                <td class="p-4 text-right align-top">
                    ${botonesAccion}
                </td>
            </tr>
        `;
    });

    contenedor.innerHTML = html;
}
// ==========================================
// FUNCIONES DEL MODAL DE PERSONAL
// ==========================================
window.abrirModalPersonal = function(id = null) {
    const modal = document.getElementById("modal-personal");
    const form = document.getElementById("formulario-personal");
    if (!modal) return;
    
    if (form) form.reset(); // Limpia el formulario cada vez que se abre

    if (id) {
        console.log("Modo Edición para el ID:", id);
        // Aquí conectaremos los inputs cuando les pongamos ID en tu HTML
    } else {
        console.log("Modo Nuevo Empleado");
    }

    modal.classList.remove("hidden");
};

window.cerrarModalPersonal = function() {
    const modal = document.getElementById("modal-personal");
    if (modal) modal.classList.add("hidden");
};

window.confirmarEliminacionPersonal = function(id) {
    if(confirm("¿Estás seguro de que deseas eliminar a este empleado del sistema?")) {
        alert("Simulación: Empleado con ID " + id + " eliminado.");
        // Aquí agregaremos el fetch con method: 'DELETE'
    }
};
// ==========================================
// SISTEMA DE NOTIFICACIONES (ADMIN)
// ==========================================
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


// ==========================================
// SECCIÓN: ADMINISTRACIÓN DE PRODUCTOS (CRUD)
// ==========================================
let adminProductosData = [];

async function cargarTablaAdminProductos() {
    const tbody = document.getElementById('tabla-productos-admin');
    if (!tbody) return;

    try {
        const respuesta = await fetch(`${baseUrl}/productos`);
        if (!respuesta.ok) throw new Error("Error al obtener productos");
        
        // Guardamos los productos en la memoria global
        adminProductosData = await respuesta.json();
        tbody.innerHTML = '';

        if(adminProductosData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-500">No hay productos registrados.</td></tr>`;
            return;
        }

        adminProductosData.forEach(prod => {
            const imagenUrl = `${CLOUD_BASE}${prod.imagen_url}`;

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                    <td class="p-4 text-gray-500 font-medium">#${prod.idProducto}</td>
                    <td class="p-4">
                        <div class="w-12 h-12 bg-white rounded flex items-center justify-center p-1 border border-gray-200 shadow-sm">
                            <img src="${imagenUrl}" alt="Img" class="max-w-full max-h-full object-contain">
                        </div>
                    </td>
                    <td class="p-4 font-semibold text-gray-900">${prod.nombre}</td>
                    <td class="p-4"><span class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium border border-gray-200">${prod.categoria}</span></td>
                    <td class="p-4 text-[#6bc148] font-bold">$${parseFloat(prod.precio).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td class="p-4 text-gray-700">${prod.stock}</td>
                    <td class="p-4 text-center space-x-3">
                        <button onclick="abrirModalProducto(${prod.idProducto})" class="text-blue-500 hover:text-blue-700 font-medium transition" title="Editar">✏️ Editar</button>
                        <button onclick="eliminarProducto(${prod.idProducto})" class="text-red-500 hover:text-red-700 font-medium transition" title="Eliminar">🗑️</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error detallado al cargar la tabla:", error); 
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-red-500">Error al cargar la tabla. Revisa la consola.</td></tr>`;
    }
}

// Control del Modal
function abrirModalProducto(idProducto = null) {
    const modal = document.getElementById('modal-producto');
    const form = document.getElementById('formulario-producto');
    const titulo = document.getElementById('modal-titulo');
    
    const inputFile = document.getElementById('admin-imagen-file');
    const contenedorImgActual = document.getElementById('contenedor-imagen-actual');
    const nombreImgActual = document.getElementById('nombre-imagen-actual');

    form.reset(); 
    inputFile.value = ''; 

    if (idProducto) {
        // BUSCAMOS LOS DATOS DEL PRODUCTO EN LA MEMORIA GLOBAL
        const prod = adminProductosData.find(p => p.idProducto === idProducto);
        
        if (!prod) {
            alert("No se encontró la información del producto.");
            return;
        }

        titulo.innerText = "Editar Producto";
        
        // Llenamos los campos
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
}

function cerrarModalProducto() {
    document.getElementById('modal-producto').classList.add('hidden');
}

// Guardar (Crear o Editar)
async function gestionarSubmitProducto(evento) {
    evento.preventDefault();
    const id = document.getElementById('admin-id').value;
    const btnGuardar = document.getElementById('btn-guardar-producto');
    const inputFile = document.getElementById('admin-imagen-file');
    
    let nombreImagenFinal = document.getElementById('nombre-imagen-actual').innerText;

    btnGuardar.disabled = true;

    try {
        // IMAGEN  A CLOUDINARY ---
        if (inputFile.files.length > 0) {
            btnGuardar.innerText = "Subiendo imagen a la nube...";
            
            const formData = new FormData();
            formData.append('file', inputFile.files[0]);
            formData.append('upload_preset', UPLOAD_PRESET);

            const resCloudinary = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!resCloudinary.ok) throw new Error("Fallo al subir la imagen a Cloudinary.");
            
            const dataCloudinary = await resCloudinary.json();
            
            // guardar solo el "nombre.extensión"
            const urlCompleta = dataCloudinary.secure_url;
            nombreImagenFinal = urlCompleta.split('/').pop(); 
        }

        // ARMAMOS EL PAQUETE PARA LA API  
        btnGuardar.innerText = "Guardando datos...";
        const payload = {
            nombre: document.getElementById('admin-nombre').value,
            categoria: document.getElementById('admin-categoria').value,
            precio: parseFloat(document.getElementById('admin-precio').value),
            stock: parseInt(document.getElementById('admin-stock').value),
            descripcion: document.getElementById('admin-descripcion').value,
            imagen_url: nombreImagenFinal // <--- ¡Aquí va el nombre limpio para la base de datos!
        };

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/productos/${id}` : `${API_BASE_URL}/productos`;

        // MANDAMOS LA PETICIÓN AL BACKEND DE JAVA 
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) throw new Error("Error al guardar en la base de datos");

        cerrarModalProducto();
        cargarTablaAdminProductos(); 
        
    } catch (error) {
        alert("Ocurrió un error: " + error.message);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerText = "Guardar";
    }
}

// Eliminar
async function eliminarProducto(id) {
    if(!confirm("¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.")) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/productos/${id}`, { method: 'DELETE' });
        if (!respuesta.ok) throw new Error("Error al eliminar");
        
        cargarTablaAdminProductos(); // Recargar la tabla
    } catch (error) {
        alert("Ocurrió un error al eliminar: " + error.message);
    }
}

// ==========================================
// FUNCIÓN PARA GUARDAR EMPLEADO
// ==========================================
window.guardarEmpleado = async function(evento) {
    evento.preventDefault();
    
    const btnSubmit = evento.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = "⏳ Guardando...";
    btnSubmit.disabled = true;

    // 1. Recolectamos datos
    const idEmp = document.getElementById('emp-id').value;
    const emailUsuario = document.getElementById('emp-email-user').value.trim();
    const password = document.getElementById('emp-password').value;

    // Validamos que tenga contraseña si es un registro nuevo
    if (!idEmp && !password) {
        mostrarNotificacionAdmin("La contraseña es obligatoria para un nuevo empleado", "error");
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
        return;
    }

    // Juntamos el correo con el dominio fijo
    const correoCompleto = `${emailUsuario}@pcextreme.com`;

    const datosTrabajador = {
        nombre: document.getElementById('emp-nombre').value.trim(),
        aPaterno: document.getElementById('emp-ap-paterno').value.trim(),
        aMaterno: document.getElementById('emp-ap-materno').value.trim(),
        idRol: document.getElementById('emp-rol').value,
        email: correoCompleto,
        telefono: document.getElementById('emp-telefono').value.trim(),
        direccion: document.getElementById('emp-direccion').value.trim()
    };

    // Solo enviamos el password si el usuario escribió uno
    if (password) {
        datosTrabajador.password = password;
    }

    // 2. Extraemos el Token de seguridad del administrador
    const token = localStorage.getItem('token');

    try {
        let url = `${baseUrl}/trabajadores`;
        let method = 'POST'; 

        if (idEmp) {
            url = `${baseUrl}/trabajadores/${idEmp}`;
            method = 'PUT';
        }

        // 3. Hacemos la petición a la API
        const respuesta = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Enviamos la credencial
            },
            body: JSON.stringify(datosTrabajador)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.message || resultado.error || "Error al guardar el empleado");
        }

        // 4. Éxito
        mostrarNotificacionAdmin(`Empleado ${idEmp ? 'actualizado' : 'registrado'} correctamente`, 'exito');
        cerrarModalPersonal();
        iniciarModuloPersonal(); // Recarga la tabla de fondo

    } catch (error) {
        console.error("Error:", error);
        mostrarNotificacionAdmin(error.message, "error");
    } finally {
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
};

// ==========================================
// INICIALIZADOR GENERAL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    cargarComponentesAdmin();
    iniciarModuloReparaciones();
    iniciarModuloClientes();
    iniciarModuloWeb();
    iniciarModuloPersonal();
    if(document.getElementById('tabla-productos-admin')) {
        cargarTablaAdminProductos();
        document.getElementById('formulario-producto').addEventListener('submit', gestionarSubmitProducto);
    }
});