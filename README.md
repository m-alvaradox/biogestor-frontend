# BioGestor Frontend

Frontend de BioGestor para gestionar datos y recursos de aprendizaje automático destinados a investigación acuícola.

## Tecnologías

- Angular 22.2.
- Componentes standalone.
- Angular Router.
- SCSS.

## Requisitos

- Node.js 24.15 o superior (Angular 22 también admite Node ^22.22.3 o >=26) y npm.
- Git.

Las versiones de las dependencias están definidas en `package.json` y `package-lock.json`.

## Instalación

Desde la raíz del proyecto:

```bash
npm ci
```

## Ejecución local

```bash
npm start
```

Abre http://localhost:4200 en el navegador. La aplicación se actualiza al guardar cambios en el código.

## Rutas disponibles

| Ruta | Pantalla |
|---|---|
| `/login` | Acceso de demostración |
| `/dashboard` | Panel principal con indicadores de demostración |
| `/datasets` | Catálogo de datasets conectado a la API |
| `/datasets/:id` | Detalle de un dataset |
| `/integrations` | Prueba de integración del Sprint 0 (`/integration` redirige aquí) |
| `/models`, `/model-versions`, `/experiments`, `/observations`, `/users`, `/settings` | Módulos pendientes, con una pantalla provisional |

La ruta raíz `/` redirige a `/dashboard`. Las rutas desconocidas también redirigen al Dashboard.

El acceso es simulado y los indicadores del Dashboard utilizan datos de ejemplo. Todavía no existe autenticación real.

## Conexión con el backend

`npm start` usa `proxy.conf.json`, que reenvía las peticiones a `/api/**` hacia el backend en http://localhost:8080. Las pantallas de Datasets e Integración necesitan el backend activo.

## Catálogo de datasets

La pantalla `/datasets` consulta `GET /api/v1/datasets/` mediante `DatasetService.list()` y muestra la primera página de resultados (10 datasets).

- Columnas: Nombre, Tipo, Investigador, Fecha de registro, Estado y Acciones.
- Tipo y estado se muestran en español como badges. Si el estado es `null` o vacío, se muestra "Sin estado". La columna Investigador muestra el nombre del responsable o "—" si no tiene.
- Estados de la pantalla: cargando, error con botón "Reintentar", vacío ("No hay datasets registrados") y tabla con datos.
- La columna Acciones muestra "Ver", "Editar" y "Eliminar" en cada fila. "Ver" abre el detalle del dataset; "Editar" y "Eliminar" están deshabilitados.
- La búsqueda, los filtros por tipo y estado, el orden y la paginación todavía no están conectados.

## Detalle de dataset

La pantalla `/datasets/:id` consulta `GET /api/v1/datasets/:id/` mediante `DatasetService.get(id)`.

- Encabezado: nombre, badges de tipo y estado, investigador y fecha de registro. "Editar" y "Eliminar" están deshabilitados.
- Metadatos: especie, granja, piscina, fecha de captura y los campos de `type_metadata` como pares clave/valor.
- Almacenamiento: ubicación (`s3_uri`), formato, tamaño (formateado desde bytes) y cantidad de archivos.
- Estados de la pantalla: cargando, "No encontrado" (si la API responde 404 o el id no es un número), error con botón "Reintentar" y detalle con datos.
- Los campos sin valor (`null` o texto vacío) se muestran como "—". Un 0 se muestra como 0.

## Estructura

```text
src/app/
├── core/
│   └── layout/
│       ├── app-layout/
│       ├── sidebar/
│       └── navbar/
├── shared/
│   ├── pages/
│   │   └── module-placeholder/
│   ├── pipes/
│   │   └── file-size/
│   └── ui/
│       ├── badge/
│       └── stat-card/
├── features/
│   ├── auth/
│   │   └── pages/login/
│   ├── dashboard/
│   │   └── pages/dashboard/
│   ├── datasets/
│   │   ├── components/
│   │   ├── models/
│   │   ├── pages/dataset-list/
│   │   ├── pages/dataset-detail/
│   │   └── services/
│   └── integration/
├── app.config.ts
└── app.routes.ts
```

- `core`: layout principal y elementos de navegación.
- `shared`: componentes, pipes y pantallas reutilizables.
- `features`: pantallas organizadas por funcionalidad.

`src/styles.scss` define en `:root` la paleta de colores, los radios de borde y el ancho máximo de página como variables CSS (`--color-*`, `--radius-*`, `--page-max-width`). Los `.scss` de los componentes usan `var(--…)` en lugar de valores fijos.

## Compilación

```bash
npm run build
```

Genera la aplicación en `dist/`.

## Pruebas

```bash
npm test
```

Ejecuta las pruebas del proyecto.

## Integración continua

El flujo `.github/workflows/ci.yml` se ejecuta con GitHub Actions en cada Pull Request y push hacia `develop` o `main`, y también puede lanzarse manualmente desde la pestaña Actions (`workflow_dispatch`). Con Node.js 24:

1. Instala las dependencias con `npm ci` a partir de `package-lock.json`.
2. Verifica las convenciones de código con ESLint (`npm run lint`).
3. Ejecuta las pruebas unitarias (`npm test -- --watch=false`).
4. Compila la aplicación en modo producción (`npm run build`), incluyendo los presupuestos de tamaño de `angular.json`.
5. Publica la carpeta `dist/biogestor-frontend` como artefacto descargable durante 7 días.

Se recomienda configurar este job como comprobación obligatoria en la protección de las ramas `develop` y `main`.
