import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DatasetDetail, DatasetPage } from '../models/dataset';

const DATASETS_URL = '/api/v1/datasets/';

@Injectable({ providedIn: 'root' })
export class DatasetService {
  private readonly http = inject(HttpClient);

  list(): Observable<DatasetPage> {
    return this.http.get<DatasetPage>(DATASETS_URL);
  }

  get(id: number): Observable<DatasetDetail> {
    return this.http.get<DatasetDetail>(`${DATASETS_URL}${id}/`);
  }
}
