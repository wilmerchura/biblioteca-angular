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
      },
      onReady: (_: any, __: any, fp: any) => {
        this.injectYearSelect(fp);
      },
      onMonthChange: (_: any, __: any, fp: any) => {
        this.syncYearSelect(fp);
      }
    });
  }

  private injectYearSelect(fp: any) {
    const monthContainer = fp.calendarContainer?.querySelector('.flatpickr-current-month') as HTMLElement;
    if (!monthContainer || monthContainer.querySelector('.fp-year-select')) return;

    const numWrapper = monthContainer.querySelector('.numInputWrapper') as HTMLElement;
    const currentYear = fp.currentYear;

    const select = document.createElement('select');
    select.className = 'fp-year-select';

    for (let y = currentYear + 10; y >= currentYear - 100; y--) {
      const opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = String(y);
      if (y === currentYear) opt.selected = true;
      select.appendChild(opt);
    }

    select.addEventListener('change', () => {
      fp.changeYear(Number(select.value));
    });

    if (numWrapper) {
      numWrapper.after(select);
    } else {
      monthContainer.appendChild(select);
    }
  }

  private syncYearSelect(fp: any) {
    const select = fp.calendarContainer?.querySelector('.fp-year-select') as HTMLSelectElement;
    if (select) select.value = String(fp.currentYear);
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
