import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeadlineService } from '../../services/deadline.service';
import { Subject, takeUntil } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { CountdownHighlightDirective } from '../../directives/countdown-highlight.directive';
import { PerformanceTracker, TrackPerformance } from '../../utils/performance';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule, CountdownHighlightDirective],
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountdownComponent implements OnInit, OnDestroy {
  private deadlineService = inject(DeadlineService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private destroy$ = new Subject<void>();

  @ViewChild('countdownContainer', { static: false })
  countdownContainer?: ElementRef;

  secondsLeft = this.deadlineService.deadline;
  loading = this.deadlineService.loading;
  error = this.deadlineService.error;

  message = computed(() => {
    const seconds = this.secondsLeft();
    if (!seconds) return 'Loading deadline information...';
    return `Seconds left to deadline: ${seconds.secondsLeft}`;
  });

  isAlmostDeadline = computed(() => {
    const seconds = this.secondsLeft();
    return seconds && seconds.secondsLeft <= 10;
  });

  i18nText = signal({
    title: 'Countdown Timer',
    loading: 'Loading deadline information...',
    seconds: 'Seconds left to deadline: ',
    error: 'Error loading deadline: '
  });

  constructor() {
    effect(() => {
      const seconds = this.secondsLeft();
      if (seconds) {
        this.titleService.setTitle(`Deadline: ${seconds.secondsLeft} seconds left`);
        this.updateMetaTags(seconds.secondsLeft);
      }
    });

    effect(() => {
      const seconds = this.secondsLeft();
      if (seconds && seconds.secondsLeft === 0) {
        this.notifyDeadlineReached();
      }
    });

    afterNextRender(() => {
      PerformanceTracker.addMetric({
        componentName: 'CountdownComponent',
        eventName: 'initialRender',
        duration: performance.now(),
        timestamp: Date.now()
      });
    });
  }

  @TrackPerformance('CountdownComponent', 'ngOnInit')
  ngOnInit(): void {
    this.deadlineService.autoRefresh$.pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @TrackPerformance('CountdownComponent', 'refreshDeadline')
  refreshDeadline(): void {
    this.deadlineService.refreshDeadline();
  }

  private updateMetaTags(secondsLeft: number): void {
    this.metaService.updateTag({
      name: 'description',
      content: `Countdown timer with ${secondsLeft} seconds left to deadline`
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: `Deadline: ${secondsLeft} seconds left`
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: `Countdown timer with ${secondsLeft} seconds left`
    });
  }

  private notifyDeadlineReached(): void {
    console.log('Deadline reached!');

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Deadline reached!', {
        body: 'The countdown timer has reached zero.',
        icon: '/favicon.ico'
      });
    }
  }
}
