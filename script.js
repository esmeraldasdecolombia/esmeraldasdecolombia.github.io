
let productosGlobal = [];
let carrito = [];
let reseñas = {};
let productoActivo = null;

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
        <button onclick="abrirModal('${prod.codigo}', '${prod.nombre}')">Dejar Reseña</button>
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

function abrirModal(codigo, nombre) {
  productoActivo = codigo;
  document.getElementById("modalReseñas").style.display = "block";
  document.getElementById("tituloReseña").textContent = `Reseñas para ${nombre}`;
  document.getElementById("nuevaReseña").value = "";
  cargarEstrellasInteractivas();
}

function cerrarModal() {
  document.getElementById("modalReseñas").style.display = "none";
}

function cargarEstrellasInteractivas() {
  const contenedor = document.getElementById("estrellasInput");
  contenedor.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const estrella = document.createElement("span");
    estrella.textContent = "☆";
    estrella.dataset.valor = i;
    estrella.addEventListener("click", seleccionarEstrella);
    contenedor.appendChild(estrella);
  }
}

function seleccionarEstrella(e) {
  const valor = parseInt(e.target.dataset.valor);
  document.querySelectorAll("#estrellasInput span").forEach(star => {
    star.textContent = parseInt(star.dataset.valor) <= valor ? "★" : "☆";
  });
  document.getElementById("estrellasInput").dataset.valor = valor;
}

function guardarReseña() {
  const comentario = document.getElementById("nuevaReseña").value.trim();
  const estrellas = parseInt(document.getElementById("estrellasInput").dataset.valor || 0);
  if (!comentario || estrellas < 1 || estrellas > 5 || !productoActivo) return alert("Por favor completa todos los campos");

  if (!reseñas[productoActivo]) reseñas[productoActivo] = [];
  reseñas[productoActivo].push({ comentario, estrellas });
  cerrarModal();
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
