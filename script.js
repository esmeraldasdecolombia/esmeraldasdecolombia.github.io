
async function cargarProductos() {
  const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRoODpPJHcq-NybV0eOi7PGHeMe23NqRscTKQparQp8si0pUQJqkmCif6kc2tD2r6LXmsbTLYblMW4Z/pub?gid=0&single=true&output=csv");
  const data = await response.text();
  const rows = data.split("\n").slice(1);
  const productos = rows.map(row => {
    const columnas = row.split(",");
    return {
      codigo: columnas[0],
      nombre: columnas[1],
      descripcion: columnas[2],
      precio: columnas[3],
      stock: columnas[4],
      categoria: columnas[5],
      imagen1: columnas[6],
      imagen2: columnas[7],
      oferta: columnas[8],
    };
  });

  const contenedor = document.getElementById("catalogo");
  contenedor.innerHTML = "";
  productos.forEach(prod => {
    if (!prod.nombre) return;
    contenedor.innerHTML += `
      <div class="producto">
        <img src="${prod.imagen1}" alt="${prod.nombre}"/>
        <h3>${prod.nombre}</h3>
        <p>${prod.descripcion}</p>
        <p><strong>${prod.precio} COP</strong></p>
        <p>Stock: ${prod.stock}</p>
        <button onclick="agregarCarrito('${prod.codigo}')">Añadir al carrito</button>
      </div>
    `;
  });
}

function agregarCarrito(codigo) {
  alert("Producto " + codigo + " añadido al carrito.");
}

cargarProductos();
