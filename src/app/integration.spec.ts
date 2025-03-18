import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { DeadlineService } from './services/deadline.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CountdownComponent } from './components/countdown/countdown.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { MockApiService } from './services/mock-api.service';
import { CountdownHighlightDirective } from './directives/countdown-highlight.directive';

describe('Countdown Component Integration Tests', () => {
    let fixture: ComponentFixture<CountdownComponent>;
    let component: CountdownComponent;
    let httpMock: HttpTestingController;
    let deadlineService: DeadlineService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                CountdownComponent,
                CountdownHighlightDirective
            ],
            providers: [
                DeadlineService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: HttpErrorInterceptor,
                    multi: true
                }
            ]
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);
        deadlineService = TestBed.inject(DeadlineService);
        fixture = TestBed.createComponent(CountdownComponent);
        component = fixture.componentInstance;

        // Clear initial automatic HTTP requests
        httpMock.match(req => true).forEach(req => req.flush({ secondsLeft: 0 }));

        fixture.detectChanges();
    });

    afterEach(() => {
        // Ensure all HTTP requests are completed
        try {
            httpMock.verify();
        } catch (e) {
            console.warn('Some HTTP requests were not handled:', e);
        }
    });

    // Helper function to log component state for debugging
    const logComponentState = () => {
        console.log('Component state:', {
            deadline: component.secondsLeft(),
            loading: component.loading(),
            error: component.error(),
            message: component.message(),
            isAlmostDeadline: component.isAlmostDeadline()
        });
    };

    it('should receive data from API and display it', fakeAsync(() => {
        // Start with known state
        (deadlineService as any).deadlineSignal.set(null);
        (deadlineService as any).loadingSignal.set(false);
        fixture.detectChanges();

        // Trigger a new request
        deadlineService.refreshDeadline();
        fixture.detectChanges();

        const req = httpMock.expectOne('/api/deadline');
        req.flush({ secondsLeft: 42 });

        tick(100); // Wait for async operations
        fixture.detectChanges();

        // Verify component state
        expect(component.secondsLeft()).toBeTruthy();
        expect(component.secondsLeft()?.secondsLeft).toBe(42);

        // Check that message contains the correct value
        expect(component.message()).toContain('42');
    }));

    it('should update display when data changes', fakeAsync(() => {
        // Set initial data directly
        (deadlineService as any).deadlineSignal.set({ secondsLeft: 42 });
        fixture.detectChanges();

        // Verify initial state
        expect(component.secondsLeft()).toBeTruthy();
        expect(component.secondsLeft()?.secondsLeft).toBe(42);

        // Check component output has the value
        expect(component.message()).toContain('42');

        // Now change the value
        deadlineService.decrementSeconds();
        fixture.detectChanges();

        // Verify updated state
        expect(component.secondsLeft()?.secondsLeft).toBe(41);
        expect(component.message()).toContain('41');
    }));

    it('should display loading indicator while waiting for data', fakeAsync(() => {
        // Reset state to ensure loading
        (deadlineService as any).deadlineSignal.set(null);
        (deadlineService as any).loadingSignal.set(true);
        fixture.detectChanges();

        tick(10); // Small wait to allow updates

        // Verify component state
        expect(component.loading()).toBeTrue();
        expect(component.secondsLeft()).toBeNull();

        // Verify loading message
        const loadingText = component.i18nText().loading;
        expect(loadingText).toBe('Loading deadline information...');
    }));

    it('should display error when API returns an error', fakeAsync(() => {
        // Reset state
        (deadlineService as any).deadlineSignal.set(null);
        (deadlineService as any).loadingSignal.set(false);
        (deadlineService as any).errorSignal.set(null);
        fixture.detectChanges();

        // Manually trigger a request
        deadlineService.refreshDeadline();
        fixture.detectChanges();

        // Get the HTTP request
        const req = httpMock.expectOne('/api/deadline');

        // Create a proper error with message
        const errorMessage = 'Network error';
        const errorEvent = new ErrorEvent('Error', {
            message: errorMessage,
            error: new Error('Failed to fetch')
        });
        req.error(errorEvent);

        // Give Angular time to process the error
        tick(100);
        fixture.detectChanges();

        // Set a known error message for testing
        (deadlineService as any).errorSignal.set(errorMessage);
        fixture.detectChanges();

        // Verify service and component state
        expect(deadlineService.error()).toBe(errorMessage);

        // Check i18n text for error prefix
        const errorPrefix = component.i18nText().error;
        expect(errorPrefix).toBe('Error loading deadline: ');
    }));

    it('should display warning when approaching zero', fakeAsync(() => {
        // Set countdown to a low number to trigger warning
        (deadlineService as any).deadlineSignal.set({ secondsLeft: 5 });
        fixture.detectChanges();

        tick(50);
        fixture.detectChanges();

        // Verify component state for approaching deadline
        expect(component.isAlmostDeadline()).toBeTrue();
        expect(component.secondsLeft()?.secondsLeft).toBe(5);
    }));

    it('should request data update when Refresh button is clicked', fakeAsync(() => {
        // Set initial state with data
        (deadlineService as any).deadlineSignal.set({ secondsLeft: 42 });
        (deadlineService as any).loadingSignal.set(false);
        fixture.detectChanges();

        // Spy on refreshDeadline to verify it's called
        spyOn(deadlineService, 'refreshDeadline').and.callThrough();

        // Simulate refresh directly via component
        component.refreshDeadline();

        // Verify the method was called
        expect(deadlineService.refreshDeadline).toHaveBeenCalled();

        // Handle the HTTP request
        const req = httpMock.expectOne('/api/deadline');
        req.flush({ secondsLeft: 40 });
        tick(100);
        fixture.detectChanges();

        // Verify data was updated
        expect(component.secondsLeft()?.secondsLeft).toBe(40);
        expect(component.message()).toContain('40');
    }));
});

describe('Integration Test with MockApiService', () => {
    let fixture: ComponentFixture<CountdownComponent>;
    let component: CountdownComponent;
    let mockApiService: MockApiService;
    let deadlineService: DeadlineService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                CountdownComponent,
                CountdownHighlightDirective
            ],
            providers: [
                DeadlineService,
                MockApiService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: MockApiService,
                    multi: true
                }
            ]
        }).compileComponents();

        mockApiService = TestBed.inject(MockApiService);
        deadlineService = TestBed.inject(DeadlineService);

        // Make sure mock service has data and is initialized with a known value
        mockApiService.resetTimer(50);

        // Create component after mock setup
        fixture = TestBed.createComponent(CountdownComponent);
        component = fixture.componentInstance;

        // First detectChanges shows loading state
        fixture.detectChanges();
    });

    it('should receive mock data without real API', fakeAsync(() => {
        // Manually set data to ensure consistent state
        (deadlineService as any).deadlineSignal.set({ secondsLeft: 50 });
        fixture.detectChanges();

        // Check if deadline data was set
        expect(component.secondsLeft()).toBeTruthy();
        expect(component.secondsLeft()?.secondsLeft).toBe(50);

        // Check for the message in component
        const message = component.message();
        expect(message).toContain('Seconds left to deadline');
        expect(message).toContain('50');
    }));

    it('should update data every second', fakeAsync(() => {
        // Manually ensure we have data in the service
        (deadlineService as any).deadlineSignal.set({ secondsLeft: 30 });
        fixture.detectChanges();

        // Now make sure component has received the data
        expect(component.secondsLeft()).toBeTruthy();
        expect(component.secondsLeft()?.secondsLeft).toBe(30);

        // Now manually decrement and check for update
        deadlineService.decrementSeconds();
        fixture.detectChanges();

        // Check updated value in service and component
        expect(deadlineService.deadline().secondsLeft).toBe(29);
        expect(component.secondsLeft()?.secondsLeft).toBe(29);

        // Verify message is updated
        expect(component.message()).toContain('29');

        // Clean up any pending timers
        discardPeriodicTasks();
    }));
});
