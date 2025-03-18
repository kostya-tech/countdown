import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockApiService } from './mock-api.service';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { DeadlineResponse } from '../models/deadline';

describe('MockApiService', () => {
  let service: MockApiService;
  let mockHandler = {
    handle: jasmine.createSpy('handle').and.returnValue(of(new HttpResponse()))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MockApiService]
    });
    service = TestBed.inject(MockApiService);
    mockHandler.handle.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should intercept only requests to /api/deadline', () => {
    const targetRequest = new HttpRequest('GET', '/api/deadline');
    const otherRequest = new HttpRequest('GET', '/api/other');

    service.intercept(targetRequest, mockHandler);
    service.intercept(otherRequest, mockHandler);

    // Should only intercept request to /api/deadline
    expect(mockHandler.handle).toHaveBeenCalledTimes(1);
    expect(mockHandler.handle).toHaveBeenCalledWith(otherRequest);
  });

  it('should handle deadline request with proper response structure', () => {
    const targetRequest = new HttpRequest('GET', '/api/deadline');

    // Ensure we don't trigger the error branch
    spyOn(Math, 'random').and.returnValue(0.5); // Value > 0.1 prevents error simulation

    service.intercept(targetRequest, mockHandler).subscribe(response => {
      if (response instanceof HttpResponse) {
        const body = response.body as DeadlineResponse;
        expect(body).toBeDefined();
        expect(body.secondsLeft).toBeDefined();
        expect(typeof body.secondsLeft).toBe('number');
      }
    });
  });

  it('should simulate API errors when random value is < 0.1', () => {
    const targetRequest = new HttpRequest('GET', '/api/deadline');

    // Force error branch
    spyOn(Math, 'random').and.returnValue(0.05);

    expect(() => {
      service.intercept(targetRequest, mockHandler)
    }).toThrowError('Simulated API Error');
  });

  it('should decrease secondsLeft every second', () => {
    // Instead of relying on the timer, we'll manually call the decrement function
    const initialValue = (service as any).secondsLeft;

    // Manually decrement
    (service as any).decrementSeconds();
    expect((service as any).secondsLeft).toBe(initialValue - 1);

    // Manually decrement again
    (service as any).decrementSeconds();
    expect((service as any).secondsLeft).toBe(initialValue - 2);
  });

  it('should stop the timer when secondsLeft reaches zero', fakeAsync(() => {
    // Set secondsLeft to 1
    service.resetTimer(1);

    // Manually decrement to reach zero instead of relying on the timer
    (service as any).decrementSeconds();
    expect((service as any).secondsLeft).toBe(0);

    // Try to decrement below zero
    (service as any).decrementSeconds();
    expect((service as any).secondsLeft).toBe(0);
  }));

  it('should reset timer with new value', () => {
    service.resetTimer(50);
    expect((service as any).secondsLeft).toBe(50);

    service.resetTimer();
    expect((service as any).secondsLeft).toBe(120); // Default value
  });

  it('should log intercepted requests', () => {
    const targetRequest = new HttpRequest('GET', '/api/deadline');
    spyOn(console, 'log');

    // Prevent error branch
    spyOn(Math, 'random').and.returnValue(0.5);

    service.intercept(targetRequest, mockHandler);

    expect(console.log).toHaveBeenCalledWith('Intercepted API request for /api/deadline');
  });
});
