## Qué cambia y por qué

Describe el objetivo, los cambios realizados y su justificación.

## Tarea e Issues relacionados

- ID de tarea / historia: <!-- S1-XX, PB-XX -->
- Planner: <!-- enlace -->
- GitHub Issue: <!-- #n; para corregir bugs escribir "Fixes #n" -->
- PR relacionado en backend (si afecta ambos repositorios): <!-- enlace -->
- Prototipo / ADR / documentación relacionada: <!-- enlaces si aplica -->

## Tipo de cambio

- [ ] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Refactorización
- [ ] Documentación / decisión (sin código)
- [ ] Configuración / CI
- [ ] Release / hotfix

## Cómo probarlo

**Precondiciones:** <!-- entorno, datos de prueba, roles -->
**Pasos reproducibles:**
1.
2.
3.

**Resultado esperado:** <!-- indicar criterios de aceptación -->

## Evidencia (obligatoria según tipo de cambio)

<!-- Adjuntar aquí enlaces, capturas, GIF, logs saneados, resultados de pruebas y/o tabla E2E. La tarea de Planner debe enlazar este PR. No incluir datos reales o sensibles de BioDynamics. Nombre: IDtarea_descripcion_AAAAMMDD. -->

- Pruebas unitarias: <!-- ejecución CI verde + resumen de cobertura >= 70 % -->
- Frontend: <!-- captura/GIF del flujo completo y mensajes de validación -->
- API (si aplica): <!-- request/response de éxito y error, con código HTTP -->
- Base de datos (si aplica): <!-- migración en base limpia + consulta verificadora -->
- Permisos (si aplica): <!-- misma pantalla con dos roles diferentes -->
- Integración / E2E (si aplica): <!-- tabla: ID, caso, precondición, pasos, resultado esperado, obtenido, estado, evidencia -->
- Si falló una prueba: <!-- enlace al Issue correspondiente -->

## Definition of Done (DoD)

### Código y calidad
- [ ] Se cumplen todos los criterios de aceptación.
- [ ] Lint y formato pasan sin errores.
- [ ] Las funciones, servicios y endpoints nuevos tienen pruebas unitarias.
- [ ] Cobertura del código nuevo >= 70 % (exigible desde S0-09).
- [ ] Todas las pruebas pasan y CI está en verde.
- [ ] No hay secretos/credenciales en código; nuevas variables documentadas en `.env.example`.

### Integración (marcar solo cuando aplica)
- [ ] Migraciones incluidas y verificadas en una base limpia, si hay cambios de BD.
- [ ] Endpoints nuevos/modificados documentados en la API, si aplica.
- [ ] Integración frontend/backend comprobada en local, si aplica.
- [ ] Si afecta ambos repositorios: PR con mismo ID en backend, enlace cruzado y backend fusionado primero; integración con ambas versiones de `develop` verificada.

### Proceso y aceptación
- [ ] Rama creada desde `develop` (o `main` para `hotfix/*`), con nombre acordado.
- [ ] Título: `tipo(área): descripción [ID]`.
- [ ] PR de hasta 400 líneas modificadas o justificación/división documentada.
- [ ] Evidencia de pruebas adjunta en la sección anterior.
- [ ] Revisión de una persona distinta del autor y del CODEOWNER correspondiente (pueden ser la misma persona).
- [ ] Conversaciones de revisión resueltas, CI verde y rama actualizada con destino.
- [ ] Si se añadieron commits después de aprobación, se solicitó nueva revisión.

**Pendiente para el cierre (no marcar antes de realizarlo):**
- [ ] Autor fusionó mediante squash merge a `develop` y eliminó la rama; en un release, se siguió el flujo `develop` → `main` después de Sprint Review.
- [ ] Issue relacionado cerrado y Planner en «Completada».
- [ ] Product Owner aceptó el ítem en Sprint Review.

> Para tareas sin código: documentar el resultado en OneNote, obtener revisión de otro integrante y cerrar Planner. Los criterios de código no aplicables deben justificarse.

## Revisión

<!-- El revisor comprueba funcionalidad, pruebas, legibilidad, seguridad/permisos, manejo de errores y consistencia con arquitectura/estilo. Prefijos: bloqueante:, sugerencia:, pregunta:, nit:. Tiempo de revisión: 24 horas hábiles; si se excede, avisar por Teams. -->

## Observaciones y excepciones justificadas

<!-- Explica verificaciones no aplicables, riesgos, dependencias, PR >400 líneas o decisiones pendientes. -->
