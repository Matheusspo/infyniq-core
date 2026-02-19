
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalType = 'danger' | 'info' | 'success';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        (click)="onCancel()"
      ></div>

      <!-- Modal Card -->
      <div
        class="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20"
      >
        <!-- Icon Header -->
        <div
          class="flex justify-center pt-8 pb-4"
          [ngClass]="{
            'text-red-500': type === 'danger',
            'text-blue-600': type === 'info',
            'text-emerald-500': type === 'success'
          }"
        >
          <ng-content select="[icon]"></ng-content>
          @if (!hasIconContent) {
            <svg
              *ngIf="type === 'danger'"
              class="w-16 h-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
             <svg
              *ngIf="type === 'info'"
              class="w-16 h-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
             <svg
              *ngIf="type === 'success'"
              class="w-16 h-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        </div>

        <!-- Content -->
        <div class="px-8 text-center space-y-3 pb-8">
          <h3 class="text-2xl font-black text-slate-800 tracking-tight">
            {{ title }}
          </h3>
          <p class="text-slate-500 font-medium leading-relaxed">
            {{ message }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex border-t border-slate-100">
          <button
            (click)="onCancel()"
            class="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest text-[11px]"
          >
            {{ cancelText }}
          </button>
          <div class="w-px bg-slate-100"></div>
          <button
            (click)="onConfirm()"
            [ngClass]="{
              'text-red-600 hover:bg-red-50': type === 'danger',
              'text-blue-600 hover:bg-blue-50': type === 'info',
              'text-emerald-600 hover:bg-emerald-50': type === 'success'
            }"
            class="flex-1 py-4 font-black transition-colors uppercase tracking-widest text-[11px]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmationModalComponent {
  @Input() title = 'Tem certeza?';
  @Input() message = '';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() type: ModalType = 'danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  protected hasIconContent = false; // Placeholder logic if we want to detect ng-content

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
