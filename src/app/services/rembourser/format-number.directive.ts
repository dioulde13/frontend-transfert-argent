import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appFormatNumber]'
})
export class FormatNumberDirective {
  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const value = this.el.value.replace(/\s/g, '');
    if (!isNaN(Number(value))) {
      this.el.value = this.formatNumber(value);
    }
  }

  private formatNumber(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
