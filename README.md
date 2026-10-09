# BioGestor Frontend

Frontend de BioGestor para gestionar datos y recursos de aprendizaje automático destinados a investigación acuícola.

## Tecnologías

- Angular 22.2.
- Componentes standalone.
- Angular Router.
- SCSS.

## Requisitos

- Node.js y npm compatibles con la versión de Angular del proyecto.
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