
let productosGlobal = [];
let carrito = [];
let reseñas = {}; // Objeto para guardar reseñas por código

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

    const imagen2HTML = prod.imagen2
      ? `<img class="imagen2" src="${prod.imagen2}" alt="${prod.nombre}" />`
      : "";

    const estrellasHTML = obtenerEstrellasHTML(prod.codigo);

    contenedor.innerHTML += `
      <div class="producto">
        <div class="imagen-con-etiqueta">
          <img class="imagen1" src="${prod.imagen1}" alt="${prod.nombre}" />
          ${imagen2HTML}
          ${etiquetaOferta}
        </div>
        <h3>${prod.nombre}</h3>
        <p>${prod.descripcion}</p>
        ${htmlPrecio}
        <p>Stock: ${prod.stock}</p>
        <div class="resenas">${estrellasHTML}</div>
        <button onclick="agregarCarrito('${prod.codigo}')">Añadir al carrito</button>
        <button onclick="mostrarFormularioResena('${prod.codigo}')">Dejar Reseña</button>
      </div>
    `;
  });
}

function obtenerEstrellasHTML(codigo) {
  const lista = reseñas[codigo] || [];
  if (!lista.length) return '<p>Sin reseñas</p>';

  const promedio = lista.reduce((acc, r) => acc + r.estrellas, 0) / lista.length;
  const estrellas = Math.round(promedio);
  let html = '<div class="estrellas">';
  for (let i = 1; i <= 5; i++) {
    html += `<span>${i <= estrellas ? '★' : '☆'}</span>`;
  }
  html += ` <small>(${lista.length} reseñas)</small></div>`;
  return html;
}

function mostrarFormularioResena(codigo) {
  const nombre = prompt("Tu nombre:");
  if (!nombre) return;

  let estrellas = prompt("¿Cuántas estrellas le das? (1 a 5):");
  estrellas = parseInt(estrellas);
  if (isNaN(estrellas) || estrellas < 1 || estrellas > 5) return alert("Número inválido");

  const comentario = prompt("¿Qué opinas del producto?");
  if (!comentario) return;

  if (!reseñas[codigo]) reseñas[codigo] = [];
  reseñas[codigo].push({ nombre, estrellas, comentario });

  mostrarProductos(productosGlobal);
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

