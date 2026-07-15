// Manejo de traslados usando localStorage
const LS_KEY = 'traslados'
let currentEditId = ''
let map = null
let mapMode = 'origin' // 'origin' or 'dest'
let originMarker = null
let destMarker = null

function cargarTraslados() {
  const raw = localStorage.getItem(LS_KEY) || '[]'
  return JSON.parse(raw)
}

function guardarTraslados(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

function crearId() {
  return 't-' + Date.now()
}

function renderLista() {
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

function abrirForm() {
  currentEditId = ''
  document.getElementById('formTitulo').textContent = 'Nuevo Traslado'
  document.getElementById('currentEditId').value = ''
  document.getElementById('seccionForm').classList.remove('oculta')
  setTimeout(() => { if (map) map.invalidateSize() }, 200)
}

function abrirFormEdicion(traslado) {
  currentEditId = traslado.id
  document.getElementById('formTitulo').textContent = 'Editar Traslado — Iniciado'
  document.getElementById('currentEditId').value = traslado.id
  document.getElementById('inputPaciente').value = traslado.paciente
  document.getElementById('inputOrigen').value = traslado.origen
  document.getElementById('inputDestino').value = traslado.destino
  document.getElementById('inputNotas').value = traslado.notas || ''
  if (traslado.origenCoord) {
    document.getElementById('inputLatOrigin').value = traslado.origenCoord.lat
    document.getElementById('inputLngOrigin').value = traslado.origenCoord.lng
  }
  if (traslado.destinoCoord) {
    document.getElementById('inputLatDest').value = traslado.destinoCoord.lat
    document.getElementById('inputLngDest').value = traslado.destinoCoord.lng
  }
  document.getElementById('seccionForm').classList.remove('oculta')
  setTimeout(() => {
    if (map) {
      map.invalidateSize()
      if (traslado.origenCoord) {
        if (originMarker) map.removeLayer(originMarker)
        originMarker = L.marker([traslado.origenCoord.lat, traslado.origenCoord.lng]).addTo(map).bindPopup('Origen')
      }
      if (traslado.destinoCoord) {
        if (destMarker) map.removeLayer(destMarker)
        destMarker = L.marker([traslado.destinoCoord.lat, traslado.destinoCoord.lng]).addTo(map).bindPopup('Destino')
      }
      if (traslado.origenCoord) map.setView([traslado.origenCoord.lat, traslado.origenCoord.lng], 13)
    }
  }, 200)
}

function cerrarForm() {
  currentEditId = ''
  document.getElementById('formTraslado').reset()
  document.getElementById('currentEditId').value = ''
  document.getElementById('seccionForm').classList.add('oculta')
}

function añadirEventoLista(e) {
  const id = e.target.dataset.id
  if (!id) return
  if (e.target.classList.contains('btn-ver')) viewTraslado(id)
  if (e.target.classList.contains('btn-iniciar')) {
    const list = cargarTraslados()
    const t = list.find(x => x.id === id)
    if (!t) return
    // marcar traslado como en curso y abrir formulario para completar datos
    t.estado = 'en curso'
    t.historial = t.historial || []
    t.historial.push({ estado: 'en curso', fecha: new Date().toISOString() })
    guardarTraslados(list)
    abrirFormEdicion(t)
    renderLista()
  }
  if (e.target.classList.contains('btn-finalizar')) cambiarEstado(id, 'finalizado')
}

function cambiarEstado(id, nuevoEstado) {
  const list = cargarTraslados()
  const t = list.find(x => x.id === id)
  if (!t) return
  t.estado = nuevoEstado
  t.historial = t.historial || []
  t.historial.push({ estado: nuevoEstado, fecha: new Date().toISOString() })
  guardarTraslados(list)
  renderLista()
}

function viewTraslado(id) {
  const list = cargarTraslados()
  const t = list.find(x => x.id === id)
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
  renderLista()

  document.getElementById('btnNuevoTraslado').addEventListener('click', abrirForm)
  document.getElementById('btnCerrarForm').addEventListener('click', (e) => { e.preventDefault(); cerrarForm() })

  // Inicializar mapa Leaflet
  try {
    map = L.map('map').setView([0, 0], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map)
    map.on('click', (ev) => {
      const lat = ev.latlng.lat
      const lng = ev.latlng.lng
      if (mapMode === 'origin') {
        if (originMarker) map.removeLayer(originMarker)
        originMarker = L.marker([lat, lng]).addTo(map).bindPopup('Origen').openPopup()
        document.getElementById('inputLatOrigin').value = lat
        document.getElementById('inputLngOrigin').value = lng
      } else {
        if (destMarker) map.removeLayer(destMarker)
        destMarker = L.marker([lat, lng]).addTo(map).bindPopup('Destino').openPopup()
        document.getElementById('inputLatDest').value = lat
        document.getElementById('inputLngDest').value = lng
      }
    })
  } catch (err) {
    console.warn('Leaflet no pudo inicializarse:', err)
  }

  document.getElementById('btnSetOrigin').addEventListener('click', () => { mapMode = 'origin' })
  document.getElementById('btnSetDest').addEventListener('click', () => { mapMode = 'dest' })

  document.getElementById('formTraslado').addEventListener('submit', (e) => {
    e.preventDefault()
    const paciente = document.getElementById('inputPaciente').value.trim()
    const origen = document.getElementById('inputOrigen').value.trim()
    const destino = document.getElementById('inputDestino').value.trim()
    const notas = document.getElementById('inputNotas').value.trim()
    const latO = document.getElementById('inputLatOrigin').value
    const lngO = document.getElementById('inputLngOrigin').value
    const latD = document.getElementById('inputLatDest').value
    const lngD = document.getElementById('inputLngDest').value
    if (!paciente || !origen || !destino) return alert('Complete los campos obligatorios')
    const list = cargarTraslados()
    if (currentEditId) {
      const t = list.find(x => x.id === currentEditId)
      if (!t) return
      t.paciente = paciente
      t.origen = origen
      t.destino = destino
      t.notas = notas
      if (latO && lngO) t.origenCoord = { lat: parseFloat(latO), lng: parseFloat(lngO) }
      if (latD && lngD) t.destinoCoord = { lat: parseFloat(latD), lng: parseFloat(lngD) }
      t.historial = t.historial || []
      t.historial.push({ estado: 'datos actualizados', fecha: new Date().toISOString() })
      guardarTraslados(list)
      cerrarForm()
      renderLista()
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
    list.push(nuevo)
    guardarTraslados(list)
    cerrarForm()
    document.getElementById('formTraslado').reset()
    renderLista()
  })

  document.getElementById('listaTraslados').addEventListener('click', añadirEventoLista)
  document.getElementById('btnCerrarDetalle').addEventListener('click', cerrarDetalle)
})
