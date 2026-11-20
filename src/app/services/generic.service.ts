import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GenericService<T> {
  private readonly http = inject(HttpClient);

  getAll(endpoint: string, params?: HttpParams): Observable<T[]> {
    return this.http.get<T[]>(endpoint, { params });
  }

  getById(endpoint: string, id: string | number): Observable<T> {
    return this.http.get<T>(this.resourceUrl(endpoint, id));
  }

  create<TPayload = Partial<T>>(endpoint: string, payload: TPayload): Observable<T> {
    return this.http.post<T>(endpoint, payload);
  }

  update<TPayload = Partial<T>>(
    endpoint: string,
    id: string | number,
    payload: TPayload,
  ): Observable<T> {
    return this.http.put<T>(this.resourceUrl(endpoint, id), payload);
  }

  delete(endpoint: string, id: string | number): Observable<void> {
    return this.http.delete<void>(this.resourceUrl(endpoint, id));
  }

  private resourceUrl(endpoint: string, id: string | number): string {
    return `${endpoint.replace(/\/+$/, '')}/${encodeURIComponent(String(id))}`;
  }
}
