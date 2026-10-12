import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  styleUrl: './stat-card.scss',
  templateUrl: './stat-card.html',
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly description = input<string>('');
}
