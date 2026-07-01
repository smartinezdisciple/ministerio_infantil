# Separación Aprobación/Creación de Cuentas + Gestión de Usuarios

## Objetivo
Separar la aprobación de solicitudes de la creación de cuentas de usuario y agregar gestión centralizada de usuarios, edición de perfil con historial de cambios.

## Cambios Realizados

### Backend

#### Migración SQL (`backend/migracion_v5_10.sql`)
- Crea `Personal_Historial_Cambios` (tabla de auditoría)
- 5 triggers que registran cambios en: `Personas`, `Info_Personal`, `Info_Iglesia`, `Telefonos_Personas`, `Personas_Direcciones`

#### `solicitudesControlador.ts`
- `aprobarSolicitud`: simplificada — ya no recibe rol/credenciales del body. Auto-asigna ID_Rol=1 (Colaborador), genera temp username (`temp_*`) con hash aleatorio. Solo acepta `notas` opcionales.
- `eliminarSolicitud` (nueva): DELETE físico directo en cualquier estado. Desvincula `Personal_Sistema.ID_Solicitud_Origen` y elimina requisitos/historial asociados.

#### `personalControlador.ts`
- Eliminado: `obtenerPerfilPersonal` (reemplazado por `obtenerPerfilCompleto`)
- Eliminado: `obtenerHistorialRoles` (absorbido por `obtenerHistorialCambios`)
- Agregado: `listarPersonalCompleto` — lista todos los usuarios con info base + turnos/grupos
- Agregado: `configurarAccesoPersonal` — asigna usuario, contraseña, rol, turnos y grupo
- Agregado: `obtenerHistorialCambios` — unifica historial de roles + cambios de perfil
- Actualizado: `obtenerPerfilCompleto` — query manual con camelCase y arrays JSON anidados (telefonos, direcciones, grupos, turnos, requisitos, suspensionActiva)

#### Rutas
- `personalRutas.ts`: +3 rutas (`/lista-completa`, `/:id/configurar-acceso`, `/:id/historial-cambios`), -2 rutas (`/:id/perfil`, `/:id/historial-roles`)
- `solicitudesRutas.ts`: +`DELETE /:id`

### Frontend

#### `servicioApi.ts`
- `aprobarSolicitud` simplificada (solo `id, notas?`)
- `eliminarSolicitud` agregada
- `obtenerPerfilPersonal` ahora apunta a `/perfil-completo`
- Nuevos tipos: `UsuarioSistemaApi`, `CambioHistorialApi`
- Nuevas funciones: `listarPersonalCompleto`, `configurarAccesoPersonal`, `obtenerHistorialCambios`
- `PerfilPersonalApi` actualizado para coincidir con respuesta del backend

#### `PaginaSolicitudes.tsx`
- Modal de aprobar simplificado: solo info del candidato + notas opcionales
- Botón "Eliminar" (nivel 4+) con confirmación
- Eliminado: normalizarNombre, catálogos de turnos/grupos para aprobación

#### `PaginaUsuarios.tsx` (nueva)
- Tabla de todos los usuarios del sistema
- Modal "Configurar Acceso" con: usuario, contraseña, rol, turnos, grupo
- Para usuarios con credenciales temporales o cualquier usuario (nivel 4+)

#### `PaginaPerfilPersonal.tsx`
- Ruta `/perfil` para perfil propio (toma `idPersona` del auth context)
- Ruta `/personal/:id` para ver perfil de otro (nivel 3+)
- API ahora llama a `obtenerPerfilPersonal` (servicioApi → `/perfil-completo`)
- Adaptador `adaptarPerfilApi` para transformar respuesta API plana a estructura anidada
- Sección "Historial de Cambios" con toggle que carga y muestra cambios vía `obtenerHistorialCambios`

#### `BarraLateral.tsx`
- Item "Usuarios" agregado (nivel 4+)
- Nombre del usuario en el footer ahora es clickeable → `/perfil`

#### `main.tsx`
- Ruta `/perfil` (nivel 1+)
- Ruta `/usuarios` (nivel 4+)

## Archivos Modificados
- `backend/migracion_v5_10.sql` (nuevo)
- `backend/src/controllers/solicitudesControlador.ts`
- `backend/src/controllers/personalControlador.ts`
- `backend/src/routes/personalRutas.ts`
- `backend/src/routes/solicitudesRutas.ts`
- `frontend/src/services/servicioApi.ts`
- `frontend/src/pages/PaginaSolicitudes.tsx`
- `frontend/src/pages/PaginaPerfilPersonal.tsx`
- `frontend/src/components/BarraLateral.tsx`
- `frontend/src/main.tsx`
- `frontend/src/pages/PaginaUsuarios.tsx` (nuevo)

## Próximos pasos/recomendaciones
1. Aplicar migración `migracion_v5_10.sql` en producción
2. Probar flujo completo: crear solicitud → aprobar → configurar acceso en Usuarios → ver perfil
3. Agregar protección idempotente en `configurarAccesoPersonal` (evitar re-asignar si ya configurado)
