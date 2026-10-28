import { Injectable, inject } from '@angular/core';
import { Database, ref, objectVal, runTransaction } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContadorService {
  private db = inject(Database);

  // Para leer el valor en el footer
  obtenerContador(): Observable<number> {
    const referencia = ref(this.db, 'impacto_calculadora');
    return objectVal<number>(referencia);
  }

  // Para sumar 1 (botón calcular)
  registrarImpacto() {
    const referencia = ref(this.db, 'impacto_calculadora');
    runTransaction(referencia, (valor) => {
      return (valor || 0) + 1;
    });
  }
}