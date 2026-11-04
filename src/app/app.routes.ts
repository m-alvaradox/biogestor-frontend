import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'datasets',
        loadComponent: () =>
          import('./features/datasets/pages/dataset-list/dataset-list').then((m) => m.DatasetList),
      },
      {
        path: 'datasets/new',
        loadComponent: () =>
          import('./features/datasets/pages/dataset-form/dataset-form').then((m) => m.DatasetForm),
      },
      {
        path: 'datasets/:id',
        loadComponent: () =>
          import('./features/datasets/pages/dataset-detail/dataset-detail').then(
            (m) => m.DatasetDetailPage,
          ),
      },

      {
        path: 'integrations',
        loadComponent: () =>
          import('./features/integration/integration').then((m) => m.Integration),
      },
      {
        path: 'integration',
        redirectTo: 'integrations',
        pathMatch: 'full',
      },
      {
        path: 'models',
        data: { title: 'Modelos' },
        loadComponent: () =>
          import('./shared/pages/module-placeholder/module-placeholder').then(
            (m) => m.ModulePlaceholder,
          ),
      },
      {
        path: 'model-versions',
        data: { title: 'Versiones de modelos' },
        loadComponent: () =>
          import('./shared/pages/module-placeholder/module-placeholder').then(
            (m) => m.ModulePlaceholder,
          ),
      },
      {
        path: 'experiments',
        data: { title: 'Experimentos' },
        loadComponent: () =>
          import('./shared/pages/module-placeholder/module-placeholder').then(
            (m) => m.ModulePlaceholder,
          ),
      },
      {
        path: 'observations',
        data: { title: 'Observaciones' },
        loadComponent: () =>
          import('./shared/pages/module-placeholder/module-placeholder').then(
            (m) => m.ModulePlaceholder,
          ),
      },
      {
        path: 'users',
        data: { title: 'Usuarios' },
        loadComponent: () =>
          import('./shared/pages/module-placeholder/module-placeholder').then(
            (m) => m.ModulePlaceholder,
          ),
      },
      {
        path: 'settings',
        data: { title: 'Configuración' },
        loadComponent: () =>
          import('./shared/pages/module-placeholder/module-placeholder').then(
            (m) => m.ModulePlaceholder,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
