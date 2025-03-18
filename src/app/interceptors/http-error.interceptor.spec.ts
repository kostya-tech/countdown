import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let interceptor: HttpErrorInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpErrorInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    interceptor = TestBed.inject(HttpErrorInterceptor);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should pass successful requests unchanged', () => {
    const testData = { data: 'test-data' };

    httpClient.get('/api/test').subscribe(data => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    req.flush(testData);
  });

  it('should intercept errors and return a formatted error object', () => {
    // Create a spy for the console to avoid polluting test output
    spyOn(console, 'error');

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 404 error'),
      error: (error) => {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Not Found');
        expect(error.timestamp).toBeTruthy();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should log error messages to the console', () => {
    const consoleErrorSpy = spyOn(console, 'error');

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with error'),
      error: () => { }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Error message', { status: 500, statusText: 'Server Error' });

    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorMessage = consoleErrorSpy.calls.argsFor(0)[0];
    expect(errorMessage).toContain('500');
    expect(errorMessage).toContain('Server Error');
  });

  it('should handle network errors', () => {
    spyOn(console, 'error');

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with network error'),
      error: (error) => {
        expect(error.statusCode).toBe(0);
        expect(error.message).toBe('Network error');
      }
    });

    const req = httpMock.expectOne('/api/test');
    const mockError = new ErrorEvent('Network error', {
      message: 'Network error'
    });
    req.error(mockError);
  });
});
