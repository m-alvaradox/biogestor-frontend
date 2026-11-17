import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';

export interface LoginCredentials {
    username: string;
    password: string;
}

interface LoginResponse {
    access: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private accessToken: string | null = null;

    login(credentials: LoginCredentials): Observable<void> {
        return this.http
        .get<void>('/api/v1/auth/csrf/', {
            withCredentials: true,
        })
        .pipe(
            switchMap(() =>
                this.http.post<LoginResponse>(
                    '/api/v1/auth/login/',
                    credentials,
                    { withCredentials: true },
                ),
            ),
            tap((response) => {
                this.accessToken = response.access;
            }),
            map(() => undefined),
        );
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    clearSession(): void {
        this.accessToken = null;
    }
}