import { Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'muted' | 'danger';

@Component({
  selector: 'app-badge',
  styleUrl: './badge.scss',
  templateUrl: './badge.html',
  host: { '[class]': "'badge-' + tone()" },
})
export class Badge {
  readonly label = input.required<string>();
  readonly tone = input<BadgeTone>('neutral');
}
