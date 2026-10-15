import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';

interface IntegrationRecord {
  id: string;
  message: string;
}

@Component({
  imports: [],
  selector: 'app-integration',
  styleUrl: './integration.scss',
  templateUrl: './integration.html',
})
export class Integration implements OnInit {
  private readonly http = inject(HttpClient);

  readonly record = signal<IntegrationRecord | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.record.set(null);

    this.http.get<IntegrationRecord>('/api/v1/integration/').subscribe({
      next: (record) => {
        this.record.set(record);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo consultar el registro de integración.');
        this.loading.set(false);
      },
    });
  }
}
