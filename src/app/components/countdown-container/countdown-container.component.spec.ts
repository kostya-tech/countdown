import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CountdownContainerComponent } from './countdown-container.component';
import { CountdownDisplayComponent } from '../countdown-display/countdown-display.component';
import { DeadlineApiService } from '../../services/deadline-api.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('CountdownContainerComponent', () => {
    let component: CountdownContainerComponent;
    let fixture: ComponentFixture<CountdownContainerComponent>;
    let httpMock: HttpTestingController;
    let deadlineService: DeadlineApiService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CountdownContainerComponent, CountdownDisplayComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideAnimations(),
                DeadlineApiService
            ]
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);
        deadlineService = TestBed.inject(DeadlineApiService);
        fixture = TestBed.createComponent(CountdownContainerComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        fixture.detectChanges();
        const req = httpMock.expectOne('/api/deadline');
        req.flush(null);
        expect(component).toBeTruthy();
    });

    it('should show loading state initially', () => {
        fixture.detectChanges();
        expect(component.loading()).toBeTrue();

        const req = httpMock.expectOne('/api/deadline');
        req.flush(null);
    });

    it('should update secondsLeft when deadline is received', fakeAsync(() => {
        const mockDeadline = { secondsLeft: 60 };

        fixture.detectChanges();
        const req = httpMock.expectOne('/api/deadline');
        req.flush(mockDeadline);

        fixture.detectChanges();
        tick();

        expect(component.deadline()).toEqual(mockDeadline);
        expect(component.secondsLeft()).toBe(60);

        tick(1000);
        fixture.detectChanges();
        expect(component.secondsLeft()).toBe(59);

        tick(1000);
        fixture.detectChanges();
        expect(component.secondsLeft()).toBe(58);
    }));

    it('should handle API error gracefully', fakeAsync(() => {
        fixture.detectChanges();
        const req = httpMock.expectOne('/api/deadline');
        req.error(new ErrorEvent('Network error'));

        fixture.detectChanges();
        tick();

        expect(component.deadline()).toBeNull();
        expect(component.error()).toBeNull();
        expect(component.loading()).toBeTrue();
    }));

    it('should not go below 0 seconds', fakeAsync(() => {
        const mockDeadline = { secondsLeft: 1 };

        fixture.detectChanges();
        const req = httpMock.expectOne('/api/deadline');
        req.flush(mockDeadline);

        fixture.detectChanges();
        tick();

        expect(component.secondsLeft()).toBe(1);

        tick(1000);
        fixture.detectChanges();
        expect(component.secondsLeft()).toBe(0);

        tick(1000);
        fixture.detectChanges();
        expect(component.secondsLeft()).toBe(0);
    }));

    it('should cleanup timer subscription on destroy', fakeAsync(() => {
        const mockDeadline = { secondsLeft: 60 };

        fixture.detectChanges();
        const req = httpMock.expectOne('/api/deadline');
        req.flush(mockDeadline);

        fixture.detectChanges();
        tick();

        expect(component.secondsLeft()).toBe(60);

        fixture.destroy();

        tick(1000);
        expect(component.secondsLeft()).toBe(60);
    }));
}); 