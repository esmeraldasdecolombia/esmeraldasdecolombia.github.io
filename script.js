
let productosGlobal = [];
let carrito = [];

async function cargarProductos() {
  try {
    const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRoODpPJHcq-NybV0eOi7PGHeMe23NqRscTKQparQp8si0pUQJqkmCif6kc2tD2r6LXmsbTLYblMW4Z/pub?gid=0&single=true&output=csv");
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    productosGlobal = parsed.data;

    mostrarProductos(productosGlobal);
  } catch (err) {
    document.getElementById("mensajeError").textContent = "Error al cargar productos: " + err.message;
  }
}

function mostrarProductos(lista) {
  const contenedor = document.getElementById("catalogo");
  contenedor.innerHTML = "";

  lista.forEach(prod => {
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
}

function filtrarCategoria(categoria) {
  const filtro = categoria.toLowerCase();
  const filtrados = filtro ? productosGlobal.filter(p => p.categoria.toLowerCase() === filtro) : productosGlobal;
  mostrarProductos(filtrados);
}

document.getElementById("buscador").addEventListener("input", function () {
  const texto = this.value.toLowerCase();
  const resultados = productosGlobal.filter(p =>
    p.nombre.toLowerCase().includes(texto) ||
    p.codigo.toLowerCase().includes(texto)
  );
  mostrarProductos(resultados);
});

function agregarCarrito(codigo) {
  const producto = productosGlobal.find(p => p.codigo === codigo);
  if (!producto) return;

  const existente = carrito.find(p => p.codigo === codigo);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById("listaCarrito");
  const total = document.getElementById("totalCarrito");
  lista.innerHTML = "";

  let suma = 0;

  carrito.forEach(prod => {
    const precio = parseInt(prod.precio) * prod.cantidad;
    suma += precio;

    const li = document.createElement("li");
    li.innerHTML = `
      ${prod.nombre} x${prod.cantidad}
      <span>${precio.toLocaleString()} COP</span>
      <button onclick="eliminarDelCarrito('${prod.codigo}')">❌</button>
    `;
    lista.appendChild(li);
  });

  total.textContent = "Total: " + suma.toLocaleString() + " COP";
}

function eliminarDelCarrito(codigo) {
  carrito = carrito.filter(p => p.codigo !== codigo);
  actualizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  actualizarCarrito();
}

function toggleCarrito() {
  const carritoDiv = document.getElementById("carrito");
  carritoDiv.style.display = carritoDiv.style.display === "none" ? "block" : "none";
}

cargarProductos();

