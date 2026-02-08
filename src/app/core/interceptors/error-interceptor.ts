import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      let errorMsg = 'Ocorreu um erro inesperado.';

      if (error.status === 0) {
        errorMsg =
          'Não foi possível conectar ao servidor da Repair Elevadores. Verifique se o Backend está rodando.';
      } else if (error.status === 400) {
        errorMsg = 'Dados inválidos. Verifique os campos do formulário.';
      }

      // Aqui você poderia usar um Toast/Notificação em vez de alert
      alert(errorMsg);
      return throwError(() => error);
    }),
  );
};
