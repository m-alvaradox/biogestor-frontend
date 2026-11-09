import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.scss',
  templateUrl: './confirm-dialog.html',
  host: { '(document:keydown.escape)': 'cancel()' },
})
export class ConfirmDialog {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Eliminar');
  readonly busy = input(false);
  readonly error = input('');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    effect(() => {
      if (this.open()) {
        this.cancelButton()?.nativeElement.focus();
      }
    });
  }

  confirm(): void {
    if (!this.busy()) {
      this.confirmed.emit();
    }
  }

  cancel(): void {
    if (this.open() && !this.busy()) {
      this.cancelled.emit();
    }
  }
}
