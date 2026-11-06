import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DatasetOwner } from '../../datasets/models/dataset';
import { UserService } from './user';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('requests the active users from the API', () => {
    const users: DatasetOwner[] = [
      { id: 2, name: 'Dra. Ana Lima' },
      { id: 3, name: 'Ing. Carlos Mora' },
    ];
    let result: DatasetOwner[] | undefined;

    service.list().subscribe((value) => (result = value));

    const request = http.expectOne('/api/v1/users/');
    expect(request.request.method).toBe('GET');
    request.flush(users);

    expect(result).toEqual(users);
  });
});
