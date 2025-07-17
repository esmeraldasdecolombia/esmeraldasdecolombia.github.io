
let productosGlobal = [];

function toggleCarrito() {
  const carrito = document.getElementById("carrito");
  carrito.style.display = carrito.style.display === "block" ? "none" : "block";
}

function vaciarCarrito() {
  document.getElementById("listaCarrito").innerHTML = "";
  document.getElementById("totalCarrito").textContent = "Total: 0 COP";
}

function abrirResena(codigoProducto) {
  const producto = productosGlobal.find(p => p.codigo === codigoProducto);
  if (!producto) return;

  const contenido = document.getElementById("contenidoResena");
  contenido.innerHTML = `
    <p><strong>${producto.nombre}</strong></p>
    <p>⭐⭐⭐⭐☆ (4.0/5)</p>
    <p>Excelente calidad, muy recomendado.</p>
  `;
  document.getElementById("modalResena").style.display = "block";
}

function cerrarResena() {
  document.getElementById("modalResena").style.display = "none";
}
