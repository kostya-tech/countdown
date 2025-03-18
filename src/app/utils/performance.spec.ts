import { TestBed } from '@angular/core/testing';
import { PerformanceTracker, TrackPerformance } from './performance';

describe('PerformanceTracker', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({});
        // Clear data before each test
        PerformanceTracker.clearMetrics();
        spyOn(console, 'debug').and.stub();
    });

    it('should save performance metrics', () => {
        PerformanceTracker.addMetric({
            componentName: 'TestComponent',
            eventName: 'testEvent',
            duration: 100,
            timestamp: Date.now()
        });

        expect(PerformanceTracker.getMetrics().length).toBe(1);
        expect(PerformanceTracker.getMetrics()[0].componentName).toBe('TestComponent');
        expect(PerformanceTracker.getMetrics()[0].eventName).toBe('testEvent');
    });

    it('should log metrics to console', () => {
        PerformanceTracker.addMetric({
            componentName: 'TestComponent',
            eventName: 'testEvent',
            duration: 100,
            timestamp: Date.now()
        });

        expect(console.debug).toHaveBeenCalled();
    });

    it('should measure function execution time', () => {
        const testFn = () => {
            let sum = 0;
            for (let i = 0; i < 1000; i++) {
                sum += i;
            }
            return sum;
        };

        const result = PerformanceTracker.measure('TestComponent', 'testMeasure', testFn);

        expect(result).toBe(499500); // Sum of numbers from 0 to 999
        expect(PerformanceTracker.getMetrics().length).toBe(1);
        expect(PerformanceTracker.getMetrics()[0].componentName).toBe('TestComponent');
        expect(PerformanceTracker.getMetrics()[0].eventName).toBe('testMeasure');
        expect(PerformanceTracker.getMetrics()[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should limit the number of stored metrics', () => {
        // Add more than 100 metrics
        for (let i = 0; i < 110; i++) {
            PerformanceTracker.addMetric({
                componentName: `Component${i}`,
                eventName: `Event${i}`,
                duration: i,
                timestamp: Date.now()
            });
        }

        expect(PerformanceTracker.getMetrics().length).toBe(100);
        // The last metric should be with index 109
        expect(PerformanceTracker.getMetrics()[99].componentName).toBe('Component109');
    });

    it('should clear all metrics', () => {
        PerformanceTracker.addMetric({
            componentName: 'TestComponent',
            eventName: 'testEvent',
            duration: 100,
            timestamp: Date.now()
        });

        expect(PerformanceTracker.getMetrics().length).toBe(1);

        PerformanceTracker.clearMetrics();

        expect(PerformanceTracker.getMetrics().length).toBe(0);
    });
});

describe('TrackPerformance Decorator', () => {
    let testObj: any;

    class TestClass {
        @TrackPerformance('TestClass', 'testMethod')
        testMethod(a: number, b: number): number {
            return a + b;
        }

        @TrackPerformance('TestClass')
        anotherMethod(): string {
            return 'test';
        }
    }

    beforeEach(() => {
        PerformanceTracker.clearMetrics();
        spyOn(console, 'debug').and.stub();
        testObj = new TestClass();
    });

    it('should measure method performance', () => {
        const result = testObj.testMethod(5, 10);

        expect(result).toBe(15);
        expect(PerformanceTracker.getMetrics().length).toBe(1);
        expect(PerformanceTracker.getMetrics()[0].componentName).toBe('TestClass');
        expect(PerformanceTracker.getMetrics()[0].eventName).toBe('testMethod');
    });

    it('should use method name if eventName is not specified', () => {
        testObj.anotherMethod();

        expect(PerformanceTracker.getMetrics().length).toBe(1);
        expect(PerformanceTracker.getMetrics()[0].componentName).toBe('TestClass');
        expect(PerformanceTracker.getMetrics()[0].eventName).toBe('anotherMethod');
    });

    it('should preserve this context', () => {
        class ContextTestClass {
            private value: number = 10;

            @TrackPerformance('ContextTest')
            getValue(): number {
                return this.value;
            }
        }

        const contextObj = new ContextTestClass();
        const result = contextObj.getValue();

        expect(result).toBe(10);
    });
});
