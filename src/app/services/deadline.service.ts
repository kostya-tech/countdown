import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, interval, map, retry, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { Deadline, DeadlineResponse } from '../models/deadline';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class DeadlineService {
  private http = inject(HttpClient);

  // Signal for storing deadline data
  private deadlineSignal = signal<Deadline | null>(null);

  // Signal for tracking loading status
  private loadingSignal = signal<boolean>(false);

  // Signal for tracking errors
  private errorSignal = signal<string | null>(null);

  // Performance metrics
  private lastFetchTime = signal<number | null>(null);
  private fetchCount = signal<number>(0);

  // Public signals for use in components
  public deadline = this.deadlineSignal.asReadonly();
  public loading = this.loadingSignal.asReadonly();
  public error = this.errorSignal.asReadonly();

  // Computed signal for formatting seconds
  public formattedSeconds = computed(() => {
    const deadline = this.deadlineSignal();
    if (!deadline) return 'Loading...';
    return `${deadline.secondsLeft}`;
  });

  // Observable for automatic updates (made public)
  public autoRefresh$ = interval(1000).pipe(
    startWith(0),
    tap(() => this.loadingSignal.set(true)),
    switchMap(() => this.fetchDeadline()),
    shareReplay(1)
  );

  // Signal from Observable
  public autoDeadline = toSignal(this.autoRefresh$, { initialValue: null as Deadline | null });

  constructor() {
    // Effect for logging changes
    effect(() => {
      const currentDeadline = this.deadlineSignal();
      if (currentDeadline) {
        console.log(`Seconds left: ${currentDeadline.secondsLeft}`);
      }
    });

    // Effect for tracking metrics
    effect(() => {
      const fetchTime = this.lastFetchTime();
      const count = this.fetchCount();
      if (fetchTime && count > 0) {
        console.log(`API call #${count} completed in ${fetchTime}ms`);
      }
    });
  }

  /**
   * Gets deadline data from API
   */
  public fetchDeadline(): Observable<Deadline> {
    const startTime = performance.now();

    return this.http.get<DeadlineResponse>('/api/deadline').pipe(
      retry(3),
      map(response => ({ secondsLeft: response.secondsLeft })),
      tap({
        next: (data) => {
          this.deadlineSignal.set(data);
          this.errorSignal.set(null);
          this.lastFetchTime.set(Math.round(performance.now() - startTime));
          this.fetchCount.update(count => count + 1);
        },
        error: (err) => {
          this.errorSignal.set(err.message || 'Error fetching data');
          this.loadingSignal.set(false);
        },
        finalize: () => {
          this.loadingSignal.set(false);
        }
      }),
      catchError(err => {
        throw err;
      })
    );
  }

  /**
   * Updates timer manually
   */
  public refreshDeadline(): void {
    this.loadingSignal.set(true);
    this.fetchDeadline().subscribe();
  }

  /**
   * Simulates timer update without API request
   */
  public decrementSeconds(): void {
    const current = this.deadlineSignal();
    if (current && current.secondsLeft > 0) {
      this.deadlineSignal.set({ ...current, secondsLeft: current.secondsLeft - 1 });
    }
  }
}
