// Manejo de traslados usando localStorage
const LS_KEY = 'traslados'

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
  document.getElementById('seccionForm').classList.remove('oculta')
}

function cerrarForm() {
  document.getElementById('seccionForm').classList.add('oculta')
}

function añadirEventoLista(e) {
  const id = e.target.dataset.id
  if (!id) return
  if (e.target.classList.contains('btn-ver')) viewTraslado(id)
  if (e.target.classList.contains('btn-iniciar')) cambiarEstado(id, 'en curso')
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

  document.getElementById('formTraslado').addEventListener('submit', (e) => {
    e.preventDefault()
    const paciente = document.getElementById('inputPaciente').value.trim()
    const origen = document.getElementById('inputOrigen').value.trim()
    const destino = document.getElementById('inputDestino').value.trim()
    const notas = document.getElementById('inputNotas').value.trim()
    if (!paciente || !origen || !destino) return alert('Complete los campos obligatorios')
    const list = cargarTraslados()
    const nuevo = {
      id: crearId(),
      paciente, origen, destino, notas,
      estado: 'pendiente',
      creado: new Date().toISOString(),
      historial: [{ estado: 'pendiente', fecha: new Date().toISOString() }]
    }
    list.push(nuevo)
    guardarTraslados(list)
    cerrarForm()
    document.getElementById('formTraslado').reset()
    renderLista()
  })

  document.getElementById('listaTraslados').addEventListener('click', añadirEventoLista)
  document.getElementById('btnCerrarDetalle').addEventListener('click', cerrarDetalle)
})
