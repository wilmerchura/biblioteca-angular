import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  visible = signal(false);
  message = signal('');
  title = signal('Confirmar');
  confirmLabel = signal('Confirmar');
  confirmClass = signal('btn-danger');

  private resolveFn: ((v: boolean) => void) | null = null;

  open(opts: { message: string; title?: string; confirmLabel?: string; confirmClass?: string }): Promise<boolean> {
    this.message.set(opts.message);
    this.title.set(opts.title ?? 'Confirmar');
    this.confirmLabel.set(opts.confirmLabel ?? 'Confirmar');
    this.confirmClass.set(opts.confirmClass ?? 'btn-danger');
    this.visible.set(true);
    return new Promise(resolve => { this.resolveFn = resolve; });
  }

  accept() {
    this.visible.set(false);
    this.resolveFn?.(true);
    this.resolveFn = null;
  }

  cancel() {
    this.visible.set(false);
    this.resolveFn?.(false);
    this.resolveFn = null;
  }
}
