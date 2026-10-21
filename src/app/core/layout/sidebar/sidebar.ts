import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavigationItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly navigationItems: NavigationItem[] = [
    {
      label: 'Panel Principal',
      route: '/dashboard',
      icon: 'layout-dashboard',
    },
    {
      label: 'Datasets',
      route: '/datasets',
      icon: 'database',
    },
    {
      label: 'Modelos',
      route: '/models',
      icon: 'brain',
    },
    {
      label: 'Versiones',
      route: '/model-versions',
      icon: 'git-branch',
    },
    {
      label: 'Experimentos',
      route: '/experiments',
      icon: 'activity',
    },
    {
      label: 'Observaciones',
      route: '/observations',
      icon: 'message-square',
    },
    {
      label: 'Usuarios',
      route: '/users',
      icon: 'users',
    },
    {
      label: 'Integraciones',
      route: '/integrations',
      icon: 'plug',
    },
    {
      label: 'Configuración',
      route: '/settings',
      icon: 'settings',
    },
  ];
}
