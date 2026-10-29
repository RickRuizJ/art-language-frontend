# Art & Language Campus — reporte final de correcciones

Fecha: 28 de octubre de 2026. Responsable de la revisión: entrega técnica para Rick.

**Resultado: remediación implementada y pruebas locales satisfactorias. GO para staging controlado; NO-GO para producción hasta validar migración/restauración del clon real y servicios externos.** No se hizo push, despliegue, modificación de producción ni envío de correo a estudiantes reales.

## Alcance y entregables

Se partió de los proyectos `*-github`, cotejados con los `*-main`, el paquete de cambios y la auditoría del 28 de octubre. Las copias de entrada se conservaron intactas. Se entregan proyectos completos e independientes en `art-language-frontend-FINAL.zip` y `art-language-backend-FINAL.zip`, junto con `INSTRUCCIONES_GITHUB_FINAL.md` y este reporte. No se requiere combinar versiones.

Se conserva la identidad visual, editor, PDF interactivo, dashboards, grupos, workbooks, materiales, mensajes, Practice y Ask AL. Se corrigen compatibilidad y acceso de Practice; no se rediseñan sus juegos ni se implementa su futura persistencia avanzada. El flujo existente PDF se volvió a probar de extremo a extremo.

## Hallazgos HIGH

| ID | Corrección implementada | Evidencia y límite |
|---|---|---|
| H01 | `access.service` autoriza gestión solo por supervisión vigente en grupos activos; `teacher_id` residual no concede acceso. | Antiguo profesor rechazado después de la última retirada; admin legítimo conserva acceso. |
| H02 | Reset en transacción: bloqueo del usuario, nueva consulta/bloqueo del token vigente y borrado condicional de una fila, junto con contraseña y revocación. | Dos solicitudes simultáneas: 200/400; repetición rechazada. Probado con PGlite; falta ensayo con dos conexiones PostgreSQL reales. |
| H03 | Rutas antigua y nueva usan la misma retirada transaccional; limpian membresía y representación directa aplicable. | Ambos flujos revocan tareas/gestión y conservan alumno, entregas y notas. |
| H04 | Perfil/progreso/entregas se limitan a worksheets propios y grupos autorizados; alumno compartido no expone la historia exclusiva de otro docente. | Regresión con dos docentes y alumno compartido. |
| H05 | `manual_activities`, relación opcional con assignment, identidad canónica y unicidad `(activity_id, student_id)`, más bloqueo asesor en creación. | Doble POST y selección repetida devuelven 409; otra persona puede recibir nota de la misma actividad. Importados retenidos y señalados. |
| H06 | Promedio oficial automático separado de resumen manual; historial con fuente explícita y misma condición de liberación en ambas pantallas. | 100 automático + 50 manual conserva oficial 100; `after_review` no liberado no entra. Sin pesos ni promedio combinado. |
| H07 | Estado de fallo y comprobación de columnas de todos los modelos, ledger, índices y FK; API bloqueada antes de procesar cuerpos si no está lista. | Esquema vacío, columna ausente y fallo real de migración: readiness/API 503; recuperación solo tras verificar esquema. |
| H08 | Actualización compatible de Next, Multer, Express, Sequelize y dependencias transitivas; lockfiles y runtime alineados. | Auditoría producción: 0 alertas en ambos; quedan 6 LOW de desarrollo por proyecto, una cadena subyacente deepmerge/Jest. |

H01–H07 quedan resueltos en el código y ensayos aislados. H08 elimina las alertas de dependencias de producción detectadas por npm en esta revisión, con la limitación de desarrollo descrita más abajo. No se confunde ausencia de alertas con ausencia de vulnerabilidades.

## Hallazgos MEDIUM

| ID | Resultado |
|---|---|
| M01 | `auth_version` se incrementa al cambiar contraseña; JWT compara versión, rol y estado actual en DB. Se comprueba revocación en el mismo segundo y login nuevo válido. JWT heredado sin versión solo se acepta con versión 0 y el corte seguro de fecha. |
| M02 | Forgot Password responde uniformemente y encola trabajo duradero para conocido/desconocido; trabajo desconocido no envía correo. Piso temporal aproximado de respuesta y fallo de proveedor sin enumeración explícita. No promete resistencia absoluta a análisis estadístico de tiempos. |
| M03 | Tipos estrictos, números finitos de hasta dos decimales, nota dentro del máximo, UUID por formato, fecha canónica y URL HTTP(S) con host y sin credenciales. Valores nulos, booleanos, arrays y fechas imposibles devuelven 400. |
| M04 | Contraseña temporal de 24 horas, cambio obligatorio, modal con dos campos password, auditoría duradera de acciones, sin guardar secretos en eventos. Desactivar/reactivar no revive sesiones revocadas. |
| M05 | Validación devuelve campo/mensaje y omite valores de contraseñas. Upload y handlers no devuelven configuración ni mensajes internos de DB. |
| M06 | Política bcrypt por bytes: mínimo 8 caracteres, no solo espacios, máximo 72 bytes UTF-8; hashes nuevos coste 12. Se preservan hashes anteriores. Usuarios con contraseña heredada de más de 72 bytes deberán recuperarla para establecer una compatible; no se intenta truncar/rehashear masivamente. |
| M07 | Copia de membresías redundantes antes de consolidar y UNIQUE alumno/grupo. Se normaliza la pertenencia directa heredada y se comparten operaciones de altas/bajas. No se borran cuentas ni registros académicos. |
| M08 | Referencias ORM y FK verificables en DB para resets y notas manuales, incluso si tablas fueron creadas antes con ORM. Un huérfano provoca aborto de migración, no borrado automático. |
| M09 | Corrección con transacción, bloqueo y versión; motivo obligatorio; historial retenido y auditoría append-only con trigger. Dos ediciones con la misma versión: una 200 y otra 409. |
| M10 | CSV del servidor por lotes de 500, snapshot repetible, todos los resultados filtrados y neutralización de prefijos de fórmula. Listado paginado con total; exportación no se limita a los 200 visibles. |
| M11 | Cuotas PostgreSQL por operación/IP/cuenta/token; HMAC de claves; cuota por correo y reset docente; timeout de envío de 10 segundos y tres intentos. Se añade presupuesto de Ask AL en backend. Requiere ajustar proxy/capacidad con tráfico real. |
| M12 | TLS verifica certificados en producción; se eliminan flags de URL que podrían sobrescribir la validación y se permite CA del proveedor. Desactivar TLS en producción se rechaza. Falta probar el certificado/conexión del proveedor real. |

## LOW y compatibilidad

- **L01:** join exige alumno y grupo activo; registro tampoco acepta código inactivo. Archivar grupo conserva sus relaciones/historia y cierra assignments activos; un grupo archivado no autoriza gestión. No se añadió una interfaz nueva para reactivar grupos archivados.
- **L02:** guard de sesión estudiantil en hub, juegos y placement. No se agregó una API de progreso para XP/rachas de Practice ni la futura actividad Listening; permanecen limitaciones funcionales anteriores y explícitas, fuera del rediseño solicitado.
- **L03:** Node 24 recomendado y probado; engines, lockfiles, `.nvmrc`, instalación reproducible con `npm ci`, Vercel y CI alineados. CI usa permisos de lectura y no despliega; falta ejecutarlo en GitHub.
- **L04:** generador único con `crypto.randomInt` para modelo y rutas; constraint de código único y tratamiento de colisiones al crear. No se rotaron códigos existentes.
- **L05:** respuestas 500 genéricas en superficies revisadas, CORS 403 y errores de upload 400; se retiraron logs de configuración Axios y datos de upload. Se conservan rutas alternativas históricas sin montarlas. Los manejadores globales heredados de excepciones/rechazos del proceso aún pueden registrar el objeto interno: acceso a logs restringido y revisión de redacción pendiente. No se afirma saneamiento de todos los logs de toda la plataforma.

Los JWT siguen en localStorage conforme al diseño existente. Una futura XSS podría leerlos; no se demostró una vía XSS en esta remediación. La migración a cookies HttpOnly/CSRF y una prueba de penetración completa quedan fuera de este cambio. La clave general docente conserva el modelo solicitado: una sola clave privada en backend, comparada de forma segura; cada docente usa contraseña personal. No se incluye el valor elegido por el propietario.

## Política de evaluación y comportamiento manual

Se mantiene `automatic_only` como modo oficial permitido de `grading_policy`; la tabla prepara una futura configuración, pero habilitar combinación requiere una decisión y migración explícitas. No hay pesos inventados ni preview combinado. Las notas automáticas no se recalculan ni se sobrescriben al corregir las manuales.

Analytics y dashboard usan resultados automáticos de worksheets asignadas, último intento calificado/revisado aplicable y condición de liberación consistente. Manual Grading muestra alumno, grupo, actividad/tarea, título, URL, score, máximo, porcentaje, feedback, estado e historial. El alumno ve sus fuentes Automatic/Manual. Los resúmenes manuales no alteran assigned/completed/attempts oficiales automáticos.

La identidad combina grupo, tarea opcional, título normalizado, URL canónica y fecha. Puede reutilizarse una actividad para varios alumnos. El registro de actividad importada mantiene una identidad separada por nota original, sin deduplicación especulativa. Al crear una coincidencia heredada se avisa con conflicto en lugar de duplicarla. Correcciones cambian score/máximo/feedback con motivo y versión; no reescriben la identidad de una actividad ya calificada. Archivo/restauración conserva nota e historial y queda auditado. El docente debe mantener supervisión vigente para modificar el alumno; las consultas históricas propias no conceden gestión residual.

## Base de datos y migraciones

1. **Nuevo `20230101_initial_schema.sql`:** bootstrap aditivo de tablas y enums centrales para que el runner también admita una base vacía; `IF NOT EXISTS` preserva tablas existentes. No sustituye la revisión de tipos/columnas de un clon real.
2. **`20260721_sprint0_stabilization.sql` y `20261005_lms_stabilization.sql`:** se reemplaza la renumeración automática heredada por comprobación que aborta ante intentos ambiguos. Un archivo ya aplicado según ledger no se repite. No se modifican números de intentos de producción durante esta entrega.
3. **Se conserva `20261028_account_security_manual_grades.sql`:** primera ampliación de seguridad/manual de la versión recibida.
4. **Nuevo `20261028b_security_remediation.sql`:** campos de sesión/temporalidad, auditoría inmutable, archivo de membresías redundantes y unicidad, normalización de pertenencia, actividades y versión de notas, conservación de manuales previas, FK y checks, outbox de correo con snapshot de versión de sesión, cuotas y política automática.
5. **Runner:** bloqueo asesor de migraciones, SQL/ledger transaccional, fallos con categoría redactada; no ejecuta sync destructivo. `AUTO_MIGRATE=false` por defecto. Readiness comprueba esquema, no solo SELECT 1. Si falla inicialización se exige corregir y reiniciar antes de reabrir.

En la prueba de migración se sembró un esquema anterior con cuentas bcrypt, grupos, membresías duplicadas, worksheets, assignments, submissions y dos notas manuales. Se verificaron preservación de filas/valores académicos, normalización controlada, acceso posterior y notas importadas conservadas. El caso llamado Veronica es **una cuenta sintética de prueba**, no la cuenta real de una alumna. No se manipuló ninguna base de producción.

**Reversión:** conservar esquema aditivo y registros, volver al par de código validado y corregir configuración; no hay down que borre datos. Restauración de DB solo dentro de un plan probado y con reconciliación de escrituras posteriores. Volver al original auditado reabre fallos y no respeta auth_version; requiere bloqueo de rutas/parches y posible rotación JWT. El procedimiento operativo detallado está en la guía.

## Pruebas finales y comandos

Entorno: Linux aislado, Node 24.22.1, npm 11.9.0, PGlite 0.5.8/socket y Chromium 141 con Playwright 1.56.1. Bases y servicios locales efímeros; Cloudinary/Resend simulados. No se usaron credenciales reales. Los siguientes son los comandos de instalación, verificación y diagnóstico relevantes ejecutados durante la remediación; búsquedas/lecturas y parches de archivos son operaciones de implementación, no pruebas adicionales.

| Directorio / comando | Resultado final |
|---|---|
| Backend y frontend: `npm install` con actualizaciones compatibles explícitas y `npm update` | Lockfiles actualizados; sin `npm audit fix --force`. |
| Backend: `npm ci` | Instalación limpia correcta. |
| Frontend: `npm ci` | Instalación limpia correcta. |
| Backend: `npm ci --prefix tests/system` | Instalación aislada de herramientas correcta. |
| Backend: `npm test -- --runInBand` | 6 suites, **60/60**. Se confirmó también con `--json --outputFile=../../final-evidence/backend-unit-final.json`; salida 0. |
| Frontend: `npm test -- --runInBand` | 5 suites, **41/41**; salida 0. |
| Backend: `npm run test:integration` | **34** comprobaciones API heredada + **40** interactivas = **74/74**; salida 0. |
| Backend: `npm run test:security` | **105/105**; salida 0. |
| Backend: `npm run test:startup` | **11/11** sobre entrypoint real, incluyendo migración fallida/FK y TLS desactivado rechazado; salida 0. |
| Backend: `node --check <archivo>` sobre src, scripts y runners JS/MJS | **74 archivos**, sin errores. |
| Frontend: `NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_API_URL=http://localhost:5000/api npm run build` | Build de producción correcto, rutas generadas; salida 0. |
| Backend: `FRONTEND_DIR=<ruta-frontend> E2E_CHROME=<Chromium141> npm run test:browser --prefix tests/system` | Flujo PDF completo y **32/32** controles UI; salida 0, sin errores JS no capturados. |
| Backend y frontend: `npm audit --omit=dev --json` | **0** alertas producción en cada proyecto; salida 0. |
| Backend y frontend: `npm audit --json` | **6 LOW**, 0 moderate/high/critical por proyecto; salida 1 por las alertas de desarrollo. |
| Backend/tests/system: `npm audit --json` | **0** alertas; salida 0. |
| Instalación de PostgreSQL nativo mediante `apt-get update` y ensayo con paquete `embedded-postgres` en carpeta privada de evidencia | No viable: restricciones de UID/setgroups y biblioteca nativa libpq ausente. No se afirma validación en PostgreSQL nativo. Ninguna de esas herramientas se incorpora al producto. |
| Instalación/selección de Chromium para el runner | Descarga de una variante más reciente falló con ZIP inválido; se utilizó Chromium 141 ya disponible, compatible y con recorrido final aprobado. |
| Empaquetado Python `zipfile`, `testzip`, extracción y comparación SHA-256 por miembro | Se verifica al cerrar la entrega y se registra en `VALIDACION_FINAL.json`/control de paquetes. |

La ejecución del CLI `npm run migrate` está cubierta dentro de los runners de migración/arranque en bases efímeras; `npm run check:readiness` se entrega para el host. La ruta HTTP de readiness sí se probó contra proceso real. No se ejecutaron esos comandos contra Neon ni el hosting del propietario.

La batería final suma **323 comprobaciones con contador** (60+41+74+105+11+32), además del recorrido PDF y los análisis estáticos/build/dependencias. Son comprobaciones de suites con propósitos distintos; no 323 usuarios ni una certificación de carga.

Cobertura UI: login personal docente, altas/ediciones/estado del alumno, reset enmascarado, cambio temporal forzado en móvil, selección de assignment, creación/corrección/historial manual, duplicado visible, CSV, archivo/restauración, perfil, registro docente con clave general, registro estudiantil con código, Forgot/Reset y conservación de historia tras recuperación. Se verificó ausencia de desbordamiento en Students/Analytics a 390 px y escritorio a 1440 px. PDF: subida, render, campos, publicación/asignación, guardado/reanudación móvil, envío, revisión, 100% y Analytics.

Se resolvieron fallos intermedios antes del cierre: status incorrecto de upload no admitido; mock de dashboard afectado por la nueva consulta de historial; selectores Playwright de opciones ocultas y botones de rol; enlace loopback explícito para Next en este entorno; configuración de conexiones del socket PGlite y Chromium antiguo incompatible con el PDF. Hubo además un primer comando de auditoría de tests/system con ruta de salida incorrecta; se corrigió y terminó con 0 alertas. Los resultados finales de la tabla pertenecen a las ejecuciones posteriores a esos ajustes. La confirmación de 60 tests backend se guardó explícitamente porque un log previo no contenía el resumen completo.

Los runners, fixtures y pruebas se incluyen para reproducir la verificación. `tests/system/results/`, capturas y logs privados no se incluyen en los ZIP. `VALIDACION_FINAL.json` conserva un resumen y resultados textuales sin secretos. Las capturas se usaron únicamente para inspección interna.

## Dependencias y límites de seguridad

| Componente | Versión instalada en lockfile final |
|---|---|
| Next / eslint-config-next | 15.5.28 |
| React / React DOM | 18.3.1 |
| Axios | 1.21.0 |
| pdfjs-dist | 5.4.624, worker generado desde esa misma versión |
| Express | 4.22.3 |
| Multer | 2.5.0 |
| Sequelize | 6.37.8 |
| bcryptjs | 3.0.3 |
| pg | 8.23.1 |
| Cloudinary | 2.11.0 |

Se aplicaron overrides compatibles para dottie, lodash, moment, proxy-addr, underscore y uuid en backend, y postcss/source-map-js/nanoid en frontend. El uso de multer 2 se probó en upload y en el flujo PDF. Se mantuvo React 18 compatible para evitar una migración funcional innecesaria.

Las seis alertas LOW de cada instalación completa corresponden a **una cadena deepmerge/Jest**, con paquetes transitivos afectados en herramientas de pruebas; no son seis exploits independientes. El escáner propone bajar Jest a una versión mayor antigua en parte de esa cadena, por lo que no se forzó. Persiste riesgo durante instalación/ejecución de herramientas de desarrollo: usar CI de confianza, no ejecutar configuraciones de pruebas no confiables y actualizar al publicarse una resolución compatible. Producción auditada con `--omit=dev` da cero. No se promete que avisos futuros o servicios externos estén cubiertos por ese resultado puntual.

Fuentes primarias: [Next security update](https://nextjs.org/blog/nextjs-security-update-october-14-2026), [Multer security advisories](https://github.com/expressjs/multer/security/advisories), [setup-node](https://github.com/actions/setup-node). Las versiones se verifican en los lockfiles incluidos y los resúmenes de auditoría corresponden a la ejecución de esta entrega.

## Pendientes y decisión de despliegue

**NO-GO producción.** No se dispone de clon autorizado de la base real, credenciales/CA de hosting ni buzón/dominio/almacén de staging. Por ello no se verificaron: migración/restauración representativa real, concurrencia de dos conexiones PostgreSQL/Neon, extensiones/datos particulares, entrega real Resend, TLS del proveedor, Cloudinary real, comportamiento bajo carga y despliegue remoto de CI. PGlite ejecuta SQL PostgreSQL, pero su serialización no certifica la concurrencia de varias conexiones/procesos PostgreSQL reales.

Se entregó todo lo realizable sin esos accesos. No hay pérdida conocida de cuentas/notas en los ensayos, pero eso no demuestra preservación sobre una base real no inspeccionada. Antes de producción deben cerrarse los controles de la sección 9 de la guía y registrar comparación de datos antes/después. No se autoriza implicitamente ningún envío, push o despliegue mediante esta documentación.

Otros riesgos acotados: alertas LOW de herramientas de desarrollo, logs globales heredados, JWT en localStorage y persistencia avanzada de Practice pendiente. Readiness valida el esquema; `/health` y configuración de correo no certifican entrega. Un fallo de migración o datos huérfanos debe resolverse en staging, sin borrar historia ni maquillar el ledger.

## Inventario de archivos

La lista siguiente se genera mediante comparación binaria con los proyectos `*-github` recibidos. También se coteja presencia contra `*-main`. Se omiten exclusivamente dependencias instaladas, builds, worker generado y resultados locales. Incluye documentación y evidencia reproducible agregada a cada proyecto.

<!-- GENERATED INVENTORY -->

### Frontend

89 archivos entregados; 24 modificados y 13 nuevos respecto de `*-github`. Cero rutas originales ausentes y cero archivos fuente retirados.

**Modificados**

- `.gitignore`
- `GUIA_ACTUALIZACION_GITHUB.md`
- `next.config.js`
- `package-lock.json`
- `package.json`
- `src/app/api/al-assistant/route.js`
- `src/app/dashboard/student/page.js`
- `src/app/dashboard/student/placement-test/page.js`
- `src/app/dashboard/student/practice-hub/page.js`
- `src/app/dashboard/student/practice/grammar-challenge/page.js`
- `src/app/dashboard/student/practice/spelling-challenge/page.js`
- `src/app/dashboard/student/practice/vocab-match/page.js`
- `src/app/dashboard/teacher/page.js`
- `src/app/groups/[id]/page.js`
- `src/app/register/page.js`
- `src/app/reset-password/page.js`
- `src/app/worksheets/upload/page.js`
- `src/components/AnalyticsPanel.jsx`
- `src/components/ManualGrading.jsx`
- `src/components/StudentManagement.jsx`
- `src/contexts/AuthContext.js`
- `src/lib/api.js`
- `tests/dashboard.test.js`
- `vercel.json`

**Nuevos**

- `.env.example`
- `.github/workflows/ci.yml`
- `.nvmrc`
- `INSTRUCCIONES_GITHUB_FINAL.md`
- `README.md`
- `REPORTE_FINAL_CORRECCIONES.md`
- `VALIDACION_FINAL.json`
- `src/app/change-password/page.js`
- `src/components/AcademicHistory.jsx`
- `src/components/Modal.jsx`
- `src/components/StudentAccess.jsx`
- `src/lib/passwordRules.js`
- `tests/academic-history.test.js`

### Backend

109 archivos entregados; 44 modificados y 24 nuevos respecto de `*-github`. Cero rutas originales ausentes y cero archivos fuente retirados.

**Modificados**

- `.env.example`
- `.gitignore`
- `GUIA_ACTUALIZACION_GITHUB.md`
- `backend-dependencies.json`
- `package-lock.json`
- `package.json`
- `scripts/e2e-server.js`
- `scripts/integration-test.js`
- `scripts/interactive-integration-test.js`
- `src/app.js`
- `src/config/config.json`
- `src/config/database.js`
- `src/config/migrate.js`
- `src/controllers/analyticsController.js`
- `src/controllers/authController.js`
- `src/controllers/studentController.js`
- `src/controllers/submissionController.js`
- `src/controllers/teacherController.js`
- `src/controllers/uploadController.js`
- `src/middleware/auth.js`
- `src/middleware/errorHandler.js`
- `src/migrations/20260721_sprint0_stabilization.sql`
- `src/migrations/20261005_lms_stabilization.sql`
- `src/models/Group.js`
- `src/models/ManualGrade.js`
- `src/models/PasswordReset.js`
- `src/models/User.js`
- `src/models/index.js`
- `src/routes/auth.js`
- `src/routes/groups.js`
- `src/routes/manualGrades.js`
- `src/routes/studentManagement.js`
- `src/routes/studentRoutes.js`
- `src/routes/users.js`
- `src/server.js`
- `src/services/email.service.js`
- `src/services/interactive.service.js`
- `test-upload.js`
- `tests/system/README.md`
- `tests/system/browser-flow.mjs`
- `tests/system/package-lock.json`
- `tests/system/package.json`
- `tests/system/run-api.mjs`
- `tests/system/run-browser.mjs`

**Nuevos**

- `.github/workflows/ci.yml`
- `.nvmrc`
- `INSTRUCCIONES_GITHUB_FINAL.md`
- `README.md`
- `REPORTE_FINAL_CORRECCIONES.md`
- `VALIDACION_FINAL.json`
- `scripts/check-readiness.js`
- `scripts/remediation-integration-test.js`
- `src/config/readiness.js`
- `src/middleware/securityLimits.js`
- `src/migrations/20230101_initial_schema.sql`
- `src/migrations/20261028b_security_remediation.sql`
- `src/models/AuditEvent.js`
- `src/models/EmailJob.js`
- `src/models/ManualActivity.js`
- `src/services/academic.service.js`
- `src/services/access.service.js`
- `src/services/audit.service.js`
- `src/services/recovery.service.js`
- `src/services/validation.service.js`
- `src/utils/groupCodes.js`
- `tests/system/run-security.mjs`
- `tests/system/run-startup.mjs`
- `tests/system/security-browser.mjs`

Los ZIP excluyen artefactos generados y secretos, se abren sin errores CRC y se extraen con comparación SHA-256 de cada archivo frente al proyecto de trabajo. Los cuatro entregables se proporcionan por separado; los documentos también están dentro de ambos proyectos.
