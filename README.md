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
| `/dashboard` | Panel principal con indicadores de demostración |
| `/login` | Acceso de demostración |

La ruta raíz `/` redirige a `/dashboard`. Las rutas desconocidas también redirigen al Dashboard.

El acceso es simulado y los indicadores utilizan datos de ejemplo. Todavía no existe conexión con una API ni autenticación real.

## Estructura inicial

```text
src/app/
├── core/
│   └── layout/
│       ├── app-layout/
│       ├── sidebar/
│       └── navbar/
├── shared/
│   └── ui/
│       └── stat-card/
├── features/
│   ├── auth/
│   │   └── pages/login/
│   └── dashboard/
│       └── pages/dashboard/
├── app.config.ts
└── app.routes.ts
```

- `core`: layout principal y elementos de navegación.
- `shared`: componentes reutilizables.
- `features`: pantallas organizadas por funcionalidad.

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
2. Ejecuta las pruebas unitarias (`npm test -- --watch=false`).
3. Compila la aplicación en modo producción (`npm run build`), incluyendo los presupuestos de tamaño de `angular.json`.
4. Publica la carpeta `dist/biogestor-frontend` como artefacto descargable durante 7 días.

Se recomienda configurar este job como comprobación obligatoria en la protección de las ramas `develop` y `main`.
