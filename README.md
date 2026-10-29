# Art & Language Campus — Frontend final

Proyecto Next.js completo con la identidad visual, worksheets/PDF, grupos y Practice existentes. Incluye gestión de alumnos, perfil académico, recuperación, cambio obligatorio de contraseña temporal y manual grading con historial/exportación.

Usar Node 24 recomendado (rango >=22.12 y <25), ejecutar `npm ci`, configurar NEXT_PUBLIC_API_URL según `.env.example` y ejecutar `npm run build`. En local, la API puede ser `http://localhost:5000/api`; en hosting debe ser HTTPS y terminar en /api. El build genera automáticamente los assets del worker PDF. No copiar node_modules o .next al repositorio.

Las notas manuales están separadas del promedio oficial automático. Practice conserva su diseño y juegos; se exige sesión estudiantil en su interfaz. Su persistencia avanzada de XP, Listening independiente y ampliaciones de Ask AL no forman parte de esta corrección. La cuota de Ask AL ahora se verifica en el backend para coordinar réplicas; no se han cambiado sus contenidos ni proveedor.

Ver `INSTRUCCIONES_GITHUB_FINAL.md` y `REPORTE_FINAL_CORRECCIONES.md`. `npm test -- --runInBand` verifica las pruebas unitarias. El recorrido de navegador conjunto se ejecuta desde tests/system en el backend, indicando FRONTEND_DIR.
