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
async function cargarReparaciones() {
  const contenedor = document.getElementById("lista-reparaciones");

  // Verificamos que estemos en la página correcta antes de ejecutar
  if (!contenedor) return;

  try {
    // Indicador de carga temporal
    contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Cargando reparaciones...</td></tr>`;

    // 1. Hacemos la petición a tu API (Asegúrate de que esta URL sea la correcta, ya sea localhost o Vercel)
    const respuesta = await fetch("https://app-web-java.vercel.app/api/registros");

    if (!respuesta.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const reparaciones = await respuesta.json();

    // 2. Si no hay datos en la tabla
    if (reparaciones.length === 0) {
      contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No hay reparaciones registradas.</td></tr>`;
      return;
    }

    // --- AQUÍ ESTÁ LA MAGIA DE LA OPTIMIZACIÓN ---
    // 3. Creamos una variable de texto vacía para acumular el HTML
    let htmlAcumulado = "";

    // 4. Construimos cada fila y la sumamos a la variable (sin tocar la pantalla)
    reparaciones.forEach((rep) => {
      htmlAcumulado += `
            <tr class="hover:bg-gray-50 transition">
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
                            <select class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
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

    // 5. Inyectamos todo el HTML acumulado de un solo golpe
    contenedor.innerHTML = htmlAcumulado;

  } catch (error) {
    console.error("Error al cargar reparaciones:", error);
    contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error al conectar con la base de datos o el servidor Express.</td></tr>`;
  }
}

//  llamar la función cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  cargarComponentesAdmin();
  cargarReparaciones();
});
