# Mission — Sistema de Gestión del Ministerio Infantil

## 1. Propósito del Sistema

Sistema web para la administración integral del ministerio infantil. Cubre asistencia (niños y personal), planificación de eventos, reportes, comunicación con padres, control de cumpleañeros, medidas disciplinarias del personal, transiciones y graduaciones de niños.

---

## 2. Alcance y Límites

### 2.1 Población Atendida

| Regla | Descripción |
|---|---|
| Rango etario estándar | Niños de 3 a 12 años inclusive. |
| Excepción por hijo de maestro (menores) | Se permite el ingreso de niños **menores de 3 años** si son hijos de un maestro. |
| Excepción por hijo de maestro (mayores) | No se permite el ingreso de niños mayores de 12 años, incluso si son hijos de maestro. |
| Período de gracia | Un niño que ya está activo y cumple 13 años puede permanecer **temporalmente** por un período de gracia para facilitar su transición fuera del ministerio. |

### 2.2 Personal

- Todo el personal **debe** ser líder (haber cumplido todos los requisitos) para pertenecer al ministerio.
- No se utilizan rechazos automáticos. En su lugar, se asigna una **badge**:
  - "Cumple requisitos" (verde)
  - "No cumple requisitos" (roja/amarilla)
- El ingreso de nuevo personal se realiza exclusivamente mediante **solicitud** que un coordinador general (nivel 4) aprueba o rechaza.
- Todos los integrantes inician como **colaboradores** (nivel 1).
- Un staff (nivel 3) del turno puede ascender a un colaborador a un rango superior.
- Un colaborador puede tener su usuario inactivo hasta un año después de haber ingresado.

---

## 3. Jerarquía de Acceso

### 3.1 Niveles de Autorización

| Nivel | Título | Privilegios |
|---|---|---|
| 1 | Colaborador | Ver asistencia de su propio grupo. No puede ingresar niños ni personal. |
| 2 | Maestro | Ingresar niños. Ver asistencia de su propio grupo. |
| 3 | Staff | Ver solicitudes y asistencia (niños y personal) de **su propio turno**. Ver fichas, agregar notas y editar estado (extravió). |
| 4 | Coordinador General | Acceso total: todo el personal, todos los niños, asistencias, solicitudes y usuarios de **cualquier turno**. Crear/modificar roles y requisitos. Administrar fichas (crear nuevas). |

### 3.2 Visibilidad Cruzada

- Solo **coordinador general** puede ver personal, niños, asistencias y solicitudes de todos los turnos.
- **Staff** solo ve su propio turno.
- **Maestro** solo ve su propio grupo.
- **Colaborador** solo ve asistencia de su grupo.

---

## 4. Reglas de Asistencia del Personal

### 4.1 Registro

- La asistencia del personal **solo puede listar** staff y niveles inferiores. Nunca niveles superiores.
- El **coordinador general** puede marcar su propia asistencia en cualquier turno, así como la de cualquier otro miembro.
- Un maestro puede ser registrado en la asistencia de **otro turno** si estuvo apoyando (para mantener contabilidad correcta).
- Un staff o coordinador puede **cambiar temporalmente** a un maestro de turno por un día (por motivos graves como falta de maestros).

---

## 5. Fichas (Registro de Menores)

| Acción | Quién puede ejecutarla |
|---|---|
| Crear una ficha | Solo coordinador general. |
| Ver fichas | Staff y coordinador general. |
| Agregar notas y editar estado (ej. extravió) | Staff (durante su turno) y coordinador general. |

---

## 6. Roles y Requisitos

- Solo **coordinador general** puede:
  - Crear nuevos roles.
  - Modificar requisitos existentes.
  - Crear nuevos requisitos.

---

## 7. Eventos y Comunicación

El sistema debe soportar:

- **Planificación de eventos**.
- **Reportes de niños**.
- **Comunicación con padres** (llamada o mensaje de texto) cuando se requiera.
- **Control de cumpleañeros del mes** (niños y personal).
- **Medidas disciplinarias** para el personal: suspensiones o tiempos de espera.

---

## 8. Transiciones y Graduaciones

- Control de **transición** de un niño de un grupo a otro.
- Control de **graduación** de un niño que egresa del ministerio infantil.
