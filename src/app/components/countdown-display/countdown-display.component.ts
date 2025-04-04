import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    animate,
    style,
    transition,
    trigger
} from '@angular/animations';

@Component({
    selector: 'app-countdown-display',
    imports: [CommonModule],
    templateUrl: './countdown-display.component.html',
    styles: [`
        @keyframes flip {
            0%, 5% { transform: rotate(0deg); }
            45%, 50% { transform: rotate(180deg); }
            95%, 100% { transform: rotate(0deg); }
        }
        
        .hourglass-flip {
            display: inline-block;
            animation: flip 6s ease-in-out infinite;
            transform-origin: center;
            will-change: transform;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10% { transform: translateX(-4px) rotate(-5deg); }
            30% { transform: translateX(4px) rotate(5deg); }
            50% { transform: translateX(-4px) rotate(-5deg); }
            70% { transform: translateX(4px) rotate(5deg); }
            90% { transform: translateX(-4px) rotate(-5deg); }
        }
        
        .alarm-shake {
            display: inline-block !important;
            animation: shake 1.2s cubic-bezier(.36,.07,.19,.97);
            transform-origin: center;
            will-change: transform;
            color: var(--bs-danger);
            font-size: 1.5em;
        }
    `],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms ease-out', style({ opacity: 1 })),
            ]),
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownDisplayComponent {
    secondsLeft = input<number | null>(null);
    loading = input<boolean>(false);
    error = input<string | null>(null);

    title = 'Countdown Timer';

    totalSeconds = computed(() => Math.max(this.secondsLeft() ?? 0, 0));

    formattedTime = computed(() => {
        const total = this.totalSeconds();
        const minutes = Math.floor(total / 60);
        const seconds = total % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });

    timerState = computed(() => {
        const seconds = this.totalSeconds();
        if (seconds === 0) return 'expired';
        if (seconds <= 10) return 'danger';
        if (seconds <= 30) return 'warning';
        return 'normal';
    });
}