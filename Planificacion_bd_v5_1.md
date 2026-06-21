# Planificación Arquitectónica — Base de Datos v5.1
**Sistema de Gestión Infantil — Hosanna Infantil**
**Fecha:** 2026-05-30 | **Versión:** 5.1

> **Cambios respecto a v5.0-FINAL:** Corrección de 5 bugs críticos + 10 mejoras de modelado y escalabilidad identificadas en revisión técnica. Ver §8 — Resumen de Cambios v5.0 → v5.1.
>
> **Ajustes post-revisión (aplicados sobre v5.1):** Bug #5 — protocolo de transición de grupo en `Ninos_Grupos` corregido para cerrar la asignación anterior antes de insertar la nueva, evitando niños activos en dos grupos simultáneamente. Adicionalmente, el SQL del índice de `mv_ninos_transicion_grupo_mes` (§10.5) corregido para usar `ID_Persona` consistente con la decisión D21.

---

## Tabla de Contenidos

1. [Inventario de Campos del Formulario](#1-inventario-de-campos-del-formulario)
2. [Mapeo: Campos Existentes vs. Nuevos](#2-mapeo-campos-existentes-vs-nuevos)
3. [Análisis Arquitectónico Crítico](#3-análisis-arquitectónico-crítico)
   - 3.1 [Caso Cónyuge](#31-caso-cónyuge)
   - 3.2 [Caso Líderes — Dominio externo a Personal_Sistema](#32-caso-líderes)
   - 3.3 [Dominios Separados: Rol Operativo vs. Estado Formativo](#33-dominios-separados)
   - 3.4 [Fechas Flexibles](#34-fechas-flexibles)
   - 3.5 [Campos Nuevos y su Ubicación Canónica](#35-campos-nuevos-y-su-ubicación-canónica)
4. [Decisiones de Diseño Seleccionadas](#4-decisiones-de-diseño-seleccionadas)
5. [Estructura Detallada de Cambios por Bloque](#5-estructura-detallada-de-cambios-por-bloque)
   - 5.1 [Bloque General — `Personas`](#51-bloque-general--personas)
   - 5.2 [Bloque Familiar](#52-bloque-familiar)
   - 5.3 [Bloque Eclesiástico](#53-bloque-eclesiástico)
   - 5.4 [Expedientes de Conducta y Evaluación](#54-expedientes-de-conducta-y-evaluación)
   - 5.5 [Protocolos Operativos del Personal](#55-protocolos-operativos-del-personal)
   - 5.6 [Snapshot en `Solicitudes_Personal`](#56-snapshot-en-solicitudes_personal)
6. [Scripts SQL Completos](#6-scripts-sql-completos)
   - 6.1 [ENUMs — Nuevos y Modificados](#61-enums--nuevos-y-modificados)
   - 6.2 [Nuevas Tablas](#62-nuevas-tablas)
   - 6.3 [ALTER TABLE — Tablas Existentes](#63-alter-table--tablas-existentes)
   - 6.4 [Vistas Operativas y Predictivas](#64-vistas-operativas-y-predictivas)
7. [Integridad Referencial y Cascadas](#7-integridad-referencial-y-cascadas)
8. [Resumen de Cambios v5.0 → v5.1](#8-resumen-de-cambios-v50--v51)
9. [Arranque en Frío — Data Seeding](#9-arranque-en-frío--data-seeding)
10. [Manual de Protocolos Operativos](#10-manual-de-protocolos-operativos)

---

## 1. Inventario de Campos del Formulario

El formulario físico *"Hoja de Aplicación Hosanna Infantil"* está organizado en cuatro secciones.

### Sección A — Datos Personales
| # | Campo en formulario | Tipo de dato inferido |
|---|---|---|
| 1 | Fecha (de la solicitud) | DATE |
| 2 | Nombres y Apellidos | VARCHAR — **ya existe** en `Personas` |
| 3 | Sexo (Masculino / Femenino) | ENUM |
| 4 | Cédula Nº | VARCHAR(20) |
| 5 | Fecha de nacimiento | DATE — **ya existe** en `Personas` |
| 6 | Edad (calculada) | Calculado — no almacenar |
| 7 | Ciudad o Departamento | VARCHAR |
| 8 | Municipio | VARCHAR |
| 9 | Distrito | VARCHAR |
| 10 | Barrio | VARCHAR |
| 11 | Dirección exacta | TEXT — **ya existe** como `Direccion` en `Personal_Info_Personal` |
| 12 | Ocupación | VARCHAR |
| 13 | Centro Laboral | VARCHAR |
| 14 | Telf. Casa | VARCHAR |
| 15 | Telf. Oficina | VARCHAR |
| 16 | Claro (número celular) | VARCHAR |
| 17 | Movistar (número celular) | VARCHAR |
| 18 | Correo Electrónico | VARCHAR |
| 19 | Nivel académico (checkboxes) | ENUM |
| 20 | Estado civil (checkboxes) | ENUM — **ya existe** pero incompleto |

### Sección B — Datos del Cónyuge
| # | Campo en formulario | Tipo de dato inferido |
|---|---|---|
| 21 | Nombres y Apellidos del cónyuge | VARCHAR — actualmente solo `Nombre_Conyuge` |
| 22 | Ocupación del cónyuge | VARCHAR |
| 23 | Centro Laboral del cónyuge | VARCHAR |

### Sección C — Experiencia Espiritual y de Crecimiento
| # | Campo en formulario | Tipo de dato inferido |
|---|---|---|
| 24 | ¿Bautizado en agua? (SI/NO) + Desde (fecha) | BOOLEAN + DATE |
| 25 | ¿Pertenece a círculo de amistad? (SI/NO) + Desde (fecha) | BOOLEAN + DATE |
| 26 | ¿Ha cursado Escuela de Nuevos Creyentes? (SI/NO) + Módulo actual | → cubierto por `Requisitos` |
| 27 | ¿Ha cursado Escuela de Obreros? (SI/NO) + Año | → cubierto por `Requisitos` |
| 28 | ¿Ha impartido clases bíblicas a niños? (SI/NO) + Especificar | BOOLEAN + TEXT |
| 29 | ¿Ha recibido capacitación para enseñar niños? + Explicar | BOOLEAN + TEXT |
| 30 | Observaciones generales (espirituales) | TEXT |

### Sección D — Datos del Líder
| # | Campo en formulario | Tipo de dato inferido |
|---|---|---|
| 31 | Red a la que pertenece | FK a `Redes` — parcialmente cubierto |
| 32 | Nombre del Líder | FK a `Personal_Lideres` (nueva tabla, `Personas` como base) |
| 33 | Celular del Líder | Dato en `Telefonos_Personas` del líder |
| 34 | Correo Electrónico del Líder | Eliminado del modelo — no requerido por el sistema |

> **Nota v5-FINAL:** La figura del Mentor ha sido **eliminada** del modelo de datos. El formulario físico incluye un campo Mentor que queda mapeado exclusivamente hacia el Líder (`Personal_Lideres`). Si en el futuro la iglesia formaliza la mentoría como entidad independiente, se añade sin romper este esquema.

---

## 2. Mapeo: Campos Existentes vs. Nuevos

### ✅ Ya cubiertos en v4
| Campo formulario | Tabla/Columna v4 |
|---|---|
| Nombres y Apellidos | `Personas.Nombres`, `Personas.Apellidos` |
| Fecha de nacimiento | `Personas.Fecha_Nacimiento` |
| Teléfono (genérico) | `Personas.Telefono` (se migra a `Telefonos_Personas`) |
| Dirección exacta | `Personal_Info_Personal.Direccion` (se migra a `Personas_Direcciones`) |
| Estado civil | `Personal_Info_Personal.Estado_Civil` / `Solicitudes_Personal.Estado_Civil` |
| Nombre del Cónyuge | `Personal_Info_Personal.Nombre_Conyuge` |
| Red a la que pertenece | `Personal_Info_Iglesia.ID_Red` |
| Círculo de Amistad | `Personal_Info_Iglesia.Circulo_Amistad` |
| Ministerio adicional | `Personal_Info_Iglesia.Ministerio_Adicional` |
| Tiempo en iglesia | `Personal_Info_Iglesia.Tiempo_Iglesia_Meses` |
| Requisitos (Escuelas) | `Requisitos` + `Personal_Requisitos` |

### 🆕 Campos nuevos — requieren cambios de esquema
| Campo formulario | Bloque | Acción requerida |
|---|---|---|
| Sexo | General | ADD COLUMN `Sexo` ENUM en `Personas` |
| Cédula Nº | General | ADD COLUMN `Cedula` VARCHAR en `Personas` |
| Dirección estructurada | General | Nueva tabla `Personas_Direcciones` |
| Ocupación, Centro Laboral | General | ADD COLUMNs en `Personal_Info_Personal` |
| Teléfonos múltiples | General | Nueva tabla `Telefonos_Personas` |
| Correo Electrónico | General | ADD COLUMN en `Personas` |
| Nivel académico | General | ADD COLUMN ENUM en `Personal_Info_Personal` |
| Estado civil ampliado | General | Ampliar ENUM `estado_civil` |
| Ocupación/Centro Laboral del cónyuge | Familiar | ADD COLUMNs en `Solicitudes_Personal` |
| Bautizado en agua + Desde | Eclesiástico | ADD COLUMNs en `Personal_Info_Iglesia` |
| Círculo de amistad + Desde | Eclesiástico | ADD COLUMN fecha en `Personal_Info_Iglesia` |
| Clases bíblicas a niños | Eclesiástico | ADD COLUMNs en `Personal_Info_Iglesia` |
| Capacitación para enseñar | Eclesiástico | ADD COLUMNs en `Personal_Info_Iglesia` |
| Observaciones espirituales | Eclesiástico | ADD COLUMN en `Personal_Info_Iglesia` |
| Datos del Líder | Eclesiástico | Nueva tabla `Personal_Lideres` |

---

## 3. Análisis Arquitectónico Crítico

### 3.1 Caso Cónyuge

#### Alternativa A — Columnas planas (estado v4)
Solo `Nombre_Conyuge VARCHAR(100)`. No tiene lugar para ocupación ni centro laboral. Si el cónyuge se une al ministerio en el futuro, los datos quedan duplicados.

#### Alternativa B — Tabla `Conyuges` separada
Crea una entidad paralela a `Personas`. Viola el principio de identidad única del esquema.

#### Alternativa C (✅ SELECCIONADA) — Tabla `Relaciones_Personas` (auto-referencia)
```sql
CREATE TABLE Relaciones_Personas (
    ID_Persona_A   INT NOT NULL REFERENCES Personas(ID_Persona),
    ID_Persona_B   INT NOT NULL REFERENCES Personas(ID_Persona),
    Tipo_Relacion  tipo_relacion_persona NOT NULL,  -- 'Conyuge', 'Familiar', 'Otro'
    Fecha_Inicio   DATE,
    Fecha_Fin      DATE,   -- NULL = relación vigente; NOT NULL = relación terminada (divorcio, viudez)
    PRIMARY KEY (ID_Persona_A, ID_Persona_B, Tipo_Relacion)
);
```
**Justificación:** El cónyuge es una Persona. Este modelo evita duplicación y es extensible a otras relaciones familiares. `Fecha_Fin` permite registrar el fin de una relación (divorcio, viudez) sin perder el historial — si A se divorcia de B y se casa con C, la relación A-B queda con `Fecha_Fin` y se inserta A-C como relación nueva. La función `fn_registrar_conyuge` cierra automáticamente cualquier relación de cónyuge vigente antes de registrar una nueva. Para solicitudes donde el cónyuge aún no está en el sistema, se mantienen columnas de escape en el snapshot (`Nombre_Conyuge`, `Conyuge_Ocupacion`, `Conyuge_Centro_Laboral`).

---

### 3.2 Caso Líderes

#### Aclaración del dominio de negocio
Los líderes son personas de la iglesia que supervisan el crecimiento espiritual de los candidatos. **No son necesariamente personal del sistema** (`Personal_Sistema`). Un mismo líder puede supervisar a múltiples personas.

La figura del **Mentor queda eliminada** del modelo en esta versión. Solo existe la relación de supervisión de tipo Líder, simplificando el esquema y reflejando la estructura jerárquica real de la iglesia.

#### Alternativa A — Texto libre
`Nombre_Lider`, `Tel_Lider` como VARCHAR. No tiene integridad referencial. Si el líder cambia de teléfono, hay que actualizar N filas.

#### Alternativa B — FK a `Personal_Sistema`
Obliga a que el líder tenga usuario en el sistema. Viola la realidad del negocio y contamina la tabla operativa con personas sin rol en el ministerio infantil.

#### Alternativa C (✅ SELECCIONADA) — Catálogo `Personal_Lideres` + relación N:1
```sql
CREATE TABLE Personal_Lideres (
    ID_Lider     SERIAL PRIMARY KEY,
    ID_Persona   INT NOT NULL REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Activo       BOOLEAN NOT NULL DEFAULT TRUE
);
```
**Justificación:**
- El líder es una `Persona` — aprovecha `Telefonos_Personas` sin duplicación.
- Relación N:1 desde `Personal_Info_Iglesia.ID_Lider` → `Personal_Lideres.ID_Lider`: cada miembro del personal tiene un líder; un líder puede tener N supervisados.
- Registrar un líder nuevo es solo un INSERT en `Personas` + uno en `Personal_Lideres`. Sin contraseña, sin flujo de aprobación.
- Datos de contacto siempre actualizados via JOIN.

---

### 3.3 Dominios Separados: Rol Operativo vs. Estado Formativo

#### El problema del ENUM `estado_liderazgo` en v4
`Personal_Info_Iglesia.Estado_Liderazgo` usaba el ENUM `estado_liderazgo ('Gap','Lider','Mentor')`. Esto mezclaba dos conceptos distintos:
- **Rol operativo:** qué hace la persona en el ministerio (su `ID_Rol` en `Personal_Sistema`).
- **Estado formativo:** en qué punto de su crecimiento espiritual está.

Con la eliminación de la figura del Mentor, se rediseña el ENUM espiritual.

#### Decisión (✅ SELECCIONADA) — Dos ENUMs con responsabilidades claras

| ENUM | Tabla | Valores | Propósito |
|---|---|---|---|
| `rol_nombre` (existente) | `Roles` | 'Colaborador','Maestro','Staff','Coordinador General' | Qué puede hacer en el sistema |
| `estado_operativo` (nuevo) | `Personal_Info_Iglesia` | 'Lider','En_Formacion' | Dónde está en su madurez espiritual |

**Justificación:** `estado_operativo` reemplaza a `estado_liderazgo` en `Personal_Info_Iglesia`. La distinción "En_Formacion" cubre el antiguo estado "Gap". Se elimina "Mentor" del catálogo de estados. El ENUM `estado_liderazgo` original se depreca y se elimina tras la migración.

**Compatibilidad:** `Personal_Info_Iglesia.Estado_Liderazgo` se renombra a `Estado_Operativo` y cambia de tipo a `estado_operativo`. Los constraints dependientes de ese campo se actualizan en consecuencia.

---

### 3.4 Fechas Flexibles

Las personas a veces solo recuerdan el año o el mes/año de su bautismo o de cuándo ingresaron a un círculo. Forzar `DATE` completa implica inventar el día 01, introduciendo imprecisión silenciosa.

#### Alternativa seleccionada (✅) — DATE + columna de precisión
```sql
Fecha_Bautismo           DATE,
Fecha_Bautismo_Precision tipo_precision_fecha  -- 'Dia', 'Mes', 'Ano'
```
Permite almacenar `2019-01-01` con precisión `Ano` = "solo sabemos el año 2019". Las consultas filtran por `EXTRACT(YEAR FROM Fecha_Bautismo)`. Patrón estándar en sistemas de registros históricos y civiles.

---

### 3.5 Campos Nuevos y su Ubicación Canónica

| Campo | Ubicación canónica | Justificación |
|---|---|---|
| Sexo, Cédula | `Personas` | Datos de identidad universal; aplican a niños, tutores y personal |
| Teléfonos múltiples | `Telefonos_Personas` (con `Tiene_Whatsapp BOOLEAN`) | Normalización 1NF; WhatsApp es atributo del número, no un tipo independiente |
| Dirección estructurada | `Personas_Direcciones` (con `Tipo_Direccion`) | Permite filtrar por ciudad/municipio y diferenciar domicilio vs. laboral |
| Ocupación, Centro Laboral | `Personal_Info_Personal` | Datos laborales del miembro |
| Nivel académico | `Personal_Info_Personal` | Dato personal del miembro |
| Estado civil ampliado | ENUM `estado_civil` (ALTER TYPE) | Lista controlada; no requiere tabla separada |
| Bautismo, Círculo, Clases | `Personal_Info_Iglesia` | Datos espirituales del miembro |
| Estado formativo | `Personal_Info_Iglesia.Estado_Operativo` | Reemplaza `Estado_Liderazgo` |
| Círculo de Amistad | `Circulos_Amistad` (catálogo) + FK en `Personal_Info_Iglesia` | Evita variantes de texto libre del mismo círculo |
| Líder (catálogo) | `Personal_Lideres` | Personas externas al sistema con rol supervisor |
| Líder (relación N:1) | `Personal_Info_Iglesia.ID_Lider` | Un miembro tiene un líder; un líder tiene N miembros |
| Historial de líderes | `Personal_Historial_Lideres` | Trazabilidad de cambios de líder espiritual |
| Historial de roles | `Personal_Historial_Roles` | Auditoría de ascensos y cambios de rol |
| Suspensiones | `Personal_Suspensiones_Servicio` (con `Categoria_Motivo`) | Inhabilitación temporal sin romper vínculos espirituales |
| Historial de estado solicitud | `Solicitudes_Historial_Estado` | Trazabilidad de aprobaciones, rechazos y reevaluaciones |
| Expedientes niños | `Ninos_Expedientes_Conducta` | Registro de incidentes con trazabilidad |
| Expedientes personal | `Personal_Expedientes_Evaluacion` | Evaluaciones formales con trazabilidad |

---

## 4. Decisiones de Diseño Seleccionadas

| # | Decisión | Alternativa descartada | Razón |
|---|---|---|---|
| D1 | `Relaciones_Personas` para cónyuge | Tabla `Conyuges` separada | Normalización; cónyuge ES una persona |
| D2 | Catálogo `Personal_Lideres` (FK→`Personas`) + FK N:1 en `Personal_Info_Iglesia` | FK directa a `Personal_Sistema` o texto libre | Líderes son personas de la iglesia; N:1 refleja la realidad jerárquica |
| D3 | Eliminar figura del Mentor; solo Líderes | Tabla `Personal_Mentores` separada | Simplificación solicitada; elimina ambigüedad de rol |
| D4 | ENUM `estado_operativo` separado de `rol_nombre` | Mezclar roles con estado espiritual | Separación de dominios; evita acoplamiento entre estructura operativa y formativa |
| D5 | DATE + columna de precisión para fechas | SMALLINT año | Permite rangos, comparaciones y ORDER BY correctos |
| D6 | `Telefonos_Personas` normalizada + `Tiene_Whatsapp BOOLEAN` por número | Columnas Telf_Casa, Telf_Claro, etc. o 'Whatsapp' como tipo | 1NF; WhatsApp es aplicación sobre el número, no un tipo de línea independiente |
| D7 | `Personas_Direcciones` con `Tipo_Direccion` ENUM | TEXT libre en `Personas` | Filtros por ciudad/municipio; distinción semántica entre domicilio residencial y laboral |
| D8 | ALTER TYPE para `estado_civil` | Nueva tabla de estados civiles | Overengineering innecesario para lista controlada |
| D9 | Soft Delete universal (`Activo = FALSE`) | Hard Delete | Prohibido en producción; preserva integridad de auditoría |
| D10 | `Personal_Historial_Roles` + trigger automático con excepción explícita si falta autorizador | Solo registro manual o fallback silencioso | El trigger garantiza que ningún ascenso quede sin registrar; el error explícito evita autorizadores incorrectos silenciosos |
| D11 | `Personal_Suspensiones_Servicio` con `Categoria_Motivo` independiente de `Activo` | Reutilizar `Activo = FALSE` para suspensiones | Suspensión ≠ baja; `Categoria_Motivo` habilita filtros y estadísticas por tipo de causa |
| D12 | Índices funcionales sobre `EXTRACT(MONTH/DAY FROM Fecha_Nacimiento)` | Escaneo completo en vistas predictivas | Evita Full Table Scan en vistas `v_ninos_graduacion_mes` y `v_ninos_transicion_grupo_mes` |
| D13 | `Fecha_Fin` en `Relaciones_Personas` + cierre automático en `fn_registrar_conyuge` | Sin historial de relaciones terminadas | Permite representar divorcios y segundas nupcias sin perder historial |
| D14 | `Personal_Historial_Lideres` para trazabilidad de cambios de líder | Solo el ID_Lider actual en `Personal_Info_Iglesia` | Sin historial no es posible auditar la trayectoria espiritual de un miembro |
| D15 | `Solicitudes_Historial_Estado` para auditar cambios de estado de solicitud | Solo columna `Estado` sin historial | Permite rastrear aprobaciones, rechazos y reevaluaciones con fecha y responsable |
| D16 | Catálogo `Circulos_Amistad` con FK en `Personal_Info_Iglesia` | VARCHAR libre | Evita variantes ortográficas del mismo círculo; habilita reportes por círculo |
| D17 | Columnas de auditoría `Creado_En` / `Actualizado_En` en todas las tablas con `Activo` | Solo en algunas tablas | Consistencia de trazabilidad; `Actualizado_En` actualizado por trigger universal |
| D18 | Trigger `trg_validar_hash_bcrypt` en `Personal_Sistema` | Solo documentación | Previene passwords en texto plano en la BD independientemente del proceso |
| D19 | `MAKE_DATE()` con `LEAST()` para calcular `Fecha_Graduacion_Este_Anio` | Aritmética de intervalos | Manejo correcto del 29 de febrero en años no bisiestos |
| D20 | `Nombre_Conyuge` deprecado en `Personal_Info_Personal`; constraint migrado a `Relaciones_Personas` | Coexistencia de dos fuentes de verdad | Elimina ambigüedad entre columna de texto libre y relación formal |
| D21 | Índice único en `mv_ninos_transicion_grupo_mes` basado en `ID_Persona` | `(Apellidos, Nombres, Fecha_Nacimiento)` | Unicidad real garantizada; evita fallo de `REFRESH CONCURRENTLY` con homónimos |

---

## 5. Estructura Detallada de Cambios por Bloque

### 5.1 Bloque General — `Personas`

**Nuevas columnas en `Personas`:**
```
Sexo    : tipo_sexo ENUM ('Masculino','Femenino','Otro')
Cedula  : VARCHAR(20) UNIQUE (índice parcial WHERE NOT NULL)
```

> **v5.1:** `Email` ha sido eliminado del modelo. No es un dato requerido por el sistema.

**Nueva tabla `Telefonos_Personas`:**
Reemplaza la columna única `Personas.Telefono`. Soporta múltiples números por persona con tipo explícito y un único número principal activo garantizado por índice parcial único. El campo `Tiene_Whatsapp` reemplaza al anterior tipo `'Whatsapp'` del ENUM — WhatsApp es una aplicación que corre sobre un número existente, no un tipo de línea independiente.

| Columna | Tipo | Notas |
|---|---|---|
| ID_Telefono | SERIAL PK | |
| ID_Persona | INT FK→Personas | ON DELETE CASCADE |
| Tipo | tipo_telefono ENUM | 'Casa','Oficina','Claro','Movistar','Otro' |
| Numero | VARCHAR(20) NOT NULL | |
| Tiene_Whatsapp | BOOLEAN NOT NULL DEFAULT FALSE | WhatsApp como atributo del número, no tipo independiente |
| Es_Principal | BOOLEAN DEFAULT FALSE | |
| Activo | BOOLEAN DEFAULT TRUE | |
| Creado_En | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |
| Actualizado_En | TIMESTAMPTZ | Actualizado por trigger `trg_auditoria_updated_at` |

**Nueva tabla `Personas_Direcciones`:**
El campo `Tipo_Direccion` permite distinguir semánticamente entre domicilio residencial y dirección laboral, relevante cuando ambas son distintas.

| Columna | Tipo | Notas |
|---|---|---|
| ID_Direccion | SERIAL PK | |
| ID_Persona | INT FK→Personas | ON DELETE CASCADE |
| Tipo_Direccion | tipo_direccion ENUM | 'Residencial','Laboral','Referencia','Otro' |
| Ciudad_Departamento | VARCHAR(60) | |
| Municipio | VARCHAR(60) | |
| Distrito | VARCHAR(60) | |
| Barrio | VARCHAR(60) | |
| Direccion_Exacta | TEXT | |
| Es_Principal | BOOLEAN DEFAULT TRUE | |
| Activo | BOOLEAN DEFAULT TRUE | |
| Creado_En | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |
| Actualizado_En | TIMESTAMPTZ | Actualizado por trigger |

---

### 5.2 Bloque Familiar

**Cambios en `Personal_Info_Personal`:**
```
+ Ocupacion          VARCHAR(150)
+ Centro_Laboral     VARCHAR(150)
+ Nivel_Academico    nivel_academico ENUM
```

> **v5.1 — Deprecación de `Nombre_Conyuge`:** Con la introducción de `Relaciones_Personas`, el campo `Nombre_Conyuge VARCHAR` queda como fuente redundante de verdad. Se depreca en esta versión: el constraint `chk_conyuge` se reemplaza por una función que verifica la existencia de una relación activa de tipo `'Conyuge'` en `Relaciones_Personas`. El campo se elimina físicamente una vez validada la migración de datos. En el snapshot de `Solicitudes_Personal`, `Nombre_Conyuge` se conserva como dato de escape para candidatos cuyo cónyuge aún no está registrado en el sistema.

**Ampliación ENUM `estado_civil`:** Se añaden los valores del formulario:
`'Union_Libre'`, `'Segundo_Matrimonio'`, `'Separado'`, `'Madre_Soltera'`, `'Padre_Soltero'`

**Nueva tabla `Relaciones_Personas`** (auto-referencia para cónyuge/familiar):

| Columna | Tipo | Notas |
|---|---|---|
| ID_Persona_A | INT FK→Personas | ON DELETE RESTRICT |
| ID_Persona_B | INT FK→Personas | ON DELETE RESTRICT |
| Tipo_Relacion | tipo_relacion_persona ENUM | 'Conyuge','Familiar','Otro' |
| Datos_Adicionales | JSONB | Ocupación/centro laboral si B no tiene perfil |
| Fecha_Inicio | DATE | |
| Fecha_Fin | DATE | NULL = relación vigente; NOT NULL = relación terminada (divorcio, viudez) |
| Activo | BOOLEAN DEFAULT TRUE | |
| Creado_En | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |
| Actualizado_En | TIMESTAMPTZ | Actualizado por trigger |
| CHECK | ID_Persona_A <> ID_Persona_B | No autorelación |
| CHECK | Fecha_Fin IS NULL OR Fecha_Fin > Fecha_Inicio | Coherencia temporal |

> **Lógica de cambio de cónyuge:** La función `fn_registrar_conyuge` cierra automáticamente cualquier relación de cónyuge vigente entre A y otro tercero (estableciendo `Fecha_Fin = CURRENT_DATE`) antes de insertar la nueva. Esto permite representar correctamente divorcios y segundas nupcias sin pérdida de historial.

---

### 5.3 Bloque Eclesiástico

**Cambios en `Personal_Info_Iglesia`:**
```
-- Reemplaza Estado_Liderazgo (deprecado)
+ Estado_Operativo              estado_operativo  -- 'Lider','En_Formacion'

-- Bautismo
+ Bautizado_Agua                BOOLEAN DEFAULT FALSE
+ Fecha_Bautismo                DATE
+ Fecha_Bautismo_Precision      tipo_precision_fecha

-- Círculo de amistad
+ Circulo_Amistad_Desde         DATE
+ Circulo_Amistad_Precision     tipo_precision_fecha

-- Experiencia docente
+ Clases_Biblicas_Ninos         BOOLEAN DEFAULT FALSE
+ Clases_Biblicas_Detalle       TEXT
+ Capacitacion_Ensenanza        BOOLEAN DEFAULT FALSE
+ Capacitacion_Detalle          TEXT

-- Observaciones
+ Observaciones_Espirituales    TEXT

-- Relación con líder
+ ID_Lider                      INT FK→Personal_Lideres(ID_Lider)
```

**Nueva tabla `Personal_Lideres`:**
Catálogo de líderes espirituales. Son `Personas` sin rol obligatorio en `Personal_Sistema`.

| Columna | Tipo | Notas |
|---|---|---|
| ID_Lider | SERIAL PK | |
| ID_Persona | INT FK→Personas | ON DELETE RESTRICT |
| Activo | BOOLEAN DEFAULT TRUE | Soft Delete |

> El celular del líder se consulta via JOIN con `Telefonos_Personas`.

**Deprecaciones:**
- `Personal_Info_Iglesia.Estado_Liderazgo` → reemplazado por `Estado_Operativo`
- `Personal_Info_Iglesia.ID_Mentor` (v4) → eliminado; figura del Mentor eliminada del modelo
- `Personal_Info_Iglesia.Circulo_Amistad` (VARCHAR libre) → reemplazado por FK a `Circulos_Amistad`

**Nueva tabla `Circulos_Amistad`:**
Catálogo de círculos de amistad de la iglesia. Evita variantes ortográficas del mismo círculo y permite reportes agrupados.

| Columna | Tipo | Notas |
|---|---|---|
| ID_Circulo | SERIAL PK | |
| Nombre | VARCHAR(100) NOT NULL UNIQUE | |
| Descripcion | TEXT | |
| Activo | BOOLEAN NOT NULL DEFAULT TRUE | |
| Creado_En | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |

La columna `Personal_Info_Iglesia.Circulo_Amistad` (VARCHAR) se reemplaza por `ID_Circulo INT FK→Circulos_Amistad ON DELETE SET NULL`. La columna `Circulo_Amistad_Desde` y `Circulo_Amistad_Precision` permanecen sin cambios.

**Nueva tabla `Personal_Historial_Lideres`:**
Registra los cambios de líder espiritual a lo largo del tiempo para cada miembro. Se inserta automáticamente cuando `Personal_Info_Iglesia.ID_Lider` cambia, vía trigger `trg_auditoria_cambio_lider`.

| Columna | Tipo | Notas |
|---|---|---|
| ID_Historial | SERIAL PK | |
| ID_Personal | INT FK→Personal_Sistema ON DELETE RESTRICT | |
| ID_Lider_Anterior | INT FK→Personal_Lideres | NULL = primer líder asignado |
| ID_Lider_Nuevo | INT FK→Personal_Lideres | NULL = líder removido sin reemplazo |
| Fecha_Cambio | DATE NOT NULL DEFAULT CURRENT_DATE | |
| ID_Registrado_Por | INT FK→Personal_Sistema ON DELETE RESTRICT | |
| Notas | TEXT | |
| Creado_En | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |

---

### 5.4 Expedientes de Conducta y Evaluación

#### `Ninos_Expedientes_Conducta`
Registro de incidentes, observaciones de conducta o situaciones especiales de un niño durante los servicios. Requiere trazabilidad estricta: no se permite borrar el registro del reportador aunque este salga del personal.

| Columna | Tipo | Notas |
|---|---|---|
| ID_Expediente | SERIAL PK | |
| ID_Nino | INT FK→Ninos ON DELETE RESTRICT | El expediente no desaparece si el niño se da de baja |
| Fecha | DATE NOT NULL DEFAULT CURRENT_DATE | |
| ID_Turno | INT FK→Turnos | Turno en el que ocurrió |
| ID_Evento | INT FK→Eventos (nullable) | Evento específico si aplica |
| Tipo | tipo_expediente_nino ENUM | 'Conducta','Incidente','Observacion','Medico' |
| Descripcion | TEXT NOT NULL | |
| ID_Reportado_Por | INT NOT NULL FK→Personal_Sistema ON DELETE RESTRICT | No puede borrarse si tiene expedientes |
| Resuelto | BOOLEAN NOT NULL DEFAULT FALSE | |
| Notas_Resolucion | TEXT | |
| Creado_En | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |

#### `Personal_Expedientes_Evaluacion`
Registro formal de evaluaciones periódicas del personal (desempeño, formación, conducta). El evaluador queda protegido contra borrado físico.

| Columna | Tipo | Notas |
|---|---|---|
| ID_Evaluacion | SERIAL PK | |
| ID_Personal | INT FK→Personal_Sistema ON DELETE RESTRICT | |
| Fecha | DATE NOT NULL DEFAULT CURRENT_DATE | |
| Tipo | tipo_evaluacion ENUM | 'Desempeno','Formacion','Conducta','Ascenso','Otro' |
| Descripcion | TEXT NOT NULL | |
| Resultado | tipo_resultado_evaluacion ENUM | 'Satisfactorio','En_Proceso','Insatisfactorio' |
| ID_Evaluador | INT NOT NULL FK→Personal_Sistema ON DELETE RESTRICT | Protegido contra borrado |
| Notas | TEXT | |
| Creado_En | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |

> **Política de integridad:** Ambas tablas usan `ON DELETE RESTRICT` tanto en `ID_Reportado_Por`/`ID_Evaluador` como en los sujetos (`ID_Nino`, `ID_Personal`). Antes de cualquier baja, se deben reasignar o archivar los expedientes. El **Soft Delete** (`Activo = FALSE`) es la práctica correcta para evitar conflictos.

---

### 5.5 Protocolos Operativos del Personal

#### Offboarding — Soft Delete obligatorio
**Regla:** Nunca ejecutar `DELETE` físico sobre `Personal_Sistema`. Siempre:
```sql
UPDATE Personal_Sistema SET Activo = FALSE WHERE ID_Persona = :id;
```
Esto preserva todas las FKs en asistencias, expedientes, historial de roles y relaciones con liderados.

#### Suspensiones de Servicio
Una suspensión inhabilita operativamente a un miembro para ser asignado a turnos **sin** romper su vínculo espiritual con sus liderados en `Personal_Lideres`. Es una condición temporal distinta a la baja definitiva.

**Nueva tabla `Personal_Suspensiones_Servicio`:**

| Columna | Tipo | Notas |
|---|---|---|
| ID_Suspension | SERIAL PK | |
| ID_Personal | INT FK→Personal_Sistema ON DELETE RESTRICT | |
| Fecha_Inicio | DATE NOT NULL | |
| Fecha_Fin | DATE | NULL = indefinida hasta resolución manual |
| Categoria_Motivo | categoria_motivo_suspension ENUM | 'Conducta','Enfermedad','Personal','Disciplina','Otro' — para filtros y estadísticas |
| Motivo | TEXT NOT NULL | Descripción libre del motivo específico |
| ID_Registrado_Por | INT FK→Personal_Sistema ON DELETE RESTRICT | |
| Activo | BOOLEAN NOT NULL DEFAULT TRUE | FALSE = suspensión levantada antes de Fecha_Fin |
| Creado_En | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |
| Actualizado_En | TIMESTAMPTZ | Actualizado por trigger |
| CHECK | Fecha_Fin IS NULL OR Fecha_Fin > Fecha_Inicio | |
| CHECK | Solo se inserta si Personal_Sistema.Activo = TRUE | Verificado via trigger |

**Vista `v_personal_disponible_servicio`:** Lista el personal apto para ser asignado: activo y sin suspensión vigente. Ver §6.4.

#### Historial de Roles — Auditoría de Ascensos
**Nueva tabla `Personal_Historial_Roles`:**

| Columna | Tipo | Notas |
|---|---|---|
| ID_Historial | SERIAL PK | |
| ID_Personal | INT FK→Personal_Sistema ON DELETE RESTRICT | |
| ID_Rol_Anterior | INT FK→Roles | NULL si es el primer registro |
| ID_Rol_Nuevo | INT FK→Roles NOT NULL | |
| Fecha_Cambio | DATE NOT NULL DEFAULT CURRENT_DATE | |
| ID_Autorizado_Por | INT FK→Personal_Sistema ON DELETE RESTRICT | |
| Notas | TEXT | |

Un **trigger** `trg_auditoria_cambio_rol` inserta automáticamente en esta tabla cuando `Personal_Sistema.ID_Rol` cambia, garantizando que ningún ascenso quede sin registrar independientemente de la capa de aplicación.

#### Historial de Estado de Solicitudes
**Nueva tabla `Solicitudes_Historial_Estado`:**
Registra cada transición de estado de una solicitud (Pendiente → Aprobado, Pendiente → Rechazado, etc.) con fecha y responsable. Permite rastrear reevaluaciones y apelaciones.

| Columna | Tipo | Notas |
|---|---|---|
| ID_Historial | SERIAL PK | |
| ID_Solicitud | INT FK→Solicitudes_Personal ON DELETE RESTRICT | |
| Estado_Anterior | estado_solicitud ENUM | NULL si es el registro inicial |
| Estado_Nuevo | estado_solicitud ENUM NOT NULL | |
| Fecha_Cambio | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |
| ID_Cambiado_Por | INT FK→Personal_Sistema ON DELETE RESTRICT | |
| Notas | TEXT | |

Un **trigger** `trg_auditoria_cambio_estado_solicitud` inserta en esta tabla automáticamente cuando `Solicitudes_Personal.Estado` cambia.

#### Suplencias y Cross-Shift
El esquema **ya soporta** que un maestro dé clases en un turno o grupo distinto al oficial a través de dos mecanismos:

1. **`Personal_Grupos`** tiene PK compuesta `(ID_Personal, ID_Grupo, ID_Turno)`. Insertar una fila adicional con otro grupo/turno es suficiente para registrar una asignación habitual cruzada.
2. **`Asistencia_Maestros`** es por evento: cada fila registra la presencia en un turno específico. El staff puede registrar asistencia en un turno no-oficial sin modificar las asignaciones permanentes.

Ver §10 (Manual de Protocolos Operativos) para el flujo detallado.

---

### 5.6 Snapshot en `Solicitudes_Personal`

Columnas a añadir al snapshot:

```sql
-- Bloque General (datos al momento de la solicitud)
Sexo_Candidato               tipo_sexo,
Cedula_Candidato             VARCHAR(20),
Ocupacion_Candidato          VARCHAR(150),
Centro_Laboral_Candidato     VARCHAR(150),
Nivel_Academico_Candidato    nivel_academico,
Dir_Ciudad                   VARCHAR(60),
Dir_Municipio                VARCHAR(60),
Dir_Distrito                 VARCHAR(60),
Dir_Barrio                   VARCHAR(60),
Dir_Exacta                   TEXT,
Tel_Casa                     VARCHAR(20),
Tel_Oficina                  VARCHAR(20),
Tel_Claro                    VARCHAR(20),
Tel_Movistar                 VARCHAR(20),

-- Bloque Familiar
Conyuge_Ocupacion            VARCHAR(150),
Conyuge_Centro_Laboral       VARCHAR(150),

-- Bloque Eclesiástico
Bautizado_Agua               BOOLEAN DEFAULT FALSE,
Fecha_Bautismo               DATE,
Fecha_Bautismo_Precision     tipo_precision_fecha,
Circulo_Amistad_Desde        DATE,
Circulo_Amistad_Precision    tipo_precision_fecha,
Clases_Biblicas_Ninos        BOOLEAN DEFAULT FALSE,
Clases_Biblicas_Detalle      TEXT,
Capacitacion_Ensenanza       BOOLEAN DEFAULT FALSE,
Capacitacion_Detalle         TEXT,
Observaciones_Espirituales_Sol TEXT,
Estado_Operativo_Candidato   estado_operativo,

-- Líder propuesto (FK a Personal_Lideres)
ID_Lider_Propuesto           INT REFERENCES Personal_Lideres(ID_Lider)
```

---

## 6. Scripts SQL Completos

### 6.1 ENUMs — Nuevos y Modificados

```sql
-- ================================================================
-- NUEVOS TIPOS ENUM — v5.1
-- ================================================================

-- Sexo
CREATE TYPE tipo_sexo AS ENUM ('Masculino', 'Femenino', 'Otro');

-- Tipo de teléfono
-- NOTA v5.1: 'Whatsapp' eliminado. WhatsApp es una aplicación que corre
-- sobre un número existente. Se modela como atributo booleano del número
-- (columna Tiene_Whatsapp en Telefonos_Personas), no como tipo de línea.
CREATE TYPE tipo_telefono AS ENUM (
    'Casa', 'Oficina', 'Claro', 'Movistar', 'Otro'
);

-- Tipo de dirección
CREATE TYPE tipo_direccion AS ENUM (
    'Residencial', 'Laboral', 'Referencia', 'Otro'
);

-- Nivel académico
CREATE TYPE nivel_academico AS ENUM (
    'Primaria', 'Secundaria', 'Nivel_Tecnico', 'Licenciatura',
    'Ingenieria', 'Postgrado', 'Maestria', 'Doctorado', 'Otro'
);

-- Tipo de relación familiar entre personas
CREATE TYPE tipo_relacion_persona AS ENUM ('Conyuge', 'Familiar', 'Otro');

-- Precisión de fechas parciales
CREATE TYPE tipo_precision_fecha AS ENUM ('Dia', 'Mes', 'Ano');

-- ────────────────────────────────────────────────────────────────
-- Estado formativo/espiritual del personal
-- Reemplaza estado_liderazgo ('Gap','Lider','Mentor') de v4.
-- 'En_Formacion' cubre el antiguo 'Gap'.
-- 'Mentor' se elimina del modelo.
-- ────────────────────────────────────────────────────────────────
CREATE TYPE estado_operativo AS ENUM ('Lider', 'En_Formacion');

-- Categoría de motivo de suspensión (para filtros y estadísticas)
CREATE TYPE categoria_motivo_suspension AS ENUM (
    'Conducta', 'Enfermedad', 'Personal', 'Disciplina', 'Otro'
);

-- Estado de solicitud de personal (para historial de transiciones)
CREATE TYPE estado_solicitud AS ENUM (
    'Pendiente', 'Aprobado', 'Rechazado', 'En_Revision'
);

-- Tipo de expediente para niños
CREATE TYPE tipo_expediente_nino AS ENUM (
    'Conducta', 'Incidente', 'Observacion', 'Medico'
);

-- Tipo de evaluación de personal
CREATE TYPE tipo_evaluacion AS ENUM (
    'Desempeno', 'Formacion', 'Conducta', 'Ascenso', 'Otro'
);

-- Resultado de evaluación
CREATE TYPE tipo_resultado_evaluacion AS ENUM (
    'Satisfactorio', 'En_Proceso', 'Insatisfactorio'
);

-- ────────────────────────────────────────────────────────────────
-- Ampliar ENUM existente estado_civil
-- ADD VALUE es seguro en PostgreSQL: no requiere DROP/RECREATE
-- ────────────────────────────────────────────────────────────────
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Union_Libre';
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Segundo_Matrimonio';
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Separado';
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Madre_Soltera';
ALTER TYPE estado_civil ADD VALUE IF NOT EXISTS 'Padre_Soltero';

-- ────────────────────────────────────────────────────────────────
-- Deprecación del ENUM estado_liderazgo
-- Ejecutar DROP solo DESPUÉS de migrar Personal_Info_Iglesia.Estado_Liderazgo
-- a Personal_Info_Iglesia.Estado_Operativo (tipo estado_operativo).
-- No ejecutar en el mismo release de ALTER TABLE.
-- DROP TYPE estado_liderazgo;
-- ────────────────────────────────────────────────────────────────
```

---

### 6.2 Nuevas Tablas

```sql
-- ================================================================
-- FUNCIÓN UNIVERSAL DE AUDITORÍA updated_at
-- Se aplica a todas las tablas que tienen columna Actualizado_En.
-- ================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.Actualizado_En = NOW();
    RETURN NEW;
END;
$$;

-- Macro para crear el trigger en cada tabla:
-- CREATE TRIGGER trg_auditoria_updated_at
--     BEFORE UPDATE ON <tabla>
--     FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ================================================================
-- TABLA: Telefonos_Personas
-- NOTA v5.1: 'Whatsapp' eliminado del ENUM tipo_telefono.
-- Se agrega columna Tiene_Whatsapp BOOLEAN para indicar si el número
-- tiene WhatsApp activo — es un atributo del número, no un tipo de línea.
-- ================================================================
CREATE TABLE Telefonos_Personas (
    ID_Telefono     SERIAL        PRIMARY KEY,
    ID_Persona      INT           NOT NULL
                                      REFERENCES Personas(ID_Persona) ON DELETE CASCADE,
    Tipo            tipo_telefono NOT NULL DEFAULT 'Otro',
    Numero          VARCHAR(20)   NOT NULL,
    Tiene_Whatsapp  BOOLEAN       NOT NULL DEFAULT FALSE,
    Es_Principal    BOOLEAN       NOT NULL DEFAULT FALSE,
    Activo          BOOLEAN       NOT NULL DEFAULT TRUE,
    Creado_En       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    Actualizado_En  TIMESTAMPTZ
);

CREATE INDEX idx_telefonos_persona ON Telefonos_Personas (ID_Persona);
-- Solo un número principal activo por persona
CREATE UNIQUE INDEX uq_un_principal_activo
    ON Telefonos_Personas (ID_Persona)
    WHERE Es_Principal = TRUE AND Activo = TRUE;

CREATE TRIGGER trg_auditoria_updated_at_telefonos
    BEFORE UPDATE ON Telefonos_Personas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ================================================================
-- TABLA: Personas_Direcciones
-- NOTA v5.1: Se agrega Tipo_Direccion para distinguir semánticamente
-- domicilio residencial de dirección laboral u otras.
-- ================================================================
CREATE TABLE Personas_Direcciones (
    ID_Direccion         SERIAL         PRIMARY KEY,
    ID_Persona           INT            NOT NULL
                                            REFERENCES Personas(ID_Persona) ON DELETE CASCADE,
    Tipo_Direccion       tipo_direccion NOT NULL DEFAULT 'Residencial',
    Ciudad_Departamento  VARCHAR(60),
    Municipio            VARCHAR(60),
    Distrito             VARCHAR(60),
    Barrio               VARCHAR(60),
    Direccion_Exacta     TEXT,
    Es_Principal         BOOLEAN        NOT NULL DEFAULT TRUE,
    Activo               BOOLEAN        NOT NULL DEFAULT TRUE,
    Creado_En            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    Actualizado_En       TIMESTAMPTZ
);

CREATE INDEX idx_direcciones_persona ON Personas_Direcciones (ID_Persona);
CREATE UNIQUE INDEX uq_una_dir_principal
    ON Personas_Direcciones (ID_Persona)
    WHERE Es_Principal = TRUE AND Activo = TRUE;

CREATE TRIGGER trg_auditoria_updated_at_direcciones
    BEFORE UPDATE ON Personas_Direcciones
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ================================================================
-- TABLA: Relaciones_Personas
-- Vínculos familiares (cónyuge, etc.) entre personas del sistema.
-- NOTA v5.1: Se agrega Fecha_Fin para registrar el fin de una relación
-- (divorcio, viudez) sin perder historial. fn_registrar_conyuge cierra
-- automáticamente cualquier cónyuge vigente antes de insertar uno nuevo.
-- ================================================================
CREATE TABLE Relaciones_Personas (
    ID_Persona_A      INT                   NOT NULL
                                                REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    ID_Persona_B      INT                   NOT NULL
                                                REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Tipo_Relacion     tipo_relacion_persona NOT NULL,
    Datos_Adicionales JSONB,
    -- Ej: {"ocupacion": "Contadora", "centro_laboral": "BCIE"}
    -- Para cuando la persona B aún no tiene Personal_Info_Personal
    Fecha_Inicio      DATE,
    Fecha_Fin         DATE,
    -- NULL = relación vigente; NOT NULL = relación terminada (divorcio, viudez, etc.)
    Activo            BOOLEAN               NOT NULL DEFAULT TRUE,
    Creado_En         TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    Actualizado_En    TIMESTAMPTZ,
    PRIMARY KEY (ID_Persona_A, ID_Persona_B, Tipo_Relacion),
    CONSTRAINT chk_no_autorelacion CHECK (ID_Persona_A <> ID_Persona_B),
    CONSTRAINT chk_relacion_fechas CHECK (Fecha_Fin IS NULL OR Fecha_Fin > Fecha_Inicio)
);

CREATE INDEX idx_relaciones_a ON Relaciones_Personas (ID_Persona_A);
CREATE INDEX idx_relaciones_b ON Relaciones_Personas (ID_Persona_B);

CREATE TRIGGER trg_auditoria_updated_at_relaciones
    BEFORE UPDATE ON Relaciones_Personas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- Helper: registrar cónyuge de forma bidireccional.
-- v5.1: Antes de insertar la nueva relación, cierra (Fecha_Fin = CURRENT_DATE)
-- cualquier relación de Conyuge vigente que A o B tengan con terceros,
-- permitiendo representar correctamente divorcios y segundas nupcias.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_registrar_conyuge(
    p_id_a              INT,
    p_id_b              INT,
    p_datos_adicionales JSONB DEFAULT NULL,
    p_fecha_inicio      DATE  DEFAULT CURRENT_DATE
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    -- Cerrar cualquier relación de cónyuge vigente de A con terceros distintos a B
    UPDATE Relaciones_Personas
    SET    Fecha_Fin      = CURRENT_DATE,
           Activo         = FALSE,
           Actualizado_En = NOW()
    WHERE  ID_Persona_A   = p_id_a
      AND  ID_Persona_B  <> p_id_b
      AND  Tipo_Relacion  = 'Conyuge'
      AND  Fecha_Fin IS NULL
      AND  Activo = TRUE;

    -- Cerrar la misma relación desde el lado B (espejo)
    UPDATE Relaciones_Personas
    SET    Fecha_Fin      = CURRENT_DATE,
           Activo         = FALSE,
           Actualizado_En = NOW()
    WHERE  ID_Persona_A   = p_id_b
      AND  ID_Persona_B  <> p_id_a
      AND  Tipo_Relacion  = 'Conyuge'
      AND  Fecha_Fin IS NULL
      AND  Activo = TRUE;

    -- Insertar o reactivar la relación A→B
    INSERT INTO Relaciones_Personas
        (ID_Persona_A, ID_Persona_B, Tipo_Relacion, Datos_Adicionales, Fecha_Inicio)
    VALUES (p_id_a, p_id_b, 'Conyuge', p_datos_adicionales, p_fecha_inicio)
    ON CONFLICT (ID_Persona_A, ID_Persona_B, Tipo_Relacion)
        DO UPDATE SET Datos_Adicionales = EXCLUDED.Datos_Adicionales,
                      Fecha_Inicio      = EXCLUDED.Fecha_Inicio,
                      Fecha_Fin         = NULL,
                      Activo            = TRUE,
                      Actualizado_En    = NOW();

    -- Insertar o reactivar la relación B→A (espejo)
    INSERT INTO Relaciones_Personas
        (ID_Persona_A, ID_Persona_B, Tipo_Relacion, Datos_Adicionales, Fecha_Inicio)
    VALUES (p_id_b, p_id_a, 'Conyuge', p_datos_adicionales, p_fecha_inicio)
    ON CONFLICT (ID_Persona_A, ID_Persona_B, Tipo_Relacion)
        DO UPDATE SET Datos_Adicionales = EXCLUDED.Datos_Adicionales,
                      Fecha_Inicio      = EXCLUDED.Fecha_Inicio,
                      Fecha_Fin         = NULL,
                      Activo            = TRUE,
                      Actualizado_En    = NOW();
END;
$$;


-- ================================================================
-- TABLA: Personal_Lideres
-- Catálogo de líderes espirituales de la iglesia.
-- Son Personas; NO requieren ser Personal_Sistema.
-- ================================================================
CREATE TABLE Personal_Lideres (
    ID_Lider    SERIAL  PRIMARY KEY,
    ID_Persona  INT     NOT NULL
                            REFERENCES Personas(ID_Persona) ON DELETE RESTRICT,
    Activo      BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_lider_persona UNIQUE (ID_Persona)
);

CREATE INDEX idx_lideres_activo ON Personal_Lideres (Activo) WHERE Activo = TRUE;


-- ================================================================
-- TABLA: Circulos_Amistad
-- Catálogo de círculos de amistad de la iglesia.
-- NOTA v5.1: Reemplaza el VARCHAR libre en Personal_Info_Iglesia.
-- Evita variantes ortográficas del mismo círculo y permite reportes agrupados.
-- ================================================================
CREATE TABLE Circulos_Amistad (
    ID_Circulo   SERIAL       PRIMARY KEY,
    Nombre       VARCHAR(100) NOT NULL,
    Descripcion  TEXT,
    Activo       BOOLEAN      NOT NULL DEFAULT TRUE,
    Creado_En    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_circulo_nombre UNIQUE (Nombre)
);

CREATE INDEX idx_circulos_activo ON Circulos_Amistad (Activo) WHERE Activo = TRUE;


-- ================================================================
-- TABLA: Personal_Historial_Lideres
-- Registra cambios de líder espiritual para cada miembro.
-- Análogo a Personal_Historial_Roles pero para el vínculo de liderazgo.
-- Poblada automáticamente por trigger trg_auditoria_cambio_lider.
-- ================================================================
CREATE TABLE Personal_Historial_Lideres (
    ID_Historial       SERIAL      PRIMARY KEY,
    ID_Personal        INT         NOT NULL
                                       REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Lider_Anterior  INT         REFERENCES Personal_Lideres(ID_Lider),
    -- NULL = primer líder asignado
    ID_Lider_Nuevo     INT         REFERENCES Personal_Lideres(ID_Lider),
    -- NULL = líder removido sin reemplazo
    Fecha_Cambio       DATE        NOT NULL DEFAULT CURRENT_DATE,
    ID_Registrado_Por  INT         NOT NULL
                                       REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas              TEXT,
    Creado_En          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historial_lideres_personal ON Personal_Historial_Lideres
    (ID_Personal, Fecha_Cambio DESC);

-- Trigger: registrar automáticamente el cambio de líder
CREATE OR REPLACE FUNCTION fn_auditoria_cambio_lider()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_registrador INT;
BEGIN
    IF OLD.ID_Lider IS DISTINCT FROM NEW.ID_Lider THEN
        v_registrador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;
        IF v_registrador IS NULL THEN
            RAISE EXCEPTION
                'app.id_autorizador no está definido en la sesión. '
                'Usar SET LOCAL app.id_autorizador = <id> antes del UPDATE.';
        END IF;

        INSERT INTO Personal_Historial_Lideres
            (ID_Personal, ID_Lider_Anterior, ID_Lider_Nuevo, ID_Registrado_Por)
        VALUES
            (NEW.ID_Persona, OLD.ID_Lider, NEW.ID_Lider, v_registrador);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auditoria_cambio_lider
    AFTER UPDATE OF ID_Lider ON Personal_Info_Iglesia
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_cambio_lider();


-- ================================================================
-- TABLA: Solicitudes_Historial_Estado
-- Registra cada transición de estado de una solicitud.
-- Permite rastrear reevaluaciones, rechazos y apelaciones con fecha
-- y responsable. Poblada por trigger trg_auditoria_cambio_estado_solicitud.
-- ================================================================
CREATE TABLE Solicitudes_Historial_Estado (
    ID_Historial     SERIAL          PRIMARY KEY,
    ID_Solicitud     INT             NOT NULL
                                         REFERENCES Solicitudes_Personal(ID_Solicitud) ON DELETE RESTRICT,
    Estado_Anterior  estado_solicitud,
    -- NULL si es el primer registro (solicitud recién creada)
    Estado_Nuevo     estado_solicitud NOT NULL,
    Fecha_Cambio     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    ID_Cambiado_Por  INT             NOT NULL
                                         REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas            TEXT
);

CREATE INDEX idx_historial_estado_solicitud ON Solicitudes_Historial_Estado
    (ID_Solicitud, Fecha_Cambio DESC);

-- Trigger: registrar automáticamente el cambio de estado de la solicitud
CREATE OR REPLACE FUNCTION fn_auditoria_cambio_estado_solicitud()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_responsable INT;
BEGIN
    IF OLD.Estado IS DISTINCT FROM NEW.Estado THEN
        v_responsable := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;
        IF v_responsable IS NULL THEN
            RAISE EXCEPTION
                'app.id_autorizador no está definido en la sesión. '
                'Usar SET LOCAL app.id_autorizador = <id> antes del UPDATE.';
        END IF;

        INSERT INTO Solicitudes_Historial_Estado
            (ID_Solicitud, Estado_Anterior, Estado_Nuevo, ID_Cambiado_Por)
        VALUES
            (NEW.ID_Solicitud, OLD.Estado, NEW.Estado, v_responsable);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auditoria_cambio_estado_solicitud
    AFTER UPDATE OF Estado ON Solicitudes_Personal
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_cambio_estado_solicitud();


-- ================================================================
-- TABLA: Personal_Historial_Roles
-- Auditoría de ascensos y cambios de rol del personal.
-- Poblada automáticamente por trigger trg_auditoria_cambio_rol.
-- ================================================================
CREATE TABLE Personal_Historial_Roles (
    ID_Historial      SERIAL  PRIMARY KEY,
    ID_Personal       INT     NOT NULL
                                  REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    ID_Rol_Anterior   INT     REFERENCES Roles(ID_Rol),       -- NULL = primer rol asignado
    ID_Rol_Nuevo      INT     NOT NULL REFERENCES Roles(ID_Rol),
    Fecha_Cambio      DATE    NOT NULL DEFAULT CURRENT_DATE,
    ID_Autorizado_Por INT     NOT NULL
                                  REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas             TEXT
);

CREATE INDEX idx_historial_personal ON Personal_Historial_Roles (ID_Personal, Fecha_Cambio DESC);

-- ──────────────────────────────────────────────────────────────
-- Trigger: registrar automáticamente el cambio de rol
-- Dispara en UPDATE de Personal_Sistema cuando cambia ID_Rol.
-- NOTA v5.1: Si app.id_autorizador no está definido, lanza excepción
-- explícita. Elimina el fallback silencioso a ID_Creado_Por que
-- producía autorizadores incorrectos en el historial.
-- Requiere que la app pase el autorizador via variable de sesión:
--   SET LOCAL app.id_autorizador = '<id>';
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_auditoria_cambio_rol()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_autorizador INT;
BEGIN
    IF OLD.ID_Rol IS DISTINCT FROM NEW.ID_Rol THEN
        v_autorizador := NULLIF(current_setting('app.id_autorizador', TRUE), '')::INT;

        IF v_autorizador IS NULL THEN
            RAISE EXCEPTION
                'app.id_autorizador no está definido en la sesión. '
                'Usar SET LOCAL app.id_autorizador = <id_coordinador> antes del UPDATE de ID_Rol.';
        END IF;

        INSERT INTO Personal_Historial_Roles
            (ID_Personal, ID_Rol_Anterior, ID_Rol_Nuevo, ID_Autorizado_Por)
        VALUES
            (NEW.ID_Persona, OLD.ID_Rol, NEW.ID_Rol, v_autorizador);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auditoria_cambio_rol
    AFTER UPDATE OF ID_Rol ON Personal_Sistema
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_cambio_rol();


-- ================================================================
-- TABLA: Personal_Suspensiones_Servicio
-- Inhabilita temporalmente a un miembro para asignaciones de turno
-- SIN afectar su vínculo espiritual con sus liderados.
-- Es distinto al Soft Delete (Activo = FALSE).
-- NOTA v5.1: Se agrega Categoria_Motivo (ENUM controlado) además del
-- texto libre Motivo, para habilitar filtros y estadísticas por tipo
-- de causa de suspensión.
-- ================================================================
CREATE TABLE Personal_Suspensiones_Servicio (
    ID_Suspension      SERIAL                       PRIMARY KEY,
    ID_Personal        INT                          NOT NULL
                                                        REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Fecha_Inicio       DATE                         NOT NULL DEFAULT CURRENT_DATE,
    Fecha_Fin          DATE,
    Categoria_Motivo   categoria_motivo_suspension  NOT NULL DEFAULT 'Otro',
    Motivo             TEXT                         NOT NULL,
    ID_Registrado_Por  INT                          NOT NULL
                                                        REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Activo             BOOLEAN                      NOT NULL DEFAULT TRUE,
    -- FALSE = suspensión levantada manualmente antes de Fecha_Fin
    Creado_En          TIMESTAMPTZ                  NOT NULL DEFAULT NOW(),
    Actualizado_En     TIMESTAMPTZ,
    CONSTRAINT chk_suspension_fechas
        CHECK (Fecha_Fin IS NULL OR Fecha_Fin > Fecha_Inicio)
);

CREATE INDEX idx_suspensiones_personal ON Personal_Suspensiones_Servicio
    (ID_Personal, Activo, Fecha_Inicio, Fecha_Fin);

CREATE TRIGGER trg_auditoria_updated_at_suspensiones
    BEFORE UPDATE ON Personal_Suspensiones_Servicio
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Trigger: bloquear suspensiones para personal inactivo (dado de baja)
CREATE OR REPLACE FUNCTION fn_validar_suspension()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NOT (SELECT Activo FROM Personal_Sistema WHERE ID_Persona = NEW.ID_Personal) THEN
        RAISE EXCEPTION
            'No se puede suspender al personal inactivo (ID: %). Usar Soft Delete es suficiente.',
            NEW.ID_Personal;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_suspension
    BEFORE INSERT ON Personal_Suspensiones_Servicio
    FOR EACH ROW EXECUTE FUNCTION fn_validar_suspension();


-- ================================================================
-- TABLA: Ninos_Expedientes_Conducta
-- ================================================================
CREATE TABLE Ninos_Expedientes_Conducta (
    ID_Expediente    SERIAL              PRIMARY KEY,
    ID_Nino          INT                 NOT NULL
                                             REFERENCES Ninos(ID_Persona) ON DELETE RESTRICT,
    Fecha            DATE                NOT NULL DEFAULT CURRENT_DATE,
    ID_Turno         INT                 REFERENCES Turnos(ID_Turno),
    ID_Evento        INT                 REFERENCES Eventos(ID_Evento),
    Tipo             tipo_expediente_nino NOT NULL DEFAULT 'Observacion',
    Descripcion      TEXT                NOT NULL,
    ID_Reportado_Por INT                 NOT NULL
                                             REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Resuelto         BOOLEAN             NOT NULL DEFAULT FALSE,
    Notas_Resolucion TEXT,
    Creado_En        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expediente_nino  ON Ninos_Expedientes_Conducta (ID_Nino, Fecha DESC);
CREATE INDEX idx_expediente_tipo  ON Ninos_Expedientes_Conducta (Tipo, Resuelto);


-- ================================================================
-- TABLA: Personal_Expedientes_Evaluacion
-- ================================================================
CREATE TABLE Personal_Expedientes_Evaluacion (
    ID_Evaluacion  SERIAL                   PRIMARY KEY,
    ID_Personal    INT                      NOT NULL
                                                REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Fecha          DATE                     NOT NULL DEFAULT CURRENT_DATE,
    Tipo           tipo_evaluacion          NOT NULL DEFAULT 'Desempeno',
    Descripcion    TEXT                     NOT NULL,
    Resultado      tipo_resultado_evaluacion,
    ID_Evaluador   INT                      NOT NULL
                                                REFERENCES Personal_Sistema(ID_Persona) ON DELETE RESTRICT,
    Notas          TEXT,
    Creado_En      TIMESTAMPTZ              NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evaluacion_personal ON Personal_Expedientes_Evaluacion (ID_Personal, Fecha DESC);
CREATE INDEX idx_evaluacion_tipo     ON Personal_Expedientes_Evaluacion (Tipo, Resultado);


-- ================================================================
-- TRIGGER: Validación de hash bcrypt en Personal_Sistema
-- NOTA v5.1: Previene que passwords en texto plano lleguen a la BD,
-- independientemente de si la capa de aplicación los hashea o no.
-- El formato bcrypt comienza con '$2a$', '$2b$' o '$2y$'.
-- ================================================================
CREATE OR REPLACE FUNCTION fn_validar_hash_bcrypt()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.Password_Hash IS NOT NULL
       AND NEW.Password_Hash NOT SIMILAR TO '\$2[aby]\$%' THEN
        RAISE EXCEPTION
            'Password_Hash debe ser un hash bcrypt válido (debe comenzar con $2a$, $2b$ o $2y$). '
            'Nunca almacenar contraseñas en texto plano.';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_hash_bcrypt
    BEFORE INSERT OR UPDATE OF Password_Hash ON Personal_Sistema
    FOR EACH ROW EXECUTE FUNCTION fn_validar_hash_bcrypt();
```

---

### 6.3 ALTER TABLE — Tablas Existentes

```sql
-- ================================================================
-- A: Personas — nuevos campos de identidad
-- NOTA v5.1: Email eliminado del modelo. Solo Sexo y Cedula se agregan.
-- ================================================================
ALTER TABLE Personas
    ADD COLUMN IF NOT EXISTS Sexo   tipo_sexo   DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Cedula VARCHAR(20) DEFAULT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_personas_cedula
    ON Personas (Cedula) WHERE Cedula IS NOT NULL;

-- ────────────────────────────────────────────────────────────────
-- ÍNDICES FUNCIONALES para vistas predictivas de niños
-- Evitan Full Table Scan en v_ninos_graduacion_mes y
-- v_ninos_transicion_grupo_mes cuando la tabla tiene miles de filas.
-- ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_personas_mes_nac
    ON Personas (EXTRACT(MONTH FROM Fecha_Nacimiento))
    WHERE Fecha_Nacimiento IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_personas_dia_nac
    ON Personas (EXTRACT(DAY FROM Fecha_Nacimiento))
    WHERE Fecha_Nacimiento IS NOT NULL;

-- Migrar Personas.Telefono → Telefonos_Personas
-- NOTA: La migración asigna el primer número disponible como principal,
-- independientemente del orden original de columnas.
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT ID_Persona, 'Casa', Telefono, TRUE
FROM   Personas
WHERE  Telefono IS NOT NULL
ON CONFLICT DO NOTHING;
-- Deprecar columna después de validar:
-- ALTER TABLE Personas DROP COLUMN Telefono;


-- ================================================================
-- B: Personal_Info_Personal — bloque familiar/laboral
-- ================================================================
ALTER TABLE Personal_Info_Personal
    ADD COLUMN IF NOT EXISTS Ocupacion       VARCHAR(150)    DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Centro_Laboral  VARCHAR(150)    DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Nivel_Academico nivel_academico DEFAULT NULL;

-- Migrar Direccion → Personas_Direcciones
INSERT INTO Personas_Direcciones (ID_Persona, Direccion_Exacta, Es_Principal)
SELECT pip.ID_Persona, pip.Direccion, TRUE
FROM   Personal_Info_Personal pip
WHERE  pip.Direccion IS NOT NULL
ON CONFLICT DO NOTHING;
-- Deprecar columna después de validar:
-- ALTER TABLE Personal_Info_Personal DROP COLUMN Direccion;

-- Ampliar constraint de cónyuge para nuevos estados civiles
ALTER TABLE Personal_Info_Personal
    DROP CONSTRAINT IF EXISTS chk_conyuge;
ALTER TABLE Personal_Info_Personal
    ADD CONSTRAINT chk_conyuge
        CHECK (
            Estado_Civil NOT IN
                ('Casado','Acompañado','Union_Libre','Segundo_Matrimonio')
            OR Nombre_Conyuge IS NOT NULL
        );


-- ================================================================
-- C: Personal_Info_Iglesia — bloque eclesiástico ampliado
-- ================================================================

-- Paso 1: añadir nueva columna Estado_Operativo
ALTER TABLE Personal_Info_Iglesia
    ADD COLUMN IF NOT EXISTS Estado_Operativo estado_operativo DEFAULT NULL;

-- Paso 2: migrar datos del campo antiguo
UPDATE Personal_Info_Iglesia
SET Estado_Operativo =
    CASE Estado_Liderazgo
        WHEN 'Lider'   THEN 'Lider'::estado_operativo
        WHEN 'Gap'     THEN 'En_Formacion'::estado_operativo
        WHEN 'Mentor'  THEN 'Lider'::estado_operativo  -- Mentor asciende a Lider por decisión
        ELSE NULL
    END
WHERE Estado_Liderazgo IS NOT NULL;
-- Paso 3: eliminar campo antiguo (después de validar)
-- ALTER TABLE Personal_Info_Iglesia DROP COLUMN Estado_Liderazgo;

-- Nuevas columnas
ALTER TABLE Personal_Info_Iglesia
    ADD COLUMN IF NOT EXISTS Bautizado_Agua             BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Fecha_Bautismo             DATE                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Fecha_Bautismo_Precision   tipo_precision_fecha DEFAULT NULL,
    -- ID_Circulo reemplaza a Circulo_Amistad (VARCHAR libre)
    ADD COLUMN IF NOT EXISTS ID_Circulo                 INT                  DEFAULT NULL
                                                            REFERENCES Circulos_Amistad(ID_Circulo)
                                                            ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS Circulo_Amistad_Desde      DATE                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Circulo_Amistad_Precision  tipo_precision_fecha DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Clases_Biblicas_Ninos      BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Clases_Biblicas_Detalle    TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Capacitacion_Ensenanza     BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Capacitacion_Detalle       TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Observaciones_Espirituales TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ID_Lider                   INT                  DEFAULT NULL
                                                            REFERENCES Personal_Lideres(ID_Lider)
                                                            ON DELETE SET NULL;

-- Migrar Circulo_Amistad (VARCHAR) → Circulos_Amistad (catálogo)
-- Paso 1: crear entradas en el catálogo para cada nombre único existente
INSERT INTO Circulos_Amistad (Nombre)
SELECT DISTINCT TRIM(Circulo_Amistad)
FROM   Personal_Info_Iglesia
WHERE  Circulo_Amistad IS NOT NULL AND TRIM(Circulo_Amistad) <> ''
ON CONFLICT (Nombre) DO NOTHING;

-- Paso 2: asignar el FK
UPDATE Personal_Info_Iglesia pii
SET    ID_Circulo = ca.ID_Circulo
FROM   Circulos_Amistad ca
WHERE  TRIM(pii.Circulo_Amistad) = ca.Nombre
  AND  pii.Circulo_Amistad IS NOT NULL;

-- Paso 3: deprecar columna VARCHAR (después de validar)
-- ALTER TABLE Personal_Info_Iglesia DROP COLUMN Circulo_Amistad;

-- Constraints de integridad
ALTER TABLE Personal_Info_Iglesia
    ADD CONSTRAINT chk_bautismo_precision
        CHECK (Fecha_Bautismo IS NULL OR Fecha_Bautismo_Precision IS NOT NULL),
    ADD CONSTRAINT chk_circulo_precision
        CHECK (Circulo_Amistad_Desde IS NULL OR Circulo_Amistad_Precision IS NOT NULL),
    ADD CONSTRAINT chk_clases_detalle
        CHECK (Clases_Biblicas_Ninos = FALSE OR Clases_Biblicas_Detalle IS NOT NULL),
    ADD CONSTRAINT chk_capacitacion_detalle
        CHECK (Capacitacion_Ensenanza = FALSE OR Capacitacion_Detalle IS NOT NULL);

-- Migración de ID_Mentor (v4 → obsoleto)
-- Paso 1: registrar los mentores en Personal_Lideres
-- INSERT INTO Personas (...) — solo si el mentor no tiene registro en Personas aún
-- INSERT INTO Personal_Lideres (ID_Persona)
--   SELECT DISTINCT pii.ID_Mentor FROM Personal_Info_Iglesia pii WHERE pii.ID_Mentor IS NOT NULL
--   ON CONFLICT DO NOTHING;
-- Paso 2: actualizar ID_Lider con el ID del mentor convertido
-- UPDATE Personal_Info_Iglesia pii
-- SET ID_Lider = pl.ID_Lider
-- FROM Personal_Lideres pl
-- WHERE pl.ID_Persona = pii.ID_Mentor AND pii.ID_Mentor IS NOT NULL;
-- Paso 3: eliminar columna obsoleta
-- ALTER TABLE Personal_Info_Iglesia DROP COLUMN ID_Mentor;


-- ================================================================
-- D: Solicitudes_Personal — snapshot completo del formulario
-- NOTA v5.1: Email eliminado completamente del modelo. No es un dato
-- requerido por el sistema en ningún contexto.
-- ================================================================
ALTER TABLE Solicitudes_Personal
    ADD COLUMN IF NOT EXISTS Sexo_Candidato              tipo_sexo            DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Cedula_Candidato            VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Ocupacion_Candidato         VARCHAR(150)         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Centro_Laboral_Candidato    VARCHAR(150)         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Nivel_Academico_Candidato   nivel_academico      DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Ciudad                  VARCHAR(60)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Municipio               VARCHAR(60)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Distrito                VARCHAR(60)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Barrio                  VARCHAR(60)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Dir_Exacta                  TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Tel_Casa                    VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Tel_Oficina                 VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Tel_Claro                   VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Tel_Movistar                VARCHAR(20)          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Conyuge_Ocupacion           VARCHAR(150)         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Conyuge_Centro_Laboral      VARCHAR(150)         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Bautizado_Agua              BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Fecha_Bautismo              DATE                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Fecha_Bautismo_Precision    tipo_precision_fecha DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Circulo_Amistad_Desde       DATE                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Circulo_Amistad_Precision   tipo_precision_fecha DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Clases_Biblicas_Ninos       BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Clases_Biblicas_Detalle     TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Capacitacion_Ensenanza      BOOLEAN              NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS Capacitacion_Detalle        TEXT                 DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Observaciones_Espirituales_Sol TEXT              DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS Estado_Operativo_Candidato  estado_operativo     DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ID_Lider_Propuesto          INT                  DEFAULT NULL
                                                             REFERENCES Personal_Lideres(ID_Lider)
                                                             ON DELETE SET NULL;


-- Actualizar constraint de cónyuge en Solicitudes_Personal
ALTER TABLE Solicitudes_Personal
    DROP CONSTRAINT IF EXISTS chk_sol_conyuge;
ALTER TABLE Solicitudes_Personal
    ADD CONSTRAINT chk_sol_conyuge
        CHECK (
            Estado_Civil IS NULL
            OR Estado_Civil NOT IN ('Casado','Acompañado','Union_Libre','Segundo_Matrimonio')
            OR Nombre_Conyuge IS NOT NULL
        );

-- Redirigir ID_Mentor_Propuesto (v4 apuntaba a Personal_Sistema → obsoleto)
-- La columna ID_Mentor_Propuesto ya no tiene sentido; renombrar como reserva
-- o eliminar en una ventana de mantenimiento posterior al redespliegue:
-- ALTER TABLE Solicitudes_Personal DROP COLUMN ID_Mentor_Propuesto;


-- ================================================================
-- E: Actualización de fn_propagar_datos_solicitud_aprobada
-- Incluye nuevos campos y tabla Personal_Lideres.
-- NOTA v5.1:
--   - Corrección del teléfono principal: se determina por ROW_NUMBER()
--     sobre el conjunto filtrado (no por número de fila absoluto),
--     garantizando que siempre haya exactamente un Es_Principal = TRUE
--     aunque Tel_Casa sea NULL.
-- ================================================================
CREATE OR REPLACE FUNCTION fn_propagar_datos_solicitud_aprobada()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.Estado = 'Aprobado' AND OLD.Estado = 'Pendiente' THEN

        -- Actualizar datos de identidad en Personas
        UPDATE Personas
        SET
            Sexo   = COALESCE(Personas.Sexo,   NEW.Sexo_Candidato),
            Cedula = COALESCE(Personas.Cedula,  NEW.Cedula_Candidato)
        WHERE ID_Persona = NEW.ID_Persona;

        -- Propagar teléfonos del snapshot
        -- v5.1: ROW_NUMBER() sobre el conjunto ya filtrado determina el principal,
        -- evitando el bug de ningún número marcado como principal cuando Tel_Casa es NULL.
        INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
        SELECT NEW.ID_Persona,
               tipo,
               numero,
               (ROW_NUMBER() OVER (ORDER BY orden) = 1) AS Es_Principal
        FROM (VALUES
            (1, 'Casa'::tipo_telefono,     NEW.Tel_Casa),
            (2, 'Oficina'::tipo_telefono,  NEW.Tel_Oficina),
            (3, 'Claro'::tipo_telefono,    NEW.Tel_Claro),
            (4, 'Movistar'::tipo_telefono, NEW.Tel_Movistar)
        ) AS t(orden, tipo, numero)
        WHERE numero IS NOT NULL
        ON CONFLICT DO NOTHING;

        -- Propagar dirección estructurada
        INSERT INTO Personas_Direcciones (
            ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio,
            Distrito, Barrio, Direccion_Exacta, Es_Principal)
        SELECT NEW.ID_Persona,
               'Residencial',
               NEW.Dir_Ciudad, NEW.Dir_Municipio,
               NEW.Dir_Distrito, NEW.Dir_Barrio,
               NEW.Dir_Exacta, TRUE
        WHERE  NEW.Dir_Exacta IS NOT NULL OR NEW.Dir_Ciudad IS NOT NULL
        ON CONFLICT DO NOTHING;

        -- Propagar a Personal_Info_Personal
        INSERT INTO Personal_Info_Personal (
            ID_Persona, Estado_Civil, Nombre_Conyuge,
            Tiene_Hijos, Numero_Hijos, Direccion,
            Ocupacion, Centro_Laboral, Nivel_Academico)
        SELECT ps.ID_Persona,
               NEW.Estado_Civil, NEW.Nombre_Conyuge,
               NEW.Tiene_Hijos, NEW.Numero_Hijos,
               NEW.Dir_Exacta,
               NEW.Ocupacion_Candidato,
               NEW.Centro_Laboral_Candidato,
               NEW.Nivel_Academico_Candidato
        FROM Personal_Sistema ps
        WHERE ps.ID_Persona = NEW.ID_Persona
          AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO NOTHING;

        -- Propagar a Personal_Info_Iglesia
        INSERT INTO Personal_Info_Iglesia (
            ID_Persona, ID_Red, Estado_Operativo, ID_Lider,
            ID_Circulo, Tiempo_Iglesia_Meses, Ministerio_Adicional,
            Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
            Circulo_Amistad_Desde, Circulo_Amistad_Precision,
            Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
            Capacitacion_Ensenanza, Capacitacion_Detalle,
            Observaciones_Espirituales)
        SELECT ps.ID_Persona,
               NEW.ID_Red,
               NEW.Estado_Operativo_Candidato,
               NEW.ID_Lider_Propuesto,
               -- Circulo_Amistad del snapshot se resuelve por nombre en el catálogo
               (SELECT ID_Circulo FROM Circulos_Amistad
                WHERE TRIM(Nombre) = TRIM(NEW.Circulo_Amistad) LIMIT 1),
               NEW.Tiempo_Iglesia_Meses,
               NEW.Ministerio_Adicional,
               NEW.Bautizado_Agua,
               NEW.Fecha_Bautismo,
               NEW.Fecha_Bautismo_Precision,
               NEW.Circulo_Amistad_Desde,
               NEW.Circulo_Amistad_Precision,
               NEW.Clases_Biblicas_Ninos,
               NEW.Clases_Biblicas_Detalle,
               NEW.Capacitacion_Ensenanza,
               NEW.Capacitacion_Detalle,
               NEW.Observaciones_Espirituales_Sol
        FROM Personal_Sistema ps
        WHERE ps.ID_Persona = NEW.ID_Persona
          AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Persona) DO NOTHING;

        -- Copiar requisitos
        INSERT INTO Personal_Requisitos
            (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido, Notas)
        SELECT ps.ID_Persona,
               sr.ID_Requisito, sr.Cumplido,
               sr.Fecha_Cumplido, sr.Notas
        FROM Solicitudes_Requisitos sr
        JOIN Personal_Sistema ps
          ON ps.ID_Persona = NEW.ID_Persona
         AND ps.ID_Solicitud_Origen = NEW.ID_Solicitud
        ON CONFLICT (ID_Personal, ID_Requisito) DO NOTHING;

    END IF;
    RETURN NEW;
END;
$$;
-- El trigger trg_propagar_datos_solicitud ya existe y apunta automáticamente
-- a la función redefinida.
```

---

### 6.4 Vistas Operativas y Predictivas

```sql
-- ================================================================
-- Vista: v_personal_disponible_servicio
--
-- Lista el personal apto para ser asignado a turnos:
-- debe estar activo Y sin suspensión vigente en la fecha actual.
--
-- NOTA DE AUDITORÍA: La condición de suspensión verifica Activo=TRUE
-- en la suspensión (no levantada manualmente) Y que la fecha actual
-- esté dentro del rango [Fecha_Inicio, Fecha_Fin] o que Fecha_Fin
-- sea NULL (suspensión indefinida).
-- ================================================================
CREATE OR REPLACE VIEW v_personal_disponible_servicio AS
SELECT
    ps.ID_Persona,
    p.Nombres || ' ' || p.Apellidos   AS Nombre_Completo,
    r.Nombre_Rol                       AS Rol,
    ps.Fecha_Ingreso_Servicio
FROM Personal_Sistema ps
JOIN Personas p ON ps.ID_Persona = p.ID_Persona
JOIN Roles    r ON ps.ID_Rol     = r.ID_Rol
WHERE ps.Activo = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM Personal_Suspensiones_Servicio pss
      WHERE pss.ID_Personal   = ps.ID_Persona
        AND pss.Activo        = TRUE
        AND pss.Fecha_Inicio  <= CURRENT_DATE
        AND (pss.Fecha_Fin IS NULL OR pss.Fecha_Fin >= CURRENT_DATE)
  )
ORDER BY r.Nivel_Jerarquico DESC, p.Apellidos, p.Nombres;


-- ================================================================
-- Vista: v_ninos_graduacion_mes
--
-- Lista los niños que cumplen 13 años en el transcurso del año
-- en curso (es decir, salen del rango de grupos al cumplir 13).
-- El límite es 13 porque Grupos cubre hasta 12 años.
--
-- DISEÑO DE RENDIMIENTO:
--   La condición filtra por EXTRACT(YEAR FROM AGE(Fecha_Nacimiento))
--   que no es directamente indexable. La estrategia correcta para
--   tablas grandes es:
--   1. Filtrar primero por rango de Fecha_Nacimiento calculado
--      (permite usar el índice btree sobre Fecha_Nacimiento).
--   2. Luego refinar con EXTRACT(MONTH) apoyado en el índice funcional
--      idx_personas_mes_nac creado en §6.3-A.
--
--   Rango de fechas para niños que cumplen 13 en el año actual:
--     Entre: DATE(EXTRACT(YEAR FROM CURRENT_DATE)-13 || '-01-01')
--     Y:     DATE(EXTRACT(YEAR FROM CURRENT_DATE)-13 || '-12-31')
-- ================================================================
CREATE OR REPLACE VIEW v_ninos_graduacion_mes AS
SELECT
    p.Nombres,
    p.Apellidos,
    p.Fecha_Nacimiento,
    EXTRACT(MONTH FROM p.Fecha_Nacimiento)::INT   AS Mes_Cumpleanos,
    EXTRACT(DAY   FROM p.Fecha_Nacimiento)::INT   AS Dia_Cumpleanos,
    g.Nombre                                       AS Grupo_Actual,
    -- Fecha exacta en que cumple 13 este año
    (DATE_TRUNC('year', CURRENT_DATE)
        + (EXTRACT(MONTH FROM p.Fecha_Nacimiento) - 1 || ' months')::INTERVAL
        + (EXTRACT(DAY   FROM p.Fecha_Nacimiento) - 1 || ' days')::INTERVAL
    )::DATE                                        AS Fecha_Graduacion_Este_Anio,
    -- Indica si ya graduó (para filtrar en el frontend)
    CASE
        WHEN (DATE_TRUNC('year', CURRENT_DATE)
            + (EXTRACT(MONTH FROM p.Fecha_Nacimiento) - 1 || ' months')::INTERVAL
            + (EXTRACT(DAY   FROM p.Fecha_Nacimiento) - 1 || ' days')::INTERVAL
            )::DATE < CURRENT_DATE
        THEN TRUE
        ELSE FALSE
    END                                            AS Ya_Graduo_Este_Anio
FROM Personas p
JOIN Ninos n ON p.ID_Persona = n.ID_Persona
-- Usar rango de Fecha_Nacimiento para aprovechar índice btree
WHERE p.Fecha_Nacimiento BETWEEN
    MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT - 13, 1,  1)
    AND
    MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT - 13, 12, 31)
-- Obtener el grupo actual del niño (última asignación activa)
LEFT JOIN LATERAL (
    SELECT g2.Nombre
    FROM Ninos_Grupos ng
    JOIN Grupos g2 ON ng.ID_Grupo = g2.ID_Grupo
    WHERE ng.ID_Nino = n.ID_Persona
    ORDER BY ng.Fecha_Asignacion DESC
    LIMIT 1
) g ON TRUE
ORDER BY Mes_Cumpleanos, Dia_Cumpleanos;


-- ================================================================
-- Vista: v_ninos_transicion_grupo_mes
--
-- Lista los niños cuya edad proyectada al mes en curso los
-- coloca en un grupo diferente al que tienen asignado actualmente.
-- Permite al coordinador anticipar movimientos de grupo.
--
-- DISEÑO DE RENDIMIENTO:
--   Para determinar el grupo correcto por edad calculamos la edad
--   al primer día del mes actual, lo que es estable durante el mes.
--   En vez de aplicar AGE() sobre toda la tabla, delimitamos
--   primero con un rango de Fecha_Nacimiento usando aritmética de
--   fechas, aprovechando el índice btree sobre Fecha_Nacimiento.
--
--   Niños que pueden estar en transición tienen entre 2 y 12 años.
--   Rango: nacidos entre (hoy - 13 años) y (hoy - 2 años).
-- ================================================================
CREATE OR REPLACE VIEW v_ninos_transicion_grupo_mes AS
WITH edad_calculada AS (
    SELECT
        p.ID_Persona,
        p.Nombres,
        p.Apellidos,
        p.Fecha_Nacimiento,
        -- Edad al 1er día del mes actual (estable durante el mes)
        DATE_PART('year',
            AGE(DATE_TRUNC('month', CURRENT_DATE)::DATE, p.Fecha_Nacimiento)
        )::INT                          AS Edad_Este_Mes
    FROM Personas p
    JOIN Ninos n ON p.ID_Persona = n.ID_Persona
    -- Filtro por rango: niños de 2 a 12 años (aprovecha índice sobre Fecha_Nacimiento)
    WHERE p.Fecha_Nacimiento BETWEEN
        (CURRENT_DATE - INTERVAL '13 years')::DATE
        AND
        (CURRENT_DATE - INTERVAL '2 years')::DATE
),
grupo_asignado AS (
    SELECT DISTINCT ON (ng.ID_Nino)
        ng.ID_Nino,
        ng.ID_Grupo                     AS ID_Grupo_Actual,
        g.Nombre                        AS Nombre_Grupo_Actual,
        g.Edad_Minima,
        g.Edad_Maxima
    FROM Ninos_Grupos ng
    JOIN Grupos g ON ng.ID_Grupo = g.ID_Grupo
    ORDER BY ng.ID_Nino, ng.Fecha_Asignacion DESC
),
grupo_correcto AS (
    SELECT
        ec.ID_Persona,
        g.ID_Grupo                      AS ID_Grupo_Correcto,
        g.Nombre                        AS Nombre_Grupo_Correcto
    FROM edad_calculada ec
    JOIN Grupos g
      ON ec.Edad_Este_Mes >= g.Edad_Minima
     AND ec.Edad_Este_Mes <= g.Edad_Maxima
     AND g.Activo = TRUE
)
SELECT
    ec.Nombres,
    ec.Apellidos,
    ec.Fecha_Nacimiento,
    ec.Edad_Este_Mes,
    ga.Nombre_Grupo_Actual             AS Grupo_Actual,
    gc.Nombre_Grupo_Correcto           AS Grupo_Sugerido,
    CASE
        WHEN ga.ID_Grupo_Actual IS NULL          THEN 'Sin_Asignacion'
        WHEN gc.ID_Grupo_Correcto IS NULL        THEN 'Fuera_De_Rango'
        WHEN ga.ID_Grupo_Actual <> gc.ID_Grupo_Correcto THEN 'Debe_Transicionar'
        ELSE 'En_Grupo_Correcto'
    END                                AS Estado_Transicion
FROM edad_calculada ec
LEFT JOIN grupo_asignado ga ON ec.ID_Persona = ga.ID_Nino
LEFT JOIN grupo_correcto  gc ON ec.ID_Persona = gc.ID_Persona
WHERE
    -- Solo mostrar los que realmente necesitan atención
    ga.ID_Grupo_Actual IS NULL
    OR gc.ID_Grupo_Correcto IS NULL
    OR ga.ID_Grupo_Actual <> gc.ID_Grupo_Correcto
ORDER BY ec.Edad_Este_Mes DESC, ec.Apellidos;


-- ================================================================
-- Vista: v_perfil_completo_personal
-- Perfil unificado con todos los bloques del formulario.
-- ================================================================
CREATE OR REPLACE VIEW v_perfil_completo_personal AS
SELECT
    ps.ID_Persona,
    p.Nombres || ' ' || p.Apellidos    AS Nombre_Completo,
    p.Sexo,
    p.Cedula,
    p.Fecha_Nacimiento,
    DATE_PART('year', AGE(CURRENT_DATE, p.Fecha_Nacimiento))::INT AS Edad,
    r.Nombre_Rol                        AS Rol,
    ps.Activo,
    -- Dirección principal
    pd.Ciudad_Departamento,
    pd.Municipio,
    pd.Distrito,
    pd.Barrio,
    pd.Direccion_Exacta,
    -- Teléfono principal
    tp.Numero                           AS Telefono_Principal,
    tp.Tipo                             AS Tipo_Telefono_Principal,
    -- Info personal
    pip.Estado_Civil,
    pip.Nombre_Conyuge,
    pip.Tiene_Hijos,
    pip.Numero_Hijos,
    pip.Ocupacion,
    pip.Centro_Laboral,
    pip.Nivel_Academico,
    -- Info iglesia
    pii.Bautizado_Agua,
    pii.Fecha_Bautismo,
    pii.Estado_Operativo,
    rd.Nombre                           AS Red,
    pii.Circulo_Amistad,
    pii.Circulo_Amistad_Desde,
    pii.Tiempo_Iglesia_Meses,
    pii.Ministerio_Adicional,
    pii.Clases_Biblicas_Ninos,
    pii.Capacitacion_Ensenanza,
    pii.Observaciones_Espirituales,
    -- Líder actual
    pl.ID_Lider,
    p_lider.Nombres || ' ' || p_lider.Apellidos AS Nombre_Lider,
    tp_lider.Numero                     AS Tel_Lider,
    -- Suspensión activa
    CASE WHEN sus.ID_Suspension IS NOT NULL THEN TRUE ELSE FALSE END AS En_Suspension,
    sus.Fecha_Inicio                    AS Suspension_Desde,
    sus.Fecha_Fin                       AS Suspension_Hasta,
    sus.Motivo                          AS Motivo_Suspension
FROM Personal_Sistema ps
JOIN  Personas p              ON ps.ID_Persona = p.ID_Persona
JOIN  Roles    r              ON ps.ID_Rol      = r.ID_Rol
LEFT JOIN Personal_Info_Personal pip ON ps.ID_Persona = pip.ID_Persona
LEFT JOIN Personal_Info_Iglesia  pii ON ps.ID_Persona = pii.ID_Persona
LEFT JOIN Redes rd                   ON pii.ID_Red    = rd.ID_Red
LEFT JOIN Personal_Lideres pl        ON pii.ID_Lider  = pl.ID_Lider
LEFT JOIN Personas p_lider           ON pl.ID_Persona = p_lider.ID_Persona
LEFT JOIN Telefonos_Personas tp_lider
       ON p_lider.ID_Persona   = tp_lider.ID_Persona
      AND tp_lider.Es_Principal = TRUE AND tp_lider.Activo = TRUE
LEFT JOIN Personas_Direcciones pd
       ON ps.ID_Persona   = pd.ID_Persona
      AND pd.Es_Principal = TRUE AND pd.Activo = TRUE
LEFT JOIN Telefonos_Personas tp
       ON ps.ID_Persona   = tp.ID_Persona
      AND tp.Es_Principal = TRUE AND tp.Activo = TRUE
-- Suspensión vigente (si existe)
LEFT JOIN LATERAL (
    SELECT ID_Suspension, Fecha_Inicio, Fecha_Fin, Motivo
    FROM Personal_Suspensiones_Servicio pss
    WHERE pss.ID_Personal  = ps.ID_Persona
      AND pss.Activo       = TRUE
      AND pss.Fecha_Inicio <= CURRENT_DATE
      AND (pss.Fecha_Fin IS NULL OR pss.Fecha_Fin >= CURRENT_DATE)
    LIMIT 1
) sus ON TRUE
ORDER BY p.Apellidos, p.Nombres;


-- ================================================================
-- Vista: v_solicitud_formulario_completo
-- Reconstruye el formulario físico desde el snapshot de la solicitud.
-- ================================================================
CREATE OR REPLACE VIEW v_solicitud_formulario_completo AS
SELECT
    sp.ID_Solicitud,
    sp.Fecha_Solicitud::DATE              AS Fecha_Formulario,
    p.Nombres || ' ' || p.Apellidos       AS Candidato,
    sp.Sexo_Candidato                     AS Sexo,
    sp.Cedula_Candidato                   AS Cedula,
    p.Fecha_Nacimiento,
    sp.Tel_Casa, sp.Tel_Oficina, sp.Tel_Claro, sp.Tel_Movistar,
    sp.Dir_Ciudad, sp.Dir_Municipio, sp.Dir_Distrito,
    sp.Dir_Barrio, sp.Dir_Exacta,
    sp.Ocupacion_Candidato,
    sp.Centro_Laboral_Candidato,
    sp.Nivel_Academico_Candidato          AS Nivel_Academico,
    sp.Estado_Civil,
    sp.Nombre_Conyuge,
    sp.Conyuge_Ocupacion,
    sp.Conyuge_Centro_Laboral,
    sp.Bautizado_Agua,
    sp.Fecha_Bautismo,
    sp.Fecha_Bautismo_Precision,
    sp.Circulo_Amistad,
    sp.Circulo_Amistad_Desde,
    sp.Clases_Biblicas_Ninos,
    sp.Clases_Biblicas_Detalle,
    sp.Capacitacion_Ensenanza,
    sp.Capacitacion_Detalle,
    sp.Observaciones_Espirituales_Sol     AS Observaciones_Espirituales,
    sp.Estado_Operativo_Candidato,
    r_sol.Nombre_Rol                      AS Rol_Solicitado,
    sp.Estado,
    -- Líder propuesto (JOIN directo a Personal_Lideres → Personas)
    p_lider.Nombres || ' ' || p_lider.Apellidos AS Lider_Propuesto,
    tp_lider.Numero                       AS Tel_Lider,
    -- Gestionado por
    p_staff.Nombres || ' ' || p_staff.Apellidos AS Gestionado_Por,
    sp.Notas_Staff,
    sp.Notas_Coordinador
FROM Solicitudes_Personal sp
JOIN Personas p                   ON sp.ID_Persona        = p.ID_Persona
JOIN Roles r_sol                  ON sp.ID_Rol_Solicitado = r_sol.ID_Rol
JOIN Personal_Sistema ps_staff    ON sp.ID_Gestionado_Por = ps_staff.ID_Persona
JOIN Personas p_staff             ON ps_staff.ID_Persona  = p_staff.ID_Persona
LEFT JOIN Personal_Lideres pl     ON sp.ID_Lider_Propuesto = pl.ID_Lider
LEFT JOIN Personas p_lider        ON pl.ID_Persona         = p_lider.ID_Persona
LEFT JOIN Telefonos_Personas tp_lider
       ON p_lider.ID_Persona    = tp_lider.ID_Persona
      AND tp_lider.Es_Principal = TRUE AND tp_lider.Activo = TRUE
ORDER BY sp.Fecha_Solicitud DESC;
```

---

## 7. Integridad Referencial y Cascadas

### Políticas de eliminación adoptadas

| Relación | ON DELETE | Justificación |
|---|---|---|
| `Telefonos_Personas → Personas` | CASCADE | Los teléfonos no tienen existencia independiente |
| `Personas_Direcciones → Personas` | CASCADE | Las direcciones no tienen existencia independiente |
| `Relaciones_Personas → Personas` | RESTRICT | No eliminar persona con vínculos familiares activos |
| `Personal_Lideres → Personas` | RESTRICT | Un líder con supervisados no puede eliminarse |
| `Personal_Info_Iglesia.ID_Lider → Personal_Lideres` | SET NULL | Si se elimina un líder, el campo queda NULL; no rompe el perfil |
| `Personal_Historial_Roles → Personal_Sistema` | RESTRICT | Preservar trazabilidad de ascensos |
| `Personal_Suspensiones_Servicio → Personal_Sistema` | RESTRICT | No borrar personal con historial de suspensiones |
| `Ninos_Expedientes_Conducta → Personal_Sistema` (reportador) | RESTRICT | Auditoría: el reportador no puede ser borrado |
| `Ninos_Expedientes_Conducta → Ninos` | RESTRICT | El expediente pertenece al niño; Soft Delete del niño primero |
| `Personal_Expedientes_Evaluacion → Personal_Sistema` | RESTRICT | Ambas FKs (evaluado y evaluador) protegidas |

### Reglas de negocio reforzadas por constraints

| Regla | Implementación |
|---|---|
| Hard Delete prohibido en producción | Política de desarrollo + Soft Delete (`Activo = FALSE`) |
| Suspensión solo para personal activo | Trigger `trg_validar_suspension` |
| Ascenso siempre auditado | Trigger `trg_auditoria_cambio_rol` |
| Única ficha principal activa por persona | `UNIQUE INDEX` parcial en `Telefonos_Personas` y `Personas_Direcciones` |
| Cédula única cuando está registrada | `UNIQUE INDEX` parcial `WHERE Cedula IS NOT NULL` |
| Cónyuge requerido en estados civiles de pareja | Constraint `chk_conyuge` ampliado |
| Fecha de bautismo requiere precisión | `CHECK (Fecha_Bautismo IS NULL OR Fecha_Bautismo_Precision IS NOT NULL)` |
| Estado_Operativo = 'Lider' no requiere mentor | Figura del Mentor eliminada del modelo |

### Índices de rendimiento

```sql
-- Identidad
CREATE UNIQUE INDEX uq_personas_cedula      ON Personas (Cedula)  WHERE Cedula IS NOT NULL;
-- Vistas predictivas (evitan Full Table Scan)
CREATE INDEX idx_personas_mes_nac ON Personas (EXTRACT(MONTH FROM Fecha_Nacimiento))
    WHERE Fecha_Nacimiento IS NOT NULL;
CREATE INDEX idx_personas_dia_nac ON Personas (EXTRACT(DAY FROM Fecha_Nacimiento))
    WHERE Fecha_Nacimiento IS NOT NULL;

-- Teléfono y dirección principales
CREATE UNIQUE INDEX uq_un_principal_activo ON Telefonos_Personas (ID_Persona)
    WHERE Es_Principal = TRUE AND Activo = TRUE;
CREATE UNIQUE INDEX uq_una_dir_principal   ON Personas_Direcciones (ID_Persona)
    WHERE Es_Principal = TRUE AND Activo = TRUE;

-- Suspensiones vigentes (acceso frecuente en v_personal_disponible_servicio)
CREATE INDEX idx_suspensiones_vigentes ON Personal_Suspensiones_Servicio
    (ID_Personal, Activo, Fecha_Inicio, Fecha_Fin)
    WHERE Activo = TRUE;

-- Historial de roles
CREATE INDEX idx_historial_personal ON Personal_Historial_Roles
    (ID_Personal, Fecha_Cambio DESC);

-- Expedientes
CREATE INDEX idx_expediente_nino_activo ON Ninos_Expedientes_Conducta
    (ID_Nino, Resuelto) WHERE Resuelto = FALSE;
```

---

## 8. Resumen de Cambios v4 → v5

### Nuevos objetos

| Tipo | Nombre | Propósito |
|---|---|---|
| ENUM | `tipo_sexo` | Sexo del candidato |
| ENUM | `tipo_telefono` | Clasificación de números telefónicos |
| ENUM | `nivel_academico` | Nivel de estudios |
| ENUM | `tipo_relacion_persona` | Vínculo familiar entre personas |
| ENUM | `tipo_precision_fecha` | Precisión de fechas parciales |
| ENUM | `estado_operativo` | Estado formativo del personal (reemplaza `estado_liderazgo`) |
| ENUM | `tipo_expediente_nino` | Tipo de incidente en expediente de niño |
| ENUM | `tipo_evaluacion` | Tipo de evaluación de personal |
| ENUM | `tipo_resultado_evaluacion` | Resultado de evaluación |
| ALTER ENUM | `estado_civil` | +5 nuevos valores del formulario |
| TABLE | `Telefonos_Personas` | Teléfonos múltiples normalizados |
| TABLE | `Personas_Direcciones` | Domicilios estructurados |
| TABLE | `Relaciones_Personas` | Vínculos familiares (cónyuge, etc.) |
| TABLE | `Personal_Lideres` | Catálogo de líderes espirituales |
| TABLE | `Personal_Historial_Roles` | Auditoría de ascensos |
| TABLE | `Personal_Suspensiones_Servicio` | Inhabilitación temporal del personal |
| TABLE | `Ninos_Expedientes_Conducta` | Incidentes y observaciones de niños |
| TABLE | `Personal_Expedientes_Evaluacion` | Evaluaciones formales del personal |
| FUNCTION | `fn_registrar_conyuge()` | Helper bidireccional para cónyuge |
| FUNCTION | `fn_auditoria_cambio_rol()` | Registra automáticamente ascensos |
| FUNCTION | `fn_validar_suspension()` | Bloquea suspensiones de personal inactivo |
| TRIGGER | `trg_auditoria_cambio_rol` | Dispara en UPDATE de ID_Rol |
| TRIGGER | `trg_validar_suspension` | Dispara en INSERT en Suspensiones |
| VIEW | `v_personal_disponible_servicio` | Personal activo sin suspensión vigente |
| VIEW | `v_ninos_graduacion_mes` | Niños que cumplen 13 este año |
| VIEW | `v_ninos_transicion_grupo_mes` | Niños que deben cambiar de grupo |
| VIEW | `v_perfil_completo_personal` | Perfil unificado con líder y suspensión |
| VIEW | `v_solicitud_formulario_completo` | Reconstrucción del formulario físico |

### Tablas modificadas

| Tabla | Cambios principales |
|---|---|
| `Personas` | + `Sexo`, `Cedula` + índices funcionales para fechas |
| `Personal_Info_Personal` | + `Ocupacion`, `Centro_Laboral`, `Nivel_Academico` |
| `Personal_Info_Iglesia` | + `Estado_Operativo` (reemplaza `Estado_Liderazgo`), + campos bautismo/círculo/experiencia, + `ID_Lider` |
| `Solicitudes_Personal` | + 25 columnas snapshot; `ID_Lider_Propuesto` → `Personal_Lideres` |

### Columnas deprecadas

| Tabla | Columna | Reemplazada por |
|---|---|---|
| `Personas` | `Telefono` | `Telefonos_Personas` |
| `Personal_Info_Personal` | `Direccion` | `Personas_Direcciones` |
| `Personal_Info_Iglesia` | `Estado_Liderazgo` | `Estado_Operativo` (ENUM `estado_operativo`) |
| `Personal_Info_Iglesia` | `ID_Mentor` | Eliminado (figura del Mentor eliminada del modelo) |
| `Solicitudes_Personal` | `ID_Mentor_Propuesto` | Eliminado |

### Constraints añadidos (post-revisión)

| Constraint | Tabla | Propósito |
|---|---|---|

### Protocolos corregidos (post-revisión)

| Sección | Corrección |
|---|---|
| §10.5 — Transición de grupo | Protocolo de `Ninos_Grupos` reescrito: cierra asignación anterior (`Activo = FALSE`) antes de insertar la nueva; `ON CONFLICT DO UPDATE` en lugar de `DO NOTHING` |
| §10.5 — Vista materializada | Índice de `mv_ninos_transicion_grupo_mes` corregido a `(ID_Persona)` — consistente con D21 |

### Triggers actualizados

| Trigger | Cambio |
|---|---|
| `trg_propagar_datos_solicitud` | Función reescrita para propagar todos los campos nuevos: teléfonos, direcciones, `Estado_Operativo`, `ID_Lider` |

---

## 9. Arranque en Frío — Data Seeding

Este script es para **entornos nuevos o restauraciones** donde existe personal preexistente que debe ingresarse sin pasar por el flujo de `Solicitudes_Personal`. Se ejecuta **una sola vez** en un bloque transaccional. El trigger de autorización se deshabilita temporalmente para crear el superusuario semilla.

```sql
-- ================================================================
-- DATA SEEDING — ARRANQUE EN FRÍO
-- Sistema de Gestión Infantil v5
--
-- INSTRUCCIONES:
--   1. Ejecutar COMPLETO en una sola transacción.
--   2. No ejecutar en producción con datos existentes sin revisar
--      primero los IDs semilla.
--   3. Sustituir los valores entre <> con los datos reales antes
--      de ejecutar.
--   4. Este script asume que la BD ya tiene el esquema v5 aplicado.
-- ================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────
-- FASE 1: CREAR EL SUPERUSUARIO SEMILLA (COORDINADOR GENERAL)
--
-- El trigger trg_validar_autorizacion_staff verifica la jerarquía
-- del creador. Para el primer usuario no existe creador, por lo que
-- se deshabilita el trigger temporalmente en esta sesión.
-- ────────────────────────────────────────────────────────────────

-- Deshabilitar el trigger de autorización SOLO en esta sesión
ALTER TABLE Personal_Sistema DISABLE TRIGGER trg_validar_autorizacion_staff;

-- Paso 1a: registrar la persona base del Coordinador General
INSERT INTO Personas (Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES ('<Nombres>', '<Apellidos>', '<Telefono>', '<YYYY-MM-DD>')
RETURNING ID_Persona;
-- ↑ Anotar el ID_Persona devuelto; se usa abajo como :id_coord

-- Paso 1b: crear el usuario en Personal_Sistema
-- (ID_Creado_Por e ID_Autorizado_Por son NULL en el superusuario semilla)
INSERT INTO Personal_Sistema (
    ID_Persona,
    ID_Rol,
    Usuario,
    Password_Hash,
    Fecha_Ingreso_Servicio,
    Activo,
    ID_Creado_Por,
    ID_Autorizado_Por
)
VALUES (
    :id_coord,
    (SELECT ID_Rol FROM Roles WHERE Nombre_Rol = 'Coordinador General'),
    '<usuario_coord>',
    '<hash_bcrypt>',       -- Generar con la capa de aplicación; NUNCA texto plano
    CURRENT_DATE,
    TRUE,
    NULL,                  -- Sin creador (superusuario semilla)
    NULL
);

-- Paso 1c: registrar primer rol en el historial
INSERT INTO Personal_Historial_Roles (
    ID_Personal, ID_Rol_Anterior, ID_Rol_Nuevo, ID_Autorizado_Por, Notas)
VALUES (
    :id_coord,
    NULL,
    (SELECT ID_Rol FROM Roles WHERE Nombre_Rol = 'Coordinador General'),
    :id_coord,             -- Se auto-autoriza en el arranque en frío
    'Registro inicial — Data Seeding de arranque en frío'
);

-- Reactivar el trigger
ALTER TABLE Personal_Sistema ENABLE TRIGGER trg_validar_autorizacion_staff;


-- ────────────────────────────────────────────────────────────────
-- FASE 2: INSERTAR PERSONAL PREEXISTENTE
--
-- El Coordinador General ya está creado. A partir de aquí todos
-- los INSERT en Personal_Sistema incluyen ID_Creado_Por = :id_coord
-- y el trigger de autorización funciona normalmente.
--
-- Repetir el bloque A + B + C por cada miembro preexistente.
-- ────────────────────────────────────────────────────────────────

-- ── Miembro preexistente #1 ──────────────────────────────────────

-- A: Persona base
INSERT INTO Personas (Nombres, Apellidos, Telefono, Fecha_Nacimiento, Sexo, Cedula)
VALUES ('<Nombres>', '<Apellidos>', '<Telefono>', '<YYYY-MM-DD>',
        '<Masculino|Femenino|Otro>'::tipo_sexo, '<Cedula>')
RETURNING ID_Persona;
-- ↑ Anotar como :id_p1

-- B: Personal_Sistema
-- Para Staff o Maestro creados por el Coordinador, el trigger
-- ya no necesita ser deshabilitado.
INSERT INTO Personal_Sistema (
    ID_Persona, ID_Rol, Usuario, Password_Hash,
    Fecha_Ingreso_Servicio, Activo, ID_Creado_Por, ID_Autorizado_Por)
VALUES (
    :id_p1,
    (SELECT ID_Rol FROM Roles WHERE Nombre_Rol = '<Colaborador|Maestro|Staff>'),
    '<usuario>',
    '<hash_bcrypt>',
    '<YYYY-MM-DD>',
    TRUE,
    :id_coord,
    :id_coord
);

-- C: Perfil Personal
INSERT INTO Personal_Info_Personal (
    ID_Persona, Estado_Civil, Nombre_Conyuge,
    Tiene_Hijos, Numero_Hijos, Ocupacion, Centro_Laboral, Nivel_Academico)
VALUES (
    :id_p1,
    '<estado_civil>'::estado_civil,
    '<Nombre_Conyuge_o_NULL>',
    FALSE, NULL,
    '<Ocupacion>', '<Centro_Laboral>',
    '<nivel_academico>'::nivel_academico
);

-- D: Perfil Iglesia
INSERT INTO Personal_Info_Iglesia (
    ID_Persona, ID_Red, Estado_Operativo, ID_Lider,
    Circulo_Amistad, Tiempo_Iglesia_Meses,
    Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision)
VALUES (
    :id_p1,
    (SELECT ID_Red FROM Redes WHERE Nombre = '<Nombre_Red>'),
    '<Lider|En_Formacion>'::estado_operativo,
    (SELECT ID_Lider FROM Personal_Lideres WHERE ID_Persona = :id_lider),
    '<Circulo_Amistad_o_NULL>',
    <meses_en_iglesia>,
    <TRUE|FALSE>,
    '<YYYY-MM-DD>',
    '<Dia|Mes|Ano>'::tipo_precision_fecha
);

-- E: Historial de roles (primer ingreso)
INSERT INTO Personal_Historial_Roles (
    ID_Personal, ID_Rol_Anterior, ID_Rol_Nuevo, ID_Autorizado_Por, Notas)
VALUES (
    :id_p1, NULL,
    (SELECT ID_Rol FROM Roles WHERE Nombre_Rol = '<rol>'),
    :id_coord,
    'Registro inicial — Data Seeding'
);

-- F: Teléfonos adicionales (si aplica)
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
VALUES
    (:id_p1, 'Casa',    '<tel_casa>',    TRUE),
    (:id_p1, 'Claro',   '<tel_claro>',   FALSE),
    (:id_p1, 'Movistar','<tel_movistar>',FALSE);

-- G: Dirección
INSERT INTO Personas_Direcciones (
    ID_Persona, Ciudad_Departamento, Municipio,
    Distrito, Barrio, Direccion_Exacta, Es_Principal)
VALUES (
    :id_p1,
    '<Ciudad_Departamento>', '<Municipio>',
    '<Distrito>', '<Barrio>',
    '<Direccion_Exacta>', TRUE
);

-- Repetir bloque A–G para cada miembro preexistente adicional...


-- ────────────────────────────────────────────────────────────────
-- FASE 3: VERIFICACIÓN POST-SEEDING
-- ────────────────────────────────────────────────────────────────

-- Verificar que el trigger está activo
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'trg_validar_autorizacion_staff';
-- Resultado esperado: tgenabled = 'O' (Origin)

-- Verificar que no hay Personal_Sistema sin perfil
SELECT ps.ID_Persona, p.Nombres
FROM   Personal_Sistema ps
JOIN   Personas p ON ps.ID_Persona = p.ID_Persona
WHERE  NOT EXISTS (
    SELECT 1 FROM Personal_Info_Personal pip WHERE pip.ID_Persona = ps.ID_Persona
)
   OR  NOT EXISTS (
    SELECT 1 FROM Personal_Info_Iglesia  pii WHERE pii.ID_Persona = ps.ID_Persona
);
-- Resultado esperado: 0 filas

-- Verificar historial de roles completo
SELECT ps.ID_Persona, COUNT(phr.ID_Historial) AS entradas_historial
FROM   Personal_Sistema ps
LEFT JOIN Personal_Historial_Roles phr ON ps.ID_Persona = phr.ID_Personal
GROUP BY ps.ID_Persona
HAVING COUNT(phr.ID_Historial) = 0;
-- Resultado esperado: 0 filas (todo el personal tiene al menos 1 entrada)

COMMIT;
```

---

## 10. Manual de Protocolos Operativos

Este manual está dirigido a los equipos de **Backend y Frontend** que consumen el esquema v5. Explica cómo operar los flujos más complejos correctamente.

---

### 10.1 Política Universal: Soft Delete

**Regla de oro:** Nunca emitir `DELETE FROM Personal_Sistema WHERE ...` ni `DELETE FROM Ninos WHERE ...` ni ninguna tabla que sea referenciada por otras.

```sql
-- ✅ CORRECTO — dar de baja a un miembro del personal
UPDATE Personal_Sistema SET Activo = FALSE WHERE ID_Persona = :id;

-- ✅ CORRECTO — dar de baja a un niño
-- (No hay columna Activo en Ninos; el soft delete se hace en Personas si aplica,
--  o simplemente dejando de asignarle asistencias)

-- ❌ INCORRECTO — rompe FKs en asistencias, expedientes, historial
DELETE FROM Personal_Sistema WHERE ID_Persona = :id;
```

Si el motor lanza un error de FK al intentar borrar, es una señal de que hay datos históricos vinculados. La respuesta correcta es el Soft Delete, no desactivar el constraint.

---

### 10.2 Flujo de Suspensión de un Maestro

Una suspensión inhabilita operativamente a un miembro **sin** romper su relación como líder de otras personas ni su historial espiritual.

**Pasos para el backend:**

```sql
-- 1. Registrar la suspensión
INSERT INTO Personal_Suspensiones_Servicio
    (ID_Personal, Fecha_Inicio, Fecha_Fin, Motivo, ID_Registrado_Por)
VALUES (:id_personal, CURRENT_DATE, :fecha_fin_o_null, :motivo, :id_quien_registra);

-- 2. Para listar asignaciones de turno disponibles, usar SIEMPRE:
SELECT * FROM v_personal_disponible_servicio;
-- Esta vista ya filtra activos Y sin suspensión vigente.

-- 3. Levantar la suspensión antes de tiempo:
UPDATE Personal_Suspensiones_Servicio
SET    Activo = FALSE
WHERE  ID_Personal = :id_personal
  AND  Activo = TRUE;
```

**Lo que NO cambia durante una suspensión:**
- `Personal_Sistema.Activo` permanece `TRUE`.
- El miembro sigue apareciendo como líder en `Personal_Info_Iglesia.ID_Lider` de sus supervisados.
- Su historial de expedientes y evaluaciones se mantiene intacto.

---

### 10.3 Flujo de Ascenso de Rol

```sql
-- Establecer el autorizador en la sesión actual (requerido por el trigger)
SET LOCAL app.id_autorizador = '<id_coordinador>';

-- Ejecutar el ascenso
UPDATE Personal_Sistema
SET ID_Rol = (SELECT ID_Rol FROM Roles WHERE Nombre_Rol = 'Maestro')
WHERE ID_Persona = :id_personal;

-- El trigger trg_auditoria_cambio_rol registra automáticamente en
-- Personal_Historial_Roles. No se requiere INSERT manual.
```

El frontend debe exponer el historial de roles en el perfil del miembro consultando:
```sql
SELECT phr.Fecha_Cambio, r_ant.Nombre_Rol AS De, r_nuevo.Nombre_Rol AS A,
       p_aut.Nombres || ' ' || p_aut.Apellidos AS Autorizado_Por, phr.Notas
FROM Personal_Historial_Roles phr
LEFT JOIN Roles r_ant             ON phr.ID_Rol_Anterior  = r_ant.ID_Rol
JOIN      Roles r_nuevo           ON phr.ID_Rol_Nuevo     = r_nuevo.ID_Rol
JOIN      Personal_Sistema ps_aut ON phr.ID_Autorizado_Por = ps_aut.ID_Persona
JOIN      Personas p_aut          ON ps_aut.ID_Persona    = p_aut.ID_Persona
WHERE phr.ID_Personal = :id_personal
ORDER BY phr.Fecha_Cambio DESC;
```

---

### 10.4 Suplencias y Cross-Shift

Un maestro puede dar clases en un turno o grupo distinto al oficial. El esquema lo soporta sin cambios de estructura:

**Caso A — Suplencia puntual (no modifica asignaciones permanentes):**
El staff simplemente registra la asistencia del maestro en `Asistencia_Maestros` con el turno y grupo del día. No se requiere ningún INSERT previo en `Personal_Grupos`. La vista `v_cumplimiento_personal` refleja esta asistencia automáticamente.

**Caso B — Asignación cruzada permanente (el maestro cubre dos turnos regularmente):**
```sql
-- Añadir la segunda asignación; la PK (ID_Personal, ID_Grupo, ID_Turno) lo permite
INSERT INTO Personal_Grupos (ID_Personal, ID_Grupo, ID_Turno)
VALUES (:id_personal, :id_grupo_nuevo, :id_turno_nuevo);
```

**Regla de consulta para el frontend:** Al mostrar quién está disponible para asignar a un turno, filtrar `v_personal_disponible_servicio` y luego cruzar con `Personal_Turnos` para los asignados habituales. Los maestros sin asignación en `Personal_Turnos` para ese turno pueden considerarse suplentes disponibles.

---

### 10.5 Consumo de Vistas Predictivas de Niños

#### `v_ninos_graduacion_mes` — Alerta de Egreso

Esta vista lista los niños que cumplen 13 años en el año en curso. El campo `Ya_Graduo_Este_Anio` permite al frontend distinguir entre "graduará próximamente" y "ya graduó".

**Casos de uso recomendados:**
- **Dashboard mensual:** ejecutar al inicio de cada mes; mostrar una alerta si hay niños con `Fecha_Graduacion_Este_Anio` en el mes actual.
- **Badge de atención:** si `Ya_Graduo_Este_Anio = FALSE` y `Mes_Cumpleanos = EXTRACT(MONTH FROM CURRENT_DATE)`, mostrar un indicador de "se gradúa este mes".
- **Reporte anual de egreso:** consumir sin filtros para obtener todos los niños que egresan en el año.

```sql
-- Niños que se gradúan este mes (para alerta inmediata)
SELECT * FROM v_ninos_graduacion_mes
WHERE Mes_Cumpleanos = EXTRACT(MONTH FROM CURRENT_DATE)
  AND Ya_Graduo_Este_Anio = FALSE;

-- Total de egresos del año
SELECT COUNT(*), Ya_Graduo_Este_Anio
FROM v_ninos_graduacion_mes
GROUP BY Ya_Graduo_Este_Anio;
```

#### `v_ninos_transicion_grupo_mes` — Alerta de Cambio de Grupo

Esta vista calcula si cada niño está en el grupo correcto según su edad proyectada al mes actual. Solo devuelve filas donde hay una discrepancia.

**Columna `Estado_Transicion`:**
| Valor | Significado | Acción sugerida |
|---|---|---|
| `Debe_Transicionar` | Edad ya corresponde al grupo siguiente | Mover de grupo; confirmar con coordinador |
| `Fuera_De_Rango` | Edad fuera de todos los grupos (≥13 o <2) | Revisar si debe egresar o si hay error de datos |
| `Sin_Asignacion` | El niño no tiene grupo asignado | Asignar grupo inmediatamente |

**Casos de uso recomendados:**
- **Al inicio de cada mes:** ejecutar y notificar al coordinador la lista de transiciones pendientes.
- **Al registrar asistencia de un niño nuevo:** verificar si ya existe en esta vista antes de asignarle grupo manualmente.
- **Acción de transición en el backend:**

```sql
-- Confirmar transición de un niño al grupo correcto
-- IMPORTANTE: Se debe cerrar primero la asignación anterior antes de insertar
-- la nueva. Sin este paso, el niño quedaría activo en dos grupos simultáneamente
-- y v_ninos_transicion_grupo_mes nunca lo mostraría como resuelto, porque
-- DISTINCT ON ... ORDER BY Fecha_Asignacion DESC puede seguir tomando el grupo
-- viejo si la nueva inserción falla silenciosamente con ON CONFLICT DO NOTHING.

-- Paso 1: Cerrar la asignación actual (marcar Fecha_Fin si la tabla lo soporta,
-- o marcar Activo = FALSE si la columna existe — ajustar según el esquema real
-- de Ninos_Grupos en producción).
UPDATE Ninos_Grupos
SET    Activo = FALSE
WHERE  ID_Nino = :id_nino
  AND  Activo  = TRUE
  AND  ID_Grupo <> (
      SELECT ID_Grupo FROM Grupos
      WHERE  Edad_Minima <= :edad_actual
        AND  Edad_Maxima >= :edad_actual
        AND  Activo = TRUE
      LIMIT 1
  );

-- Paso 2: Insertar la nueva asignación.
-- ON CONFLICT actualiza Fecha_Asignacion para reactivar si el niño ya estuvo
-- en ese grupo antes (p.ej. regreso tras excepción), en vez de silenciar la op.
INSERT INTO Ninos_Grupos (ID_Nino, ID_Grupo, Es_Excepcion, Fecha_Asignacion, Activo)
VALUES (
    :id_nino,
    (SELECT ID_Grupo FROM Grupos
     WHERE Edad_Minima <= :edad_actual AND Edad_Maxima >= :edad_actual AND Activo = TRUE
     LIMIT 1),
    FALSE,
    CURRENT_DATE,
    TRUE
)
ON CONFLICT (ID_Nino, ID_Grupo)
    DO UPDATE SET Fecha_Asignacion = EXCLUDED.Fecha_Asignacion,
                  Activo           = TRUE;
```

> **Nota de esquema:** Este flujo asume que `Ninos_Grupos` tiene una columna `Activo BOOLEAN`. Si la tabla no la tiene aún, agregar `ALTER TABLE Ninos_Grupos ADD COLUMN Activo BOOLEAN NOT NULL DEFAULT TRUE;` antes de ejecutar la migración. Sin esa columna no es posible distinguir entre una asignación histórica y una activa, y las vistas predictivas pueden retornar resultados incorrectos.

#### Nota sobre rendimiento en producción

Ambas vistas usan rangos de `Fecha_Nacimiento` calculados estáticamente, lo que permite al planner de PostgreSQL usar el índice btree sobre `Personas.Fecha_Nacimiento` para el filtro inicial. Los índices funcionales `idx_personas_mes_nac` y `idx_personas_dia_nac` creados en §6.3-A complementan el filtrado de mes/día en consultas derivadas. Para tablas con más de 10,000 niños se recomienda revisar el plan de ejecución con `EXPLAIN (ANALYZE, BUFFERS)` y considerar una **vista materializada** que se refresque diariamente:

```sql
-- Vista materializada opcional para instalaciones de alta escala
CREATE MATERIALIZED VIEW mv_ninos_transicion_grupo_mes
AS SELECT * FROM v_ninos_transicion_grupo_mes;

-- NOTA v5.1 (D21): El índice único se basa en ID_Persona, no en
-- (Apellidos, Nombres, Fecha_Nacimiento). La combinación de nombre + fecha
-- no garantiza unicidad real — puede haber homónimos con la misma fecha de
-- nacimiento, lo que haría fallar REFRESH MATERIALIZED VIEW CONCURRENTLY.
-- La vista debe exponer ID_Persona para que este índice sea válido.
CREATE UNIQUE INDEX ON mv_ninos_transicion_grupo_mes (ID_Persona);

-- Refrescar diariamente (p.ej. via pg_cron o tarea programada)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ninos_transicion_grupo_mes;
```

---

### 10.6 Registro de Expedientes

**Expediente de niño:**
```sql
INSERT INTO Ninos_Expedientes_Conducta
    (ID_Nino, ID_Turno, ID_Evento, Tipo, Descripcion, ID_Reportado_Por)
VALUES (:id_nino, :id_turno, :id_evento_o_null,
        'Conducta'::tipo_expediente_nino, :descripcion, :id_staff);
```

**Regla:** `ID_Reportado_Por` debe ser siempre el usuario autenticado en la sesión. El frontend nunca debe permitir elegir el reportador en un selector; debe tomarse del token de sesión.

**Resolver un expediente:**
```sql
UPDATE Ninos_Expedientes_Conducta
SET Resuelto = TRUE, Notas_Resolucion = :notas
WHERE ID_Expediente = :id AND Resuelto = FALSE;
```

---

*Documento final generado para el Sistema de Gestión Infantil — Hosanna Infantil.*
*Versión del esquema base: v4 (Definitivo). Versión objetivo: v5.0-FINAL.*
*Fecha de emisión: 2026-05-30.*