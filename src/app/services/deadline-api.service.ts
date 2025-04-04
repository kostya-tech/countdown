import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { IDeadline } from '../models/deadline.interface';

@Injectable({
    providedIn: 'root'
})
export class DeadlineApiService {
    constructor(private http: HttpClient) { }

    getDeadline(): Observable<IDeadline | null> {
        return this.http.get<IDeadline>('/api/deadline').pipe(
            catchError(err => {
                console.error('Error fetching deadline:', err);
                return of(null);
            })
        );
    }
} 