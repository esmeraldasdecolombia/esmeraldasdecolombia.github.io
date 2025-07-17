
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
      ? `<p class="precio"><span class="tachado">${precioOriginal.toLocaleString()} COP</span> <strong>${precioFinal.toLocaleString()} COP</strong></p>`
      : `<p class="precio"><strong>${precioOriginal.toLocaleString()} COP</strong></p>`;

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
        <p class="descripcion">${prod.descripcion}</p>
        ${htmlPrecio}
        <p class="stock">Stock: ${prod.stock}</p>
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
  document.getElementById("modalResenas").style.display = "block";
  document.getElementById("tituloResena").textContent = `Reseña para ${nombre}`;
  document.getElementById("comentarioResena").value = "";
  document.getElementById("estrellasInput").dataset.valor = "0";

  const estrellas = document.querySelectorAll("#estrellasInput span");
  estrellas.forEach(span => {
    span.textContent = "☆";
    span.classList.remove("activa");
  });
}

function cerrarModal() {
  document.getElementById("modalResenas").style.display = "none";
}

function seleccionarEstrella(event) {
  const valor = parseInt(event.target.dataset.valor);
  const estrellas = document.querySelectorAll("#estrellasInput span");
  estrellas.forEach(span => {
    const spanValor = parseInt(span.dataset.valor);
    span.textContent = spanValor <= valor ? "★" : "☆";
    if (spanValor <= valor) {
      span.classList.add("activa");
    } else {
      span.classList.remove("activa");
    }
  });
  document.getElementById("estrellasInput").dataset.valor = valor;
}

function guardarResenaDesdeModal() {
  const comentario = document.getElementById("comentarioResena").value.trim();
  const estrellas = parseInt(document.getElementById("estrellasInput").dataset.valor || "0");

  if (!comentario || estrellas < 1 || estrellas > 5 || !productoActivo) {
    alert("Por favor completa todos los campos");
    return;
  }

  if (!reseñas[productoActivo]) reseñas[productoActivo] = [];
  reseñas[productoActivo].push({ comentario, estrellas });
  cerrarModal();
  mostrarProductos(productosGlobal);
}

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

document.querySelectorAll("#estrellasInput span").forEach(span => {
  span.addEventListener("click", seleccionarEstrella);
});

cargarProductos();
