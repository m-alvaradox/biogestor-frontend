
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavigationItem {
  label: string;
  route: string;
}

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly navigationItems: NavigationItem[] = [
    { label: 'Panel Principal', route: '/dashboard' },
    { label: 'Datasets', route: '/datasets' },
    { label: 'Modelos', route: '/models' },
    { label: 'Versiones', route: '/model-versions' },
    { label: 'Experimentos', route: '/experiments' },
    { label: 'Observaciones', route: '/observations' },
    { label: 'Usuarios', route: '/users' },
    { label: 'Integraciones', route: '/integrations' },
    { label: 'Configuración', route: '/settings' },
  ];
}

