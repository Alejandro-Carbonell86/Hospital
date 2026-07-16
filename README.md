Para el proyecto del Hospital de Clínicas, basándome en los estándares técnicos de las fuentes y los objetivos funcionales de la letra, aquí tienes la división de requisitos.
Es importante notar que, aunque menciones que la Programación Orientada a Objetos (POO) podría no parecer necesaria, las fuentes la establecen como un requisito obligatorio para cumplir con la arquitectura de tres capas exigida en un proyecto de egreso de este nivel
.
Requisitos del Proyecto (Escala 1 al 10)
Mínimos (Calificación 5-6: "Avance Moderado")
Se considera que el producto "hace lo mínimo aceptable" y demuestra trabajo, aunque necesite mejoras
.
Funcionalidad: Gestión básica de documentos (carga por administrativo y visualización por QR) y registro de traslados de ambulancias con los campos obligatorios (chofer, destino, horas)
.
Base de Datos: Estructura de al menos 15 tablas normalizadas hasta la tercera forma normal (3FN)
.
Frontend: Diseño responsivo funcional para dispositivos móviles (320px-576px) utilizando Bootstrap 5.3
.
Backend: Uso de PHP con conexión funcional a MySQL y sentencias preparadas para evitar inyecciones SQL
.
Arquitectura: Implementación inicial de la estructura de tres capas (Presentación, Negocio y Datos)
.
Máximos (Calificación 9-10: "Avance Destacado")
Producto completo, de calidad estética, funcional y debidamente documentado
.
Funcionalidad Avanzada: Módulo completo de encuestas de satisfacción con almacenamiento para análisis de datos y gestión de rutas nacionales para las ambulancias
.
Técnica POO Completa: Aplicación rigurosa de encapsulamiento, herencia y polimorfismo en la lógica de negocio
.
Interfaz y UX: Diseño "Mobile-First" con compatibilidad total en móviles, tabletas y escritorio (2993px)
.
Comunicación Asíncrona: Uso avanzado de JavaScript (Fetch/Async-Await) para carga dinámica de datos sin recargar la página
.
Seguridad y Mantenimiento: Sistema de roles de usuario diferenciados, índices optimizados y una estrategia documentada de backups
.
Documentación: Manual de usuario, diagramas UML de clases y repositorio en GitHub con historial de commits profesional
.
Lista de Cotejo / Rúbrica de Evaluación
Esta lista se alinea con los descriptores generales de los niveles de avance de las fuentes
.
Criterio
Logro para Nivel 10 (Destacado)
Logro para Nivel 5 (Moderado)
Arquitectura
Tres capas estrictas con POO avanzada
.
Tres capas básicas; lógica separada
.
Interfaz
100% responsiva y estética profesional
.
Funciona en móvil; estética básica
.
Persistencia
DB optimizada, roles y políticas de backup
.
15 tablas mínimas, normalizadas (3FN)
.
Seguridad
Validación dual y prevención SQL completa
.
Conexión funcional y sentencias preparadas
.
Funcionalidad
Incluye encuestas, análisis y rutas
.
Cumple con carga de documentos y traslados
.
Documentación
Manuales, UML y GitHub organizado
.
Documentación técnica básica entregada
.
Nota sobre la calificación final: Recuerda que la nota del proyecto (NdP) se promediará con tu nota del año (CFP) para determinar la calificación final de cada materia del tronco tecnológico
. El fallo se considera "En Suspenso" hasta que defiendas el proyecto
.
¿Cómo se integra la gestión de ambulancias en los requisitos?

La gestión de ambulancias se integra como el segundo servicio principal del proyecto, denominado "Módulo de trazabilidad de ambulancias"
. Su objetivo es el seguimiento completo del ciclo operativo del transporte especializado que parte desde el Hospital de Clínicas
.
De acuerdo con las fuentes, la integración se divide en los siguientes aspectos:
1. Datos obligatorios de registro
Para cada solicitud de traslado, el sistema debe registrar al menos
:
Personal a bordo: Conductor responsable y copiloto o acompañante.
Sujeto u objeto del traslado: Paciente (puede ser un "paciente biológico" no humano) o elementos como equipamiento médico e insumos especializados
.
Logística temporal y espacial: Punto de origen, destino, hora de salida y hora (estimada o efectiva) de llegada.
2. Alcance funcional y operativo
Gestión de Rutas: El sistema debe administrar rutas dentro de todo el circuito nacional
.
Seguimiento Administrativo: Un funcionario administrativo es el encargado de supervisar el estado del traslado desde la salida hasta el arribo al destino y el posterior retorno al hospital
.
Visualización en tiempo real: El sistema debe permitir ver el estado de cada traslado durante todo su ciclo de operación
.
3. Integración con los Requisitos Técnicos
Para cumplir con los estándares de programación Full Stack exigidos, este módulo debe implementarse considerando:
Arquitectura de tres capas: La lógica de los traslados y el seguimiento debe estar en la capa de negocio, separada de la interfaz y de la base de datos
.
Persistencia (Base de Datos): La información de choferes, vehículos y rutas debe formar parte de las 15 tablas mínimas normalizadas (3FN) requeridas para el proyecto
.
Interfaz Dinámica: Se espera el uso de JavaScript (Fetch/Async-Await) para que el administrativo pueda visualizar cambios en el estado de las ambulancias sin necesidad de recargar la página
.
Seguridad: El acceso al registro y seguimiento debe estar restringido mediante un sistema de roles de usuario, asegurando que solo el personal autorizado (como el administrativo del DTI) gestione la trazabilidad
.
Como se mencionó en nuestra conversación, en una escala de evaluación, un avance moderado (5) cumpliría con el registro básico de datos, mientras que un avance destacado (10) incluiría una gestión de rutas nacional optimizada y una interfaz profesional totalmente responsiva para el seguimiento
.
