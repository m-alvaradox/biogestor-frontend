import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let component: ConfirmDialog;
  let confirmed: number;
  let cancelled: number;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialog] }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Eliminar dataset');
    fixture.componentRef.setInput('message', '¿Eliminar «Cantos de tilapia»?');
    confirmed = 0;
    cancelled = 0;
    component.confirmed.subscribe(() => confirmed++);
    component.cancelled.subscribe(() => cancelled++);
    fixture.detectChanges();
  });

  function element<T extends HTMLElement>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  function buttons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dialog-actions button'));
  }

  it('should render nothing while closed', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    expect(element('[role="alertdialog"]')).toBeNull();
  });

  it('should show the title, the message and focus the cancel button', () => {
    expect(element('h2').textContent?.trim()).toBe('Eliminar dataset');
    expect(element('p').textContent?.trim()).toBe('¿Eliminar «Cantos de tilapia»?');
    expect(buttons().map((button) => button.textContent?.trim())).toEqual(['Cancelar', 'Eliminar']);
    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('should emit confirmed when the confirm button is pressed', () => {
    buttons()[1].click();

    expect(confirmed).toBe(1);
    expect(cancelled).toBe(0);
  });

  it('should emit cancelled from the cancel button and Escape', () => {
    buttons()[0].click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(cancelled).toBe(2);
    expect(confirmed).toBe(0);
  });

  it('should stay open when the backdrop is clicked', () => {
    element('.backdrop').click();

    expect(cancelled).toBe(0);
  });

  it('should block both actions and show progress while busy', () => {
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();

    expect(buttons().every((button) => button.disabled)).toBe(true);
    expect(buttons()[1].textContent?.trim()).toBe('Eliminando...');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(cancelled).toBe(0);
  });

  it('should show an error message', () => {
    fixture.componentRef.setInput('error', 'No se pudo eliminar el dataset.');
    fixture.detectChanges();

    expect(element('.dialog-error').textContent?.trim()).toBe('No se pudo eliminar el dataset.');
  });
});
