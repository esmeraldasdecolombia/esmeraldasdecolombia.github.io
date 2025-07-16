
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

    const oferta = prod.oferta?.replace('%', '').trim();
    const descuento = oferta ? parseFloat(oferta) : 0;
    const precioOriginal = parseFloat(prod.precio);
    const precioFinal = descuento ? precioOriginal * (1 - descuento / 100) : precioOriginal;
    const etiquetaOferta = descuento ? `<span class="etiqueta-oferta">${descuento}% OFF</span>` : "";

    const htmlPrecio = descuento
      ? `<p><span class="tachado">${precioOriginal.toLocaleString()} COP</span> <strong>${precioFinal.toLocaleString()} COP</strong></p>`
      : `<p><strong>${precioOriginal.toLocaleString()} COP</strong></p>`;

    const imagen2 = prod.imagen2?.trim();
    const eventoHover = imagen2
      ? `onmouseover="this.src='${imagen2}'" onmouseout="this.src='${prod.imagen1}'"`
      : "";

    contenedor.innerHTML += `
      <div class="producto">
        <div class="imagen-con-etiqueta">
          <img src="${prod.imagen1}" alt="${prod.nombre}" ${eventoHover}/>
          ${etiquetaOferta}
        </div>
        <h3>${prod.nombre}</h3>
        <p>${prod.descripcion}</p>
        ${htmlPrecio}
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
    const oferta = prod.oferta?.replace('%', '').trim();
    const descuento = oferta ? parseFloat(oferta) : 0;
    const precioUnitario = parseFloat(prod.precio);
    const precioFinal = descuento ? precioUnitario * (1 - descuento / 100) : precioUnitario;
    const totalProducto = precioFinal * prod.cantidad;

    suma += totalProducto;

    const li = document.createElement("li");
    li.innerHTML = `
      ${prod.nombre} x${prod.cantidad}
      <span>${totalProducto.toLocaleString()} COP</span>
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


