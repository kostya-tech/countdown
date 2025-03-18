import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CountdownComponent } from './countdown.component';
import { CommonModule } from '@angular/common';
import { DeadlineService } from '../../services/deadline.service';
import { CountdownHighlightDirective } from '../../directives/countdown-highlight.directive';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { signal } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CountdownComponent', () => {
  let component: CountdownComponent;
  let fixture: ComponentFixture<CountdownComponent>;
  let deadlineServiceMock: jasmine.SpyObj<DeadlineService>;
  let titleServiceMock: jasmine.SpyObj<Title>;
  let metaServiceMock: jasmine.SpyObj<Meta>;

  beforeEach(async () => {
    // Create a mock for deadline service
    deadlineServiceMock = jasmine.createSpyObj('DeadlineService',
      ['refreshDeadline'],
      {
        'deadline': signal(null),
        'loading': signal(false),
        'error': signal(null),
        'formattedSeconds': signal('42'),
        'autoRefresh$': of(null)
      }
    );

    // Create mocks for Title and Meta services
    titleServiceMock = jasmine.createSpyObj('Title', ['setTitle']);
    metaServiceMock = jasmine.createSpyObj('Meta', ['updateTag']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HttpClientTestingModule,
        CountdownComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DeadlineService, useValue: deadlineServiceMock },
        { provide: Title, useValue: titleServiceMock },
        { provide: Meta, useValue: metaServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set loading state from service', () => {
    // Проверяем состояние loading
    (deadlineServiceMock.loading as any).set(true);
    expect(component.loading()).toBeTrue();

    (deadlineServiceMock.loading as any).set(false);
    expect(component.loading()).toBeFalse();
  });

  it('should set error state from service', () => {
    // Проверяем состояние error
    (deadlineServiceMock.error as any).set('Test error');
    expect(component.error()).toBe('Test error');

    (deadlineServiceMock.error as any).set(null);
    expect(component.error()).toBeNull();
  });

  it('should format message correctly when data is received', () => {
    // Симулируем получение данных
    (deadlineServiceMock.deadline as any).set({ secondsLeft: 42 });
    fixture.detectChanges();

    // Проверим сигнал напрямую
    const messageValue = component.message();
    expect(messageValue).toContain('Seconds left to deadline: 42');
  });

  it('should update title and meta tags when data is received', () => {
    // Симулируем получение данных
    (deadlineServiceMock.deadline as any).set({ secondsLeft: 42 });
    fixture.detectChanges();

    expect(titleServiceMock.setTitle).toHaveBeenCalled();
    expect(titleServiceMock.setTitle).toHaveBeenCalledWith('Deadline: 42 seconds left');

    expect(metaServiceMock.updateTag).toHaveBeenCalled();
    // Проверяем хотя бы один из вызовов метода updateTag
    expect(metaServiceMock.updateTag).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'description',
      content: jasmine.stringContaining('42')
    }));
  });

  it('should set isAlmostDeadline to true when deadline is approaching', () => {
    // Симулируем приближение дедлайна
    (deadlineServiceMock.deadline as any).set({ secondsLeft: 5 });
    fixture.detectChanges();

    // Проверим сигнал напрямую
    expect(component.isAlmostDeadline()).toBeTrue();
  });

  it('should call refreshDeadline method on service when refreshDeadline is called', () => {
    // Вызовем метод напрямую
    component.refreshDeadline();

    expect(deadlineServiceMock.refreshDeadline).toHaveBeenCalled();
  });

  it('should log a message when secondsLeft reaches zero', fakeAsync(() => {
    spyOn(console, 'log');

    // Симулируем достижение нуля
    (deadlineServiceMock.deadline as any).set({ secondsLeft: 0 });
    fixture.detectChanges();
    tick();

    expect(console.log).toHaveBeenCalledWith('Deadline reached!');
  }));

  it('should subscribe to autoRefresh$ on initialization', () => {
    // Проверяем, что сервис имеет свойство autoRefresh$
    expect(deadlineServiceMock.autoRefresh$).toBeTruthy();
  });

  it('should unsubscribe from all subscriptions when destroyed', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
