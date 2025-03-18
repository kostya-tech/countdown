import { signal } from '@angular/core';

export interface PerformanceMetric {
    componentName: string;
    eventName: string;
    duration: number;
    timestamp: number;
}

export class PerformanceTracker {
    private static metrics = signal<PerformanceMetric[]>([]);

    public static measure<T>(
        componentName: string,
        eventName: string,
        fn: () => T
    ): T {
        const start = performance.now();
        const result = fn();
        const end = performance.now();

        this.addMetric({
            componentName,
            eventName,
            duration: end - start,
            timestamp: Date.now()
        });

        return result;
    }

    public static addMetric(metric: PerformanceMetric): void {
        this.metrics.update(current => [...current, metric]);

        if (this.metrics().length > 100) {
            this.metrics.update(current => current.slice(-100));
        }

        console.debug(`Performance: ${metric.componentName} - ${metric.eventName}: ${metric.duration.toFixed(2)}ms`);
    }

    public static getMetrics(): PerformanceMetric[] {
        return this.metrics();
    }

    public static clearMetrics(): void {
        this.metrics.set([]);
    }
}

export function TrackPerformance(componentName: string, eventName?: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const methodName = eventName || propertyKey;
            return PerformanceTracker.measure(
                componentName,
                methodName,
                () => originalMethod.apply(this, args)
            );
        };

        return descriptor;
    };
}
