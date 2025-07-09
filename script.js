async function cargarProductos() {
  try {
    const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRoODpPJHcq-NybV0eOi7PGHeMe23NqRscTKQparQp8si0pUQJqkmCif6kc2tD2r6LXmsbTLYblMW4Z/pub?gid=0&single=true&output=csv");
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    const productos = parsed.data;
    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = "";

    if (!productos.length) {
      document.getElementById("mensajeError").textContent = "No se encontraron productos en la hoja.";
      return;
    }

    productos.forEach(prod => {
      if (!prod.nombre || !prod.imagen1) return;
      contenedor.innerHTML += `
        <div class="producto">
          <img src="${prod.imagen1}" alt="${prod.nombre}" />
          <h3>${prod.nombre}</h3>
          <p>${prod.descripcion}</p>
          <p><strong>${prod.precio} COP</strong></p>
          <p>Stock: ${prod.stock}</p>
          <button onclick="agregarCarrito('${prod.codigo}')">Añadir al carrito</button>
        </div>
      `;
    });
  } catch (err) {
    document.getElementById("mensajeError").textContent = "Error al cargar productos: " + err.message;
  }
}

function agregarCarrito(codigo) {
  alert("Producto " + codigo + " añadido al carrito.");
}

cargarProductos();
