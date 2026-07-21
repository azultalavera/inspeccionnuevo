# Historia de Usuario: Iniciar Trámite (Efector)

**ID:** HU-01
**Título:** Iniciar un nuevo trámite sanitario desde la bandeja principal.

## Descripción
**Como** Efector (Representante del Establecimiento de Salud)
**Quiero** poder iniciar un nuevo trámite (Habilitación, Renovación, Modificación, Adecuación) desde mi bandeja de trámites
**Para** registrar mi establecimiento o actualizar su estado y cumplir con la normativa sanitaria vigente.

## Criterios de Aceptación

1. **Visibilidad del botón:**
   - **Dado** que el Efector se encuentra en la pantalla "Bandeja de Trámites",
   - **Entonces** debe visualizar un botón primario llamado "Iniciar Trámite" ubicado en la parte superior derecha de la pantalla.

2. **Apertura de Modal de Selección:**
   - **Dado** que el Efector hace clic en el botón "Iniciar Trámite",
   - **Entonces** se debe abrir una ventana modal que le permita seleccionar:
     - El **Tipo de Trámite** (Alta Digital, Habilitación, Renovación, Modificación, Adecuación).
     - La **Tipología** del establecimiento (Consultorio, Centro Médico, etc.).

3. **Validación de campos incompletos:**
   - **Dado** que el Efector se encuentra en el modal de Iniciar Trámite,
   - **Cuando** intenta confirmar sin haber seleccionado el Tipo de Trámite o la Tipología,
   - **Entonces** el sistema debe mostrar una alerta (mensaje de error o advertencia) indicando que todos los campos son obligatorios para poder continuar.

4. **Confirmación y Alerta de Éxito:**
   - **Dado** que el Efector completó la selección en el modal y confirmó la acción,
   - **Entonces** el sistema debe registrar el inicio del trámite.
   - **Y** el sistema debe mostrar una alerta de éxito indicando que el trámite ha sido iniciado correctamente.
   - **Y** posteriormente debe redirigir automáticamente al usuario al flujo de carga detallada de datos.

5. **Cancelación:**
   - **Dado** que el Efector abrió el modal de Iniciar Trámite,
   - **Cuando** hace clic en "Cancelar" o en la "X" para cerrar,
   - **Entonces** el modal debe cerrarse sin crear ningún trámite y permanecer en la Bandeja de Trámites actual.
