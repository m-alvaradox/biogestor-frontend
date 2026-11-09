import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import {
  DatasetCreatePayload,
  DatasetCreated,
  DatasetDetail,
  DatasetPage,
  DatasetUpdatePayload,
} from '../models/dataset';
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

  it('sends a new dataset to the API', () => {
    const payload: DatasetCreatePayload = {
      name: 'Lote de audio de tilapia 002',
      type: 'audio',
      status: 'active',
      description: null,
      species: 'Tilapia',
      farm: null,
      pool: null,
      capture_date: null,
      license: null,
      owner: 2,
      type_metadata: { microphone: 'Hidrófono genérico', sample_rate: 44100 },
      storage: { s3_uri: null, file_format: null, size_bytes: null, file_count: null },
    };
    const created: DatasetCreated = {
      ...payload,
      id: 9,
      created_at: '2026-11-04T10:00:00Z',
    };
    let response: DatasetCreated | undefined;

    service.create(payload).subscribe((result) => (response = result));

    const request = http.expectOne('/api/v1/datasets/');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(created);

    expect(response).toEqual(created);
  });

  it('sends the changed fields of a dataset to the API', () => {
    const payload: DatasetUpdatePayload = { name: 'Cantos de tilapia v2', species: null };
    const updated: DatasetCreated = {
      id: 5,
      name: 'Cantos de tilapia v2',
      type: 'audio',
      status: 'active',
      owner: 3,
      created_at: '2026-10-20T15:30:00Z',
      description: 'Grabaciones nocturnas',
      species: null,
      farm: null,
      pool: null,
      capture_date: null,
      license: null,
      type_metadata: null,
      storage: { s3_uri: null, file_format: null, size_bytes: null, file_count: null },
    };
    let response: DatasetCreated | undefined;

    service.update(5, payload).subscribe((result) => (response = result));

    const request = http.expectOne('/api/v1/datasets/5/');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush(updated);

    expect(response).toEqual(updated);
  });

  it('deletes a dataset by id', () => {
    let completed = false;

    service.delete(5).subscribe({ complete: () => (completed = true) });

    const request = http.expectOne('/api/v1/datasets/5/');
    expect(request.request.method).toBe('DELETE');

    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
  });
});
