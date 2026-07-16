// Gestión de documentos PDF con QR
const API_BASE_DOCUMENTOS = window.location.pathname.includes('/pages/') ? '../php/api' : 'php/api';

class GestorDocumentos {
  constructor() {
    this.claveAlmacenamiento = 'hospital_documentos';
    this.entradaPDF = document.getElementById('entradaPDF');
    this.areaSubida = document.getElementById('areaSubida');
    this.btnSubir = document.getElementById('btnSubir');
    this.btnEliminar = document.getElementById('btnEliminar');
    this.listaDocumentos = document.getElementById('listaDocumentos');
    this.vistaPrevia = document.getElementById('vistaPrevia');
    this.seccionQR = document.getElementById('seccionQR');
    this.contenedorQR = document.getElementById('contenedorQR');
    this.tituloQR = document.getElementById('tituloQR');
    this.tokenQR = document.getElementById('tokenQR');
    this.nombreDocumentoEditar = document.getElementById('nombreDocumentoEditar');
    this.btnGuardarNombre = document.getElementById('btnGuardarNombre');
    this.btnImprimirQR = document.getElementById('btnImprimirQR');
    this.archivoSeleccionado = null;
    this.documentoActualSeleccionado = null;
    this.modalPreview = document.getElementById('modalVistaPrevia');
    this.btnCerrarModal = document.getElementById('btnCerrarModal');
    this.modalPDFViewer = document.getElementById('visorPDFModal');
    this.modalQRContainer = document.getElementById('contenedorQRModal');
    this.modalQRTitulo = document.getElementById('tituloQRModal');
    this.modalQRToken = document.getElementById('tokenQRModal');
    this.btnImprimirModalQR = document.getElementById('btnImprimirModalQR');
    this.documentoModalActual = null;

    this.inicializar();
  }

  inicializar() {
    if (this.entradaPDF) {
      this.entradaPDF.addEventListener('change', (e) => this.manejarSeleccionArchivo(e));
    }

    if (this.areaSubida) {
      this.areaSubida.addEventListener('dragover', (e) => this.manejarDragOver(e));
      this.areaSubida.addEventListener('drop', (e) => this.manejarDrop(e));
      this.areaSubida.addEventListener('click', () => this.entradaPDF && this.entradaPDF.click());
    }

    if (this.btnSubir) this.btnSubir.addEventListener('click', (e) => { e.preventDefault(); this.subirArchivo(); });
    if (this.btnEliminar) this.btnEliminar.addEventListener('click', () => this.eliminarSeleccionados());
    if (this.btnGuardarNombre) this.btnGuardarNombre.addEventListener('click', () => this.guardarNombreDocumento());
    if (this.btnImprimirQR) this.btnImprimirQR.addEventListener('click', () => this.imprimirQR());
    if (this.btnCerrarModal) this.btnCerrarModal.addEventListener('click', () => this.cerrarModal());
    if (this.btnImprimirModalQR) this.btnImprimirModalQR.addEventListener('click', () => this.imprimirQRModal());

    if (this.modalPreview) {
      this.modalPreview.addEventListener('click', (e) => {
        if (e.target === this.modalPreview) {
          this.cerrarModal();
        }
      });
    }

    this.cargarLista();
  }

  manejarSeleccionArchivo(e) {
    const archivos = e.target.files;
    if (archivos.length > 0) {
      this.procesarArchivo(archivos[0]);
    }
  }

  manejarDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.areaSubida.classList.add('dragover');
  }

  manejarDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.areaSubida.classList.remove('dragover');

    const archivos = e.dataTransfer.files;
    if (archivos.length > 0) {
      const archivo = archivos[0];
      if (archivo.type === 'application/pdf') {
        this.procesarArchivo(archivo);
      } else {
        this.mostrarMensaje('Solo se aceptan archivos PDF', 'error');
      }
    }
  }

  procesarArchivo(archivo) {
    if (archivo.type !== 'application/pdf') {
      this.mostrarMensaje('Solo se aceptan archivos PDF', 'error');
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      this.mostrarMensaje('El archivo es demasiado grande (máximo 10MB)', 'error');
      return;
    }

    this.archivoSeleccionado = archivo;
    this.mostrarMensaje(`Archivo seleccionado: ${archivo.name}`, 'success');
    if (this.areaSubida) this.areaSubida.classList.add('archivo-seleccionado');
    const labelSpan = document.querySelector('.upload-label span');
    if (labelSpan) labelSpan.textContent = archivo.name;
  }

  obtenerDocumentosLocal() {
    const datos = localStorage.getItem(this.claveAlmacenamiento);
    return datos ? JSON.parse(datos) : [];
  }

  obtenerDocumentoLocalPorId(id) {
    const documentos = this.obtenerDocumentosLocal();
    return documentos.find(doc => parseInt(doc.id, 10) === parseInt(id, 10));
  }

  async obtenerDocumentoPorId(id) {
    const documentoLocal = this.obtenerDocumentoLocalPorId(id);
    if (documentoLocal) {
      return documentoLocal;
    }
    return await this.obtenerDocumentoServidorPorId(id);
  }

  async obtenerDocumentosServidor() {
    try {
      const res = await fetch(`${API_BASE_DOCUMENTOS}/documentos.php`, {
        credentials: 'include'
      });
      if (!res.ok) return this.obtenerDocumentosLocal();
      const json = await res.json();
      if (!json.success) return this.obtenerDocumentosLocal();
      localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(json.data));
      return json.data;
    } catch (error) {
      console.warn('No se pudo cargar documentos desde el servidor:', error);
      return this.obtenerDocumentosLocal();
    }
  }

  async obtenerDocumentoServidorPorId(id) {
    try {
      const res = await fetch(`${API_BASE_DOCUMENTOS}/documentos.php?id=${encodeURIComponent(id)}`, {
        credentials: 'include'
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.warn('No se pudo obtener el documento desde el servidor:', error);
      return null;
    }
  }

  async cargarLista() {
    const documentos = await this.obtenerDocumentosServidor();
    if (!this.listaDocumentos) return;

    if (!documentos || documentos.length === 0) {
      this.listaDocumentos.innerHTML = '<p class="sin-documentos">No hay documentos guardados</p>';
      return;
    }

    this.listaDocumentos.innerHTML = documentos.map(doc => `
      <div class="doc-item">
        <input type="checkbox" class="doc-checkbox" value="${doc.id}" />
        <div class="doc-info">
          <span class="doc-nombre">${this.escaparHTML(doc.nombre)}</span>
          <span class="doc-fecha">${this.escaparHTML(doc.fecha || doc.created_at || '')}</span>
          <span class="doc-token">${this.escaparHTML(doc.token)}</span>
        </div>
        <button class="btn-preview-modal" data-id="${doc.id}">Previsualizar</button>
        <button class="btn-vista-previa" data-id="${doc.id}">Ver</button>
      </div>
    `).join('');

    this.listaDocumentos.querySelectorAll('.btn-preview-modal').forEach(btn => {
      btn.addEventListener('click', async () => this.abrirModalPreview(parseInt(btn.dataset.id, 10)));
    });

    this.listaDocumentos.querySelectorAll('.btn-vista-previa').forEach(btn => {
      btn.addEventListener('click', async () => this.mostrarVistaPrevia(parseInt(btn.dataset.id, 10)));
    });
  }

  async mostrarVistaPrevia(id) {
    const documentoLocal = this.obtenerDocumentoLocalPorId(id);
    const documentoServidor = await this.obtenerDocumentoServidorPorId(id);
    const doc = documentoLocal || documentoServidor;
    if (!doc) return;

    this.documentoActualSeleccionado = id;
    const contenidoPdf = doc.data || (doc.contenido ? `data:application/pdf;base64,${doc.contenido}` : '');
    if (this.vistaPrevia) {
      this.vistaPrevia.innerHTML = `
        <div class="preview-contenedor">
          <h4>${this.escaparHTML(doc.nombre)}</h4>
          <p class="preview-fecha">Fecha: ${this.escaparHTML(doc.fecha || doc.created_at || '')}</p>
          <iframe src="${contenidoPdf}" type="application/pdf" class="pdf-viewer"></iframe>
        </div>
      `;
    }

    this.generarQR(doc);
  }

  generarQR(doc) {
    if (!this.contenedorQR) return;
    this.contenedorQR.innerHTML = '';
    const qrData = doc.qr_data || JSON.stringify({ token: doc.token, nombre: doc.nombre, fecha: doc.fecha || doc.created_at || '', id: doc.id });
    new QRCode(this.contenedorQR, {
      text: qrData,
      width: 256,
      height: 256,
      colorDark: '#184e77',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    if (this.tituloQR) this.tituloQR.textContent = doc.nombre;
    if (this.tokenQR) this.tokenQR.textContent = doc.token;
    if (this.nombreDocumentoEditar) this.nombreDocumentoEditar.value = doc.nombre;
    if (this.seccionQR) this.seccionQR.classList.remove('oculta');

    const documentos = this.obtenerDocumentosLocal();
    const docIndex = documentos.findIndex(d => parseInt(d.id, 10) === parseInt(doc.id, 10));
    if (docIndex !== -1) {
      documentos[docIndex].qr_data = qrData;
      localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(documentos));
    }
  }

  async guardarNombreDocumento() {
    if (!this.documentoActualSeleccionado) {
      this.mostrarMensaje('Por favor selecciona un documento', 'error');
      return;
    }

    const nuevoNombre = this.nombreDocumentoEditar ? this.nombreDocumentoEditar.value.trim() : '';
    if (!nuevoNombre) {
      this.mostrarMensaje('El nombre no puede estar vacío', 'error');
      return;
    }

    const documento = await this.obtenerDocumentoPorId(this.documentoActualSeleccionado);
    if (!documento) {
      this.mostrarMensaje('Documento no encontrado.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_DOCUMENTOS}/documentos.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: documento.id, nombre: nuevoNombre })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Error actualizando documento');
      }

      documento.nombre = nuevoNombre;
      const documentos = this.obtenerDocumentosLocal().map(doc => parseInt(doc.id, 10) === parseInt(documento.id, 10) ? documento : doc);
      localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(documentos));
      this.mostrarMensaje(`Nombre actualizado a: ${nuevoNombre}`, 'success');
      await this.cargarLista();
      this.generarQR(documento);
    } catch (error) {
      console.warn('Error actualizando nombre del documento:', error);
      this.mostrarMensaje('No se pudo actualizar el nombre del documento.', 'error');
    }
  }

  imprimirQR() {
    if (!this.documentoActualSeleccionado) {
      this.mostrarMensaje('Selecciona un documento antes de imprimir el QR.', 'error');
      return;
    }

    const qrSection = this.contenedorQR;
    if (!qrSection) return;

    const printWindow = window.open('', '', 'height=700,width=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir QR</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
            .print-container { background: white; padding: 24px; border-radius: 8px; text-align: center; }
            .print-container h1 { font-size: 1.5rem; color: #184e77; margin-bottom: 16px; }
            .print-container img { max-width: 100%; height: auto; }
            .print-container .token { margin-top: 12px; color: #333; font-size: 0.95rem; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>QR del Documento</h1>
            ${qrSection.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  async subirArchivo() {
    if (!this.archivoSeleccionado) {
      this.mostrarMensaje('Por favor selecciona un archivo PDF', 'error');
      return;
    }

    const formulario = new FormData();
    formulario.append('documento', this.archivoSeleccionado);

    try {
      const respuesta = await fetch(`${API_BASE_DOCUMENTOS}/upload_documento.php`, {
        method: 'POST',
        credentials: 'include',
        body: formulario
      });
      const json = await respuesta.json();
      if (!respuesta.ok || !json.success) {
        throw new Error(json.message || 'Error al subir el documento');
      }

      this.mostrarMensaje(`Archivo "${this.archivoSeleccionado.name}" subido correctamente`, 'success');
      this.limpiarForm();
      await this.cargarLista();
    } catch (error) {
      console.warn('Error subiendo archivo:', error);
      this.mostrarMensaje('No se pudo subir el documento al servidor.', 'error');
    }
  }

  async eliminarDocumentoServidor(id) {
    try {
      const res = await fetch(`${API_BASE_DOCUMENTOS}/documentos.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      return json.success;
    } catch (error) {
      console.warn('No se pudo eliminar el documento en el servidor:', error);
      return false;
    }
  }

  async eliminarSeleccionados() {
    const checkboxes = document.querySelectorAll('.doc-checkbox:checked');
    if (checkboxes.length === 0) {
      this.mostrarMensaje('Por favor selecciona al menos un documento para eliminar', 'error');
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar ${checkboxes.length} documento(s)?`)) {
      return;
    }

    const idsAEliminar = Array.from(checkboxes).map(cb => parseInt(cb.value, 10));
    let documentos = this.obtenerDocumentosLocal();
    documentos = documentos.filter(doc => !idsAEliminar.includes(parseInt(doc.id, 10)));

    for (const id of idsAEliminar) {
      await this.eliminarDocumentoServidor(id);
    }

    localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(documentos));
    this.mostrarMensaje(`${idsAEliminar.length} documento(s) eliminado(s)`, 'success');
    if (this.vistaPrevia) this.vistaPrevia.innerHTML = '<p class="sin-preview">Selecciona un documento para ver la vista previa</p>';
    if (this.seccionQR) this.seccionQR.classList.add('oculta');
    this.documentoActualSeleccionado = null;
    await this.cargarLista();
  }

  async abrirModalPreview(id) {
    const documentoServidor = await this.obtenerDocumentoServidorPorId(id);
    const documentoLocal = this.obtenerDocumentoLocalPorId(id);
    const doc = documentoServidor || documentoLocal;
    if (!doc) return;

    this.documentoModalActual = doc;
    const contenidoPdf = doc.data || (doc.contenido ? `data:application/pdf;base64,${doc.contenido}` : '');
    if (this.modalPDFViewer) this.modalPDFViewer.src = contenidoPdf;
    if (this.modalQRContainer) this.modalQRContainer.innerHTML = '';

    const qrData = doc.qr_data || JSON.stringify({ token: doc.token, nombre: doc.nombre, fecha: doc.fecha || doc.created_at || '', id: doc.id });
    new QRCode(this.modalQRContainer, {
      text: qrData,
      width: 200,
      height: 200,
      colorDark: '#184e77',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    if (this.modalQRTitulo) this.modalQRTitulo.textContent = doc.nombre;
    if (this.modalQRToken) this.modalQRToken.textContent = doc.token;
    if (this.modalPreview) this.modalPreview.classList.remove('oculta');
  }

  cerrarModal() {
    if (this.modalPreview) this.modalPreview.classList.add('oculta');
    if (this.modalPDFViewer) this.modalPDFViewer.src = '';
    if (this.modalQRContainer) this.modalQRContainer.innerHTML = '';
    this.documentoModalActual = null;
  }

  imprimirQRModal() {
    if (!this.documentoModalActual) {
      return;
    }

    const doc = this.documentoModalActual;
    const printWindow = window.open('', '', 'height=800,width=600');
    const qrImage = this.modalQRContainer.querySelector('img')?.src || '';
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código QR - ${this.escaparHTML(doc.nombre)}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .qr-print { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center; max-width: 600px; }
            h1 { color: #184e77; margin-bottom: 10px; font-size: 1.8rem; }
            .token-info { margin: 20px 0; color: #666; font-size: 0.9rem; }
            .qr-image { margin: 30px 0; }
            .qr-image img { max-width: 300px; height: auto; }
            .fecha-info { color: #999; font-size: 0.85rem; margin-top: 20px; }
            @media print { body { background: white; } }
          </style>
        </head>
        <body>
          <div class="qr-print">
            <h1>${this.escaparHTML(doc.nombre)}</h1>
            <div class="token-info"><strong>Token:</strong> ${doc.token}</div>
            <div class="qr-image"><img src="${qrImage}" alt="Código QR"></div>
            <div class="fecha-info">Generado: ${doc.fecha || doc.created_at || ''}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  limpiarForm() {
    if (this.entradaPDF) this.entradaPDF.value = '';
    this.archivoSeleccionado = null;
    if (this.areaSubida) this.areaSubida.classList.remove('archivo-seleccionado');
    const labelSpan = document.querySelector('.upload-label span');
    if (labelSpan) labelSpan.textContent = 'Haz clic o arrastra un PDF aquí';
    if (this.mensajeSubida) {
      this.mensajeSubida.textContent = '';
      this.mensajeSubida.className = 'upload-message';
    }
  }

  mostrarMensaje(texto, tipo) {
    if (!this.mensajeSubida) return;
    this.mensajeSubida.textContent = texto;
    this.mensajeSubida.className = `upload-message ${tipo}`;
    if (tipo === 'success') {
      setTimeout(() => {
        if (this.mensajeSubida) {
          this.mensajeSubida.textContent = '';
          this.mensajeSubida.className = 'upload-message';
        }
      }, 3000);
    }
  }

  escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new GestorDocumentos());
} else {
  new GestorDocumentos();
}
