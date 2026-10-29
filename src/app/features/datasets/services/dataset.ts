import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DatasetPage } from '../models/dataset';

@Injectable({ providedIn: 'root' })
export class DatasetService {
  private readonly http = inject(HttpClient);

  list(): Observable<DatasetPage> {
    return this.http.get<DatasetPage>('/api/v1/datasets/');
  }
}
