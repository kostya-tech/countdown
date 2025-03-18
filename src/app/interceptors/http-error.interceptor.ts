import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || error.statusText || 'Unknown error';
        console.error(`Error ${error.status}: ${errorMessage}`);

        return throwError(() => ({
          statusCode: error.status,
          message: errorMessage,
          timestamp: new Date().toISOString()
        }));
      })
    );
  }
}
