import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal<string>('');
  type = signal<ToastType>('success');
  show = signal(false);

  showToast(msg: string, type: ToastType = 'success') {
    this.message.set(msg);
    this.type.set(type);
    this.show.set(true);

    setTimeout(() => {
      this.show.set(false);
    }, 3000); // Some após 3 segundos
  }
}
