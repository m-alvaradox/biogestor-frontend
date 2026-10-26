import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DatasetPage } from '../models/dataset';
import { DatasetService } from './dataset';

describe('DatasetService', () => {
  let service: DatasetService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DatasetService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('requests the dataset catalog from the API', () => {
    const page: DatasetPage = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: 'Cantos de aves',
          type: 'audio',
          status: 'active',
          owner: 3,
          created_at: '2026-10-20T15:30:00Z',
        },
      ],
    };
    let response: DatasetPage | undefined;

    service.list().subscribe((result) => (response = result));

    const request = http.expectOne('/api/v1/datasets/');
    expect(request.request.method).toBe('GET');

    request.flush(page);

    expect(response).toEqual(page);
  });
});
