import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DatasetCreatePayload,
  DatasetCreated,
  DatasetDetail,
  DatasetPage,
  DatasetUpdatePayload,
} from '../models/dataset';

const DATASETS_URL = '/api/v1/datasets/';

export function deleteErrorMessage(error: HttpErrorResponse): string {
  const detail = (error.error as { detail?: unknown } | null)?.detail;

  if ([400, 403, 409].includes(error.status) && typeof detail === 'string') {
    return detail;
  }
  return 'No se pudo eliminar el dataset. Inténtalo de nuevo más tarde.';
}

@Injectable({ providedIn: 'root' })
export class DatasetService {
  private readonly http = inject(HttpClient);

  list(): Observable<DatasetPage> {
    return this.http.get<DatasetPage>(DATASETS_URL);
  }

  get(id: number): Observable<DatasetDetail> {
    return this.http.get<DatasetDetail>(`${DATASETS_URL}${id}/`);
  }

  create(payload: DatasetCreatePayload): Observable<DatasetCreated> {
    return this.http.post<DatasetCreated>(DATASETS_URL, payload);
  }

  update(id: number, payload: DatasetUpdatePayload): Observable<DatasetDetail> {
    return this.http.patch<DatasetDetail>(`${DATASETS_URL}${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${DATASETS_URL}${id}/`);
  }
}
