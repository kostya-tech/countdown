import { Directive, ElementRef, Input, OnChanges, SimpleChanges, inject, Renderer2, PLATFORM_ID, Inject } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appCountdownHighlight]',
  standalone: true
})
export class CountdownHighlightDirective implements OnChanges {
  @Input('appCountdownHighlight') secondsLeft = 0;

  private element = inject(ElementRef);
  private renderer = inject(Renderer2);
  private builder = inject(AnimationBuilder);
  private player: AnimationPlayer | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['secondsLeft']) {
      this.highlightElement();
    }
  }

  private highlightElement(): void {
    if (this.player) {
      try {
        this.player.destroy();
      } catch (error) {
        console.warn('Error destroying animation player:', error);
      }
      this.player = null;
    }

    this.renderer.setStyle(this.element.nativeElement, 'border-radius', '4px');
    this.renderer.setStyle(this.element.nativeElement, 'padding', '8px 16px');
    this.renderer.setStyle(this.element.nativeElement, 'transition', 'all 0.3s ease');

    if (this.secondsLeft <= 10) {
      this.applyWarningStyles();
    } else if (this.secondsLeft <= 30) {
      this.applyAlertStyles();
    } else {
      this.applyNormalStyles();
    }
  }

  private applyNormalStyles(): void {
    this.renderer.setStyle(this.element.nativeElement, 'background-color', '#e8f5e9');
    this.renderer.setStyle(this.element.nativeElement, 'color', '#2e7d32');
    this.renderer.setStyle(this.element.nativeElement, 'border', '1px solid #66bb6a');
  }

  private applyAlertStyles(): void {
    this.renderer.setStyle(this.element.nativeElement, 'background-color', '#fff8e1');
    this.renderer.setStyle(this.element.nativeElement, 'color', '#ff8f00');
    this.renderer.setStyle(this.element.nativeElement, 'border', '1px solid #ffc107');

    if (this.isBrowser) {
      this.createAndPlayAnimation([
        style({ transform: 'scale(1)' }),
        animate('1s ease-in-out', style({ transform: 'scale(1.05)' })),
        animate('1s ease-in-out', style({ transform: 'scale(1)' }))
      ], () => {
        if (this.secondsLeft <= 30 && this.secondsLeft > 10) {
          this.restartAnimation();
        }
      });
    }
  }

  private applyWarningStyles(): void {
    this.renderer.setStyle(this.element.nativeElement, 'background-color', '#ffebee');
    this.renderer.setStyle(this.element.nativeElement, 'color', '#c62828');
    this.renderer.setStyle(this.element.nativeElement, 'border', '1px solid #ef5350');
    this.renderer.setStyle(this.element.nativeElement, 'font-weight', 'bold');

    if (this.isBrowser) {
      this.createAndPlayAnimation([
        style({ opacity: 1 }),
        animate('0.5s ease-in-out', style({ opacity: 0.7 })),
        animate('0.5s ease-in-out', style({ opacity: 1 }))
      ], () => {
        if (this.secondsLeft <= 10) {
          this.restartAnimation();
        }
      });
    }
  }

  private createAndPlayAnimation(animationMetadata: any[], onDoneCallback?: () => void): void {
    try {
      const animation = this.builder.build(animationMetadata);
      this.player = animation.create(this.element.nativeElement);
      this.player.play();

      if (onDoneCallback) {
        this.player.onDone(onDoneCallback);
      }
    } catch (error) {
      console.warn('Error creating animation:', error);
    }
  }

  private restartAnimation(): void {
    if (this.player) {
      try {
        this.player.restart();
      } catch (error) {
        console.warn('Error restarting animation:', error);
      }
    }
  }
}
