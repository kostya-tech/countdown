import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CountdownHighlightDirective } from './countdown-highlight.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  standalone: true,
  imports: [CountdownHighlightDirective],
  template: `
    <div [appCountdownHighlight]="secondsLeft" testid="highlight-el">Test content</div>
  `
})
class TestComponent {
  secondsLeft = 30;
}

describe('CountdownHighlightDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let el: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TestComponent]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement.query(By.css('[testid="highlight-el"]'));
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = el.injector.get(CountdownHighlightDirective);
    expect(directive).toBeTruthy();
  });

  it('should apply normal styles when seconds > 30', () => {
    component.secondsLeft = 60;
    fixture.detectChanges();

    const styles = window.getComputedStyle(el.nativeElement);
    expect(styles.backgroundColor).toBe('rgb(232, 245, 233)'); // #e8f5e9
    expect(styles.color).toBe('rgb(46, 125, 50)'); // #2e7d32
  });

  it('should apply alert styles when seconds <= 30 and > 10', () => {
    component.secondsLeft = 30;
    fixture.detectChanges();

    const styles = window.getComputedStyle(el.nativeElement);
    expect(styles.backgroundColor).toBe('rgb(255, 248, 225)'); // #fff8e1
    expect(styles.color).toBe('rgb(255, 143, 0)'); // #ff8f00
  });

  it('should apply warning styles when seconds <= 10', () => {
    component.secondsLeft = 10;
    fixture.detectChanges();

    const styles = window.getComputedStyle(el.nativeElement);
    expect(styles.backgroundColor).toBe('rgb(255, 235, 238)'); // #ffebee
    expect(styles.color).toBe('rgb(198, 40, 40)'); // #c62828
    expect(styles.fontWeight).toBe('700'); // bold
  });

  it('should update styles when input parameter changes', fakeAsync(() => {
    component.secondsLeft = 60;
    fixture.detectChanges();

    expect(el.nativeElement.style.backgroundColor).toBe('rgb(232, 245, 233)');

    component.secondsLeft = 10;
    fixture.detectChanges();

    tick(100);

    expect(el.nativeElement.style.backgroundColor).toBe('rgb(255, 235, 238)');
    expect(el.nativeElement.style.fontWeight).toBe('bold');
  }));

  it('should apply border styles for all conditions', fakeAsync(() => {
    expect(el.nativeElement.style.borderRadius).toBe('4px');
    expect(el.nativeElement.style.padding).toBe('8px 16px');

    component.secondsLeft = 10;
    fixture.detectChanges();
    tick(100);

    expect(el.nativeElement.style.border).toBeDefined();
    expect(el.nativeElement.style.border.length).toBeGreaterThan(0);
  }));
});
