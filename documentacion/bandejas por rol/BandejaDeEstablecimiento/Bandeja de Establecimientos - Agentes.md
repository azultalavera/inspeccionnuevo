# Vista Agente

> **Como** usuario con perfil autorizado (Agente Auditor / Inspector / Protocolizador)
> **Quiero** consultar la información de cada establecimiento registrado en el sistema
> **Para** poder tener acceso rápido a todos los trámites del historial del establecimiento.

---

## 📝 DESCRIPCIÓN

El usuario con perfil autorizado (Agente Auditor / Inspector / Protocolizador) desea consultar la información de todos los establecimientos registrados en el sistema. Para ello, accede desde el Home principal del Agente haciendo clic en el icono posicionado en la barra lateral izquierda **“Consulta de establecimiento”**.

El usuario visualizará los establecimientos que hayan sido habilitados y en los cuales ha participado en alguno de sus trámites (es decir, su usuario forma parte del historial de asignación de algún trámite del establecimiento). 
El sistema recuperará todos aquellos establecimientos que posean su primer trámite en estado *Finalizado* y en los que el agente forme parte del historial.

---

## ✅ CRITERIOS DE ACEPTACIÓN

#### 1. Permisos y Accesibilidad

- **1.1 Accesos Directos:** Esta funcionalidad debe ser accedida desde el menú opción “Consulta de establecimientos”.
- **1.2 Filtro por Participación:** El sistema solo listará los establecimientos con su primer trámite *Finalizado* y en los cuales el usuario haya participado en el historial de asignación de algún trámite.

#### 2. Filtros de Búsqueda

- **2.1 Buscador y Filtros:** Se incluye un buscador por coincidencias y una sección de filtros comprimida que, al expandirse, muestra campos específicos. A continuación, se detallan sus reglas (en comparación con otras vistas):

| Filtro | Tipo de Campo | Reglas de Negocio |
| :--- | :--- | :--- |
| **Nombre del establecimiento** | Texto | Búsqueda por coincidencia. |
| **N° Expediente** | Texto/Número | Búsqueda exacta/coincidencia. |
| **CUIT** | Número | Búsqueda exacta. |
| **Tipología** | Menú Desplegable (Combo) | Contendrá todas las tipologías cargadas en la base de datos. |
| **Estado** | Menú Desplegable (Combo) | Contendrá todos los estados del establecimiento cargados en base. |
| **Departamento** | Menú Desplegable (Combo) | Determina el contenido del filtro Localidad. |
| **Localidad** | Menú Desplegable (Combo) | Deshabilitado por defecto. Se habilita y se cargan sus opciones solo al seleccionar un Departamento. |
| **Fecha de Creación** | Fechas (Desde / Hasta) | - *Fecha Desde*: No puede ser superior a la fecha actual del sistema.<br>- *Fecha Hasta*: Al seleccionar *Desde*, se autocompleta con la fecha actual. Se puede modificar pero nunca ser menor a *Fecha Desde*. |

- **2.2 Reglas Generales de Búsqueda:**
  - Si no se ingresa al menos un filtro, al presionar [Buscar] el sistema mostrará todos los establecimientos accesibles para el agente.
  - Si la búsqueda no arroja resultados, se mostrará el mensaje: _“No hay resultados para los filtros ingresados”_.
  - Botón **[Buscar]**: Ejecuta la búsqueda en la base de datos y muestra las tarjetas/filas encontradas.

#### 3. Bandeja Principal (Grilla / Tarjetas de Establecimientos)

- **3.1 Visualización de Datos:** La información debe ordenarse **alfabéticamente**. Los datos mostrados en la grilla/tarjeta son:

| N° Expediente | Nombre del establecimiento | CUIT | Fecha creación | Departamento | Localidad | Tipología | Estado | Acciones |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| N° | Nombre completo | N° CUIT | DD/MM/AAAA | Ubicación | Ubicación | Tipo (Clínica, etc.) | Estado actual | Ver Historial <br> Docs. Solicitados |

#### 4. Acciones y Popup de Detalle

- **4.1 Ver Historial:** Muestra todos los trámites registrados correspondientes al establecimiento cuyo estado sea a partir de "Aceptado documentación auditoría" hasta la fecha actual. 
  - Se visualizan en una grilla con las columnas: `Asunto` -- `N° Trámite` -- `Tipo trámite` -- `Estado` -- `Fecha creación` -- `Acciones`.
  - El agente podrá visualizar cualquiera de esos trámites, lo tenga asignado o no.
  - Si el agente accede a visualizar un trámite **que no tiene asignado**, el sistema mostrará los datos en **MODO CONSULTA** (solo lectura y descarga de documentos).

- **4.2 Documentos Solicitados:** Permite visualizar en forma de grilla todas las resoluciones y certificados de trámite en curso generados.
  - Se visualizan en una grilla con las columnas: `Nombre archivo` -- `Fecha Emisión` -- `Fecha fin vigencia` -- `Acciones`.

- **4.3 Emisión de Certificado:** Si alguno de los trámites del historial posee una solicitud de certificado de trámite en curso, el Agente Auditor / Inspector / Protocolizador podrá generarlo.

---

## 🕛 HISTORIAL DE CAMBIOS

| VERSIÓN | FECHA      | BREVE DESCRIPCIÓN        | NOMBRE DEL AUTOR |
| :-----: | :--------- | :----------------------- | :--------------- |
|   0.1   | 08/06/2026 | Versión inicial de la HU | Autor            |
