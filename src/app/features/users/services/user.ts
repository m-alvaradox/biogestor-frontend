import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DatasetOwner } from '../../datasets/models/dataset';

const USERS_URL = '/api/v1/users/';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  list(): Observable<DatasetOwner[]> {
    return this.http.get<DatasetOwner[]>(USERS_URL);
  }
}
