// Gestión de documentos PDF con QR
class GestorDocumentos {
  constructor() {
    this.claveAlmacenamiento = 'hospital_documentos';
    this.entradaPDF = document.getElementById('inputPDF');
    this.areaSubida = document.getElementById('uploadArea');
    this.btnSubir = document.getElementById('btnSubir');
    this.btnEliminar = document.getElementById('btnEliminar');
    this.btnDocumentos = document.getElementById('btnDocumentos');
    this.btnVolverDocumentos = document.getElementById('btnVolverDocumentos');
    this.listaDocumentos = document.getElementById('listaDocumentos');
    this.vistaPrevia = document.getElementById('vistaPrevia');
    this.seccionDocumentos = document.getElementById('seccionDocumentos');
    this.mensajeSubida = document.getElementById('uploadMessage');
    this.seccionQR = document.getElementById('seccionQR');
    this.qrContainer = document.getElementById('qrContainer');
    this.qrTitulo = document.getElementById('qrTitulo');
    this.qrToken = document.getElementById('qrToken');
    this.nombreDocumentoEdit = document.getElementById('nombreDocumentoEdit');
    this.btnGuardarNombre = document.getElementById('btnGuardarNombre');
    this.btnImprimirQR = document.getElementById('btnImprimirQR');
    this.archivoSeleccionado = null;
    this.documentoActualSeleccionado = null;
    this.modalPreview = document.getElementById('modalPreview');
    this.btnCerrarModal = document.getElementById('btnCerrarModal');
    this.modalPDFViewer = document.getElementById('modalPDFViewer');
    this.modalQRContainer = document.getElementById('modalQRContainer');
    this.modalQRTitulo = document.getElementById('modalQRTitulo');
    this.modalQRToken = document.getElementById('modalQRToken');
    this.btnImprimirModalQR = document.getElementById('btnImprimirModalQR');
    this.documentoModalActual = null;

    this.inicializar();
  }

  inicializar() {
    // Eventos de carga de archivos
    this.entradaPDF.addEventListener('change', (e) => this.manejarSeleccionArchivo(e));
    this.areaSubida.addEventListener('dragover', (e) => this.manejarDragOver(e));
    this.areaSubida.addEventListener('drop', (e) => this.manejarDrop(e));
    this.areaSubida.addEventListener('click', () => this.entradaPDF.click());

    // Eventos de botones
    this.btnSubir.addEventListener('click', () => this.subirArchivo());
    this.btnEliminar.addEventListener('click', () => this.eliminarSeleccionados());
    this.btnDocumentos.addEventListener('click', () => this.mostrarSeccionDocumentos());
    this.btnVolverDocumentos.addEventListener('click', () => this.ocultarSeccionDocumentos());
    this.btnGuardarNombre.addEventListener('click', () => this.guardarNombreDocumento());
    this.btnImprimirQR.addEventListener('click', () => this.imprimirQR());
    this.btnCerrarModal.addEventListener('click', () => this.cerrarModal());
    this.btnImprimirModalQR.addEventListener('click', () => this.imprimirQRModal());
    
    // Cerrar modal al hacer clic fuera
    this.modalPreview.addEventListener('click', (e) => {
      if (e.target === this.modalPreview) {
        this.cerrarModal();
      }
    });

    // Cargar documentos al inicializar
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

    if (archivo.size > 10 * 1024 * 1024) { // 10MB
      this.mostrarMensaje('El archivo es demasiado grande (máximo 10MB)', 'error');
      return;
    }

    this.archivoSeleccionado = archivo;
    this.mostrarMensaje(`Archivo seleccionado: ${archivo.name}`, 'success');
    this.areaSubida.classList.add('archivo-seleccionado');
    document.querySelector('.upload-label span').textContent = archivo.name;
  }

  generarToken() {
    // Generar un token único basado en timestamp y random
    return `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  subirArchivo() {
    if (!this.archivoSeleccionado) {
      this.mostrarMensaje('Por favor selecciona un archivo PDF', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const documentos = this.obtenerDocumentos();
      const token = this.generarToken();

      const nuevoDoc = {
        id: Date.now(),
        nombre: this.archivoSeleccionado.name,
        fecha: new Date().toLocaleString('es-ES'),
        data: e.target.result,
        token: token,
        qrData: null // Se generará cuando se visualice
      };

      documentos.push(nuevoDoc);
      localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(documentos));

      this.mostrarMensaje(`Archivo "${nuevoDoc.nombre}" subido correctamente`, 'success');
      this.limpiarForm();
      this.cargarLista();
    };

    reader.readAsDataURL(this.archivoSeleccionado);
  }

  cargarLista() {
    const documentos = this.obtenerDocumentos();

    if (documentos.length === 0) {
      this.listaDocumentos.innerHTML = '<p class="sin-documentos">No hay documentos guardados</p>';
      return;
    }

    this.listaDocumentos.innerHTML = documentos.map(doc => `
      <div class="doc-item">
        <input type="checkbox" class="doc-checkbox" value="${doc.id}" />
        <div class="doc-info">
          <span class="doc-nombre">${this.escaparHTML(doc.nombre)}</span>
          <span class="doc-fecha">${doc.fecha}</span>
          <span class="doc-token">${doc.token}</span>
        </div>
        <button class="btn-preview-modal" data-id="${doc.id}">Previsualizar</button>
        <button class="btn-vista-previa" data-id="${doc.id}">Ver</button>
      </div>
    `).join('');

    this.listaDocumentos.querySelectorAll('.btn-preview-modal').forEach(btn => {
      btn.addEventListener('click', () => this.abrirModalPreview(parseInt(btn.dataset.id)));
    });

    this.listaDocumentos.querySelectorAll('.btn-vista-previa').forEach(btn => {
      btn.addEventListener('click', () => this.mostrarVistaPrevia(parseInt(btn.dataset.id)));
    });
  }

  mostrarVistaPrevia(id) {
    const documentos = this.obtenerDocumentos();
    const doc = documentos.find(d => d.id === id);

    if (doc) {
      this.documentoActualSeleccionado = id;

      // Mostrar PDF
      this.vistaPrevia.innerHTML = `
        <div class="preview-contenedor">
          <h4>${this.escaparHTML(doc.nombre)}</h4>
          <p class="preview-fecha">Fecha: ${doc.fecha}</p>
          <iframe src="${doc.data}" type="application/pdf" class="pdf-viewer"></iframe>
        </div>
      `;

        // Generar y mostrar QR
        this.generarQR(doc);
    }
  }

  generarQR(doc) {
    // Limpiar QR anterior
    this.qrContainer.innerHTML = '';

    // Preparar datos para el QR
    const qrData = JSON.stringify({
      token: doc.token,
      nombre: doc.nombre,
      fecha: doc.fecha,
      id: doc.id
    });

    // Generar QR
    new QRCode(this.qrContainer, {
      text: qrData,
      width: 256,
      height: 256,
      colorDark: '#184e77',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    // Actualizar información del QR
    this.qrTitulo.textContent = doc.nombre;
    this.qrToken.textContent = doc.token;
    this.nombreDocumentoEdit.value = doc.nombre;

    // Mostrar sección de QR
    this.seccionQR.classList.remove('oculta');

    // Guardar QR data en el documento
    doc.qrData = qrData;
    const documentos = this.obtenerDocumentos();
    const docIndex = documentos.findIndex(d => d.id === doc.id);
    if (docIndex !== -1) {
      documentos[docIndex].qrData = qrData;
      localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(documentos));
    }
  }

  guardarNombreDocumento() {
    if (!this.documentoActualSeleccionado) {
      this.mostrarMensaje('Por favor selecciona un documento', 'error');
      return;
    }

    const nuevoNombre = this.nombreDocumentoEdit.value.trim();

    if (!nuevoNombre) {
      this.mostrarMensaje('El nombre no puede estar vacío', 'error');
      return;
    }

    const documentos = this.obtenerDocumentos();
    const doc = documentos.find(d => d.id === this.documentoActualSeleccionado);

    if (doc) {
      doc.nombre = nuevoNombre;
      localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(documentos));

      this.mostrarMensaje(`Nombre actualizado a: ${nuevoNombre}`, 'success');

      // Regenerar QR con el nuevo nombre
      this.generarQR(doc);
      this.cargarLista();
    }
  }

  imprimirQR() {
    if (!this.documentoActualSeleccionado) {
      this.mostrarMensaje('Por favor selecciona un documento', 'error');
      return;
    }

    const documentos = this.obtenerDocumentos();
    const doc = documentos.find(d => d.id === this.documentoActualSeleccionado);

    if (doc) {
      // Crear elemento para imprimir
      const printWindow = window.open('', '', 'height=800,width=600');

      // Obtener la imagen del QR
      const qrImage = this.qrContainer.querySelector('img').src;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Código QR - ${this.escaparHTML(doc.nombre)}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .qr-print {
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 600px;
              }
              h1 {
                color: #184e77;
                margin-bottom: 10px;
                font-size: 1.8rem;
              }
              .token-info {
                margin: 20px 0;
                color: #666;
                font-size: 0.9rem;
              }
              .qr-image {
                margin: 30px 0;
              }
              .qr-image img {
                max-width: 300px;
                height: auto;
              }
              .fecha-info {
                color: #999;
                font-size: 0.85rem;
                margin-top: 20px;
              }
              @media print {
                body {
                  background: white;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-print">
              <h1>${this.escaparHTML(doc.nombre)}</h1>
              <div class="token-info">
                <strong>Token:</strong> ${doc.token}
              </div>
              <div class="qr-image">
                <img src="${qrImage}" alt="Código QR">
              </div>
              <div class="fecha-info">
                Generado: ${doc.fecha}
              </div>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.print();
    }
  }

  eliminarSeleccionados() {
    const checkboxes = document.querySelectorAll('.doc-checkbox:checked');

    if (checkboxes.length === 0) {
      this.mostrarMensaje('Por favor selecciona al menos un documento para eliminar', 'error');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar ${checkboxes.length} documento(s)?`)) {
      const idsAEliminar = Array.from(checkboxes).map(cb => parseInt(cb.value));
      let documentos = this.obtenerDocumentos();
      documentos = documentos.filter(doc => !idsAEliminar.includes(doc.id));

      localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(documentos));
      this.mostrarMensaje(`${idsAEliminar.length} documento(s) eliminado(s)`, 'success');
      this.vistaPrevia.innerHTML = '<p class="sin-preview">Selecciona un documento para ver la vista previa</p>';
      this.seccionQR.classList.add('oculta');
      this.documentoActualSeleccionado = null;
      this.cargarLista();
    }
  }

  abrirModalPreview(id) {
    const documentos = this.obtenerDocumentos();
    const doc = documentos.find(d => d.id === id);

    if (doc) {
      this.documentoModalActual = doc;

      // Cargar PDF
      this.modalPDFViewer.src = doc.data;

      // Generar QR en el modal
      this.modalQRContainer.innerHTML = '';
      const qrData = JSON.stringify({
        token: doc.token,
        nombre: doc.nombre,
        fecha: doc.fecha,
        id: doc.id
      });

      new QRCode(this.modalQRContainer, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: '#184e77',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });

      this.modalQRTitulo.textContent = doc.nombre;
      this.modalQRToken.textContent = doc.token;

      // Mostrar modal
      this.modalPreview.classList.remove('oculta');
    }
  }

  cerrarModal() {
    this.modalPreview.classList.add('oculta');
    this.modalPDFViewer.src = '';
    this.modalQRContainer.innerHTML = '';
    this.documentoModalActual = null;
  }

  imprimirQRModal() {
    if (!this.documentoModalActual) {
      return;
    }

    const doc = this.documentoModalActual;
    const printWindow = window.open('', '', 'height=800,width=600');

    // Obtener la imagen del QR
    const qrImage = this.modalQRContainer.querySelector('img').src;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código QR - ${this.escaparHTML(doc.nombre)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .qr-print {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 600px;
            }
            h1 {
              color: #184e77;
              margin-bottom: 10px;
              font-size: 1.8rem;
            }
            .token-info {
              margin: 20px 0;
              color: #666;
              font-size: 0.9rem;
            }
            .qr-image {
              margin: 30px 0;
            }
            .qr-image img {
              max-width: 300px;
              height: auto;
            }
            .fecha-info {
              color: #999;
              font-size: 0.85rem;
              margin-top: 20px;
            }
            @media print {
              body {
                background: white;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-print">
            <h1>${this.escaparHTML(doc.nombre)}</h1>
            <div class="token-info">
              <strong>Token:</strong> ${doc.token}
            </div>
            <div class="qr-image">
              <img src="${qrImage}" alt="Código QR">
            </div>
            <div class="fecha-info">
              Generado: ${doc.fecha}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }

  mostrarSeccionDocumentos() {
    this.seccionDocumentos.classList.remove('oculta');
    document.querySelector('.panel-botones').style.display = 'none';
    document.querySelector('.panel-header').style.display = 'none';
  }

  ocultarSeccionDocumentos() {
    this.seccionDocumentos.classList.add('oculta');
    document.querySelector('.panel-botones').style.display = 'flex';
    document.querySelector('.panel-header').style.display = 'block';
  }

  limpiarForm() {
    this.entradaPDF.value = '';
    this.archivoSeleccionado = null;
    this.areaSubida.classList.remove('archivo-seleccionado');
    document.querySelector('.upload-label span').textContent = 'Haz clic o arrastra un PDF aquí';
    this.mensajeSubida.textContent = '';
    this.mensajeSubida.className = 'upload-message';
  }

  obtenerDocumentos() {
    const datos = localStorage.getItem(this.claveAlmacenamiento);
    return datos ? JSON.parse(datos) : [];
  }

  mostrarMensaje(texto, tipo) {
    this.mensajeSubida.textContent = texto;
    this.mensajeSubida.className = `upload-message ${tipo}`;

    if (tipo === 'success') {
      setTimeout(() => {
        this.mensajeSubida.textContent = '';
        this.mensajeSubida.className = 'upload-message';
      }, 3000);
    }
  }

  escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GestorDocumentos();
    inicializarCerrarSesion();
  });
} else {
  new GestorDocumentos();
  inicializarCerrarSesion();
}

// Inicializar comportamiento del botón de cerrar sesión
function inicializarCerrarSesion() {
  const btnLogout = document.getElementById('btnLogout');
  if (!btnLogout) return;

  btnLogout.addEventListener('click', () => {
    const seccion = document.getElementById('seccionDocumentos');
    // Si la sección de documentos está visible, volver a la vista principal (Documentos/Traslados)
    if (seccion && !seccion.classList.contains('oculta')) {
      seccion.classList.add('oculta')
      document.querySelector('.panel-botones').style.display = 'flex'
      document.querySelector('.panel-header').style.display = 'block'
      return
    }

    // Si no, proceder con logout normal
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      window.location.href = '../index.html';
    }
  })
}
