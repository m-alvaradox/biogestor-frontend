# S0-16: Prueba de integración Sprint 0

## Preparación

El backend debe estar activo en http://localhost:8080, con DEBUG=True,
las migraciones aplicadas y el registro sintético sprint-0 creado.

Desde la raíz del frontend:

npm ci
npm start

Abrir http://localhost:4200/integration.

El proxy reenvía /api/** al backend del puerto 8080.

## Verificación manual

1. Abrir /integration y comprobar el identificador y el mensaje.
2. Modificar el mensaje en PostgreSQL mediante Django.
3. Pulsar Consultar de nuevo: debe aparecer el valor actualizado.
4. Cambiar temporalmente el identificador del registro en la BD.
5. Consultar otra vez: debe mostrarse la alerta sin el dato anterior.
6. Restaurar el identificador sprint-0 y consultar: debe recuperarse
   el resultado sin recargar la página.

Solo se utilizan datos sintéticos.

## Pruebas y calidad

npm test -- --watch=false
npm test -- --watch=false --coverage
npm run build
npm run lint

Se verificaron diez pruebas correctas y la compilación.
La cobertura global de líneas registrada fue 97,43 %.
El componente incluye pruebas de respuesta correcta y error HTTP 404.

## Dependencia

El PR del backend de S0-16 debe fusionarse primero.
Después se verificará la integración con develop de ambos repositorios.