import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CountdownDisplayComponent } from '../countdown-display/countdown-display.component';
import { interval } from 'rxjs';
import { DeadlineApiService } from '../../services/deadline-api.service';

@Component({
    selector: 'app-countdown',
    imports: [CommonModule, CountdownDisplayComponent],
    templateUrl: './countdown-container.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountdownContainerComponent {
    private deadlineApi = inject(DeadlineApiService);
    private destroyRef = inject(DestroyRef);

    deadline = toSignal(
        this.deadlineApi.getDeadline().pipe(takeUntilDestroyed(this.destroyRef)),
        { initialValue: null }
    );

    error = signal<string | null>(null);
    secondsLeft = signal<number | null>(null);

    loading = computed(() => !this.deadline() && !this.error());

    private timerEffect = effect((onCleanup) => {
        const deadline = this.deadline();

        if (!deadline) return;

        this.secondsLeft.set(deadline.secondsLeft);

        const timerSub = interval(1000).subscribe(() => {
            this.secondsLeft.update(seconds => Math.max((seconds ?? 0) - 1, 0));
        });

        onCleanup(() => timerSub.unsubscribe()); // автоматически очищаем
    });
} 