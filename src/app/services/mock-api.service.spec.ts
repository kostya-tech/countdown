import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { mockApiInterceptor } from './mock-api.service';
import { IDeadline } from '../models/deadline.interface';

describe('mockApiInterceptor', () => {
  const interceptor = mockApiInterceptor;

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should return a mock response for deadline API requests', (done) => {
    const req = new HttpRequest('GET', '/api/deadline');
    const next = jasmine.createSpy().and.returnValue(of({}));

    interceptor(req, next).subscribe(response => {
      if (response instanceof HttpResponse) {
        expect(response.body).toBeTruthy();
        const body = response.body as IDeadline;
        expect(body.secondsLeft).toBe(35);
      }
      done();
    });
  });

  it('should pass through non-deadline requests', () => {
    const req = new HttpRequest('GET', '/api/something-else');
    const next = jasmine.createSpy().and.returnValue(of('passed through'));

    interceptor(req, next);

    expect(next).toHaveBeenCalled();
  });
});
