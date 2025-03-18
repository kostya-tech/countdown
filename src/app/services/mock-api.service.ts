import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DeadlineResponse } from '../models/deadline';

@Injectable({
  providedIn: 'root'
})
export class MockApiService implements HttpInterceptor {
  private secondsLeft = 120;
  private decrementTimer: number | null = null;

  constructor() {
    // Start countdown simulation
    this.startDecrementing();
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Process only requests to our API endpoint
    if (request.url.endsWith('/api/deadline') && request.method === 'GET') {
      console.log('Intercepted API request for /api/deadline');
      return this.handleDeadlineRequest();
    }

    // Pass other requests through
    return next.handle(request);
  }

  private handleDeadlineRequest(): Observable<HttpEvent<DeadlineResponse>> {
    // Simulate error in 10% of cases
    if (Math.random() < 0.1) {
      throw new Error('Simulated API Error');
    }

    // In other cases return success response
    const response = new HttpResponse<DeadlineResponse>({
      status: 200,
      statusText: 'OK',
      body: { secondsLeft: this.secondsLeft }
    });

    // Simulate network delay
    return of(response).pipe(delay(Math.random() * 800 + 200));
  }

  private startDecrementing(): void {
    if (this.decrementTimer !== null) {
      clearInterval(this.decrementTimer);
    }

    this.decrementTimer = window.setInterval(() => {
      this.decrementSeconds();
    }, 1000) as unknown as number;
  }


  // Made public for testing purposes
  public decrementSeconds(): void {
    if (this.secondsLeft > 0) {
      this.secondsLeft--;
    } else {
      // Stop timer when zero is reached
      this.stopDecrementing();
    }
  }

  private stopDecrementing(): void {
    if (this.decrementTimer !== null) {
      clearInterval(this.decrementTimer);
      this.decrementTimer = null;
    }
  }

  public resetTimer(seconds: number = 120): void {
    this.secondsLeft = seconds;
    this.startDecrementing();
  }
}
