import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <div 
        class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] overflow-hidden relative group"
        [style.height.px]="height"
      >
        <canvas #sigCanvas
          class="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          (mousedown)="startDrawing($event)"
          (mousemove)="draw($event)"
          (mouseup)="stopDrawing()"
          (mouseleave)="stopDrawing()"
          (touchstart)="handleTouch($event)"
          (touchmove)="handleTouch($event)"
          (touchend)="stopDrawing()"
        ></canvas>

        @if (isEmpty()) {
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            <i class="pi pi-pencil text-3xl mb-2 text-slate-400"></i>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">Assine aqui</p>
          </div>
        }
      </div>

      <div class="flex justify-between items-center px-2">
        <button 
          type="button" 
          (click)="clear()"
          class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2"
        >
          <i class="pi pi-trash"></i>
          Limpar
        </button>
        
        <p class="text-[9px] font-bold text-slate-400 uppercase italic">
          Garantia de atendimento Infyniq
        </p>
      </div>
    </div>
  `,
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('sigCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureChange = new EventEmitter<string | null>();

  height = 200;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  isEmpty = signal(true);

  ngAfterViewInit() {
    this.initCanvas();
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    // Ajustar resolução para retina
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#1e293b'; // Slate 900
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.isEmpty.set(false);
    this.ctx.beginPath();
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;
    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
    this.emitSignature();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  handleTouch(event: TouchEvent) {
    event.preventDefault();
    if (event.type === 'touchend') {
      this.stopDrawing();
      return;
    }

    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (event.type === 'touchstart') {
      this.isDrawing = true;
      this.isEmpty.set(false);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    } else if (event.type === 'touchmove' && this.isDrawing) {
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.emitSignature();
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.isEmpty.set(true);
    this.signatureChange.emit(null);
  }

  private emitSignature() {
    const dataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
    this.signatureChange.emit(dataUrl);
  }
}
