import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatasetTypeBadge } from './dataset-type-badge';

describe('DatasetTypeBadge', () => {
  let fixture: ComponentFixture<DatasetTypeBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetTypeBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetTypeBadge);
  });

  it('should translate the dataset type', () => {
    fixture.componentRef.setInput('type', 'image');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('Imagen');
  });
});
