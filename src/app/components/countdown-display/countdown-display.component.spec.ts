import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountdownDisplayComponent } from './countdown-display.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

@Component({
    standalone: true,
    imports: [CountdownDisplayComponent],
    template: `
        <app-countdown-display
            [secondsLeft]="seconds"
            [loading]="isLoading"
            [error]="errorMessage">
        </app-countdown-display>
    `
})
class TestHostComponent {
    seconds: number | null = null;
    isLoading = false;
    errorMessage: string | null = null;
}

describe('CountdownDisplayComponent', () => {
    let hostComponent: TestHostComponent;
    let component: CountdownDisplayComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, CountdownDisplayComponent],
            providers: [provideAnimations()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        hostComponent = fixture.componentInstance;
        component = fixture.debugElement.children[0].componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show loading state', () => {
        hostComponent.isLoading = true;
        hostComponent.seconds = null;
        fixture.detectChanges();
        expect(component.loading()).toBeTrue();
    });

    it('should show error state', () => {
        const errorMessage = 'Test error';
        hostComponent.errorMessage = errorMessage;
        hostComponent.seconds = null;
        fixture.detectChanges();
        expect(component.error()).toBe(errorMessage);
    });

    it('should format time correctly', () => {
        hostComponent.seconds = 125;
        hostComponent.isLoading = false;
        fixture.detectChanges();
        expect(component.formattedTime()).toBe('2:05');
    });

    it('should handle null seconds', () => {
        hostComponent.seconds = null;
        hostComponent.isLoading = false;
        fixture.detectChanges();
        expect(component.formattedTime()).toBe('0:00');
    });

    it('should show correct timer state', () => {
        hostComponent.isLoading = false;

        hostComponent.seconds = 60;
        fixture.detectChanges();
        expect(component.timerState()).toBe('normal');

        hostComponent.seconds = 30;
        fixture.detectChanges();
        expect(component.timerState()).toBe('warning');

        hostComponent.seconds = 10;
        fixture.detectChanges();
        expect(component.timerState()).toBe('danger');

        hostComponent.seconds = 0;
        fixture.detectChanges();
        expect(component.timerState()).toBe('expired');
    });
}); 