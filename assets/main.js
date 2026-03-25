// --- CONFIGURACIÓN GLOBAL ---
const API_BASE_URL = "https://app-web-java.vercel.app/api";
const CLOUD_NAME = "dswljrmnu";
const UPLOAD_PRESET = "productos_preset";
const CLOUD_BASE_IMG = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
const CLOUD_BASE_VID = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/`;

// --- UTILIDADES ---
function mostrarNotificacion(mensaje, tipo = "error") {
    let contenedor = document.getElementById("toast-container");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "toast-container";
        contenedor.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-3";
        document.body.appendChild(contenedor);
    }
    const bgClass = tipo === "error" ? "bg-red-600" : "bg-[#7ed957]";
    const textClass = tipo === "error" ? "text-white" : "text-black";
    const toast = document.createElement("div");
    toast.className = `${bgClass} ${textClass} px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0`;
    toast.innerHTML = `<span>${tipo === "error" ? "❌" : "✅"}</span><span>${mensaje}</span>`;
    contenedor.appendChild(toast);
    setTimeout(() => toast.classList.remove("translate-y-10", "opacity-0"), 10);
    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-10");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function mostrarConfirmacion(mensaje, tipo = "advertencia") {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[70] px-4 opacity-0 transition-opacity duration-300";
        const colorBtn = tipo === "peligro" ? "bg-red-600 hover:bg-red-700" : "bg-[#7ed957] hover:bg-[#6bc148] text-black";
        const icono = tipo === "peligro" ? "⚠️" : "❓";
        overlay.innerHTML = `
            <div class="bg-[#111] border border-gray-700 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-8 max-w-sm w-full transform scale-95 transition-transform duration-300 text-center">
                <span class="text-5xl mb-4 block drop-shadow-lg">${icono}</span>
                <h3 class="text-xl font-bold text-white mb-2">¿Estás seguro?</h3>
                <p class="text-gray-400 text-sm mb-8 leading-relaxed">${mensaje}</p>
                <div class="flex justify-center gap-4">
                    <button id="btn-cancelar-conf" class="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition text-sm">Cancelar</button>
                    <button id="btn-aceptar-conf" class="px-6 py-2.5 ${colorBtn} rounded-full font-bold transition text-sm shadow-lg">Sí, continuar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        setTimeout(() => { overlay.classList.remove("opacity-0"); overlay.querySelector("div").classList.remove("scale-95"); }, 10);
        const cerrar = (res) => {
            overlay.classList.add("opacity-0"); overlay.querySelector("div").classList.add("scale-95");
            setTimeout(() => { overlay.remove(); resolve(res); }, 300);
        };
        overlay.querySelector("#btn-aceptar-conf").addEventListener("click", () => cerrar(true));
        overlay.querySelector("#btn-cancelar-conf").addEventListener("click", () => cerrar(false));
    });
}

function pedirPasswordActual() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[80] px-4 opacity-0 transition-opacity duration-300";
        overlay.innerHTML = `
            <div class="bg-[#111] border border-gray-700 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-8 max-w-sm w-full transform scale-95 transition-transform duration-300 text-center">
                <span class="text-5xl mb-4 block drop-shadow-lg">🔐</span>
                <h3 class="text-xl font-bold text-white mb-2">Autenticación Requerida</h3>
                <p class="text-gray-400 text-sm mb-6 leading-relaxed">Ingresa tu contraseña actual para confirmar los cambios.</p>
                <div class="relative flex items-center mb-8 text-left">
                    <input type="password" id="input-pass-seguridad" placeholder="Tu contraseña actual" class="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-white focus:border-[#7ed957] focus:outline-none transition">
                    <button type="button" id="btn-ojo-seguridad" class="absolute right-3 text-gray-500 hover:text-[#7ed957] transition cursor-pointer">👁️</button>
                </div>
                <div class="flex justify-center gap-4">
                    <button id="btn-cancelar-pass" class="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition text-sm">Cancelar</button>
                    <button id="btn-aceptar-pass" class="px-6 py-2.5 bg-[#7ed957] hover:bg-[#6bc148] text-black rounded-full font-bold transition text-sm shadow-lg">Confirmar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        setTimeout(() => { overlay.classList.remove("opacity-0"); overlay.querySelector("div").classList.remove("scale-95"); }, 10);
        const inputPass = overlay.querySelector("#input-pass-seguridad");
        const btnOjo = overlay.querySelector("#btn-ojo-seguridad");
        btnOjo.addEventListener("mouseenter", () => (inputPass.type = "text"));
        btnOjo.addEventListener("mouseleave", () => (inputPass.type = "password"));
        const cerrar = (res) => {
            overlay.classList.add("opacity-0"); overlay.querySelector("div").classList.add("scale-95");
            setTimeout(() => { overlay.remove(); resolve(res); }, 300);
        };
        overlay.querySelector("#btn-aceptar-pass").addEventListener("click", () => cerrar(inputPass.value.trim()));
        overlay.querySelector("#btn-cancelar-pass").addEventListener("click", () => cerrar(null));
    });
}

function inicializarOjosPasswordGlobal() {
    document.querySelectorAll(".btn-ver-password").forEach((boton) => {
        const input = boton.previousElementSibling;
        if (input && input.tagName === "INPUT") {
            boton.addEventListener("mouseenter", () => (input.type = "text"));
            boton.addEventListener("mouseleave", () => (input.type = "password"));
        }
    });
}

function inicializarSepomex(inputId, estadoId, muniId, asentaContId, selectId, extraClasses) {
    const inputCP = document.getElementById(inputId);
    if (!inputCP) return;
    inputCP.addEventListener("input", async (e) => {
        const cp = e.target.value.trim();
        if (cp.length === 5) {
            mostrarNotificacion("Buscando código postal...", "exito");
            try {
                // GET: API Externa SEPOMEX
                const res = await fetch(`https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${cp}`);
                const datos = await res.json();
                if (!datos.zip_codes || !datos.zip_codes.length) throw new Error("C.P. no encontrado");
                document.getElementById(estadoId).value = datos.zip_codes[0].d_estado;
                document.getElementById(muniId).value = datos.zip_codes[0].d_mnpio;
                let html = `<select id="${selectId}" required class="w-full border border-gray-700 rounded-lg px-4 py-3 focus:border-[#7ed957] focus:outline-none transition ${extraClasses}"><option value="" disabled selected>Selecciona un asentamiento...</option>`;
                datos.zip_codes.forEach(l => html += `<option value="${l.d_asenta}">${l.d_asenta}</option>`);
                document.getElementById(asentaContId).innerHTML = html + `</select>`;
            } catch (error) { mostrarNotificacion("C.P. no válido o no encontrado", "error"); }
        }
    });
}

// --- AUTENTICACIÓN Y SESIÓN ---
function verificarSesion() {
    const token = localStorage.getItem("token");
    const usuarioStr = localStorage.getItem("usuario");
    if (!token || !usuarioStr) return;
    const usuario = JSON.parse(usuarioStr);

    if (window.location.pathname.includes("login.html")) {
        window.location.replace(usuario.tipo === "trabajador" ? "/FrontEnd-PCEXTREME/admin/dashboard.html" : "/FrontEnd-PCEXTREME/index.html");
        return;
    }

    if (usuario.tipo === "cliente") {
        const authButton = document.getElementById("authButton");
        if (authButton) {
            authButton.parentElement.innerHTML = `
                <div class="relative inline-block text-left">
                    <button id="userMenuButton" class="border border-[#7ed957] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#7ed957] hover:text-black transition">Hola, ${usuario.nombre}</button>
                    <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-[#1f1f1f] rounded-xl shadow-lg border border-gray-700 overflow-hidden z-50">
                        <button onclick="window.location.href='/FrontEnd-PCEXTREME/public/perfil.html'" class="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition font-semibold">Mi Perfil</button>
                        <button onclick="cerrarSesion()" class="w-full text-left px-4 py-3 text-[#ff4d4d] hover:bg-gray-800 transition font-semibold">Cerrar Sesión</button>
                    </div>
                </div>`;
            const btn = document.getElementById("userMenuButton");
            const drop = document.getElementById("userDropdown");
            btn.addEventListener("click", () => drop.classList.toggle("hidden"));
            window.addEventListener("click", (e) => { if (!btn.contains(e.target) && !drop.contains(e.target)) drop.classList.add("hidden"); });
        }
    }
}

window.cerrarSesion = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.replace("/FrontEnd-PCEXTREME/index.html");
};

function inicializarEventosLogin() {
    const btnIrRegistro = document.getElementById("ir-a-registro");
    const btnIrLogin = document.getElementById("ir-a-login");
    const bloqueLogin = document.getElementById("bloque-login");
    const bloqueRegistro = document.getElementById("bloque-registro");

    const formLogin = document.getElementById("formulario-login");
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            const txtOrig = btnSubmit.innerText;
            btnSubmit.innerText = "Verificando..."; btnSubmit.disabled = true;

            const payload = { email: document.getElementById("correo-login").value, password: document.getElementById("password-login").value };
            try {
                // POST: /api/auth/login/cliente
                let res = await fetch(`${API_BASE_URL}/auth/login/cliente`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                let datos = await res.json();
                if (!res.ok) {
                    // POST: /api/auth/login/trabajador
                    let resT = await fetch(`${API_BASE_URL}/auth/login/trabajador`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                    let datosT = await resT.json();
                    if (!resT.ok) throw new Error(datosT.message || datos.message || "Credenciales inválidas");
                    datos = datosT;
                }
                localStorage.setItem("token", datos.token);
                localStorage.setItem("usuario", JSON.stringify(datos.usuario));
                mostrarNotificacion(`¡Bienvenido, ${datos.usuario.nombre}!`, "exito");
                setTimeout(() => window.location.href = datos.usuario.tipo === "trabajador" ? "/FrontEnd-PCEXTREME/admin/dashboard.html" : "/FrontEnd-PCEXTREME/index.html", 1500);
            } catch (error) { mostrarNotificacion(error.message, "error"); } 
            finally { btnSubmit.innerText = txtOrig; btnSubmit.disabled = false; }
        });
    }

    const formRegistro = document.getElementById("formulario-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();
            const password = document.getElementById("reg-password").value;
            if (password !== document.getElementById("reg-password-confirm").value) return mostrarNotificacion("Las contraseñas no coinciden.", "error");

            const btnSubmit = formRegistro.querySelector('button[type="submit"]');
            const txtOrig = btnSubmit.innerText;
            btnSubmit.innerText = "⏳ Creando cuenta..."; btnSubmit.disabled = true;

            const datosCli = {
                nombre: document.getElementById("reg-nombre").value.trim(), aPaterno: document.getElementById("reg-ap-paterno").value.trim(),
                aMaterno: document.getElementById("reg-ap-materno").value.trim(), telefono: document.getElementById("reg-telefono").value.trim(),
                CPostal: document.getElementById("reg-cp").value.trim(), estado: document.getElementById("reg-estado").value.trim(),
                municipio: document.getElementById("reg-ciudad").value.trim(), asentamiento: document.getElementById("reg-asentamiento").value.trim(),
                calle: document.getElementById("reg-calle").value.trim(), email: document.getElementById("reg-email").value.trim(), password: password
            };

            try {
                // POST: /api/clientes
                const res = await fetch(`${API_BASE_URL}/clientes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datosCli) });
                if (!res.ok) throw new Error((await res.json()).message || "Error al crear la cuenta");
                mostrarNotificacion("¡Cuenta creada con éxito!", "exito");
                formRegistro.reset();
                setTimeout(() => document.getElementById("ir-a-login").click(), 1500);
            } catch (error) { mostrarNotificacion(error.message, "error"); } 
            finally { btnSubmit.innerText = txtOrig; btnSubmit.disabled = false; }
        });
    }

    if (btnIrRegistro && btnIrLogin && bloqueLogin && bloqueRegistro) {
        if (new URLSearchParams(window.location.search).get("tab") === "registro") {
            bloqueLogin.classList.replace("block", "hidden"); bloqueRegistro.classList.replace("hidden", "block");
        }
        btnIrRegistro.addEventListener("click", (e) => { e.preventDefault(); bloqueLogin.classList.replace("block", "hidden"); bloqueRegistro.classList.replace("hidden", "block"); window.history.pushState({}, "", "?tab=registro"); });
        btnIrLogin.addEventListener("click", (e) => { e.preventDefault(); bloqueRegistro.classList.replace("block", "hidden"); bloqueLogin.classList.replace("hidden", "block"); window.history.pushState({}, "", window.location.pathname); });
    }
}

// --- PORTADA Y SERVICIOS ---
async function cargarPortada() {
    const cont = document.getElementById("portada-contenido");
    const vid = document.getElementById("video-empresa");
    if (!cont) return;
    try {
        // GET: /api/inicio
        const res = await fetch(`${API_BASE_URL}/inicio`);
        const datos = (await res.json())[0];
        cont.innerHTML = `
            <h2 class="text-5xl md:text-6xl font-extrabold leading-tight">${datos.titulo || "¿Tu PC necesita<br>mantenimiento?"}</h2>
            <p class="text-gray-300 text-lg max-w-lg">${datos.descripcion || "¡Recupérala al máximo rendimiento!"}</p>
            <button onclick="window.location.href='/FrontEnd-PCEXTREME/public/contacto.html'" class="bg-[#7ed957] hover:bg-[#6bc148] text-white font-bold py-3 px-8 rounded-full transition shadow-[0_0_15px_rgba(126,217,87,0.3)]">Contáctanos</button>`;
        if (datos.video_url && vid) { vid.innerHTML = `<source src="${CLOUD_BASE_VID}${datos.video_url}.mp4" type="video/mp4">`; vid.load(); }
    } catch (e) { cont.innerHTML = `<p class="text-red-500">Error de conexión.</p>`; }
}

async function cargarServicios() {
    const cont = document.getElementById("lista-servicios");
    if (!cont) return;
    try {
        // GET: /api/servicios
        const res = await fetch(`${API_BASE_URL}/servicios`);
        const servs = [].concat(await res.json());
        if (!servs.length) return cont.innerHTML = `<p class="text-gray-400 text-center col-span-full">Sin servicios.</p>`;
        cont.innerHTML = servs.map(s => `
            <div class="bg-[#1f1f1f] rounded-xl overflow-hidden shadow-lg border border-transparent hover:border-[#7ed957] transition-all duration-300">
                <div class="h-52 w-full overflow-hidden"><img src="${CLOUD_BASE_IMG}${s.imagen}" class="w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500"></div>
            </div>`).join('');
    } catch (e) { cont.innerHTML = `<p class="text-red-500 col-span-full text-center">Error al cargar.</p>`; }
}

async function cargarMarcas() {
    const cont = document.getElementById("carrusel-marcas");
    if (!cont) return;
    try {
        // GET: /api/marcas
        const res = await fetch(`${API_BASE_URL}/marcas`);
        if (!res.ok) return;
        const marcas = await res.json();
        cont.className = "animacion-carrusel items-center gap-16 py-4";
        cont.innerHTML = [...marcas, ...marcas, ...marcas, ...marcas].map(m => `
            <a href="${m.url}" target="_blank" class="flex-shrink-0"><img src="${CLOUD_BASE_IMG}/${m.logo}" class="h-8 md:h-12 w-auto object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"></a>`).join('');
    } catch (e) {}
}

// --- RASTREO DE EQUIPOS ---
async function rastrearEquipo(evento) {
    evento.preventDefault();
    const folio = document.getElementById("input-folio").value.trim();
    const msjErr = document.getElementById("mensaje-error");
    const contRes = document.getElementById("resultado-consulta");
    const btnSubmit = evento.target.querySelector('button[type="submit"]');
    const txtOrig = btnSubmit.innerHTML;

    msjErr.classList.add("hidden"); contRes.classList.add("hidden", "opacity-0");
    if (!folio) { msjErr.innerText = "Ingresa un folio."; msjErr.classList.remove("hidden"); return; }
    btnSubmit.disabled = true; btnSubmit.innerHTML = "Buscando...";

    try {
        // GET: /api/registros/:folio
        const res = await fetch(`${API_BASE_URL}/registros/${folio}`);
        if (!res.ok) throw new Error("Equipo no encontrado.");
        let datos = await res.json();
        if (Array.isArray(datos)) { if (!datos.length) throw new Error("No encontrado"); datos = datos[0]; }

        let marca = "Info N/A", modelo = "N/A";
        if (datos.idDispositivo) {
            try {
                // GET: /api/dispositivos/:id
                const resD = await fetch(`${API_BASE_URL}/dispositivos/${datos.idDispositivo}`);
                if (resD.ok) {
                    const disp = Array.isArray(await resD.json()) ? (await resD.json())[0] : await resD.json();
                    marca = `${disp.marca || ""} `.trim() || `Disp #${datos.idDispositivo}`;
                    modelo = `${disp.modelo || ""} `.trim() || "N/A";
                }
            } catch (e) { marca = `Disp ID: ${datos.idDispositivo}`; }
        }

        document.getElementById("resultado-folio").innerText = `#${datos.idFolio || folio}`;
        document.getElementById("resultado-equipo").innerText = marca; document.getElementById("resultado-serie").innerText = modelo;
        document.getElementById("resultado-fecha").innerText = datos.fechaIngreso ? new Date(datos.fechaIngreso).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) : "--";
        document.getElementById("resultado-problema").innerText = datos.detalles || "Sin detalles";
        document.getElementById("resultado-diagnostico").innerText = datos.diagnostico || "Pendiente";
        document.getElementById("resultado-costo").innerText = `$${datos.costo || "0.00"}`;
        actualizarEstadoBadge(datos.estadoEquipo, "resultado-estado");

        contRes.classList.remove("hidden"); setTimeout(() => contRes.classList.replace("opacity-0", "opacity-100"), 50);
    } catch (err) { msjErr.innerText = err.message; msjErr.classList.remove("hidden"); } 
    finally { btnSubmit.disabled = false; btnSubmit.innerHTML = txtOrig; }
}

function actualizarEstadoBadge(estado, idElemento) {
    const b = document.getElementById(idElemento);
    b.innerText = estado || "Desconocido";
    b.className = "px-4 py-1 rounded-full text-sm font-bold uppercase border";
    const eLower = (estado || "").toLowerCase();
    if (eLower.includes("revisión") || eLower.includes("pendiente")) b.classList.add("bg-blue-600/20", "text-blue-400", "border-blue-600/50");
    else if (eLower.includes("reparación") || eLower.includes("proceso")) b.classList.add("bg-yellow-600/20", "text-yellow-400", "border-yellow-600/50");
    else if (eLower.includes("listo") || eLower.includes("entregado")) b.classList.add("bg-green-600/20", "text-green-400", "border-green-600/50");
    else b.classList.add("bg-gray-600/20", "text-gray-400", "border-gray-600/50");
}

// --- CATÁLOGO DE PRODUCTOS ---
let productosGlobales = [];

async function cargarCatalogoProductos() {
    const contCat = document.getElementById("contenedor-categorias");
    const estado = document.getElementById("estado-productos");
    if (!contCat || !estado) return;
    try {
        // GET: /api/productos
        const res = await fetch(`${API_BASE_URL}/productos`);
        if (!res.ok) throw new Error();
        productosGlobales = [].concat(await res.json());
        estado.classList.add("hidden");

        const cats = ["Todos", ...new Set(productosGlobales.map((p) => p.categoria))];
        cats.forEach((cat, i) => {
            const btn = document.createElement("button");
            btn.className = `px-6 py-2 rounded-full text-sm font-bold transition border ${i === 0 ? "bg-[#7ed957] text-black border-[#7ed957]" : "bg-transparent text-gray-400 border-gray-700 hover:border-[#7ed957] hover:text-[#7ed957]"}`;
            btn.innerText = cat.toUpperCase();
            btn.addEventListener("click", () => {
                Array.from(contCat.children).forEach(b => { b.classList.remove("bg-[#7ed957]", "text-black", "border-[#7ed957]"); b.classList.add("bg-transparent", "text-gray-400", "border-gray-700"); });
                btn.classList.replace("bg-transparent", "bg-[#7ed957]"); btn.classList.replace("text-gray-400", "text-black"); btn.classList.replace("border-gray-700", "border-[#7ed957]");
                renderizarCuadricula(cat);
            });
            contCat.appendChild(btn);
        });
        renderizarCuadricula("Todos");
    } catch (e) { estado.innerHTML = `<p class="text-red-500">Error al cargar inventario.</p>`; }
}

function renderizarCuadricula(filtro) {
    const grid = document.getElementById("cuadricula-productos");
    grid.innerHTML = "";
    const prods = filtro === "Todos" ? productosGlobales : productosGlobales.filter(p => p.categoria === filtro);
    if (!prods.length) return grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">No hay productos.</p>`;
    
    grid.innerHTML = prods.map(p => `
        <div class="bg-[#151515] border border-gray-800 rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-[#7ed957] transition-all flex flex-col group cursor-pointer" onclick="window.location.href='detalle_producto.html?id=${p.idProducto}'">
            <div class="h-48 w-full bg-black p-4 flex items-center justify-center overflow-hidden"><img src="${CLOUD_BASE_IMG}/${p.imagen_url}" class="max-h-full max-w-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"></div>
            <div class="p-5 flex flex-col flex-grow text-left">
                <span class="text-xs font-bold text-gray-500 uppercase mb-2">${p.categoria}</span>
                <h3 class="text-white text-md font-semibold mb-3 line-clamp-2">${p.nombre}</h3>
                <div class="mt-auto flex justify-between items-end">
                    <div><span class="text-xs text-gray-500 block mb-1">Precio</span><span class="text-[#7ed957] font-extrabold text-xl">$${parseFloat(p.precio).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
                    <span class="text-[#7ed957] font-bold">→</span>
                </div>
            </div>
        </div>`).join('');
}

async function cargarDetalleProducto() {
    const cont = document.getElementById("contenedor-detalle");
    const estado = document.getElementById("estado-detalle");
    const id = new URLSearchParams(window.location.search).get("id");
    if (!cont || !id) return estado && (estado.innerHTML = `<p class="text-red-500">Producto no especificado.</p>`);

    try {
        // GET: /api/productos/:id
        const res = await fetch(`${API_BASE_URL}/productos/${id}`);
        if (!res.ok) throw new Error();
        const d = Array.isArray(await res.json()) ? (await res.json())[0] : await res.json();
        estado.classList.add("hidden"); cont.classList.remove("hidden");

        cont.innerHTML = `
            <div class="bg-black border border-gray-800 rounded-2xl p-6 flex items-center justify-center"><img src="${CLOUD_BASE_IMG}/${d.imagen_url}" class="max-w-full max-h-96 object-contain hover:scale-105 transition-transform"></div>
            <div class="flex flex-col justify-center">
                <span class="inline-block bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase w-max mb-4">${d.categoria}</span>
                <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-6">${d.nombre}</h1>
                <div class="text-[#7ed957] text-4xl font-black mb-6">$${parseFloat(d.precio).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div class="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 mb-8">
                    <p class="text-gray-400 text-sm mb-2">Stock:</p>
                    <div class="flex items-center gap-3"><span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase">${d.estado_stock || "Desconocido"}</span><span class="text-gray-500 text-sm">(Cantidad: ${d.stock || 0})</span></div>
                </div>
                <div class="mb-8"><h3 class="text-white font-semibold mb-2 border-b border-gray-800 pb-2">Descripción</h3><p class="text-gray-400 text-sm">${d.descripcion || "Sin descripción"}</p></div>
                <a href="https://wa.me/${d.telefono_empresa || "7711784044"}?text=${encodeURIComponent(`Hola PC EXTREME, me interesa: ${d.nombre}`)}" target="_blank" class="w-full bg-[#7ed957] hover:bg-[#6bc148] text-black text-center font-bold py-4 px-8 rounded-full transition shadow-[0_0_15px_rgba(126,217,87,0.2)]">Me interesa</a>
            </div>`;
    } catch (e) { estado.innerHTML = `<p class="text-red-500">Error al cargar producto.</p>`; }
}

// --- ESTADÍSTICAS Y GRÁFICAS ---
const P0 = 12, k = Math.log(250 / 12) / 2.2;
let miGraficoCrecimiento;

window.calcularCrecimiento = function () {
    const t_futuro = parseFloat(document.getElementById("input-tiempo")?.value);
    if (isNaN(t_futuro) || t_futuro < 0) return mostrarNotificacion("Ingresa un tiempo válido.", "error");
    document.getElementById("resultado-k").innerText = k.toFixed(4);
    document.getElementById("resultado-p").innerText = Math.round(P0 * Math.exp(k * t_futuro)).toLocaleString();
    dibujarGraficaCrecimiento(t_futuro);
};

function dibujarGraficaCrecimiento(t_max) {
    const ctx = document.getElementById("graficaCrecimiento")?.getContext("2d");
    if (!ctx) return;
    if (miGraficoCrecimiento) miGraficoCrecimiento.destroy();
    let lbls = [], dts = [];
    for (let i = 0; i <= 20; i++) { lbls.push("Año " + ((t_max / 20) * i).toFixed(1)); dts.push(Math.round(P0 * Math.exp(k * ((t_max / 20) * i)))); }
    miGraficoCrecimiento = new Chart(ctx, { type: "line", data: { labels: lbls, datasets: [{ label: "Clientes Registrados", data: dts, borderColor: "#7ed957", backgroundColor: "rgba(126, 217, 87, 0.1)", borderWidth: 3, pointBackgroundColor: "#3f51b5", fill: true }] }, options: { responsive: true, maintainAspectRatio: false } });
}

// --- PERFIL Y DISPOSITIVOS ---
let clienteActualGlobal = null;

async function cargarPerfilYDispositivos() {
    const usr = JSON.parse(localStorage.getItem("usuario"));
    if (!usr) return;
    try {
        // GET: /api/clientes/:id & /api/dispositivos
        const [resP, resD] = await Promise.all([fetch(`${API_BASE_URL}/clientes/${usr.idCliente || usr.id}`), fetch(`${API_BASE_URL}/dispositivos`)]);
        if (resP.ok) {
            clienteActualGlobal = Array.isArray(await resP.json()) ? (await resP.json())[0] : await resP.json();
            document.getElementById("perfil-nombre").innerText = clienteActualGlobal.nombre || "N/A";
            document.getElementById("perfil-apellidos").innerText = `${clienteActualGlobal.aPaterno || ""} ${clienteActualGlobal.aMaterno || ""}`.trim() || "N/A";
            document.getElementById("perfil-telefono").innerText = clienteActualGlobal.telefono || "N/A";
            document.getElementById("perfil-correo").innerText = clienteActualGlobal.email || clienteActualGlobal.correo || "N/A";
        }
        if (resD.ok) {
            const misDisp = (await resD.json()).filter(d => String(d.idCliente) === String(usr.idCliente || usr.id));
            const lista = document.getElementById("lista-mis-dispositivos");
            if (!misDisp.length) return lista.innerHTML = `<div class="bg-gray-900/50 p-8 rounded-xl text-center"><p class="text-gray-400 font-medium">Sin dispositivos registrados.</p></div>`;
            lista.innerHTML = misDisp.map(d => `
                <div class="bg-[#151515] border border-gray-800 p-5 rounded-xl flex justify-between items-center hover:border-[#7ed957] transition group">
                    <div class="flex items-center gap-4">
                        <div class="bg-gray-900 p-3 rounded-lg text-gray-400"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div>
                        <div><h4 class="text-lg font-bold text-white uppercase">${d.marca}</h4><p class="text-sm text-gray-400">Mod. ${d.modelo}</p></div>
                    </div>
                    <button onclick="window.location.href='/FrontEnd-PCEXTREME/public/detalleDispositivo.html?id=${d.idDispositivo}'" class="px-5 py-2.5 bg-gray-800 hover:bg-[#7ed957] text-gray-300 hover:text-black font-bold rounded-lg transition">Ver Detalles</button>
                </div>`).join('');
        }
    } catch (e) { mostrarNotificacion("Error al cargar perfil.", "error"); }
}

window.abrirEdicionPerfil = async function () {
    if (!clienteActualGlobal) return;
    document.getElementById("vista-perfil").classList.add("hidden"); document.getElementById("vista-edicion").classList.remove("hidden");
    const cg = clienteActualGlobal;
    document.getElementById("edit-id-cliente").value = cg.idCliente || cg.id; document.getElementById("edit-nombre").value = cg.nombre || "";
    document.getElementById("edit-ap-paterno").value = cg.aPaterno || ""; document.getElementById("edit-ap-materno").value = cg.aMaterno || "";
    document.getElementById("edit-telefono").value = cg.telefono || ""; document.getElementById("edit-correo").value = cg.email || cg.correo || "";
    document.getElementById("edit-cp").value = cg.CPostal || ""; document.getElementById("edit-estado").value = cg.estado || "";
    document.getElementById("edit-ciudad").value = cg.municipio || ""; document.getElementById("edit-calle").value = cg.calle || "";
    document.getElementById("edit-nueva-password").value = ""; document.getElementById("edit-conf-password").value = "";
    document.getElementById("contenedor-edit-asentamiento").innerHTML = `<input type="text" id="edit-asentamiento" readonly class="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed">`;
    if (cg.CPostal && String(cg.CPostal).length === 5) {
        try {
            // GET: API Externa SEPOMEX
            const res = await fetch(`https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${cg.CPostal}`);
            const d = await res.json();
            if (d.zip_codes && d.zip_codes.length) {
                let html = `<select id="edit-asentamiento" class="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white">`;
                d.zip_codes.forEach(l => html += `<option value="${l.d_asenta}" ${l.d_asenta === cg.asentamiento ? "selected" : ""}>${l.d_asenta}</option>`);
                document.getElementById("contenedor-edit-asentamiento").innerHTML = html + `</select>`;
            }
        } catch (e) {}
    }
};

window.cerrarEdicionPerfil = () => { document.getElementById("vista-edicion").classList.add("hidden"); document.getElementById("vista-perfil").classList.remove("hidden"); };

function inicializarFormularioPerfil() {
    const f = document.getElementById("formulario-editar-perfil");
    if (!f) return;
    f.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nP = document.getElementById("edit-nueva-password").value;
        if (nP && nP !== document.getElementById("edit-conf-password").value) return mostrarNotificacion("Contraseñas no coinciden.", "error");
        if (!(await mostrarConfirmacion("¿Actualizar perfil?", "advertencia"))) return;
        const pass = await pedirPasswordActual(); if (!pass) return;

        const btn = e.target.querySelector('button[type="submit"]'); const txtO = btn.innerHTML;
        btn.innerHTML = "Guardando..."; btn.disabled = true;

        try {
            // POST: /api/auth/login/cliente (Validación)
            const resLogin = await fetch(`${API_BASE_URL}/auth/login/cliente`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: clienteActualGlobal.email || clienteActualGlobal.correo, password: pass }) });
            if (!resLogin.ok) throw new Error("Contraseña incorrecta.");

            const payload = {
                nombre: document.getElementById("edit-nombre").value.trim(), aPaterno: document.getElementById("edit-ap-paterno").value.trim(),
                aMaterno: document.getElementById("edit-ap-materno").value.trim(), telefono: document.getElementById("edit-telefono").value.trim(),
                CPostal: document.getElementById("edit-cp").value.trim(), estado: document.getElementById("edit-estado").value.trim(),
                municipio: document.getElementById("edit-ciudad").value.trim(), asentamiento: document.getElementById("edit-asentamiento").value.trim(),
                calle: document.getElementById("edit-calle").value.trim(), email: document.getElementById("edit-correo").value.trim()
            };
            if (nP) payload.password = nP;

            // PUT: /api/clientes/:id
            const resPut = await fetch(`${API_BASE_URL}/clientes/${document.getElementById("edit-id-cliente").value}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }, body: JSON.stringify(payload) });
            if (!resPut.ok) throw new Error("Error servidor.");

            let u = JSON.parse(localStorage.getItem("usuario")); u.nombre = payload.nombre; u.email = payload.email; localStorage.setItem("usuario", JSON.stringify(u));
            mostrarNotificacion("¡Perfil actualizado!", "exito"); cerrarEdicionPerfil(); cargarPerfilYDispositivos(); verificarSesion();
        } catch (err) { mostrarNotificacion(err.message, "error"); } finally { btn.innerHTML = txtO; btn.disabled = false; }
    });
}

// --- DETALLES DE DISPOSITIVOS ---
async function cargarDetalleDispositivoCliente() {
    const id = new URLSearchParams(window.location.search).get("id");
    const panel = document.getElementById("panel-diagnostico");
    if (!panel || !id) return panel && (panel.innerHTML = '<p class="text-red-500 text-center font-bold">Dispositivo no especificado.</p>');
    
    try {
        // GET: /api/dispositivos/:id & /api/registros
        const [resD, resR] = await Promise.all([fetch(`${API_BASE_URL}/dispositivos/${id}`), fetch(`${API_BASE_URL}/registros`)]);
        if (!resD.ok) throw new Error("No se pudo cargar el dispositivo.");
        const disp = Array.isArray(await resD.json()) ? (await resD.json())[0] : await resD.json();
        
        document.getElementById("det-marca").innerText = disp.marca || "N/A";
        document.getElementById("det-modelo").innerText = disp.modelo || "N/A";
        document.getElementById("det-sn").innerText = disp.numSerie || "N/A";

        const reg = (await resR.json()).reverse().find(r => String(r.idDispositivo) === String(id));
        if (reg) {
            document.getElementById("det-fecha").innerText = reg.fechaIngreso ? new Date(reg.fechaIngreso).toLocaleDateString("es-MX") : "--";
            document.getElementById("det-detalles").innerText = reg.detalles || "Sin detalles.";
            document.getElementById("det-diagnostico").innerText = reg.diagnostico || "Pendiente.";
            document.getElementById("det-costo").innerText = `$${parseFloat(reg.costo || 0).toFixed(2)}`;
            actualizarEstadoBadge(reg.estadoEquipo, "det-estado");

            let tecNombre = "No asignado";
            if (reg.idTecnico) {
                try {
                    // GET: /api/trabajadores
                    const tec = (await (await fetch(`${API_BASE_URL}/trabajadores`)).json()).find(t => String(t.idTrabajador || t.idEmpleado) === String(reg.idTecnico));
                    if (tec) tecNombre = `${tec.nombre} ${tec.aPaterno}`;
                } catch (e) {}
            }
            document.getElementById("det-tecnico").innerText = tecNombre;
        } else {
            panel.innerHTML = `<div class="flex flex-col items-center justify-center py-10 h-full"><span class="text-6xl mb-4 opacity-50">📋</span><h3 class="text-xl font-bold text-white mb-2">Sin historial</h3><p class="text-gray-400">Sin orden activa.</p></div>`;
        }
    } catch (e) { panel.innerHTML = `<p class="text-red-500 text-center font-bold">${e.message}</p>`; }
}

// --- NOSOTROS Y CONTACTO ---
async function cargarNosotrosCliente() {
    const cont = document.getElementById('contenedor-nosotros');
    if (!cont) return;
    try {
        // GET: /api/nosotros
        const res = await fetch(`${API_BASE_URL}/nosotros`);
        if (!res.ok) throw new Error();
        const datos = await res.json();
        if (!datos.length) return cont.innerHTML = `<p class="text-gray-500 text-center">Sin información.</p>`;
        cont.innerHTML = datos.map((d, i) => {
            let img = d.imagen_url || d.imagen || "https://via.placeholder.com/600x400";
            if (img && !img.startsWith('http')) img = `${CLOUD_BASE_IMG}${img}`;
            return `<section class="glass-card w-full max-w-5xl rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden"><div class="flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12"><div class="w-full md:w-1/3"><img src="${img}" class="rounded-2xl w-full object-cover aspect-video"></div><div class="flex-1"><h3 class="text-neon-green text-2xl font-bold mb-4">${d.titulo}</h3><p class="text-gray-300">${d.descripcion}</p></div></div></section>`;
        }).join('');
    } catch (e) { cont.innerHTML = `<p class="text-red-500 text-center">Error API.</p>`; }
}

async function cargarUbicacionCliente() {
    const txtDir = document.getElementById('ubi-direccion');
    if (!txtDir) return;
    try {
        // GET: /api/contacto
        const res = await fetch(`${API_BASE_URL}/contacto`);
        const c = Array.isArray(await res.json()) ? (await res.json())[0] : await res.json();
        txtDir.classList.remove('animate-pulse'); txtDir.innerText = c.direccion || 'N/A';
        if (c.mapa_url) {
            document.getElementById('ubi-link-maps').href = c.mapa_url;
            document.getElementById('ubi-iframe').src = `https://maps.google.com/maps?q=$${encodeURIComponent(c.direccion)}&output=embed`;
            document.getElementById('ubi-iframe').classList.remove('hidden'); document.getElementById('ubi-loading-map').classList.add('hidden');
        }
    } catch (e) { txtDir.innerText = 'Error ubicación.'; }
}

async function cargarInfoContactoPublico() {
    try {
        // GET: /api/contacto
        const res = await fetch(`${API_BASE_URL}/contacto`);
        if (!res.ok) return;
        const c = Array.isArray(await res.json()) ? (await res.json())[0] : await res.json();
        if (c.email) { document.getElementById('publico-email').href = `mailto:${c.email}`; document.getElementById('publico-email').innerText = c.email; }
        if (c.telefono) { document.getElementById('publico-telefono').href = `tel:${c.telefono.replace(/\D/g, '')}`; document.getElementById('publico-telefono').innerText = c.telefono; }
        if (c.whatsapp) { document.getElementById('publico-whatsapp').href = `https://wa.me/52${c.whatsapp.replace(/\D/g, '')}`; }
    } catch (e) {}
}

function inicializarFormularioContacto() {
    const f = document.getElementById('formulario-contacto-publico');
    if (!f) return;
    f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = f.querySelector('button[type="submit"]'); const txtO = btn.innerHTML;
        btn.innerHTML = "Enviando..."; btn.disabled = true;
        try {
            // POST: /api/mensajes
            const res = await fetch(`${API_BASE_URL}/mensajes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo: document.getElementById('cont-correo').value.trim(), asunto: document.getElementById('cont-asunto').value.trim(), mensaje: document.getElementById('cont-mensaje').value.trim(), tipo_mensaje: "ENTRANTE", estado_mensaje: "PENDIENTE" }) });
            if (!res.ok) throw new Error();
            mostrarNotificacion("¡Mensaje enviado con éxito!", "exito"); f.reset();
        } catch (err) { mostrarNotificacion("Error al enviar.", "error"); } finally { btn.innerHTML = txtO; btn.disabled = false; }
    });
}

// ==========================================
// ROUTER PRINCIPAL
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Componentes Generales
    try {
        const h = await fetch("/FrontEnd-PCEXTREME/components/header.html"); if (h.ok) document.getElementById("encabezado-principal").innerHTML = await h.text();
        const f = await fetch("/FrontEnd-PCEXTREME/components/footer.html"); if (f.ok) document.getElementById("pie-de-pagina").innerHTML = await f.text();
    } catch(e) {}
    
    inicializarMenuCuenta();
    verificarSesion();
    inicializarOjosPasswordGlobal();

    // 2. Modulos por vista
    if (document.getElementById("formulario-login") || document.getElementById("formulario-registro")) {
        inicializarEventosLogin();
        // Inicializamos SEPOMEX para registro de cliente
        inicializarSepomex("reg-cp", "reg-estado", "reg-ciudad", "contenedor-asentamiento", "reg-asentamiento", "bg-[#ffffff] text-black");
    }

    if (document.getElementById("portada-contenido")) cargarPortada();
    if (document.getElementById("lista-servicios")) cargarServicios();
    if (document.getElementById("carrusel-marcas")) cargarMarcas();
    if (document.getElementById("graficaCrecimiento")) { window.calcularCrecimiento(); }
    if (document.getElementById("formulario-consulta")) document.getElementById("formulario-consulta").addEventListener("submit", rastrearEquipo);
    if (document.getElementById("input-folio")) document.getElementById("input-folio").addEventListener("keydown", (e) => { if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault(); });
    
    if (document.getElementById("cuadricula-productos")) cargarCatalogoProductos();
    if (document.getElementById("contenedor-detalle")) cargarDetalleProducto();
    
    if (document.getElementById("vista-perfil")) {
        cargarPerfilYDispositivos();
        inicializarFormularioPerfil();
        // Inicializamos SEPOMEX para edición de perfil
        inicializarSepomex("edit-cp", "edit-estado", "edit-ciudad", "contenedor-edit-asentamiento", "edit-asentamiento", "bg-gray-900/50 text-white");
    }
    
    if (document.getElementById("contenedor-detalle-disp")) cargarDetalleDispositivoCliente();
    if (document.getElementById("contenedor-nosotros")) cargarNosotrosCliente();
    
    if (document.getElementById("ubi-direccion")) cargarUbicacionCliente();
    if (document.getElementById("formulario-contacto-publico")) {
        cargarInfoContactoPublico();
        inicializarFormularioContacto();
    }
});