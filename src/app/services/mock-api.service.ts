import { HttpResponse, HttpInterceptorFn } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IDeadline } from '../models/deadline.interface';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/api/deadline') && req.method === 'GET') {
    const initialSeconds = 35;

    const response = new HttpResponse<IDeadline>({
      status: 200,
      statusText: 'OK',
      body: { secondsLeft: initialSeconds }
    });

    return of(response).pipe(delay(2500));
  }

  return next(req);
};
