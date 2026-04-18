import { Directive, ElementRef, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

declare const flatpickr: any;

@Directive({
  selector: 'input[datepicker]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatepickerDirective),
    multi: true
  }]
})
export class DatepickerDirective implements OnInit, OnDestroy, ControlValueAccessor {
  private fp: any;
  private onChange = (_: string) => {};
  private onTouched = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit() {
    this.fp = flatpickr(this.el.nativeElement, {
      dateFormat: 'Y-m-d',
      locale: 'es',
      disableMobile: true,
      allowInput: true,
      onChange: (_: Date[], dateStr: string) => {
        this.onChange(dateStr);
        this.onTouched();
      }
    });
  }

  writeValue(value: string): void {
    if (this.fp && value) {
      this.fp.setDate(value, false);
    } else if (this.fp) {
      this.fp.clear();
    }
  }

  registerOnChange(fn: (_: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(disabled: boolean): void {
    this.el.nativeElement.disabled = disabled;
  }

  ngOnDestroy() {
    this.fp?.destroy();
  }
}
