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
async function cargarReparaciones() {
  const contenedor = document.getElementById("lista-reparaciones");

  if (!contenedor) return;

  try {
    contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Cargando reparaciones...</td></tr>`;

    // 1. Cambiamos a la URL real de tu API en Express (Asegúrate de que el puerto sea el correcto)
    fetch("https://app-web-java.vercel.app/api/registros")
      .then((resultado) => {
          if (!resultado.ok) throw new Error("Error en la respuesta de la API");
          return resultado.json();
      })
      .then((reparaciones) => {
        contenedor.innerHTML = "";

        if (reparaciones.length === 0) {
          contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No hay reparaciones registradas.</td></tr>`;
          return;
        }

        reparaciones.forEach((rep) => {
          // 2. Ajustamos rep.estado a rep.estadoEquipo y rep.falla a rep.detalles (según tu base de datos)
          // Nota: Por ahora puse "Dispositivo ID: rep.idDispositivo" porque para traer el nombre real del equipo ocuparemos hacer un JOIN en SQL más adelante.
          const filaHTML = `
                <tr class="hover:bg-gray-50 transition">
                    <td class="px-4 py-4 align-top">
                        <span class="bg-gray-200 text-gray-800 font-black px-2 py-1 rounded text-sm">#${rep.idFolio}</span>
                    </td>
                    <td class="px-4 py-4 align-top">
                        <strong class="text-gray-900 block">${rep.idDispositivo}</strong>
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
                                
                                <textarea rows="1" class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm resize-none" placeholder="Diagnóstico...">${rep.diagnostico}</textarea>
                                
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-500 font-bold">$</span>
                                    <input type="number" value="${rep.costo}" class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm no-spinners">
                                </div>
                            </div>
                            <button type="submit" class="text-2xl hover:scale-110 transition pb-1" title="Guardar">💾</button>
                        </form>
                    </td>
                    
                    <td class="px-4 py-4 align-top text-center">
                        <button onclick="verTicket(${rep.idFolio})" class="text-gray-400 hover:text-blue-600 transition p-2 border border-gray-200 rounded-md hover:bg-blue-50" title="Ver Ticket">📄</button>
                    </td>
                </tr>
            `;
          contenedor.innerHTML += filaHTML;
        });
      })
      .catch((err) => {
          console.error("Error al cargar datos:", err);
          contenedor.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error al conectar con la base de datos. Verifica que el servidor Express esté corriendo.</td></tr>`;
      });
  } catch (error) {
    console.error("Error al ejecutar fetch:", error);
  }
}

//  llamar la función cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  cargarComponentesAdmin();
  cargarReparaciones();
});
