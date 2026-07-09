-- ============================================================================
-- migracion_v8_miercoles_solicitudes.sql
-- Generado: 2026-07-08 23:47:36
-- Propósito: Importar solicitudes aprobadas de Turno Miercoles desde Formulario.xlsx
-- Uso: Aplicar contra Neon: psql <connection_string> -f migracion_v8_miercoles_solicitudes.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CREAR PERSONAS (solo si no existen, identificadas por cédula única)
-- ============================================================================

-- Gerardo JoseAlonsoGuerrero
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Gerardo', 'JoseAlonsoGuerrero', 'Masculino', '001-28031966X', '1966-03-28'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '001-28031966X');

-- Teléfonos: Gerardo JoseAlonsoGuerrero
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 'Claro', '5861-0390', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X') AND Tipo = 'Claro' AND Numero = '5861-0390');

-- Dirección: Gerardo JoseAlonsoGuerrero
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 'Residencial', 'Managua', 'Matiare', NULL, 'Valle de sandino', 'Del súper expres 2c abajo75varas al sur casa k 2 09', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X') AND Es_Principal = TRUE);

-- Solicitud aprobada: Gerardo JoseAlonsoGuerrero
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Masculino', '001-28031966X', 'Casado', 'Primer_Matrimonio',
  'Johanna Elizabeth Fletes Ramirez', 'Tele Marketing', 'Pharmainsa',
  TRUE, 3,
  'Managua', 'Matiare', NULL, 'Valle de sandino', 'Del súper expres 2c abajo75varas al sur casa k 2 09',
  NULL, NULL, '5861-0390', NULL,
  'Mecánico Automotriz', 'Enacal', 'Nivel_Tecnico',
  3, 'Lider',
  NULL, NULL,
  84, NULL,
  TRUE, NULL, NULL,
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Catedral', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X') AND Estado = 'Aprobado');

-- Requisitos: Gerardo JoseAlonsoGuerrero
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')) AND ID_Requisito = 5);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X')) AND ID_Requisito = 7);

-- Personal_Sistema: Gerardo JoseAlonsoGuerrero
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 1,
  'temp_1_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'));

-- Info Personal: Gerardo JoseAlonsoGuerrero
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 'Casado', 'Primer_Matrimonio', 'Johanna Elizabeth Fletes Ramirez', TRUE, 3, 'Del súper expres 2c abajo75varas al sur casa k 2 09', 'Mecánico Automotriz', 'Enacal', 'Nivel_Tecnico'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'));

-- Info Iglesia: Gerardo JoseAlonsoGuerrero
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 3, 'Lider',
  84, NULL,
  TRUE, NULL, NULL,
  NULL, NULL,
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Catedral', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'));

-- Personal Requisitos: Gerardo JoseAlonsoGuerrero
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X') AND ID_Requisito = 5);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-28031966X') AND ID_Requisito = 7);

-- Johanna Elizabeth Fletes Ramirez
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Johanna', 'Elizabeth Fletes Ramirez', 'Femenino', '001-170469-0014V', '1969-04-17'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '001-170469-0014V');

-- Teléfonos: Johanna Elizabeth Fletes Ramirez
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 'Claro', '8545-3859', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V') AND Tipo = 'Claro' AND Numero = '8545-3859');

-- Dirección: Johanna Elizabeth Fletes Ramirez
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 'Residencial', 'Managua', 'Mateare', NULL, 'Valles de sandino', 'Del super express 2c abajo 75 vrs al sur k2 09', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V') AND Es_Principal = TRUE);

-- Solicitud aprobada: Johanna Elizabeth Fletes Ramirez
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '001-170469-0014V', 'Casado', 'Primer_Matrimonio',
  'Gerardo Jose Alonso Guerrero', 'Mecanico Automotris', 'Enacal',
  TRUE, 4,
  'Managua', 'Mateare', NULL, 'Valles de sandino', 'Del super express 2c abajo 75 vrs al sur k2 09',
  NULL, NULL, '8545-3859', NULL,
  'Tele Marketing', 'Pharmainsa', 'Nivel_Tecnico',
  3, 'Lider',
  '2019-01-01', 'Ano',
  84, NULL,
  TRUE, '2019-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Catedral', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V') AND Estado = 'Aprobado');

-- Requisitos: Johanna Elizabeth Fletes Ramirez
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')) AND ID_Requisito = 5);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V')) AND ID_Requisito = 7);

-- Personal_Sistema: Johanna Elizabeth Fletes Ramirez
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 1,
  'temp_2_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'));

-- Info Personal: Johanna Elizabeth Fletes Ramirez
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 'Casado', 'Primer_Matrimonio', 'Gerardo Jose Alonso Guerrero', TRUE, 4, 'Del super express 2c abajo 75 vrs al sur k2 09', 'Tele Marketing', 'Pharmainsa', 'Nivel_Tecnico'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'));

-- Info Iglesia: Johanna Elizabeth Fletes Ramirez
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 3, 'Lider',
  84, NULL,
  TRUE, '2019-01-01', 'Ano',
  '2019-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Catedral', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'));

-- Personal Requisitos: Johanna Elizabeth Fletes Ramirez
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V') AND ID_Requisito = 5);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-170469-0014V') AND ID_Requisito = 7);

-- María Marcela de Jesús Herrera González
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'María', 'Marcela de Jesús Herrera González', 'Femenino', '281-010306-1002Q', '2006-03-01'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '281-010306-1002Q');

-- Teléfonos: María Marcela de Jesús Herrera González
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 'Casa', '88340474', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND Tipo = 'Casa' AND Numero = '88340474');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 'Oficina', '8237 2621', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND Tipo = 'Oficina' AND Numero = '8237 2621');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 'Claro', 'Celular de mi abueli', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND Tipo = 'Claro' AND Numero = 'Celular de mi abueli');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 'Movistar', '77224137', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND Tipo = 'Movistar' AND Numero = '77224137');

-- Dirección: María Marcela de Jesús Herrera González
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 'Residencial', 'Nací en León ( Vivo en Managua )', 'Mateare', 'Distrito Mateare', 'Residencial Ciudad El Doral', 'Km 18 Carretera Nueva León, calle 9 Avenida 13, Casa W106', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND Es_Principal = TRUE);

-- Solicitud aprobada: María Marcela de Jesús Herrera González
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '281-010306-1002Q', 'Soltero', 'Ninguna',
  NULL, NULL, NULL,
  FALSE, NULL,
  'Nací en León ( Vivo en Managua )', 'Mateare', 'Distrito Mateare', 'Residencial Ciudad El Doral', 'Km 18 Carretera Nueva León, calle 9 Avenida 13, Casa W106',
  '88340474', '8237 2621', 'Celular de mi abueli', '77224137',
  'Estudiante Universitaria de Psicología, y trabajo en un Centro Educativo.', 'Centro Educativo Little Angel', 'Licenciatura',
  1, 'Gap',
  '2019-01-01', 'Ano',
  96, 'Agape',
  TRUE, '2019-01-01', 'Ano',
  FALSE, 'Completado',
  TRUE, 'He trabajado como maestra sombra, y actualmente trabajo como asistente de docente.',
  NULL,
  TRUE, 'Catolica ( San Sebastían en León )', 'Católico'
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND Estado = 'Aprobado');

-- Requisitos: María Marcela de Jesús Herrera González
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q')) AND ID_Requisito = 7);

-- Personal_Sistema: María Marcela de Jesús Herrera González
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 1,
  'temp_3_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'));

-- Info Personal: María Marcela de Jesús Herrera González
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 'Soltero', 'Ninguna', NULL, FALSE, NULL, 'Km 18 Carretera Nueva León, calle 9 Avenida 13, Casa W106', 'Estudiante Universitaria de Psicología, y trabajo en un Centro Educativo.', 'Centro Educativo Little Angel', 'Licenciatura'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'));

-- Info Iglesia: María Marcela de Jesús Herrera González
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 1, 'Gap',
  96, 'Agape',
  TRUE, '2019-01-01', 'Ano',
  '2019-01-01', 'Ano',
  FALSE, 'Completado',
  TRUE, 'He trabajado como maestra sombra, y actualmente trabajo como asistente de docente.',
  NULL,
  TRUE, 'Catolica ( San Sebastían en León )', 'Católico'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'));

-- Personal Requisitos: María Marcela de Jesús Herrera González
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '281-010306-1002Q') AND ID_Requisito = 7);

-- Kathleen Vanessa Calderón Hernández
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Kathleen', 'Vanessa Calderón Hernández', 'Femenino', '001-291298-0018V', '1998-12-29'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '001-291298-0018V');

-- Teléfonos: Kathleen Vanessa Calderón Hernández
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 'Casa', '57022102', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V') AND Tipo = 'Casa' AND Numero = '57022102');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 'Oficina', '57022102', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V') AND Tipo = 'Oficina' AND Numero = '57022102');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 'Claro', '57022102', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V') AND Tipo = 'Claro' AND Numero = '57022102');

-- Dirección: Kathleen Vanessa Calderón Hernández
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 'Residencial', 'Managua', 'Mateare', NULL, 'Residencial ciudad el Doral', 'Casa H134', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V') AND Es_Principal = TRUE);

-- Solicitud aprobada: Kathleen Vanessa Calderón Hernández
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '001-291298-0018V', 'Soltero', 'Ninguna',
  NULL, NULL, NULL,
  FALSE, NULL,
  'Managua', 'Mateare', NULL, 'Residencial ciudad el Doral', 'Casa H134',
  '57022102', '57022102', '57022102', NULL,
  'Freelancer', 'Remoto', 'Licenciatura',
  3, 'Gap',
  '2025-01-01', 'Ano',
  108, NULL,
  TRUE, '2025-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Pentecostal', 'Pentecostal'
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V') AND Estado = 'Aprobado');

-- Requisitos: Kathleen Vanessa Calderón Hernández
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V')) AND ID_Requisito = 7);

-- Personal_Sistema: Kathleen Vanessa Calderón Hernández
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 1,
  'temp_4_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'));

-- Info Personal: Kathleen Vanessa Calderón Hernández
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 'Soltero', 'Ninguna', NULL, FALSE, NULL, 'Casa H134', 'Freelancer', 'Remoto', 'Licenciatura'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'));

-- Info Iglesia: Kathleen Vanessa Calderón Hernández
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 3, 'Gap',
  108, NULL,
  TRUE, '2025-01-01', 'Ano',
  '2025-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Pentecostal', 'Pentecostal'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'));

-- Personal Requisitos: Kathleen Vanessa Calderón Hernández
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-291298-0018V') AND ID_Requisito = 7);

-- Gissell Elizabeth Ebanks Ruiz
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Gissell', 'Elizabeth Ebanks Ruiz', 'Femenino', '601-080790-0001C', '1990-07-08'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '601-080790-0001C');

-- Teléfonos: Gissell Elizabeth Ebanks Ruiz
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 'Casa', '25721576', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C') AND Tipo = 'Casa' AND Numero = '25721576');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 'Claro', '88574834', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C') AND Tipo = 'Claro' AND Numero = '88574834');

-- Dirección: Gissell Elizabeth Ebanks Ruiz
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 'Residencial', 'Managua', 'Matiare', NULL, 'Cuidad Doral', 'Nueva etapa avenida 9 calle 2 casa C110', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C') AND Es_Principal = TRUE);

-- Solicitud aprobada: Gissell Elizabeth Ebanks Ruiz
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '601-080790-0001C', 'Soltero', 'Ninguna',
  NULL, NULL, NULL,
  FALSE, NULL,
  'Managua', 'Matiare', NULL, 'Cuidad Doral', 'Nueva etapa avenida 9 calle 2 casa C110',
  '25721576', NULL, '88574834', NULL,
  'Médico', 'Farmacia Hosanna', 'Postgrado',
  2, 'Gap',
  '2006-01-01', 'Ano',
  72, NULL,
  TRUE, '2006-01-01', 'Ano',
  TRUE, 'Bluefields: Fuí profesora de escuela dominical en la iglesia Morava ( Era Morava antes de conocer al señor) allí fue donde tuve la confrontación de que no podía servir Dios y al mundo, ya que un sábado estaba en una tarima algunas veces con poca ropa y bailando bailes exóticos y un domingo dando clase a los niños. Así que tuve que decidir servir a Dios bien siendo buen testimonio o dejar de dar clases.

Bluefields ( 2007) : Cuando se inició el ninisterio de niños en el 2007 en la iglesia Tabernacle ( nos reuniamos los sábados después del medio día) inicié como líder junto con otros 2 hermanos y amigos en Cristo sin embargo al año siguiente tuve que dimitir ya que fuí a estudiar al occidente y lo dejaron en pausa después de unos meses hasta que la Hija del Pastor lo retomó años después  nuevamente. Fue una experiencia grata porque anteriormente daba clase a los niños pequeños ( en el moravo) y en Tabernacle fueron niños más grandes con más conocimiento.

En León (2008- 2009 ) Eos 2 años estudiando en León fuí parte de la Iglesia el Rey Jesús Todo Poderoso y era profesora de los niños en las células ( amé esta experiencia porque tenimos niños diversos algunos necesitaban un escape de su realidad o mejor dicho necesitaban la palabra de Dios y saber que el puede cambiar las cosas que Dios los Ama y para otros ese era su tiempo de sentirse niños, de jugar y compartir con otros niños sanamente y yo hasta aprendí de ellos ( por lo menos a pronunciar algunas palabras " rr" me decían profe " se pronuncia así ".

Managua (2016)  Mientras hacia mi internado en Rivas viajaba a Managua a la iglesia donde fuí profesora de escuela dominical en la filial de la iglesia Tabernacle " Winds of Change" anteriormente solo asistía.',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Revival Tabernacle Church - Evangélico Pentecostes', 'Evangelico'
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C') AND Estado = 'Aprobado');

-- Requisitos: Gissell Elizabeth Ebanks Ruiz
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C')) AND ID_Requisito = 7);

-- Personal_Sistema: Gissell Elizabeth Ebanks Ruiz
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 1,
  'temp_5_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'));

-- Info Personal: Gissell Elizabeth Ebanks Ruiz
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 'Soltero', 'Ninguna', NULL, FALSE, NULL, 'Nueva etapa avenida 9 calle 2 casa C110', 'Médico', 'Farmacia Hosanna', 'Postgrado'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'));

-- Info Iglesia: Gissell Elizabeth Ebanks Ruiz
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 2, 'Gap',
  72, NULL,
  TRUE, '2006-01-01', 'Ano',
  '2006-01-01', 'Ano',
  TRUE, 'Bluefields: Fuí profesora de escuela dominical en la iglesia Morava ( Era Morava antes de conocer al señor) allí fue donde tuve la confrontación de que no podía servir Dios y al mundo, ya que un sábado estaba en una tarima algunas veces con poca ropa y bailando bailes exóticos y un domingo dando clase a los niños. Así que tuve que decidir servir a Dios bien siendo buen testimonio o dejar de dar clases.

Bluefields ( 2007) : Cuando se inició el ninisterio de niños en el 2007 en la iglesia Tabernacle ( nos reuniamos los sábados después del medio día) inicié como líder junto con otros 2 hermanos y amigos en Cristo sin embargo al año siguiente tuve que dimitir ya que fuí a estudiar al occidente y lo dejaron en pausa después de unos meses hasta que la Hija del Pastor lo retomó años después  nuevamente. Fue una experiencia grata porque anteriormente daba clase a los niños pequeños ( en el moravo) y en Tabernacle fueron niños más grandes con más conocimiento.

En León (2008- 2009 ) Eos 2 años estudiando en León fuí parte de la Iglesia el Rey Jesús Todo Poderoso y era profesora de los niños en las células ( amé esta experiencia porque tenimos niños diversos algunos necesitaban un escape de su realidad o mejor dicho necesitaban la palabra de Dios y saber que el puede cambiar las cosas que Dios los Ama y para otros ese era su tiempo de sentirse niños, de jugar y compartir con otros niños sanamente y yo hasta aprendí de ellos ( por lo menos a pronunciar algunas palabras " rr" me decían profe " se pronuncia así ".

Managua (2016)  Mientras hacia mi internado en Rivas viajaba a Managua a la iglesia donde fuí profesora de escuela dominical en la filial de la iglesia Tabernacle " Winds of Change" anteriormente solo asistía.',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Revival Tabernacle Church - Evangélico Pentecostes', 'Evangelico'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'));

-- Personal Requisitos: Gissell Elizabeth Ebanks Ruiz
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '601-080790-0001C') AND ID_Requisito = 7);

-- Itzel yaretzi Gutierrez Navarro
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Itzel', 'yaretzi Gutierrez Navarro', 'Femenino', '001-031207-1040U', '2007-12-03'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '001-031207-1040U');

-- Teléfonos: Itzel yaretzi Gutierrez Navarro
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 'Casa', '22317100', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U') AND Tipo = 'Casa' AND Numero = '22317100');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 'Movistar', '85571515', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U') AND Tipo = 'Movistar' AND Numero = '85571515');

-- Dirección: Itzel yaretzi Gutierrez Navarro
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 'Residencial', 'Managua', 'Ciudad sandino', NULL, 'Santa eduviges', 'Residencial santa eduviges de la guja 12 calles a mano derecha la 2 casa , casa G 19 de la 2 etapa', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U') AND Es_Principal = TRUE);

-- Solicitud aprobada: Itzel yaretzi Gutierrez Navarro
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '001-031207-1040U', 'Soltero', 'Ninguna',
  NULL, NULL, NULL,
  FALSE, NULL,
  'Managua', 'Ciudad sandino', NULL, 'Santa eduviges', 'Residencial santa eduviges de la guja 12 calles a mano derecha la 2 casa , casa G 19 de la 2 etapa',
  '22317100', NULL, NULL, '85571515',
  'Estudiante', NULL, 'Licenciatura',
  1, 'Gap',
  '2023-01-01', 'Ano',
  108, NULL,
  TRUE, '2023-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  FALSE, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U') AND Estado = 'Aprobado');

-- Requisitos: Itzel yaretzi Gutierrez Navarro
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U')) AND ID_Requisito = 7);

-- Personal_Sistema: Itzel yaretzi Gutierrez Navarro
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 1,
  'temp_6_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'));

-- Info Personal: Itzel yaretzi Gutierrez Navarro
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 'Soltero', 'Ninguna', NULL, FALSE, NULL, 'Residencial santa eduviges de la guja 12 calles a mano derecha la 2 casa , casa G 19 de la 2 etapa', 'Estudiante', NULL, 'Licenciatura'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'));

-- Info Iglesia: Itzel yaretzi Gutierrez Navarro
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 1, 'Gap',
  108, NULL,
  TRUE, '2023-01-01', 'Ano',
  '2023-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  FALSE, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'));

-- Personal Requisitos: Itzel yaretzi Gutierrez Navarro
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-031207-1040U') AND ID_Requisito = 7);

-- Andrea Belén Vallecillo Escobar
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Andrea', 'Belén Vallecillo Escobar', 'Femenino', '001-230108-1018M', '2008-01-23'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '001-230108-1018M');

-- Teléfonos: Andrea Belén Vallecillo Escobar
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 'Casa', '81558725', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M') AND Tipo = 'Casa' AND Numero = '81558725');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 'Movistar', '78085614', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M') AND Tipo = 'Movistar' AND Numero = '78085614');

-- Dirección: Andrea Belén Vallecillo Escobar
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 'Residencial', 'Managua', 'Mateare', 'Distrito No se', 'Barrio Canaan', 'Km 17 ½ carretera a xiloa, 3 c arriba ½ c al sur', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M') AND Es_Principal = TRUE);

-- Solicitud aprobada: Andrea Belén Vallecillo Escobar
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '001-230108-1018M', 'Soltero', 'Ninguna',
  NULL, NULL, NULL,
  FALSE, NULL,
  'Managua', 'Mateare', 'Distrito No se', 'Barrio Canaan', 'Km 17 ½ carretera a xiloa, 3 c arriba ½ c al sur',
  '81558725', NULL, NULL, '78085614',
  'Estudiante', NULL, 'Nivel_Tecnico',
  2, 'Miembro',
  '2024-01-01', 'Ano',
  216, NULL,
  TRUE, '2023-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  FALSE, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M') AND Estado = 'Aprobado');

-- Requisitos: Andrea Belén Vallecillo Escobar
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M')) AND ID_Requisito = 7);

-- Personal_Sistema: Andrea Belén Vallecillo Escobar
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 1,
  'temp_7_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'));

-- Info Personal: Andrea Belén Vallecillo Escobar
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 'Soltero', 'Ninguna', NULL, FALSE, NULL, 'Km 17 ½ carretera a xiloa, 3 c arriba ½ c al sur', 'Estudiante', NULL, 'Nivel_Tecnico'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'));

-- Info Iglesia: Andrea Belén Vallecillo Escobar
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 2, 'Miembro',
  216, NULL,
  TRUE, '2023-01-01', 'Ano',
  '2024-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  FALSE, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'));

-- Personal Requisitos: Andrea Belén Vallecillo Escobar
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-230108-1018M') AND ID_Requisito = 7);

-- Genesis Belen Alvarez Guerrero
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Genesis', 'Belen Alvarez Guerrero', 'Femenino', '001-071109-1024T', '2009-11-07'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '001-071109-1024T');

-- Teléfonos: Genesis Belen Alvarez Guerrero
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 'Casa', '58807373', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T') AND Tipo = 'Casa' AND Numero = '58807373');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 'Oficina', '58807373', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T') AND Tipo = 'Oficina' AND Numero = '58807373');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 'Claro', '58807373', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T') AND Tipo = 'Claro' AND Numero = '58807373');

-- Dirección: Genesis Belen Alvarez Guerrero
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 'Residencial', 'Managua', 'Mateare', 'Distrito x', 'Urbanización', 'Del super express 7c abajo casa G4-08', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T') AND Es_Principal = TRUE);

-- Solicitud aprobada: Genesis Belen Alvarez Guerrero
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '001-071109-1024T', 'Soltero', 'Ninguna',
  NULL, NULL, NULL,
  FALSE, NULL,
  'Managua', 'Mateare', 'Distrito x', 'Urbanización', 'Del super express 7c abajo casa G4-08',
  '58807373', '58807373', '58807373', NULL,
  'Estudiange', 'Colegio Enmanuel Mongalo y Rubio', 'Secundaria',
  3, 'Gap',
  '2021-01-01', 'Ano',
  72, 'Si, Fotografía',
  TRUE, '2023-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Ríos de Agua viva', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T') AND Estado = 'Aprobado');

-- Requisitos: Genesis Belen Alvarez Guerrero
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T')) AND ID_Requisito = 7);

-- Personal_Sistema: Genesis Belen Alvarez Guerrero
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 1,
  'temp_8_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'));

-- Info Personal: Genesis Belen Alvarez Guerrero
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 'Soltero', 'Ninguna', NULL, FALSE, NULL, 'Del super express 7c abajo casa G4-08', 'Estudiange', 'Colegio Enmanuel Mongalo y Rubio', 'Secundaria'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'));

-- Info Iglesia: Genesis Belen Alvarez Guerrero
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 3, 'Gap',
  72, 'Si, Fotografía',
  TRUE, '2023-01-01', 'Ano',
  '2021-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Ríos de Agua viva', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'));

-- Personal Requisitos: Genesis Belen Alvarez Guerrero
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-071109-1024T') AND ID_Requisito = 7);

-- Juliana Saraí Matamoros Ordeñana
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Juliana', 'Saraí Matamoros Ordeñana', 'Femenino', '001-200802-1043L', '2002-08-20'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '001-200802-1043L');

-- Teléfonos: Juliana Saraí Matamoros Ordeñana
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 'Claro', '5873-5203', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L') AND Tipo = 'Claro' AND Numero = '5873-5203');

-- Dirección: Juliana Saraí Matamoros Ordeñana
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 'Residencial', 'Managua', 'Mateare', NULL, 'Urbanización ValleSandino', 'Km. 14 carretera nueva a León. Urbanización Valle  Sandino, casa L3-19', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L') AND Es_Principal = TRUE);

-- Solicitud aprobada: Juliana Saraí Matamoros Ordeñana
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '001-200802-1043L', 'Soltero', 'Ninguna',
  NULL, NULL, NULL,
  FALSE, NULL,
  'Managua', 'Mateare', NULL, 'Urbanización ValleSandino', 'Km. 14 carretera nueva a León. Urbanización Valle  Sandino, casa L3-19',
  NULL, NULL, '5873-5203', NULL,
  'Estudiante universitaria/Maestra Apoyo 1er Nivel/Maestra de Guardería', 'Centro Educativo Pequeños Gigantes', 'Licenciatura',
  1, 'Lider',
  '2015-01-01', 'Ano',
  264, NULL,
  TRUE, '2015-01-01', 'Ano',
  FALSE, 'Completado',
  TRUE, 'He trabajado como tutora académica a niños menores de 12 años, desde que tengo 20 años. Actualmente, soy maestra sombra (o de apoyo) en 1er nivel de Pre-Escolar, y estoy a cargo de Guardería por las tardes. Trabajo diariamente con niños de entre 3 a 8 años.',
  NULL,
  FALSE, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L') AND Estado = 'Aprobado');

-- Requisitos: Juliana Saraí Matamoros Ordeñana
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')) AND ID_Requisito = 5);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L')) AND ID_Requisito = 7);

-- Personal_Sistema: Juliana Saraí Matamoros Ordeñana
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 1,
  'temp_9_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'));

-- Info Personal: Juliana Saraí Matamoros Ordeñana
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 'Soltero', 'Ninguna', NULL, FALSE, NULL, 'Km. 14 carretera nueva a León. Urbanización Valle  Sandino, casa L3-19', 'Estudiante universitaria/Maestra Apoyo 1er Nivel/Maestra de Guardería', 'Centro Educativo Pequeños Gigantes', 'Licenciatura'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'));

-- Info Iglesia: Juliana Saraí Matamoros Ordeñana
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 1, 'Lider',
  264, NULL,
  TRUE, '2015-01-01', 'Ano',
  '2015-01-01', 'Ano',
  FALSE, 'Completado',
  TRUE, 'He trabajado como tutora académica a niños menores de 12 años, desde que tengo 20 años. Actualmente, soy maestra sombra (o de apoyo) en 1er nivel de Pre-Escolar, y estoy a cargo de Guardería por las tardes. Trabajo diariamente con niños de entre 3 a 8 años.',
  NULL,
  FALSE, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'));

-- Personal Requisitos: Juliana Saraí Matamoros Ordeñana
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L') AND ID_Requisito = 5);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-200802-1043L') AND ID_Requisito = 7);

-- Adán de Jesús Martinez Jiménez
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Adán', 'de Jesús Martinez Jiménez', 'Masculino', '561-090101-1006V', '2001-01-09'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '561-090101-1006V');

-- Dirección: Adán de Jesús Martinez Jiménez
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'), 'Residencial', 'Managua', 'Managua', 'Distrito Ii', 'Cristo del Rosario', 'De la carne asada el Dario 2 cuadra al lago, 1 arriba, costado sur de la Iglesia Cristo del Rosario.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V') AND Es_Principal = TRUE);

-- Solicitud aprobada: Adán de Jesús Martinez Jiménez
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Masculino', '561-090101-1006V', 'Soltero', 'Ninguna',
  NULL, NULL, NULL,
  FALSE, NULL,
  'Managua', 'Managua', 'Distrito Ii', 'Cristo del Rosario', 'De la carne asada el Dario 2 cuadra al lago, 1 arriba, costado sur de la Iglesia Cristo del Rosario.',
  NULL, NULL, NULL, NULL,
  'Técnico', 'Walmart', 'Licenciatura',
  1, 'Gap',
  '2019-01-01', 'Ano',
  36, 'Si',
  TRUE, '2019-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Luz del mundo, Apostólica en la fe.', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V') AND Estado = 'Aprobado');

-- Requisitos: Adán de Jesús Martinez Jiménez
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V')) AND ID_Requisito = 7);

-- Personal_Sistema: Adán de Jesús Martinez Jiménez
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'), 1,
  'temp_10_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'));

-- Info Personal: Adán de Jesús Martinez Jiménez
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'), 'Soltero', 'Ninguna', NULL, FALSE, NULL, 'De la carne asada el Dario 2 cuadra al lago, 1 arriba, costado sur de la Iglesia Cristo del Rosario.', 'Técnico', 'Walmart', 'Licenciatura'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'));

-- Info Iglesia: Adán de Jesús Martinez Jiménez
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'), 1, 'Gap',
  36, 'Si',
  TRUE, '2019-01-01', 'Ano',
  '2019-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Luz del mundo, Apostólica en la fe.', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'));

-- Personal Requisitos: Adán de Jesús Martinez Jiménez
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '561-090101-1006V') AND ID_Requisito = 7);

-- RITA CASSANDRA BASSETT MIRANDA
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'RITA', 'CASSANDRA BASSETT MIRANDA', 'Femenino', '001-280994-0032L', '1994-09-28'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '001-280994-0032L');

-- Teléfonos: RITA CASSANDRA BASSETT MIRANDA
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 'Movistar', '81085397', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L') AND Tipo = 'Movistar' AND Numero = '81085397');

-- Dirección: RITA CASSANDRA BASSETT MIRANDA
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 'Residencial', 'Managua', 'Mateare', NULL, 'Ciudad Doral', 'Avenida 26, calle 6, casa S9', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L') AND Es_Principal = TRUE);

-- Solicitud aprobada: RITA CASSANDRA BASSETT MIRANDA
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '001-280994-0032L', 'Casado', 'Primer_Matrimonio',
  'JUNIOR EVARISTO RAMIREZ ROJAS', 'Abogado', 'Abba Xpress',
  FALSE, NULL,
  'Managua', 'Mateare', NULL, 'Ciudad Doral', 'Avenida 26, calle 6, casa S9',
  NULL, NULL, NULL, '81085397',
  'Diaeñadora', 'Abba Xpress', 'Licenciatura',
  3, 'Lider',
  '2008-01-01', 'Ano',
  36, NULL,
  TRUE, '2008-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Beraca - Bautista', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L') AND Estado = 'Aprobado');

-- Requisitos: RITA CASSANDRA BASSETT MIRANDA
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')) AND ID_Requisito = 5);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L')) AND ID_Requisito = 7);

-- Personal_Sistema: RITA CASSANDRA BASSETT MIRANDA
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 1,
  'temp_11_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'));

-- Info Personal: RITA CASSANDRA BASSETT MIRANDA
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 'Casado', 'Primer_Matrimonio', 'JUNIOR EVARISTO RAMIREZ ROJAS', FALSE, NULL, 'Avenida 26, calle 6, casa S9', 'Diaeñadora', 'Abba Xpress', 'Licenciatura'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'));

-- Info Iglesia: RITA CASSANDRA BASSETT MIRANDA
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 3, 'Lider',
  36, NULL,
  TRUE, '2008-01-01', 'Ano',
  '2008-01-01', 'Ano',
  FALSE, 'Completado',
  FALSE, 'Completado',
  NULL,
  TRUE, 'Beraca - Bautista', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'));

-- Personal Requisitos: RITA CASSANDRA BASSETT MIRANDA
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L') AND ID_Requisito = 5);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '001-280994-0032L') AND ID_Requisito = 7);

-- Flor Patricia Ulloa Peralta
INSERT INTO Personas (Nombres, Apellidos, Sexo, Cedula, Fecha_Nacimiento)
SELECT 'Flor', 'Patricia Ulloa Peralta', 'Femenino', '085-171281-0002F', '1981-12-17'
WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE Cedula = '085-171281-0002F');

-- Teléfonos: Flor Patricia Ulloa Peralta
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 'Casa', '2231 2295', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND Tipo = 'Casa' AND Numero = '2231 2295');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 'Oficina', '87000874', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND Tipo = 'Oficina' AND Numero = '87000874');
INSERT INTO Telefonos_Personas (ID_Persona, Tipo, Numero, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 'Movistar', '7792 4662', FALSE
WHERE NOT EXISTS (SELECT 1 FROM Telefonos_Personas WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND Tipo = 'Movistar' AND Numero = '7792 4662');

-- Dirección: Flor Patricia Ulloa Peralta
INSERT INTO Personas_Direcciones (ID_Persona, Tipo_Direccion, Ciudad_Departamento, Municipio, Distrito, Barrio, Direccion_Exacta, Es_Principal)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 'Residencial', 'Managua', 'Ciudad Sandino', NULL, 'Santa Eduviges', 'II etapa ; casa i8', TRUE
WHERE NOT EXISTS (SELECT 1 FROM Personas_Direcciones WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND Es_Principal = TRUE);

-- Solicitud aprobada: Flor Patricia Ulloa Peralta
INSERT INTO Solicitudes_Personal (
  ID_Persona, ID_Rol_Solicitado, ID_Gestionado_Por, ID_Resuelto_Por,
  Estado, Fecha_Solicitud, Fecha_Resolucion, Notas_Staff,
  Sexo_Candidato, Cedula_Candidato, Estado_Civil, Condicion_Civil,
  Nombre_Conyuge, Conyuge_Ocupacion, Conyuge_Centro_Laboral,
  Tiene_Hijos, Numero_Hijos,
  Dir_Ciudad, Dir_Municipio, Dir_Distrito, Dir_Barrio, Dir_Exacta,
  Tel_Casa, Tel_Oficina, Tel_Claro, Tel_Movistar,
  Ocupacion_Candidato, Centro_Laboral_Candidato, Nivel_Academico_Candidato,
  ID_Red, Estado_Liderazgo,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales_Sol,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 1, 1, 1,
  'Aprobado', NOW(), NOW(), 'Importación desde formulario Excel - Turno Miercoles',
  'Femenino', '085-171281-0002F', 'Soltero', 'Ninguna',
  NULL, NULL, NULL,
  FALSE, NULL,
  'Managua', 'Ciudad Sandino', NULL, 'Santa Eduviges', 'II etapa ; casa i8',
  '2231 2295', '87000874', NULL, '7792 4662',
  'Responsable de importaciones', 'Comercializadora de Mani S.A.', 'Ingenieria',
  3, 'Lider_Apoyo',
  '2023-01-01', 'Ano',
  72, NULL,
  TRUE, '2023-01-01', 'Ano',
  FALSE, 'Completado',
  TRUE, 'Di clases en la universidad de computacion, clase matematica e ingles personalizada',
  NULL,
  TRUE, 'Asambleas de Dios / pentecoste', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND Estado = 'Aprobado');

-- Requisitos: Flor Patricia Ulloa Peralta
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')) AND ID_Requisito = 6);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')) AND ID_Requisito = 8);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')) AND ID_Requisito = 1);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')) AND ID_Requisito = 5);
INSERT INTO Solicitudes_Requisitos (ID_Solicitud, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Solicitudes_Requisitos WHERE ID_Solicitud = (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F')) AND ID_Requisito = 7);

-- Personal_Sistema: Flor Patricia Ulloa Peralta
INSERT INTO Personal_Sistema (ID_Persona, ID_Rol, Usuario, Password_Hash, Fecha_Ingreso_Servicio, ID_Creado_Por, ID_Autorizado_Por, ID_Solicitud_Origen)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 1,
  'temp_12_miercoles',
  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlqXqFBYyFsF5SPTlHGm0TnLmhe',
  CURRENT_DATE, 1, 1, (SELECT MAX(ID_Solicitud) FROM Solicitudes_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'))
WHERE NOT EXISTS (SELECT 1 FROM Personal_Sistema WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'));

-- Info Personal: Flor Patricia Ulloa Peralta
INSERT INTO Personal_Info_Personal (ID_Persona, Estado_Civil, Condicion_Civil, Nombre_Conyuge, Tiene_Hijos, Numero_Hijos, Direccion, Ocupacion, Centro_Laboral, Nivel_Academico)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 'Soltero', 'Ninguna', NULL, FALSE, NULL, 'II etapa ; casa i8', 'Responsable de importaciones', 'Comercializadora de Mani S.A.', 'Ingenieria'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Personal WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'));

-- Info Iglesia: Flor Patricia Ulloa Peralta
INSERT INTO Personal_Info_Iglesia (
  ID_Persona, ID_Red, Estado_Liderazgo,
  Tiempo_Iglesia_Meses, Ministerio_Adicional,
  Bautizado_Agua, Fecha_Bautismo, Fecha_Bautismo_Precision,
  Circulo_Amistad_Desde, Circulo_Amistad_Precision,
  Clases_Biblicas_Ninos, Clases_Biblicas_Detalle,
  Capacitacion_Ensenanza, Capacitacion_Detalle,
  Observaciones_Espirituales,
  Asistio_Otra_Iglesia, Nombre_Otra_Iglesia, Denominacion_Otra_Iglesia
) SELECT
  (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 3, 'Lider_Apoyo',
  72, NULL,
  TRUE, '2023-01-01', 'Ano',
  '2023-01-01', 'Ano',
  FALSE, 'Completado',
  TRUE, 'Di clases en la universidad de computacion, clase matematica e ingles personalizada',
  NULL,
  TRUE, 'Asambleas de Dios / pentecoste', 'Otro'
WHERE NOT EXISTS (SELECT 1 FROM Personal_Info_Iglesia WHERE ID_Persona = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'));

-- Personal Requisitos: Flor Patricia Ulloa Peralta
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 6, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND ID_Requisito = 6);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 8, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND ID_Requisito = 8);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 1, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND ID_Requisito = 1);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 5, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND ID_Requisito = 5);
INSERT INTO Personal_Requisitos (ID_Personal, ID_Requisito, Cumplido, Fecha_Cumplido)
SELECT (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F'), 7, TRUE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM Personal_Requisitos WHERE ID_Personal = (SELECT ID_Persona FROM Personas WHERE Cedula = '085-171281-0002F') AND ID_Requisito = 7);

-- ============================================================================
-- FIN: 12 personas procesadas
-- ============================================================================

COMMIT;
