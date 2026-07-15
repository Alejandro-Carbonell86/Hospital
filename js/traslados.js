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
})
