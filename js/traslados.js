// Manejo de traslados usando localStorage
const CLAVE_TRASLADOS = 'traslados'
let idEdicionActual = ''
let mapa = null
let modoMapa = 'origen' // 'origen' or 'destino'
let marcadorOrigen = null
let marcadorDestino = null

function cargarTraslados() {
  const raw = localStorage.getItem(CLAVE_TRASLADOS) || '[]'
  return JSON.parse(raw)
}

function guardarTraslados(lista) {
  localStorage.setItem(CLAVE_TRASLADOS, JSON.stringify(lista))
}

function crearId() {
  return 't-' + Date.now()
}

// Debounce utility
function debounce(fn, delay) {
  let t
  return function (...args) {
    clearTimeout(t)
    t = setTimeout(() => fn.apply(this, args), delay)
  }
}

// Buscar direcciones usando Nominatim (OpenStreetMap)
async function buscarDirecciones(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    if (!res.ok) return []
    const data = await res.json()
    return data.map(d => ({ display_name: d.display_name, lat: parseFloat(d.lat), lon: parseFloat(d.lon) }))
  } catch (err) {
    console.warn('Error buscando direcciones:', err)
    return []
  }
}

function limpiarSugerencias(contenedor) {
  if (!contenedor) return
  contenedor.innerHTML = ''
  contenedor.classList.add('oculta')
}

function mostrarSugerencias(contenedor, results, tipo) {
  if (!contenedor) return
  contenedor.innerHTML = ''
  if (!results || !results.length) {
    contenedor.classList.add('oculta')
    return
  }
  results.forEach(r => {
    const el = document.createElement('div')
    el.className = 'sugerencia-item'
    el.textContent = r.display_name
    el.addEventListener('click', () => {
      aplicarSugerencia(r, tipo)
    })
    contenedor.appendChild(el)
  })
  contenedor.classList.remove('oculta')
}

function aplicarSugerencia(resultado, tipo) {
  if (!resultado) return
  if (tipo === 'origen') {
    const inp = document.getElementById('entradaOrigen'); if (inp) inp.value = resultado.display_name
    const lat = document.getElementById('entradaLatOrigen'); if (lat) lat.value = resultado.lat
    const lng = document.getElementById('entradaLngOrigen'); if (lng) lng.value = resultado.lon
    if (marcadorOrigen) mapa.removeLayer(marcadorOrigen)
    try {
      marcadorOrigen = L.marker([resultado.lat, resultado.lon]).addTo(mapa).bindPopup('Origen').openPopup()
      mapa.setView([resultado.lat, resultado.lon], 14)
    } catch (e) {}
    limpiarSugerencias(document.getElementById('sugerenciasOrigen'))
  } else {
    const inp = document.getElementById('entradaDestino'); if (inp) inp.value = resultado.display_name
    const lat = document.getElementById('entradaLatDestino'); if (lat) lat.value = resultado.lat
    const lng = document.getElementById('entradaLngDestino'); if (lng) lng.value = resultado.lon
    if (marcadorDestino) mapa.removeLayer(marcadorDestino)
    try {
      marcadorDestino = L.marker([resultado.lat, resultado.lon]).addTo(mapa).bindPopup('Destino').openPopup()
      mapa.setView([resultado.lat, resultado.lon], 14)
    } catch (e) {}
    limpiarSugerencias(document.getElementById('sugerenciasDestino'))
  }
}

function renderizarLista() {
  const cont = document.getElementById('listaTraslados')
  const list = cargarTraslados()
  cont.innerHTML = ''
  if (!list.length) {
    cont.innerHTML = '<p class="sin-documentos">No hay traslados registrados</p>'
    return
  }
  list.forEach(t => {
    const item = document.createElement('div')
    item.className = 'traslado-item'
    item.innerHTML = `
      <div class="traslado-info">
        <strong>${t.paciente}</strong> — ${t.origen} → ${t.destino}
        <span class="estado">${t.estado}</span>
      </div>
      <div class="traslado-acciones">
        <button data-id="${t.id}" class="btn-ver">Ver</button>
        ${t.estado === 'pendiente' ? `<button data-id="${t.id}" class="btn-iniciar">Iniciar</button>` : ''}
        ${t.estado !== 'finalizado' ? `<button data-id="${t.id}" class="btn-finalizar">Finalizar</button>` : ''}
      </div>
    `
    cont.appendChild(item)
  })
}

function abrirFormulario() {
  idEdicionActual = ''
  document.getElementById('formTitulo').textContent = 'Nuevo Traslado'
  const hiddenId = document.getElementById('idEdicionActual'); if (hiddenId) hiddenId.value = ''
  document.getElementById('seccionForm').classList.remove('oculta')
  setTimeout(() => { if (mapa) mapa.invalidateSize() }, 200)
}

function abrirFormularioEdicion(traslado) {
  idEdicionActual = traslado.id
  document.getElementById('formTitulo').textContent = 'Editar Traslado — Iniciado'
  const hiddenId = document.getElementById('idEdicionActual'); if (hiddenId) hiddenId.value = traslado.id
  const entPac = document.getElementById('entradaPaciente'); if (entPac) entPac.value = traslado.paciente
  const entOri = document.getElementById('entradaOrigen'); if (entOri) entOri.value = traslado.origen
  const entDes = document.getElementById('entradaDestino'); if (entDes) entDes.value = traslado.destino
  const entNotas = document.getElementById('notasTraslado'); if (entNotas) entNotas.value = traslado.notas || ''
  if (traslado.origenCoord) {
    const latO = document.getElementById('entradaLatOrigen'); if (latO) latO.value = traslado.origenCoord.lat
    const lngO = document.getElementById('entradaLngOrigen'); if (lngO) lngO.value = traslado.origenCoord.lng
  }
  if (traslado.destinoCoord) {
    const latD = document.getElementById('entradaLatDestino'); if (latD) latD.value = traslado.destinoCoord.lat
    const lngD = document.getElementById('entradaLngDestino'); if (lngD) lngD.value = traslado.destinoCoord.lng
  }
  document.getElementById('seccionForm').classList.remove('oculta')
  setTimeout(() => {
    if (mapa) {
      mapa.invalidateSize()
      if (traslado.origenCoord) {
        if (marcadorOrigen) mapa.removeLayer(marcadorOrigen)
        marcadorOrigen = L.marker([traslado.origenCoord.lat, traslado.origenCoord.lng]).addTo(mapa).bindPopup('Origen')
      }
      if (traslado.destinoCoord) {
        if (marcadorDestino) mapa.removeLayer(marcadorDestino)
        marcadorDestino = L.marker([traslado.destinoCoord.lat, traslado.destinoCoord.lng]).addTo(mapa).bindPopup('Destino')
      }
      if (traslado.origenCoord) mapa.setView([traslado.origenCoord.lat, traslado.origenCoord.lng], 13)
    }
  }, 200)
}

function cerrarFormulario() {
  idEdicionActual = ''
  document.getElementById('formTraslado').reset()
  const hiddenId = document.getElementById('idEdicionActual'); if (hiddenId) hiddenId.value = ''
  document.getElementById('seccionForm').classList.add('oculta')
}

function manejarEventoLista(e) {
  const id = e.target.dataset.id
  if (!id) return
  if (e.target.classList.contains('btn-ver')) verTraslado(id)
  if (e.target.classList.contains('btn-iniciar')) {
    const lista = cargarTraslados()
    const t = lista.find(x => x.id === id)
    if (!t) return
    // marcar traslado como en curso y abrir formulario para completar datos
    t.estado = 'en curso'
    t.historial = t.historial || []
    t.historial.push({ estado: 'en curso', fecha: new Date().toISOString() })
    guardarTraslados(lista)
    abrirFormularioEdicion(t)
    renderizarLista()
  }
  if (e.target.classList.contains('btn-finalizar')) cambiarEstado(id, 'finalizado')
}

function cambiarEstado(id, nuevoEstado) {
  const lista = cargarTraslados()
  const t = lista.find(x => x.id === id)
  if (!t) return
  t.estado = nuevoEstado
  t.historial = t.historial || []
  t.historial.push({ estado: nuevoEstado, fecha: new Date().toISOString() })
  guardarTraslados(lista)
  renderizarLista()
}

function verTraslado(id) {
  const lista = cargarTraslados()
  const t = lista.find(x => x.id === id)
  if (!t) return
  document.getElementById('detalleTitulo').textContent = `Traslado — ${t.paciente}`
  const contenido = document.getElementById('detalleContenido')
  contenido.innerHTML = `
    <p><strong>Paciente:</strong> ${t.paciente}</p>
    <p><strong>Origen:</strong> ${t.origen}</p>
    <p><strong>Destino:</strong> ${t.destino}</p>
    <p><strong>Notas:</strong> ${t.notas || '-'} </p>
    <p><strong>Estado:</strong> ${t.estado}</p>
    <p><strong>Fecha creación:</strong> ${new Date(t.creado).toLocaleString()}</p>
  `
  const hist = document.getElementById('detalleHistorial')
  hist.innerHTML = ''
  ;(t.historial || []).forEach(h => {
    const el = document.createElement('div')
    el.textContent = `${new Date(h.fecha).toLocaleString()} — ${h.estado}`
    hist.appendChild(el)
  })
  document.getElementById('detalleModal').classList.remove('oculta')
}

function cerrarDetalle() {
  document.getElementById('detalleModal').classList.add('oculta')
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarLista()

  document.getElementById('btnNuevoTraslado').addEventListener('click', abrirFormulario)
  document.getElementById('btnCerrarForm').addEventListener('click', (e) => { e.preventDefault(); cerrarFormulario() })

  // Inicializar mapa Leaflet
  try {
    mapa = L.map('map').setView([0, 0], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapa)
    mapa.on('click', (ev) => {
      const lat = ev.latlng.lat
      const lng = ev.latlng.lng
      if (modoMapa === 'origen') {
        if (marcadorOrigen) mapa.removeLayer(marcadorOrigen)
        marcadorOrigen = L.marker([lat, lng]).addTo(mapa).bindPopup('Origen').openPopup()
        const latO = document.getElementById('entradaLatOrigen'); if (latO) latO.value = lat
        const lngO = document.getElementById('entradaLngOrigen'); if (lngO) lngO.value = lng
      } else {
        if (marcadorDestino) mapa.removeLayer(marcadorDestino)
        marcadorDestino = L.marker([lat, lng]).addTo(mapa).bindPopup('Destino').openPopup()
        const latD = document.getElementById('entradaLatDestino'); if (latD) latD.value = lat
        const lngD = document.getElementById('entradaLngDestino'); if (lngD) lngD.value = lng
      }
    })
  } catch (err) {
    console.warn('Leaflet no pudo inicializarse:', err)
  }

  const btnMarcarOrigen = document.getElementById('btnMarcarOrigen'); if (btnMarcarOrigen) btnMarcarOrigen.addEventListener('click', () => { modoMapa = 'origen' })
  const btnMarcarDestino = document.getElementById('btnMarcarDestino'); if (btnMarcarDestino) btnMarcarDestino.addEventListener('click', () => { modoMapa = 'destino' })

  document.getElementById('formTraslado').addEventListener('submit', (e) => {
    e.preventDefault()
    const paciente = (document.getElementById('entradaPaciente') || {}).value ? document.getElementById('entradaPaciente').value.trim() : ''
    const origen = (document.getElementById('entradaOrigen') || {}).value ? document.getElementById('entradaOrigen').value.trim() : ''
    const destino = (document.getElementById('entradaDestino') || {}).value ? document.getElementById('entradaDestino').value.trim() : ''
    const notas = (document.getElementById('notasTraslado') || {}).value ? document.getElementById('notasTraslado').value.trim() : ''
    const latO = (document.getElementById('entradaLatOrigen') || {}).value
    const lngO = (document.getElementById('entradaLngOrigen') || {}).value
    const latD = (document.getElementById('entradaLatDestino') || {}).value
    const lngD = (document.getElementById('entradaLngDestino') || {}).value
    if (!paciente || !origen || !destino) return alert('Complete los campos obligatorios')
    const lista = cargarTraslados()
    if (idEdicionActual) {
      const t = lista.find(x => x.id === idEdicionActual)
      if (!t) return
      t.paciente = paciente
      t.origen = origen
      t.destino = destino
      t.notas = notas
      if (latO && lngO) t.origenCoord = { lat: parseFloat(latO), lng: parseFloat(lngO) }
      if (latD && lngD) t.destinoCoord = { lat: parseFloat(latD), lng: parseFloat(lngD) }
      t.historial = t.historial || []
      t.historial.push({ estado: 'datos actualizados', fecha: new Date().toISOString() })
      guardarTraslados(lista)
      cerrarFormulario()
      renderizarLista()
      return
    }
    const nuevo = {
      id: crearId(),
      paciente, origen, destino, notas,
      estado: 'pendiente',
      creado: new Date().toISOString(),
      historial: [{ estado: 'pendiente', fecha: new Date().toISOString() }]
    }
    if (latO && lngO) nuevo.origenCoord = { lat: parseFloat(latO), lng: parseFloat(lngO) }
    if (latD && lngD) nuevo.destinoCoord = { lat: parseFloat(latD), lng: parseFloat(lngD) }
    lista.push(nuevo)
    guardarTraslados(lista)
    cerrarFormulario()
    document.getElementById('formTraslado').reset()
    renderizarLista()
  })

  document.getElementById('listaTraslados').addEventListener('click', manejarEventoLista)
  document.getElementById('btnCerrarDetalle').addEventListener('click', cerrarDetalle)

  // Autocomplete de direcciones (entradaOrigen / entradaDestino)
  const entradaOrigen = document.getElementById('entradaOrigen')
  const entradaDestino = document.getElementById('entradaDestino')
  const sugerenciasOrigen = document.getElementById('sugerenciasOrigen')
  const sugerenciasDestino = document.getElementById('sugerenciasDestino')

  const buscarYMostrar = async (q, cont, tipo) => {
    if (!q || q.length < 3) { limpiarSugerencias(cont); return }
    const resultados = await buscarDirecciones(q)
    mostrarSugerencias(cont, resultados, tipo)
  }

  const debBuscarOrigen = debounce((ev) => buscarYMostrar(ev.target.value, sugerenciasOrigen, 'origen'), 350)
  const debBuscarDestino = debounce((ev) => buscarYMostrar(ev.target.value, sugerenciasDestino, 'destino'), 350)

  if (entradaOrigen) {
    entradaOrigen.addEventListener('input', debBuscarOrigen)
    entradaOrigen.addEventListener('blur', () => setTimeout(() => limpiarSugerencias(sugerenciasOrigen), 200))
  }
  if (entradaDestino) {
    entradaDestino.addEventListener('input', debBuscarDestino)
    entradaDestino.addEventListener('blur', () => setTimeout(() => limpiarSugerencias(sugerenciasDestino), 200))
  }

  // Cerrar sugerencias al hacer clic fuera
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest || (!ev.target.closest('#sugerenciasOrigen') && !ev.target.closest('#entradaOrigen'))) limpiarSugerencias(sugerenciasOrigen)
    if (!ev.target.closest || (!ev.target.closest('#sugerenciasDestino') && !ev.target.closest('#entradaDestino'))) limpiarSugerencias(sugerenciasDestino)
  })
})
