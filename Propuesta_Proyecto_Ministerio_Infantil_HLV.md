# PROPUESTA DE PROYECTO
## Sistema de Gestión y Control de Asistencia del Ministerio Infantil HLV

---

## 1. Resumen Ejecutivo
El **Ministerio Infantil Hosanna Linda Vista (HLV)** atiende semanalmente a niños de entre 4 y 12 años de edad, recibiendo también de forma ocasional a niños menores de 4 años bajo la supervisión directa de sus padres o tutores. Actualmente, los procesos operativos y administrativos se apoyan en métodos analógicos basados en papel y planillas manuales escritas cada domingo.

Esta propuesta presenta el **Sistema de Gestión y Control de Asistencia del Ministerio Infantil (SAMI-HLV)**, una solución tecnológica web diseñada para centralizar, digitalizar y optimizar la administración del ministerio. El proyecto cuenta con un prototipo y adelanto funcional avanzado en su frontend y backend, desarrollado e implementado de forma voluntaria y pro-bono por el colaborador del ministerio, **Sergio Daniel Martínez González**.

El propósito de este documento es justificar la necesidad del sistema, detallar sus objetivos, módulos, viabilidad y escalabilidad, y solicitar la aprobación de los coordinadores y el liderazgo de la iglesia para su implementación, despliegue y puesta en marcha oficial.

---

## 2. Justificación del Proyecto
El actual sistema manual basado en papel presenta limitaciones críticas que justifican una transición digital inmediata:

*   **Deficiencias en la Calidad de los Datos:** Al rellenar planillas físicas de forma rápida los domingos, los padres suelen escribir datos incompletos o incorrectos (teléfonos erróneos, nombres ilegibles), lo que provoca una constante pérdida de información e impide una comunicación oportuna.
*   **Atraso Operativo y Desperdicio de Papel:** La recolección manual de firmas y datos genera cuellos de botella y demoras en las horas de entrada de los niños. Además, produce un alto volumen constante de desperdicio de planillas impresas obsoletas.
*   **Complejidad en el Seguimiento Individual (Expedientes):** Con el sistema de papel es casi imposible llevar un expediente consolidado del desarrollo del niño que documente sus incidencias conductuales, fortalezas y debilidades a lo largo de su paso por las aulas.
*   **Falta de Registro de Condiciones (Módulo Médico):** Actualmente **no existe** una gestión de datos médicos. El sistema propone incorporar un expediente médico preventivo donde se registren condiciones preexistentes relevantes de los niños. 
    > ⚠️ **Nota de Aclaración Médica:** Este módulo tiene como único propósito que el personal esté al tanto de si el niño presenta alguna condición especial. Ante cualquier síntoma sospechoso o incidente, el personal del ministerio **no actuará directamente sobre la situación médica del menor**, sino que utilizará esta información para contactar de inmediato y de forma precisa al tutor asignado.
*   **Gestión de Transiciones y Despedida (13 Años):** Se dificulta planificar de forma automática el traspaso de los niños entre grupos de edad y, de manera muy especial para la localidad de Linda Vista, gestionar la despedida y el proceso de preparación formativa de los preadolescentes de 13 años antes de su transición definitiva al servicio general del templo.
*   **Control de Personal y Maestros:** Es sumamente complejo registrar con precisión las inasistencias y puntualidad del equipo. Asimismo, se requiere un espacio digital centralizado para almacenar las observaciones generadas por los coordinadores generales acerca de las actitudes y comportamientos de los maestros.
*   **Coordinación de Eventos Especiales:** El ministerio organiza diversas actividades extraordinarias fuera del servicio dominical regular; el sistema manual no permite programar, asignar roles ni registrar la asistencia de forma integrada.

---

## 3. Objetivos del Proyecto

### 3.1. Objetivo General
Implementar y desplegar el **Sistema de Gestión y Control de Asistencia del Ministerio Infantil (SAMI-HLV)** en la localidad de Hosanna Linda Vista para mejorar el orden de la información, brindar un mejor servicio y cuidado a los niños —optimizando su ingreso y retiro seguro— y permitir una mejor preparación en situaciones de emergencia, evitando pérdidas de información.

### 3.2. Objetivos Específicos
1.  **Digitalizar el Expediente del Niño:** Desarrollar un perfil único por niño que registre datos personales, incidencias, fortalezas, debilidades y sus condiciones de salud con fines informativos de emergencia.
2.  **Agilizar el Control de Asistencia y Flujo Seguro:** Reemplazar las hojas de firmas por un flujo rápido de check-in y check-out digital enlazado a un inventario de fichas físicas de retiro.
3.  **Monitorear el Desempeño del Personal:** Crear un expediente de maestros donde los coordinadores generales puedan registrar observaciones de actitud, comportamiento e inasistencias.
4.  **Automatizar Alertas y Transiciones:** Configurar el widget de cumpleaños del mes y notificaciones para el cambio de aulas y el egreso especial de jóvenes de 13 años hacia el templo.
5.  **Controlar Eventos Especiales:** Incorporar un módulo de gestión de eventos que permita registrar la asistencia, logística y roles del personal para actividades extraordinarias.
6.  **Garantizar la Escalabilidad:** Diseñar el sistema con una arquitectura flexible que permita implementarlo a futuro en otras localidades de Hosanna y a nivel del ministerio general.

---

## 4. Factibilidad del Proyecto

### 4.1. Factibilidad Económica (Costo de Desarrollo y Mantenimiento $0)
El proyecto cuenta con una factibilidad económica absoluta para la iglesia:
*   **Costo de Mano de Obra:** **$0 USD**. El diseño, codificación e implementación son realizados de forma pro-bono por el desarrollador y colaborador del ministerio, **Sergio Daniel Martínez González**.
*   **Costo de Mantenimiento e Infraestructura:** **$0 USD** para la iglesia. El mismo colaborador ha decidido asumir por su propia cuenta todos los gastos de alojamiento de base de datos (PostgreSQL), API del backend y plataforma del frontend en servidores en la nube.

### 4.2. Factibilidad Técnica y de Acceso
Al tratarse de una **aplicación web responsiva (Mobile-First)**, no existe la necesidad de adquirir dispositivos de hardware dedicados. Cualquier miembro autorizado (Coordinadores, Staff o Maestros) puede acceder al sistema de forma segura desde sus propios teléfonos móviles, tablets o laptops con conexión a internet.

---

## 5. Módulos y Presentación de Interfaces
El prototipo funcional avanzado cuenta con las siguientes interfaces principales. Debajo de cada módulo se encuentra el espacio reservado para cargar las capturas de pantalla de las interfaces desarrollada por el colaborador del ministerio.

---

### Módulo 1: Tablero Principal (Dashboard)
Centraliza las métricas clave (asistencias dominicales, maestros de turno, estado de fichas) y muestra de forma permanente el widget de cumpleaños del mes en curso para una rápida acción de felicitaciones.

> 📸 **[CAPTURA DE PANTALLA: DASHBOARD PRINCIPAL]**
> *Espacio para insertar imagen: `dashboard_mockup.png`*

---

### Módulo 2: Expediente Único del Niño y Condiciones Médicas
Formulario de registro de menores y panel de consulta rápida. Registra incidencias, fortalezas, debilidades y condiciones médicas de salud que sirvan para alertar de inmediato a los tutores en caso de sospecha médica.

> 📸 **[CAPTURA DE PANTALLA: EXPEDIENTE Y CONDICIONES MÉDICAS]**
> *Espacio para insertar imagen: `registro_ninos.png`*

---

### Módulo 3: Flujo de Check-in Rápido y Control de Asistencia
Sistema ágil de búsqueda y asignación de fichas de seguridad por color y código según el rango de edad. Reduce el tiempo de espera de los padres en la entrada.

> 📸 **[CAPTURA DE PANTALLA: MODAL O PANEL DE ASISTENCIA RÁPIDA]**
> *Espacio para insertar imagen: `asistencia_rapida.png`*

---

### Módulo 4: Registro y Observaciones sobre Maestros
Ficha detallada de los maestros de servicio, donde los coordinadores generales pueden registrar asistencia y observaciones cualitativas sobre su actitud y comportamiento.

> 📸 **[CAPTURA DE PANTALLA: EXPEDIENTE Y ASISTENCIA DE MAESTROS]**
> *Espacio para insertar imagen: `pagina_lideres.png`*

---

### Módulo 5: Gestión de Fichas Físicas y Entrega Segura
Inventario activo de fichas de salida para garantizar la seguridad en el retiro de los niños, validando que el tutor y la ficha coincidan digitalmente en la base de datos.

> 📸 **[CAPTURA DE PANTALLA: CONTROL DE INVENTARIO DE FICHAS]**
> *Espacio para insertar imagen: `gestion_fichas.png`*

---

### Módulo 6: Gestión de Eventos Especiales del Ministerio
Módulo para la planificación de eventos anuales, campamentos, días festivos y capacitaciones, registrando la asistencia de niños y la logística del equipo organizador.

> 📸 **[CAPTURA DE PANTALLA: EVENTOS ESPECIALES DEL MINISTERIO]**
> *Espacio para insertar imagen: `turnos_eventos.png`*

---

### Módulo 7: Reportes, Históricos y Exportación
Consolidador de estadísticas de asistencia de niños y maestros, con capacidad de exportación a Excel y CSV para auditorías de los coordinadores y pastores.

> 📸 **[CAPTURA DE PANTALLA: REPORTES Y EXPORTACIÓN]**
> *Espacio para insertar imagen: `reportes_excel.png`*

---

## 6. Escalabilidad y Visión de Futuro
Aunque la propuesta inicial está enfocada en la implementación y despliegue del sistema en la localidad de **Hosanna Linda Vista**, la arquitectura del software ha sido diseñada bajo estándares multisitio y modulares. 

### 6.1. Escalabilidad Geográfica
Una vez validada la fase piloto, el sistema tiene la capacidad técnica de escalarse de forma sencilla para:
*   **Multi-localidades:** Registrar y separar la información operativa de otras congregaciones o sucursales de Hosanna.
*   **Ministerio General:** Brindar un panel de control global para los líderes generales del ministerio.

### 6.2. Visión del Ecosistema Digital (Futura Web para la Comunidad)
El despliegue de este sistema establece un precedente valioso y fundamental para la digitalización del ministerio, abriendo el camino para conectar con una generación de niños que ya se encuentra altamente inmersa en la tecnología. 

A futuro, esta plataforma puede evolucionar para incorporar una **aplicación web complementaria de generación de contenido y recursos espirituales específicos para los niños**, permitiendo que:
*   El aprendizaje de la palabra no se limite a los días de servicio dominical.
*   Los padres tengan acceso inmediato a materiales interactivos, devocionales y actividades recreativas familiares.
*   Se fomente una conexión más profunda y activa con Dios en el hogar, uniendo a la familia a través de la tecnología educativa cristiana.

---

## 7. Plan de Implementación y Propuesta de Despliegue
El despliegue se propone en tres fases secuenciales:

*   **Fase 1: Configuración en la Nube (Semana 1):** Configuración del servidor PostgreSQL y el hosting web a cuenta y cargo del desarrollador.
*   **Fase 2: Migración e Importación (Semana 2):** Importación de los datos históricos de niños y padres desde los registros actuales a la base de datos. Pruebas internas del flujo web en dispositivos móviles.
*   **Fase 3: Capacitación y Lanzamiento (Semana 3):** Breve taller práctico para que los maestros y personal de puerta se familiaricen con el uso del sistema desde sus teléfonos móviles. Lanzamiento oficial y retiro del papel.

---

## 8. Conclusión
El despliegue del sistema **SAMI-HLV** representa el paso definitivo del Ministerio Infantil Hosanna Linda Vista hacia la excelencia en seguridad infantil, cuidado pastoral y efectividad administrativa. Al resolver de raíz los problemas del registro manual en papel y contar con un costo de mano de obra de cero pesos gracias al trabajo voluntario, el proyecto demuestra una factibilidad sobresaliente y un retorno de valor organizativo inmediato.

Agradecemos de antemano el apoyo de la coordinación general y el liderazgo pastoral para llevar a cabo el despliegue de esta valiosa herramienta eclesiástica.

---
**Presentado por:**
**Antonia y Moises Ramírez**
*Coordinadores Generales del Ministerio Infantil de Hosanna Linda Vista*

**Desarrollo del Proyecto a cargo de:**
**Sergio Daniel Martínez González**
*Colaborador del Ministerio Infantil HLV*

**Fecha de Presentación:** 19 de Junio, 2026
