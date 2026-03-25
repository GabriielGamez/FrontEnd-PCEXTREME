/**
 * main.js
 * Lógica principal del Frontend - PC EXTREME
 */

// ==========================================
// MÓDULO 1: CONFIGURACIÓN GLOBAL
// ==========================================
// Variables y rutas base que usamos en todo el proyecto
const API_BASE_URL = "https://app-web-java.vercel.app/api";
const CLOUD_NAME = "dswljrmnu";
const UPLOAD_PRESET = "productos_preset";

const CLOUD_BASE_IMG = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
const CLOUD_BASE_VID = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/`;

const RUTA_MARCAS = `${CLOUD_BASE_IMG}logos-grises/`;
const RUTA_PRODUCTOS = `${CLOUD_BASE_IMG}productos/`;

// ==========================================
// MÓDULO 2: UTILIDADES GENERALES
// ==========================================
// Funciones de ayuda que se usan en varias partes de la página

// Crea una notificación flotante (estilo toast) para mostrar errores o éxitos
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
    toast.innerHTML = `<span>${tipo === "error" ? "❌" : "✅"
        }</span><span>${mensaje}</span>`;

    contenedor.appendChild(toast);

    setTimeout(() => toast.classList.remove("translate-y-10", "opacity-0"), 10);
    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-10");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Muestra una advertencia flotante para confirmar acciones importantes del cliente
function mostrarConfirmacion(mensaje, tipo = "advertencia") {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className =
            "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[70] px-4 opacity-0 transition-opacity duration-300";

        const colorBtn =
            tipo === "peligro"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#7ed957] hover:bg-[#6bc148] text-black";
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
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.classList.remove("opacity-0");
            overlay.querySelector("div").classList.remove("scale-95");
        }, 10);

        const cerrar = (resultado) => {
            overlay.classList.add("opacity-0");
            overlay.querySelector("div").classList.add("scale-95");
            setTimeout(() => {
                overlay.remove();
                resolve(resultado);
            }, 300);
        };

        overlay
            .querySelector("#btn-aceptar-conf")
            .addEventListener("click", () => cerrar(true));
        overlay
            .querySelector("#btn-cancelar-conf")
            .addEventListener("click", () => cerrar(false));
    });
}

// Muestra una ventana flotante pidiendo la contraseña actual para verificar seguridad
function pedirPasswordActual() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className =
            "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[80] px-4 opacity-0 transition-opacity duration-300";

        overlay.innerHTML = `
            <div class="bg-[#111] border border-gray-700 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-8 max-w-sm w-full transform scale-95 transition-transform duration-300 text-center">
                <span class="text-5xl mb-4 block drop-shadow-lg">🔐</span>
                <h3 class="text-xl font-bold text-white mb-2">Autenticación Requerida</h3>
                <p class="text-gray-400 text-sm mb-6 leading-relaxed">Por seguridad, ingresa tu contraseña actual para confirmar los cambios.</p>

                <div class="relative flex items-center mb-8 text-left">
                    <input type="password" id="input-pass-seguridad" placeholder="Tu contraseña actual" class="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-white focus:border-[#7ed957] focus:outline-none transition">
                    <button type="button" id="btn-ojo-seguridad" class="absolute right-3 text-gray-500 hover:text-[#7ed957] transition cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </div>

                <div class="flex justify-center gap-4">
                    <button id="btn-cancelar-pass" class="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition text-sm">Cancelar</button>
                    <button id="btn-aceptar-pass" class="px-6 py-2.5 bg-[#7ed957] hover:bg-[#6bc148] text-black rounded-full font-bold transition text-sm shadow-lg">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.classList.remove("opacity-0");
            overlay.querySelector("div").classList.remove("scale-95");
        }, 10);

        // Lógica del ojito interno
        const inputPass = overlay.querySelector("#input-pass-seguridad");
        const btnOjo = overlay.querySelector("#btn-ojo-seguridad");
        btnOjo.addEventListener("mouseenter", () => (inputPass.type = "text"));
        btnOjo.addEventListener("mouseleave", () => (inputPass.type = "password"));

        const cerrar = (resultado) => {
            overlay.classList.add("opacity-0");
            overlay.querySelector("div").classList.add("scale-95");
            setTimeout(() => {
                overlay.remove();
                resolve(resultado);
            }, 300);
        };

        overlay
            .querySelector("#btn-aceptar-pass")
            .addEventListener("click", () => cerrar(inputPass.value.trim()));
        overlay
            .querySelector("#btn-cancelar-pass")
            .addEventListener("click", () => cerrar(null));
    });
}
// Convierte los botones con el icono de ojo para mostrar/ocultar las contraseñas
function inicializarOjosPasswordGlobal() {
    const botonesOjo = document.querySelectorAll(".btn-ver-password");

    botonesOjo.forEach((boton) => {
        const inputPassword = boton.previousElementSibling;
        if (inputPassword && inputPassword.tagName === "INPUT") {
            boton.addEventListener("mouseenter", () => (inputPassword.type = "text"));
            boton.addEventListener(
                "mouseleave",
                () => (inputPassword.type = "password")
            );
        }
    });
}

// Consume la API de SEPOMEX para autocompletar la dirección al registrarse
function inicializarSepomexCliente() {
    const inputCP = document.getElementById("reg-cp");
    if (inputCP) {
        inputCP.addEventListener("input", async (e) => {
            const cp = e.target.value.trim();

            if (cp.length === 5) {
                mostrarNotificacion("Buscando código postal...", "exito");
                try {
                    const respuesta = await fetch(
                        `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${cp}`
                    );
                    const datos = await respuesta.json();
                    const lugares = datos.zip_codes;

                    if (!lugares || lugares.length === 0)
                        throw new Error("Código postal no encontrado");

                    document.getElementById("reg-estado").value = lugares[0].d_estado;
                    document.getElementById("reg-ciudad").value = lugares[0].d_mnpio;

                    const contenedorAsentamiento = document.getElementById(
                        "contenedor-asentamiento"
                    );
                    let selectHtml = `<select id="reg-asentamiento" required class="w-full bg-[#ffffff] border border-gray-700 rounded-lg px-4 py-2 text-black focus:border-[#7ed957] focus:outline-none transition">`;
                    selectHtml += `<option value="" disabled selected>Selecciona un asentamiento...</option>`;

                    lugares.forEach(
                        (lugar) =>
                            (selectHtml += `<option value="${lugar.d_asenta}">${lugar.d_asenta}</option>`)
                    );
                    selectHtml += `</select>`;
                    contenedorAsentamiento.innerHTML = selectHtml;
                } catch (error) {
                    mostrarNotificacion("C.P. no válido o no encontrado", "error");
                }
            }
        });
    }
}

// ==========================================
// MÓDULO 3: AUTENTICACIÓN Y SESIÓN
// ==========================================
// Todo lo relacionado con usuarios, login, registro y menú de cuenta

// Revisa si hay una sesión activa y redirige o actualiza el menú según el usuario
function verificarSesion() {
    const token = localStorage.getItem("token");
    const usuarioStr = localStorage.getItem("usuario");

    if (!token || !usuarioStr) return;

    const usuario = JSON.parse(usuarioStr);

    if (window.location.pathname.includes("login.html")) {
        if (usuario.tipo === "trabajador") {
            window.location.replace("/FrontEnd-PCEXTREME/admin/dashboard.html");
        } else {
            window.location.replace("/FrontEnd-PCEXTREME/index.html");
        }
        return;
    }

    if (usuario.tipo === "cliente") {
        const authButton = document.getElementById("authButton");
        if (authButton) {
            const contenedorPadre = authButton.parentElement;
            contenedorPadre.innerHTML = `
                <div class="relative inline-block text-left">
                    <button id="userMenuButton" class="border border-[#7ed957] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#7ed957] hover:text-black transition">
                        Hola, ${usuario.nombre}
                    </button>
                    <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-[#1f1f1f] rounded-xl shadow-lg border border-gray-700 overflow-hidden z-50">
                        <button onclick="window.location.href='public/perfil.html'" class="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition font-semibold">Mi Perfil</button>
                        <button onclick="cerrarSesion()" class="w-full text-left px-4 py-3 text-[#ff4d4d] hover:bg-gray-800 transition font-semibold">Cerrar Sesión</button>
                    </div>
                </div>
            `;

            const btn = document.getElementById("userMenuButton");
            const drop = document.getElementById("userDropdown");
            btn.addEventListener("click", () => drop.classList.toggle("hidden"));
            window.addEventListener("click", (e) => {
                if (!btn.contains(e.target) && !drop.contains(e.target))
                    drop.classList.add("hidden");
            });
        }
    }
}

// Cierra la sesión borrando los datos y regresando al inicio
window.cerrarSesion = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.replace("/FrontEnd-PCEXTREME/index.html");
};

// Controla el menú desplegable del botón "Iniciar Sesión" (cuando no hay cuenta activa)
function inicializarMenuCuenta() {
    const authButton = document.getElementById("authButton");
    const authMenu = document.getElementById("authMenu");

    if (authButton && authMenu) {
        authButton.addEventListener("click", (e) => {
            e.preventDefault();
            authMenu.classList.toggle("hidden");
        });

        window.addEventListener("click", (e) => {
            if (!authButton.contains(e.target) && !authMenu.contains(e.target)) {
                authMenu.classList.add("hidden");
            }
        });
    }
}

// Controla los formularios de login, registro y el cambio de pestañas entre ellos
function inicializarEventosLogin() {
    const btnIrRegistro = document.getElementById("ir-a-registro");
    const btnIrLogin = document.getElementById("ir-a-login");
    const bloqueLogin = document.getElementById("bloque-login");
    const bloqueRegistro = document.getElementById("bloque-registro");

    // Formulario de Inicio de Sesión
    const formLogin = document.getElementById("formulario-login");
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("correo-login").value;
            const password = document.getElementById("password-login").value;
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerText;

            btnSubmit.innerText = "Verificando...";
            btnSubmit.disabled = true;

            try {
                // Intenta entrar como cliente
                let respuesta = await fetch(`${API_BASE_URL}/auth/login/cliente`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                let datos = await respuesta.json();

                // Si no es cliente, intenta entrar como trabajador
                if (!respuesta.ok) {
                    let resTrabajador = await fetch(
                        `${API_BASE_URL}/auth/login/trabajador`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, password }),
                        }
                    );
                    let datosTrabajador = await resTrabajador.json();

                    if (!resTrabajador.ok)
                        throw new Error(
                            datosTrabajador.message ||
                            datos.message ||
                            "Credenciales inválidas"
                        );
                    datos = datosTrabajador;
                }

                // Guarda el acceso
                localStorage.setItem("token", datos.token);
                localStorage.setItem("usuario", JSON.stringify(datos.usuario));
                mostrarNotificacion(`¡Bienvenido, ${datos.usuario.nombre}!`, "exito");

                setTimeout(() => {
                    if (datos.usuario.tipo === "trabajador") {
                        window.location.href = "/FrontEnd-PCEXTREME/admin/dashboard.html";
                    } else {
                        window.location.href = "/FrontEnd-PCEXTREME/index.html";
                    }
                }, 1500);
            } catch (error) {
                mostrarNotificacion(error.message, "error");
            } finally {
                btnSubmit.innerText = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }

    // Formulario de Registro
    const formRegistro = document.getElementById("formulario-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();

            const password = document.getElementById("reg-password").value;
            const passwordConfirm = document.getElementById(
                "reg-password-confirm"
            ).value;

            if (password !== passwordConfirm) {
                mostrarNotificacion(
                    "Las contraseñas no coinciden. Intenta de nuevo.",
                    "error"
                );
                return;
            }

            const btnSubmit = formRegistro.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerText;
            btnSubmit.innerText = "⏳ Creando cuenta...";
            btnSubmit.disabled = true;

            const datosCliente = {
                nombre: document.getElementById("reg-nombre").value.trim(),
                aPaterno: document.getElementById("reg-ap-paterno").value.trim(),
                aMaterno: document.getElementById("reg-ap-materno").value.trim(),
                telefono: document.getElementById("reg-telefono").value.trim(),
                CPostal: document.getElementById("reg-cp").value.trim(),
                estado: document.getElementById("reg-estado").value.trim(),
                municipio: document.getElementById("reg-ciudad").value.trim(),
                asentamiento: document.getElementById("reg-asentamiento").value.trim(),
                calle: document.getElementById("reg-calle").value.trim(),
                email: document.getElementById("reg-email").value.trim(),
                password: password,
            };

            try {
                const respuesta = await fetch(`${API_BASE_URL}/clientes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosCliente),
                });

                const datos = await respuesta.json();
                if (!respuesta.ok)
                    throw new Error(datos.message || "Error al crear la cuenta");

                mostrarNotificacion(
                    "¡Cuenta creada con éxito! Ahora puedes iniciar sesión.",
                    "exito"
                );
                formRegistro.reset();
                setTimeout(() => document.getElementById("ir-a-login").click(), 1500);
            } catch (error) {
                mostrarNotificacion(error.message, "error");
            } finally {
                btnSubmit.innerText = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }

    // Control de pestañas (Cambiar entre Login y Registro)
    if (btnIrRegistro && btnIrLogin && bloqueLogin && bloqueRegistro) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("tab") === "registro") {
            bloqueLogin.classList.replace("block", "hidden");
            bloqueRegistro.classList.replace("hidden", "block");
        }

        btnIrRegistro.addEventListener("click", (e) => {
            e.preventDefault();
            bloqueLogin.classList.replace("block", "hidden");
            bloqueRegistro.classList.replace("hidden", "block");
            window.history.pushState({}, "", "?tab=registro");
        });

        btnIrLogin.addEventListener("click", (e) => {
            e.preventDefault();
            bloqueRegistro.classList.replace("block", "hidden");
            bloqueLogin.classList.replace("hidden", "block");
            window.history.pushState({}, "", window.location.pathname);
        });
    }
}

// ==========================================
// MÓDULO 4: PÁGINAS PRINCIPALES (INICIO)
// ==========================================
// Carga la información de la base de datos para la pantalla de inicio

// Carga el texto principal y el video de fondo
async function cargarPortada() {
    const contenedor = document.getElementById("portada-contenido");
    const video = document.getElementById("video-empresa");
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/inicio`);
        const arrayDatos = await respuesta.json();
        const datos = arrayDatos[0];

        contenedor.innerHTML = `
            <h2 class="text-5xl md:text-6xl font-extrabold leading-tight">
                ${datos.titulo || "¿Tu PC necesita<br>mantenimiento?"}
            </h2>
            <p class="text-gray-300 text-lg max-w-lg">
                ${datos.descripcion || "¡Recupérala al máximo rendimiento!"}
            </p>
            <button onclick="window.location.href='/FrontEnd-PCEXTREME/public/contacto.html'" class="bg-[#7ed957] hover:bg-[#6bc148] text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-[0_0_15px_rgba(126,217,87,0.3)]">
                Contáctanos
            </button>
        `;

        if (datos.video_url && video) {
            video.innerHTML = `<source src="${CLOUD_BASE_VID}${datos.video_url}.mp4" type="video/mp4">`;
            video.load();
        }
    } catch (error) {
        contenedor.innerHTML = `<p class="text-red-500">Error al conectar con el servidor.</p>`;
    }
}

// Dibuja las tarjetas de los servicios que ofrece la empresa
async function cargarServicios() {
    const contenedor = document.getElementById("lista-servicios");
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/servicios`);
        let servicios = await respuesta.json();
        if (!Array.isArray(servicios)) servicios = [servicios];

        contenedor.innerHTML = "";

        if (servicios.length === 0) {
            contenedor.innerHTML = `<p class="text-gray-400 text-center col-span-full">No hay imágenes disponibles por el momento.</p>`;
            return;
        }

        servicios.forEach((servicio) => {
            contenedor.innerHTML += `
            <div class="bg-[#1f1f1f] rounded-xl overflow-hidden shadow-lg border border-transparent hover:border-[#7ed957] transition-all duration-300">
                <div class="h-52 w-full overflow-hidden">
                    <img src="${CLOUD_BASE_IMG}${servicio.imagen}" 
                         alt="Imagen del servicio" 
                         class="w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500">
                </div>
            </div>
        `;
        });
    } catch (error) {
        contenedor.innerHTML = `<p class="text-red-500 col-span-full text-center">No se pudieron cargar las imágenes.</p>`;
    }
}

// Carga la cinta infinita de logotipos de marcas asociadas
async function cargarMarcas() {
    const contenedor = document.getElementById("carrusel-marcas");
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/marcas`);
        if (!respuesta.ok) return;

        const marcas = await respuesta.json();
        const marcasDuplicadas = [...marcas, ...marcas, ...marcas, ...marcas]; // Duplicamos para el efecto infinito

        contenedor.innerHTML = "";
        contenedor.className = "animacion-carrusel items-center gap-16 py-4";

        marcasDuplicadas.forEach((marca) => {
            contenedor.innerHTML += `
                <a href="${marca.url}" target="_blank" rel="noopener noreferrer" class="flex-shrink-0">
                <img src="${CLOUD_BASE_IMG}/${marca.logo}" alt="${marca.nombre}" 
                     class="h-8 md:h-12 w-auto object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
            `;
        });
    } catch (error) { }
}

// ==========================================
// MÓDULO 5: RASTREO DE EQUIPOS
// ==========================================
// Funciones para que el cliente busque su folio de reparación

async function rastrearEquipo(evento) {
    evento.preventDefault();

    const inputFolio = document.getElementById("input-folio");
    const mensajeError = document.getElementById("mensaje-error");
    const resultadoContenedor = document.getElementById("resultado-consulta");
    const btnSubmit = evento.target.querySelector('button[type="submit"]');
    const textoOriginalBtn = btnSubmit.innerHTML;
    const folio = inputFolio.value.trim();

    mensajeError.classList.add("hidden");
    resultadoContenedor.classList.add("hidden", "opacity-0");
    resultadoContenedor.classList.remove("opacity-100");

    if (!folio) {
        mostrarError(mensajeError, "Por favor, ingresa un número de folio.");
        return;
    }

    // Ponemos el botón a cargar
    btnSubmit.disabled = true;
    btnSubmit.classList.add("cursor-not-allowed", "opacity-80");
    btnSubmit.innerHTML = `<div class="flex items-center justify-center gap-2"><svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Buscando...</span></div>`;

    try {
        const resConsulta = await fetch(`${API_BASE_URL}/registros/${folio}`);
        if (!resConsulta.ok)
            throw new Error("Equipo no encontrado. Verifica el folio.");

        let datosConsulta = await resConsulta.json();
        if (Array.isArray(datosConsulta)) {
            if (datosConsulta.length === 0) throw new Error("Equipo no encontrado.");
            datosConsulta = datosConsulta[0];
        }

        let nombreMarca = "Información no disponible",
            nombreModelo = "N/A";

        // Obtenemos los detalles del dispositivo ligado a esa orden
        if (datosConsulta.idDispositivo) {
            try {
                const resDispositivo = await fetch(
                    `${API_BASE_URL}/dispositivos/${datosConsulta.idDispositivo}`
                );
                if (resDispositivo.ok) {
                    let datosDisp = await resDispositivo.json();
                    if (Array.isArray(datosDisp)) datosDisp = datosDisp[0];
                    nombreMarca =
                        `${datosDisp.marca || ""} `.trim() ||
                        `Dispositivo #${datosConsulta.idDispositivo}`;
                    nombreModelo = `${datosDisp.modelo || ""} `.trim() || "N/A";
                }
            } catch (errorDisp) {
                nombreMarca = `Dispositivo ID: ${datosConsulta.idDispositivo}`;
            }
        }

        // Llenamos la información en la tarjeta HTML
        document.getElementById("resultado-folio").innerText = `#${datosConsulta.idFolio || folio
            }`;
        document.getElementById("resultado-equipo").innerText = nombreMarca;
        document.getElementById("resultado-serie").innerText = nombreModelo;
        document.getElementById("resultado-fecha").innerText = formatearFecha(
            datosConsulta.fechaIngreso
        );
        document.getElementById("resultado-problema").innerText =
            datosConsulta.detalles || "Sin detalles";
        document.getElementById("resultado-diagnostico").innerText =
            datosConsulta.diagnostico || "Pendiente de revisión";
        document.getElementById("resultado-costo").innerText = `$${datosConsulta.costo || "0.00"
            }`;

        actualizarEstadoBadge(datosConsulta.estadoEquipo);

        // Aparecemos la tarjeta
        resultadoContenedor.classList.remove("hidden");
        setTimeout(() => {
            resultadoContenedor.classList.remove("opacity-0");
            resultadoContenedor.classList.add("opacity-100");
        }, 50);
    } catch (error) {
        mostrarError(mensajeError, error.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.classList.remove("cursor-not-allowed", "opacity-80");
        btnSubmit.innerHTML = textoOriginalBtn;
    }
}

// Funciones de apoyo exclusivo para el rastreo
function mostrarError(elemento, mensaje) {
    elemento.innerText = mensaje;
    elemento.classList.remove("hidden");
}

function formatearFecha(fechaCadena) {
    if (!fechaCadena) return "--";
    return new Date(fechaCadena).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function actualizarEstadoBadge(estado) {
    const badge = document.getElementById("resultado-estado");
    badge.innerText = estado || "Desconocido";
    badge.className =
        "px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase border";

    const estadoLower = (estado || "").toLowerCase();
    if (estadoLower.includes("revisión") || estadoLower.includes("pendiente")) {
        badge.classList.add(
            "bg-blue-600/20",
            "text-blue-400",
            "border-blue-600/50"
        );
    } else if (
        estadoLower.includes("reparación") ||
        estadoLower.includes("proceso")
    ) {
        badge.classList.add(
            "bg-yellow-600/20",
            "text-yellow-400",
            "border-yellow-600/50"
        );
    } else if (
        estadoLower.includes("listo") ||
        estadoLower.includes("entregado")
    ) {
        badge.classList.add(
            "bg-green-600/20",
            "text-green-400",
            "border-green-600/50"
        );
    } else {
        badge.classList.add(
            "bg-gray-600/20",
            "text-gray-400",
            "border-gray-600/50"
        );
    }
}

// ==========================================
// MÓDULO 6: CATÁLOGO DE PRODUCTOS
// ==========================================
// Descarga la lista de productos, crea los filtros y muestra el detalle individual

let productosGlobales = [];

// Descarga todos los productos y dibuja los botones de categorías
async function cargarCatalogoProductos() {
    const contenedorCategorias = document.getElementById("contenedor-categorias");
    const cuadricula = document.getElementById("cuadricula-productos");
    const estado = document.getElementById("estado-productos");

    if (!contenedorCategorias || !cuadricula) return;
    estado.classList.remove("hidden");

    try {
        const respuesta = await fetch(`${API_BASE_URL}/productos`);
        if (!respuesta.ok) throw new Error("Error al cargar los productos");

        productosGlobales = await respuesta.json();
        if (!Array.isArray(productosGlobales))
            productosGlobales = [productosGlobales];

        estado.classList.add("hidden");

        // Sacamos las categorías sin repetirlas
        const categoriasSet = new Set(productosGlobales.map((p) => p.categoria));
        const categoriasUnicas = ["Todos", ...Array.from(categoriasSet)];

        categoriasUnicas.forEach((categoria, index) => {
            const btn = document.createElement("button");
            const esActivo = index === 0;
            btn.className = `px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${esActivo
                    ? "bg-[#7ed957] text-black border-[#7ed957]"
                    : "bg-transparent text-gray-400 border-gray-700 hover:border-[#7ed957] hover:text-[#7ed957]"
                }`;
            btn.innerText = categoria.toUpperCase();

            btn.addEventListener("click", () => {
                // Cambiamos el color de los botones al hacer clic
                Array.from(contenedorCategorias.children).forEach((b) => {
                    b.classList.remove("bg-[#7ed957]", "text-black", "border-[#7ed957]");
                    b.classList.add("bg-transparent", "text-gray-400", "border-gray-700");
                });
                btn.classList.replace("bg-transparent", "bg-[#7ed957]");
                btn.classList.replace("text-gray-400", "text-black");
                btn.classList.replace("border-gray-700", "border-[#7ed957]");

                renderizarCuadricula(categoria); // Filtramos los productos
            });
            contenedorCategorias.appendChild(btn);
        });

        renderizarCuadricula("Todos");
    } catch (error) {
        estado.innerHTML = `<p class="text-red-500">Error al cargar el inventario. Intenta más tarde.</p>`;
    }
}

// Dibuja las tarjetas de los productos en la cuadrícula
function renderizarCuadricula(filtroCategoria) {
    const cuadricula = document.getElementById("cuadricula-productos");
    cuadricula.innerHTML = "";

    const productosFiltrados =
        filtroCategoria === "Todos"
            ? productosGlobales
            : productosGlobales.filter((p) => p.categoria === filtroCategoria);

    if (productosFiltrados.length === 0) {
        cuadricula.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">No hay productos en esta categoría.</p>`;
        return;
    }

    productosFiltrados.forEach((prod) => {
        const imagenUrl = `${CLOUD_BASE_IMG}/${prod.imagen_url}`;
        cuadricula.innerHTML += `
            <div class="bg-[#151515] border border-gray-800 rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-[#7ed957] hover:shadow-[0_10px_30px_rgba(126,217,87,0.1)] transition-all duration-300 flex flex-col group cursor-pointer" onclick="window.location.href='detalle_producto.html?id=${prod.idProducto
            }'">
                <div class="h-48 w-full bg-black p-4 flex items-center justify-center overflow-hidden">
                    <img src="${imagenUrl}" alt="${prod.nombre
            }" class="max-h-full max-w-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                </div>
                <div class="p-5 flex flex-col flex-grow text-left">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">${prod.categoria
            }</span>
                    <h3 class="text-white text-md font-semibold mb-3 line-clamp-2 leading-tight">${prod.nombre
            }</h3>
                    <div class="mt-auto flex justify-between items-end">
                        <div>
                            <span class="text-xs text-gray-500 block mb-1">Precio</span>
                            <span class="text-[#7ed957] font-extrabold text-xl">$${parseFloat(
                prod.precio
            ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
            })}</span>
                        </div>
                        <span class="text-[#7ed957] font-bold">→</span>
                    </div>
                </div>
            </div>
        `;
    });
}

// Carga la información de un solo producto cuando entras a su página de detalle
async function cargarDetalleProducto() {
    const contenedor = document.getElementById("contenedor-detalle");
    const estado = document.getElementById("estado-detalle");
    if (!contenedor) return;

    // Leemos el ID que viene en el link (ej: detalle.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = urlParams.get("id");

    if (!idProducto) {
        estado.innerHTML = `<p class="text-red-500">Producto no especificado.</p>`;
        return;
    }

    try {
        const respuesta = await fetch(`${API_BASE_URL}/productos/${idProducto}`);
        if (!respuesta.ok) throw new Error("No se encontró el producto");

        let datos = await respuesta.json();
        if (Array.isArray(datos)) datos = datos[0];

        estado.classList.add("hidden");
        contenedor.classList.remove("hidden");

        const imagenUrl = `${CLOUD_BASE_IMG}/${datos.imagen_url}`;
        const telefonoEmpresa = datos.telefono_empresa || "7711784044";
        const mensajeWa = encodeURIComponent(
            `Hola PC EXTREME, me interesa el producto: ${datos.nombre}`
        );

        contenedor.innerHTML = `
            <div class="bg-black border border-gray-800 rounded-2xl p-6 flex items-center justify-center">
                <img src="${imagenUrl}" alt="${datos.nombre}" class="max-w-full max-h-96 object-contain hover:scale-105 transition-transform duration-500">
            </div>
            <div class="flex flex-col justify-center">
                <span class="inline-block bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider w-max mb-4">${datos.categoria}</span>
                <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">${datos.nombre}</h1>
                <div class="text-[#7ed957] text-4xl font-black mb-6">$${parseFloat(datos.precio).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div class="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 mb-8">
                    <p class="text-gray-400 text-sm mb-2">Estado del stock:</p>
                    <div class="flex items-center gap-3">
                        <span class="bg-blue-600/20 text-blue-400 border border-blue-600/50 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            ${datos.estado_stock || "Desconocido"}
                        </span>
                        <span class="text-gray-500 text-sm">(Cantidad: ${datos.stock || 0})</span>
                    </div>
                </div>
                <div class="mb-8">
                    <h3 class="text-white font-semibold mb-2 border-b border-gray-800 pb-2">Descripción del producto</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">${datos.descripcion || "Sin descripción disponible."}</p>
                </div>
                <a href="https://wa.me/${telefonoEmpresa}?text=${mensajeWa}" target="_blank" 
                   class="w-full bg-[#7ed957] hover:bg-[#6bc148] text-black text-center font-bold py-4 px-8 rounded-full transition duration-300 shadow-[0_0_15px_rgba(126,217,87,0.2)] flex items-center justify-center gap-3">
                    Me interesa este artículo
                </a>
            </div>
        `;
    } catch (error) {
        estado.innerHTML = `<p class="text-red-500">Error al cargar la información del producto.</p>`;
    }
}

// ==========================================
// MÓDULO 7: ESTADÍSTICAS Y GRÁFICAS (ED)
// ==========================================
// Calcula y dibuja la gráfica de crecimiento de clientes

const P0 = 12;
const t_actual = 2.2;
const P_actual = 250;
const k = Math.log(P_actual / P0) / t_actual;
let miGraficoCrecimiento;

window.calcularCrecimiento = function () {
    const inputTiempo = document.getElementById("input-tiempo");
    if (!inputTiempo) return;

    const t_futuro = parseFloat(inputTiempo.value);
    if (isNaN(t_futuro) || t_futuro < 0) {
        // === CAMBIO: Alerta nativa cambiada por notificación flotante ===
        mostrarNotificacion("Por favor ingresa un tiempo válido mayor o igual a 0.", "error");
        return;
    }

    document.getElementById("resultado-k").innerText = k.toFixed(4);
    const clientesProyectados = P0 * Math.exp(k * t_futuro);
    document.getElementById("resultado-p").innerText =
        Math.round(clientesProyectados).toLocaleString();

    dibujarGraficaCrecimiento(t_futuro);
};

function dibujarGraficaCrecimiento(t_max) {
    const canvas = document.getElementById("graficaCrecimiento");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (miGraficoCrecimiento) miGraficoCrecimiento.destroy();

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
        type: "line",
        data: {
            labels: etiquetasTiempo,
            datasets: [
                {
                    label: "Número de Clientes Registrados",
                    data: datosClientes,
                    borderColor: "#7ed957",
                    backgroundColor: "rgba(126, 217, 87, 0.1)",
                    borderWidth: 3,
                    pointBackgroundColor: "#3f51b5",
                    pointBorderColor: "#fff",
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#a1a1aa" } } },
            scales: {
                x: { ticks: { color: "#a1a1aa" }, grid: { color: "#27272a" } },
                y: { ticks: { color: "#a1a1aa" }, grid: { color: "#27272a" } },
            },
        },
    });
}

function iniciarModuloCrecimiento() {
    const canvas = document.getElementById("graficaCrecimiento");
    if (canvas) window.calcularCrecimiento();
}

// ==========================================
// MÓDULO 8: ARRANQUE DE LA APLICACIÓN
// ==========================================
// Esto se ejecuta automáticamente en cuanto la página termina de cargar

// Función para inyectar el HTML de la barra superior y pie de página
async function cargarComponentes() {
    try {
        const resHeader = await fetch("/FrontEnd-PCEXTREME/components/header.html");
        if (resHeader.ok)
            document.getElementById("encabezado-principal").innerHTML =
                await resHeader.text();

        inicializarMenuCuenta();
        verificarSesion();

        const resFooter = await fetch("/FrontEnd-PCEXTREME/components/footer.html");
        if (resFooter.ok)
            document.getElementById("pie-de-pagina").innerHTML =
                await resFooter.text();
    } catch (error) {
        console.error("Error cargando componentes:", error);
    }
}

// ==========================================
// MÓDULO 9: PERFIL, DISPOSITIVOS Y EDICIÓN
// ==========================================
let clienteActualGlobal = null; // Guardamos los datos del cliente para pasarlos a la vista de edición

async function cargarPerfilYDispositivos() {
    const contenedorNombre = document.getElementById("perfil-nombre");
    const listaDisp = document.getElementById("lista-mis-dispositivos");

    if (!contenedorNombre || !listaDisp) return;

    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return;

    const usuarioSesion = JSON.parse(usuarioStr);
    const idCliente = usuarioSesion.idCliente || usuarioSesion.id;

    try {
        // 1. CARGAR PERFIL
        const resPerfil = await fetch(`${API_BASE_URL}/clientes/${idCliente}`);
        if (resPerfil.ok) {
            let datosCli = await resPerfil.json();
            if (Array.isArray(datosCli)) datosCli = datosCli[0];

            clienteActualGlobal = datosCli; // Lo guardamos en la variable global

            document.getElementById("perfil-nombre").innerText =
                datosCli.nombre || "N/A";
            document.getElementById("perfil-apellidos").innerText =
                `${datosCli.aPaterno || ""} ${datosCli.aMaterno || ""}`.trim() || "N/A";
            document.getElementById("perfil-telefono").innerText =
                datosCli.telefono || "N/A";
            document.getElementById("perfil-correo").innerText =
                datosCli.email || datosCli.correo || "N/A";
        }

        // 2. CARGAR DISPOSITIVOS
        const resDisp = await fetch(`${API_BASE_URL}/dispositivos`);
        if (resDisp.ok) {
            const todosDispositivos = await resDisp.json();
            const misDispositivos = todosDispositivos.filter(
                (d) => String(d.idCliente) === String(idCliente)
            );

            if (misDispositivos.length === 0) {
                listaDisp.innerHTML = `<div class="bg-gray-900/50 border border-gray-800 p-8 rounded-xl text-center"><span class="text-4xl mb-4 opacity-50">💻</span><p class="text-gray-400 font-medium">Aún no tienes dispositivos registrados.</p></div>`;
            } else {
                let html = "";
                misDispositivos.forEach((disp) => {
                    html += `
                        <div class="bg-[#151515] border border-gray-800 p-5 rounded-xl flex justify-between items-center hover:border-[#7ed957] transition-all group">
                            <div class="flex items-center gap-4">
                                <div class="bg-gray-900 p-3 rounded-lg text-gray-400 group-hover:text-[#7ed957] transition-colors">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <div>
                                    <h4 class="text-lg font-bold text-white uppercase">${disp.marca}</h4>
                                    <p class="text-sm text-gray-400">Mod. ${disp.modelo}</p>
                                </div>
                            </div>
                            <button onclick="window.location.href='/FrontEnd-PCEXTREME/public/detalleDispositivo.html?id=${disp.idDispositivo}'" class="px-5 py-2.5 bg-gray-800 hover:bg-[#7ed957] text-gray-300 hover:text-black font-bold rounded-lg border border-gray-700 transition">Ver Detalles</button>
                        </div>`;
                });
                listaDisp.innerHTML = html;
            }
        }
    } catch (error) {
        mostrarNotificacion(
            "Hubo un error de conexión al cargar tus datos.",
            "error"
        );
    }
}

// --- LOGICA DE LA VISTA DE EDICIÓN ---

// Cambia la pantalla y rellena el formulario con los datos actuales
window.abrirEdicionPerfil = async function () {
    if (!clienteActualGlobal) return;

    document.getElementById("vista-perfil").classList.add("hidden");
    document.getElementById("vista-edicion").classList.remove("hidden");

    document.getElementById("edit-id-cliente").value =
        clienteActualGlobal.idCliente || clienteActualGlobal.id;
    document.getElementById("edit-nombre").value =
        clienteActualGlobal.nombre || "";
    document.getElementById("edit-ap-paterno").value =
        clienteActualGlobal.aPaterno || "";
    document.getElementById("edit-ap-materno").value =
        clienteActualGlobal.aMaterno || "";
    document.getElementById("edit-telefono").value =
        clienteActualGlobal.telefono || "";
    document.getElementById("edit-correo").value =
        clienteActualGlobal.email || clienteActualGlobal.correo || "";

    document.getElementById("edit-cp").value = clienteActualGlobal.CPostal || "";
    document.getElementById("edit-estado").value =
        clienteActualGlobal.estado || "";
    document.getElementById("edit-ciudad").value =
        clienteActualGlobal.municipio || "";
    document.getElementById("edit-calle").value = clienteActualGlobal.calle || "";
    document.getElementById("edit-nueva-password").value = "";
    document.getElementById("edit-conf-password").value = "";

    document.getElementById(
        "contenedor-edit-asentamiento"
    ).innerHTML = `<input type="text" id="edit-asentamiento" required readonly class="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed">`;

    // Si tiene CP, ejecutamos SEPOMEX para que arme el SELECT de la colonia
    if (
        clienteActualGlobal.CPostal &&
        String(clienteActualGlobal.CPostal).length === 5
    ) {
        try {
            const res = await fetch(
                `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${clienteActualGlobal.CPostal}`
            );
            const datos = await res.json();
            if (datos.zip_codes && datos.zip_codes.length > 0) {
                let selectHtml = `<select id="edit-asentamiento" required class="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#7ed957] focus:outline-none transition">`;
                datos.zip_codes.forEach((lugar) => {
                    const seleccionado =
                        lugar.d_asenta === clienteActualGlobal.asentamiento
                            ? "selected"
                            : "";
                    selectHtml += `<option value="${lugar.d_asenta}" ${seleccionado}>${lugar.d_asenta}</option>`;
                });
                selectHtml += `</select>`;
                document.getElementById("contenedor-edit-asentamiento").innerHTML =
                    selectHtml;
            }
        } catch (e) { }
    }
};

window.cerrarEdicionPerfil = function () {
    document.getElementById("vista-edicion").classList.add("hidden");
    document.getElementById("vista-perfil").classList.remove("hidden");
};

// Activa el buscador de CP dentro de la vista de edición
function inicializarSepomexEditarPerfil() {
    const inputCPEdit = document.getElementById("edit-cp");
    if (inputCPEdit) {
        inputCPEdit.addEventListener("input", async (e) => {
            const cp = e.target.value.trim();
            if (cp.length === 5) {
                mostrarNotificacion("Buscando código postal...", "exito");
                try {
                    const respuesta = await fetch(
                        `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${cp}`
                    );
                    const datos = await respuesta.json();
                    const lugares = datos.zip_codes;

                    if (!lugares || lugares.length === 0)
                        throw new Error("C.P. no encontrado");

                    document.getElementById("edit-estado").value = lugares[0].d_estado;
                    document.getElementById("edit-ciudad").value = lugares[0].d_mnpio;

                    const contenedor = document.getElementById(
                        "contenedor-edit-asentamiento"
                    );
                    let selectHtml = `<select id="edit-asentamiento" required class="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#7ed957] focus:outline-none transition">`;
                    selectHtml += `<option value="" disabled selected>Selecciona un asentamiento...</option>`;
                    lugares.forEach(
                        (lugar) =>
                            (selectHtml += `<option value="${lugar.d_asenta}">${lugar.d_asenta}</option>`)
                    );
                    selectHtml += `</select>`;
                    contenedor.innerHTML = selectHtml;
                } catch (error) {
                    mostrarNotificacion("C.P. no válido o no encontrado", "error");
                }
            }
        });
    }
}

// Guarda los datos al confirmar
document.addEventListener("DOMContentLoaded", () => {
    // Inicializamos el SEPOMEX para esta pantalla
    inicializarSepomexEditarPerfil();

    const formEditar = document.getElementById("formulario-editar-perfil");
    if (formEditar) {
        formEditar.addEventListener("submit", async (e) => {
            e.preventDefault();

            // 1. Verificamos si quiere cambiar la contraseña
            const nuevaPass = document.getElementById("edit-nueva-password").value;
            const confPass = document.getElementById("edit-conf-password").value;

            if (nuevaPass || confPass) {
                if (nuevaPass !== confPass) {
                    return mostrarNotificacion(
                        "Las nuevas contraseñas no coinciden.",
                        "error"
                    );
                }
            }

            // 2. PRIMERA ADVERTENCIA: Confirmación normal
            const confirmado = await mostrarConfirmacion(
                "Tu información se actualizará y no se podrá devolver. ¿Deseas continuar?",
                "advertencia"
            );
            if (!confirmado) return; // Si cancela, no hacemos nada

            // 3. SEGUNDA ADVERTENCIA: Pedir contraseña actual
            const passwordActual = await pedirPasswordActual();
            if (!passwordActual) return; // Si cancela el recuadro, no hacemos nada

            const btnGuardar = e.target.querySelector('button[type="submit"]');
            const textoOriginal = btnGuardar.innerHTML;
            btnGuardar.innerHTML = "⏳ Verificando y Guardando...";
            btnGuardar.disabled = true;

            try {
                // 4. VERIFICAMOS LA CONTRASEÑA EN LA API (Simulamos un login)
                const emailActual =
                    clienteActualGlobal.email || clienteActualGlobal.correo;
                const resLogin = await fetch(`${API_BASE_URL}/auth/login/cliente`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: emailActual,
                        password: passwordActual,
                    }),
                });

                if (!resLogin.ok) {
                    throw new Error(
                        "Contraseña incorrecta. No es posible actualizar tu información."
                    );
                }

                // 5. SI LA CONTRASEÑA ES CORRECTA, GUARDAMOS LOS DATOS
                const idCliente = document.getElementById("edit-id-cliente").value;
                const nuevoCorreo = document.getElementById("edit-correo").value.trim();

                const datosActualizados = {
                    nombre: document.getElementById("edit-nombre").value.trim(),
                    aPaterno: document.getElementById("edit-ap-paterno").value.trim(),
                    aMaterno: document.getElementById("edit-ap-materno").value.trim(),
                    telefono: document.getElementById("edit-telefono").value.trim(),
                    CPostal: document.getElementById("edit-cp").value.trim(),
                    estado: document.getElementById("edit-estado").value.trim(),
                    municipio: document.getElementById("edit-ciudad").value.trim(),
                    asentamiento: document
                        .getElementById("edit-asentamiento")
                        .value.trim(),
                    calle: document.getElementById("edit-calle").value.trim(),
                    email: nuevoCorreo,
                };

                // Si escribió una nueva contraseña, la inyectamos en el JSON para el backend
                if (nuevaPass) {
                    datosActualizados.password = nuevaPass;
                }

                const token = localStorage.getItem("token");
                const respuestaPUT = await fetch(
                    `${API_BASE_URL}/clientes/${idCliente}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(datosActualizados),
                    }
                );

                if (!respuestaPUT.ok)
                    throw new Error("Error en el servidor al actualizar el perfil.");

                // Actualizamos el LocalStorage si el nombre o el correo cambiaron
                let usuarioSesion = JSON.parse(localStorage.getItem("usuario"));
                usuarioSesion.nombre = datosActualizados.nombre;
                usuarioSesion.email = nuevoCorreo;
                localStorage.setItem("usuario", JSON.stringify(usuarioSesion));

                mostrarNotificacion("¡Perfil actualizado con éxito!", "exito");

                // Cerramos edición, recargamos el perfil visual y el header
                cerrarEdicionPerfil();
                cargarPerfilYDispositivos();
                verificarSesion();
            } catch (error) {
                // Si la contraseña fue incorrecta u otro error, se mostrará aquí
                mostrarNotificacion(error.message, "error");
            } finally {
                btnGuardar.innerHTML = textoOriginal;
                btnGuardar.disabled = false;
            }
        });
    }
});

// ==========================================
// MÓDULO 10: DETALLES DEL DISPOSITIVO (CLIENTE)
// ==========================================
// Función del botón "Ver" de cada dispositivo
window.verDetalleDispositivo = function (idDispositivo) {
    // Aquí puedes cambiarlo para redirigir a donde quieras que vean los detalles de su equipo
    window.location.href = `/FrontEnd-PCEXTREME/public/detalleDispositivo.html?id=${idDispositivo}`;
};

async function cargarDetalleDispositivoCliente() {
    const contenedor = document.getElementById("contenedor-detalle-disp");
    if (!contenedor) return;

    // 1. Extraemos el ID del dispositivo de la URL (ej: detalle_dispositivo.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const idDispositivo = urlParams.get("id");

    if (!idDispositivo) {
        document.getElementById("panel-diagnostico").innerHTML =
            '<p class="text-red-500 text-center py-10 font-bold">No se especificó ningún dispositivo.</p>';
        return;
    }

    try {
        // --- 1. CONSULTA: DATOS DEL DISPOSITIVO ---
        const resDisp = await fetch(
            `${API_BASE_URL}/dispositivos/${idDispositivo}`
        );
        if (!resDisp.ok)
            throw new Error("No se pudo cargar la información del dispositivo.");

        let disp = await resDisp.json();
        if (Array.isArray(disp)) disp = disp[0];

        document.getElementById("det-marca").innerText = disp.marca || "N/A";
        document.getElementById("det-modelo").innerText = disp.modelo || "N/A";
        // Buscamos número de serie, dependiendo de cómo lo llame tu backend (n_serie, numeroSerie, etc)
        document.getElementById("det-sn").innerText = disp.numSerie || "N/A";

        // --- 2. CONSULTA: HISTORIAL DE REPARACIÓN ---
        // Traemos todos los registros para buscar el que le pertenece a este equipo
        const resReg = await fetch(`${API_BASE_URL}/registros`);
        let registros = await resReg.json();

        // Filtramos para encontrar el registro de este dispositivo.
        // Usamos reverse() para que, si tiene varias reparaciones, agarre la más reciente.
        let registro = registros
            .reverse()
            .find((r) => String(r.idDispositivo) === String(idDispositivo));

        if (registro) {
            // Llenamos los datos
            document.getElementById("det-fecha").innerText = formatearFecha(
                registro.fechaIngreso
            );
            document.getElementById("det-detalles").innerText =
                registro.detalles || registro.falla || "Sin detalles reportados.";
            document.getElementById("det-diagnostico").innerText =
                registro.diagnostico || "El equipo está en fila para ser revisado.";
            document.getElementById("det-costo").innerText = `$${parseFloat(
                registro.costo || 0
            ).toFixed(2)}`;

            // Colores dinámicos del estado (reutilizamos la función que ya tenías para el rastreo)
            const badge = document.getElementById("det-estado");
            actualizarEstadoBadgeDetalle(
                badge,
                registro.estado || registro.estadoEquipo || "Recibido"
            );

            // --- 3. CONSULTA: NOMBRE DEL TÉCNICO ---
            let nombreTecnico = "No asignado";

            // ¡AQUÍ ESTÁ LA MAGIA! Ahora leemos "idTecnico" del registro
            if (registro.idTecnico) {
                try {
                    const resTrab = await fetch(`${API_BASE_URL}/trabajadores`);
                    if (resTrab.ok) {
                        const trabajadores = await resTrab.json();

                        // Emparejamos el idTrabajador del empleado con el idTecnico de la orden
                        const tec = trabajadores.find(
                            (t) =>
                                String(t.idTrabajador || t.idEmpleado) ===
                                String(registro.idTecnico)
                        );

                        if (tec) {
                            nombreTecnico = `${tec.nombre} ${tec.aPaterno}`;
                        }
                    }
                } catch (e) {
                    console.warn("No se pudo cargar el técnico.");
                }
            } else if (registro.tecnico || registro.trabajador) {
                // Por si en algún momento tu backend manda el objeto completo anidado
                const objTec = registro.tecnico || registro.trabajador;
                nombreTecnico = `${objTec.nombre} ${objTec.aPaterno}`;
            }

            document.getElementById("det-tecnico").innerText = nombreTecnico;
        } else {
            // Si el equipo existe pero no tiene ninguna orden de reparación
            document.getElementById("panel-diagnostico").innerHTML = `
                <div class="flex flex-col items-center justify-center py-10 h-full">
                    <span class="text-6xl mb-4 opacity-50">📋</span>
                    <h3 class="text-xl font-bold text-white mb-2">Sin historial de servicio</h3>
                    <p class="text-gray-400 text-center">Este dispositivo está registrado a tu nombre, pero actualmente no tiene ninguna orden de reparación activa.</p>
                </div>
            `;
        }
    } catch (error) {
        document.getElementById(
            "panel-diagnostico"
        ).innerHTML = `<p class="text-red-500 text-center py-10 font-bold">${error.message}</p>`;
    }
}

// Función auxiliar para pintar el badge de estado en el detalle del dispositivo
function actualizarEstadoBadgeDetalle(badge, estado) {
    badge.innerText = estado;
    badge.className =
        "px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border";

    const estadoLower = (estado || "").toLowerCase();
    if (estadoLower.includes("revisión") || estadoLower.includes("pendiente")) {
        badge.classList.add(
            "bg-blue-900/40",
            "text-blue-400",
            "border-blue-600/50"
        );
    } else if (
        estadoLower.includes("reparación") ||
        estadoLower.includes("proceso")
    ) {
        badge.classList.add(
            "bg-yellow-900/40",
            "text-yellow-400",
            "border-yellow-600/50"
        );
    } else if (
        estadoLower.includes("listo") ||
        estadoLower.includes("entregado") ||
        estadoLower.includes("reparado")
    ) {
        badge.classList.add(
            "bg-green-900/40",
            "text-[#7ed957]",
            "border-[#7ed957]/50"
        );
    } else {
        badge.classList.add("bg-gray-900", "text-gray-400", "border-gray-700");
    }
}

// ==========================================
// MÓDULO 11: SOBRE NOSOTROS (CLIENTE)
// ==========================================
async function cargarNosotrosCliente() {
    const contenedor = document.getElementById('contenedor-nosotros');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/nosotros`);
        if (!respuesta.ok) throw new Error("Error al cargar la información");

        const datos = await respuesta.json();

        if (datos.length === 0) {
            contenedor.innerHTML = `<p class="text-gray-500 text-xl text-center">Información no disponible por el momento.</p>`;
            return;
        }

        contenedor.innerHTML = ''; // Limpiamos el texto de "Cargando..."

        datos.forEach((item, index) => {
            // Alternamos la dirección de la fila: Pares (0, 2) normales, Impares (1, 3) en reversa
            const direccionFila = index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse';
            
            // Verificamos si la imagen viene como URL completa o solo el nombre del archivo de Cloudinary
            let imagenUrl = item.imagen_url || item.imagen || "https://via.placeholder.com/600x400?text=PC+EXTREME";
            if (imagenUrl && !imagenUrl.startsWith('http')) {
                imagenUrl = `${CLOUD_BASE_IMG}${imagenUrl}`;
            }

            const seccionHTML = `
                <section class="glass-card w-full max-w-5xl rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden">
                    <div class="flex flex-col ${direccionFila} items-center gap-12">
                        <div class="w-full md:w-1/3">
                            <img src="${imagenUrl}" alt="${item.titulo}" class="rounded-2xl shadow-lg border border-white/10 w-full h-auto object-cover aspect-video">
                        </div>
                        <div class="flex-1">
                            <h3 class="text-neon-green text-2xl font-bold mb-4">${item.titulo}</h3>
                            <p class="text-gray-300 leading-relaxed text-lg whitespace-pre-line">${item.descripcion}</p>
                        </div>
                    </div>
                </section>
            `;
            
            contenedor.innerHTML += seccionHTML;
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `<p class="text-red-500 text-xl text-center">Error al conectar con el servidor.</p>`;
    }
}

// ==========================================
// MÓDULO 12: UBICACIÓN Y MAPA (CLIENTE)
// ==========================================
async function cargarUbicacionCliente() {
    const txtDireccion = document.getElementById('ubi-direccion');
    const linkMaps = document.getElementById('ubi-link-maps');
    const iframeMaps = document.getElementById('ubi-iframe');
    const loadingMap = document.getElementById('ubi-loading-map');

    if (!txtDireccion) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/contacto`);
        if (!respuesta.ok) throw new Error("Error al cargar la información de contacto");

        const datos = await respuesta.json();
        const contacto = Array.isArray(datos) ? datos[0] : datos;

        if (contacto) {
            txtDireccion.classList.remove('animate-pulse');
            txtDireccion.innerText = contacto.direccion || 'Dirección no disponible.';

            if (contacto.mapa_url) {
                // 1. EL BOTÓN AZUL: Usa tu link normal de la BD (Funciona perfecto)
                linkMaps.href = contacto.mapa_url;
                
                // 2. EL IFRAME (RECUADRO): Auto-generamos un link de inserción usando el texto de tu dirección
                // Transformamos los espacios y comas en código (ej: %20) para que sea una URL válida
                const direccionCodificada = encodeURIComponent(contacto.direccion);
                iframeMaps.src = `https://maps.google.com/maps?q=${direccionCodificada}&output=embed`;
                
                iframeMaps.classList.remove('hidden'); 
                loadingMap.classList.add('hidden'); 
            } else {
                loadingMap.innerText = "Mapa no disponible";
            }
        }
    } catch (error) {
        console.error(error);
        txtDireccion.classList.remove('animate-pulse');
        txtDireccion.classList.replace('text-[#7ed957]', 'text-red-500');
        txtDireccion.innerText = 'Error de conexión. No se pudo cargar la ubicación.';
        loadingMap.innerText = "Error al cargar el mapa";
    }
}

// ==========================================
// MÓDULO 13 : FORMULARIO DE CONTACTO PÚBLICO
// ==========================================
async function cargarInfoContactoPublico() {
    try {
        const respuesta = await fetch("https://app-web-java.vercel.app/api/contacto");
        if (!respuesta.ok) return;
        
        const datos = await respuesta.json();
        
        if (datos) {
            const contacto = Array.isArray(datos) ? datos[0] : datos;

            // 1. Inyectar Email
            const linkEmail = document.getElementById('publico-email');
            if (linkEmail && contacto.email) {
                linkEmail.href = `mailto:${contacto.email}`;
                linkEmail.innerText = contacto.email;
            }

            // 2. Inyectar Teléfono
            const linkTel = document.getElementById('publico-telefono');
            if (linkTel && contacto.telefono) {
                linkTel.href = `tel:${contacto.telefono.replace(/\D/g, '')}`;
                linkTel.innerText = contacto.telefono;
            }

            // 3. Inyectar WhatsApp
            const linkWa = document.getElementById('publico-whatsapp');
            if (linkWa && contacto.whatsapp) {
                // Limpiamos todo lo que no sea número para el link de WhatsApp
                const numeroLimpio = contacto.whatsapp.replace(/\D/g, '');
                // Asumimos código de país 52 (México), cámbialo si es otro
                linkWa.href = `https://wa.me/52${numeroLimpio}`; 
            }
        }
    } catch (error) {
        console.error("No se pudo cargar la información dinámica de contacto:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarInfoContactoPublico();
    const formContacto = document.getElementById('formulario-contacto-publico');
    
    if (formContacto) {
        formContacto.addEventListener('submit', async (evento) => {
            evento.preventDefault(); // Evita que la página intente recargarse

            const boton = formContacto.querySelector('button[type="submit"]');
            const textoOriginal = boton.innerHTML;
            boton.innerHTML = " Enviando mensaje...";
            boton.disabled = true;

            // Empaquetamos
            const payload = {
                correo: document.getElementById('cont-correo').value.trim(),
                asunto: document.getElementById('cont-asunto').value.trim(),
                mensaje: document.getElementById('cont-mensaje').value.trim(),
                tipo_mensaje: "ENTRANTE",
                estado_mensaje: "PENDIENTE"
            };

            try {
                // Hacemos el POST directo a API en Vercel
                const respuesta = await fetch("https://app-web-java.vercel.app/api/mensajes", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!respuesta.ok) throw new Error("Error del servidor al guardar el mensaje");

                // === CAMBIO: Alerta de éxito convertida a flotante ===
                mostrarNotificacion("¡Mensaje enviado con éxito! Te responderemos pronto a tu correo.", "exito");
                formContacto.reset();

            } catch (error) {
                console.error("Error al enviar formulario:", error);
                // === CAMBIO: Alerta de error convertida a flotante ===
                mostrarNotificacion("Ocurrió un error al enviar tu mensaje. Por favor intenta más tarde.", "error");
            } finally {
                // Restauramos el botón a la normalidad
                boton.innerHTML = textoOriginal;
                boton.disabled = false;
            }
        });
    }
});

// Disparador principal
document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargamos cosas generales
    cargarComponentes();
    inicializarEventosLogin();
    inicializarSepomexCliente();
    inicializarOjosPasswordGlobal();

    // 2. Llamadas exclusivas de la página de Inicio
    if (document.getElementById("portada-contenido")) cargarPortada();
    if (document.getElementById("lista-servicios")) cargarServicios();
    if (document.getElementById("carrusel-marcas")) cargarMarcas();
    if (document.getElementById("graficaCrecimiento")) iniciarModuloCrecimiento();

    // 3. Llamadas exclusivas para el rastreo de equipos
    const inputFolio = document.getElementById("input-folio");
    if (inputFolio) {
        // Evita que escriban signos o letras raras en el input del folio
        inputFolio.addEventListener("keydown", (e) => {
            if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
        });
    }
    const formConsulta = document.getElementById("formulario-consulta");
    if (formConsulta) formConsulta.addEventListener("submit", rastrearEquipo);

    // 4. Llamadas exclusivas para los Productos
    if (document.getElementById("cuadricula-productos"))
        cargarCatalogoProductos();
    if (document.getElementById("contenedor-detalle")) cargarDetalleProducto();
    // 5. Llamada para la vista de Perfil / Dispositivos
    if (document.getElementById("perfil-nombre")) cargarPerfilYDispositivos();
    // 6. Llamada para la vista de Detalles del Dispositivo Individual
    if (document.getElementById("contenedor-detalle-disp"))
        cargarDetalleDispositivoCliente();
    if (document.getElementById("contenedor-nosotros")) cargarNosotrosCliente();
    if(document.getElementById('ubi-direccion')) cargarUbicacionCliente();
});
