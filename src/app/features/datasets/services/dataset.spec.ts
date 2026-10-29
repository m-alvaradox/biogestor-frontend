import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DatasetDetail, DatasetPage } from '../models/dataset';
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
          owner: { id: 3, name: 'Dra. Ana Lima' },
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

  it('requests a single dataset by id', () => {
    const detail: DatasetDetail = {
      id: 5,
      name: 'Cantos de tilapia',
      type: 'audio',
      status: 'active',
      owner: { id: 3, name: 'Dra. Ana Lima' },
      created_at: '2026-10-20T15:30:00Z',
      species: 'Tilapia',
      farm: 'Granja Norte',
      pool: 'P-01',
      capture_date: '2026-10-01',
      type_metadata: { sample_rate: 44100 },
      storage: {
        s3_uri: 's3://biogestor/datasets/5/',
        file_format: '.WAV',
        size_bytes: 1024,
        file_count: 12,
      },
    };
    let response: DatasetDetail | undefined;

    service.get(5).subscribe((result) => (response = result));

    const request = http.expectOne('/api/v1/datasets/5/');
    expect(request.request.method).toBe('GET');

    request.flush(detail);

    expect(response).toEqual(detail);
  });
});
