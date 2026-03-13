/**
 * admin.js
 * Archivo principal para la lógica del panel de administración de PC EXTREME.
 * Separado de main.js por seguridad y limpieza de arquitectura.
 */

// ==========================================
// 1. CARGA DE COMPONENTES DEL ADMINISTRADOR
// ==========================================

async function cargarComponentesAdmin() {
  try {
    // 1.1 Cargar e inyectar el Header del Admin
    const respuestaHeader = await fetch(
      "/FrontEnd-PCEXTREME/admin/admin_header.html"
    );
    if (!respuestaHeader.ok)
      throw new Error("No se pudo cargar el header del admin");
    const htmlHeader = await respuestaHeader.text();
    document.getElementById("encabezado-admin").innerHTML = htmlHeader;

    // 1.2 Cargar e inyectar el Footer del Admin
    const respuestaFooter = await fetch(
      "/FrontEnd-PCEXTREME/admin/admin_footer.html"
    );
    if (!respuestaFooter.ok)
      throw new Error("No se pudo cargar el footer del admin");
    const htmlFooter = await respuestaFooter.text();
    document.getElementById("pie-admin").innerHTML = htmlFooter;

    console.log("Componentes de Administración cargados correctamente.");
  } catch (error) {
    console.error("Error en la carga de componentes del admin:", error);
  }
}

// ==========================================
// 2. GESTIÓN DE REPARACIONES (API)
// ==========================================

/**
 * Función asíncrona para obtener las reparaciones de la API
 * y pintar las filas en la tabla del administrador.
 */
/**
 * Función asíncrona para obtener las reparaciones de la API
 * y pintar las filas en la tabla del administrador de forma optimizada.
 */
// ==========================================
// VARIABLES GLOBALES PARA PAGINACIÓN
// ==========================================
let registrosGlobales = []; // Aquí guardaremos todos los datos
let paginaActual = 1;
const registrosPorPagina = 20; // Límite por página

// ==========================================
// 1. DESCARGAR DATOS DE LA API
// ==========================================
async function cargarReparaciones() {
  const contenedor = document.getElementById("lista-reparaciones");
  if (!contenedor) return;

  try {
    contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Cargando reparaciones...</td></tr>`;

    const respuesta = await fetch("http://localhost:3000/api/registro");
    if (!respuesta.ok) throw new Error("Error en la respuesta de la API");

    // Guardamos todos los registros en la variable global
    registrosGlobales = await respuesta.json();
    paginaActual = 1; // Reiniciamos a la página 1 por si acaso

    // Llamamos a la función que pinta solo los 20 correspondientes
    mostrarPagina();

  } catch (error) {
    console.error("Error al cargar reparaciones:", error);
    contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error al conectar con la base de datos.</td></tr>`;
  }
}

// ==========================================
// 2. DIBUJAR SOLO 20 REGISTROS
// ==========================================
function mostrarPagina() {
  const contenedor = document.getElementById("lista-reparaciones");

  if (registrosGlobales.length === 0) {
    contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No hay reparaciones registradas.</td></tr>`;
    actualizarControlesPaginacion(); // Ocultamos la paginación si no hay datos
    return;
  }

  // Matemáticas de paginación: Cortamos el arreglo de 20 en 20
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const registrosPagina = registrosGlobales.slice(inicio, fin);

  let htmlAcumulado = "";

  registrosPagina.forEach((rep) => {
    htmlAcumulado += `
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
              <button onclick="verTicket(${rep.idFolio})" type="button" class="text-gray-400 hover:text-blue-600 transition p-2 border border-gray-200 rounded-md hover:bg-blue-50" title="Ver Ticket">📄</button>
          </td>
      </tr>
    `;
  });

  contenedor.innerHTML = htmlAcumulado;
  actualizarControlesPaginacion(); // Actualizamos los botones de Siguiente/Anterior
}

// ==========================================
// 3. CAMBIAR DE PÁGINA
// ==========================================
function cambiarPagina(direccion) {
  const totalPaginas = Math.ceil(registrosGlobales.length / registrosPorPagina);
  
  if (direccion === 'siguiente' && paginaActual < totalPaginas) {
    paginaActual++;
  } else if (direccion === 'anterior' && paginaActual > 1) {
    paginaActual--;
  }
  
  // Volvemos a dibujar la tabla con la nueva página (es instantáneo)
  mostrarPagina(); 
}

// ==========================================
// 4. DIBUJAR BOTONES DE PAGINACIÓN (Estilo Tailwind)
// ==========================================
function actualizarControlesPaginacion() {
  let controles = document.getElementById("controles-paginacion");
  
  // Si no existe el contenedor de los botones, lo creamos justo debajo de la tabla
  if (!controles) {
    // Buscamos la tabla envolvente (asegúrate de que tu <tbody> esté dentro de un <table>)
    const tabla = document.querySelector("table").parentNode; 
    controles = document.createElement("div");
    controles.id = "controles-paginacion";
    controles.className = "flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 rounded-b-lg mt-2";
    tabla.appendChild(controles);
  }

  const totalPaginas = Math.ceil(registrosGlobales.length / registrosPorPagina);

  if (totalPaginas === 0) {
    controles.innerHTML = "";
    return;
  }

  // Generamos los botones con Tailwind
  controles.innerHTML = `
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
            <p class="text-sm text-gray-700">
                Mostrando <span class="font-medium">${(paginaActual - 1) * registrosPorPagina + 1}</span> a <span class="font-medium">${Math.min(paginaActual * registrosPorPagina, registrosGlobales.length)}</span> de <span class="font-medium">${registrosGlobales.length}</span> registros
            </p>
        </div>
        <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onclick="cambiarPagina('anterior')" ${paginaActual === 1 ? 'disabled' : ''} class="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100 ${paginaActual === 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                    Anterior
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Página ${paginaActual} de ${totalPaginas}
                </span>
                <button onclick="cambiarPagina('siguiente')" ${paginaActual === totalPaginas ? 'disabled' : ''} class="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100 ${paginaActual === totalPaginas ? 'opacity-50 cursor-not-allowed' : ''}">
                    Siguiente
                </button>
            </nav>
        </div>
    </div>
  `;
}
//  llamar la función cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  cargarComponentesAdmin();
  cargarReparaciones();
});
