// phone.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
  standalone: true,
})
export class PhonePipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '';

    // Remove tudo que não for número
    const phone = value.toString().replace(/\D/g, '');

    // Máscara para Celular (11 dígitos) ou Fixo (10 dígitos)
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return value.toString(); // Retorna o original caso não encaixe
  }
}
