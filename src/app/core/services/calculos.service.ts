import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CalculosService {
    /** Versión del núcleo de cálculo (v1.1.0: se elimina la asignación directa CVCt = 1 en unanimidad máxima
     *  y se exige un mínimo de 3 jueces, conforme a Hernández-Nieto, 2002). */
    static readonly VERSION = '1.1.0';
    static readonly MIN_JUECES = 3;
    constructor(){}

      private validarEntero(valor: any, minimo: number = 1, nombre: string = "valor"): number {
    if (typeof valor !== 'number' || !Number.isInteger(valor)) {
      throw new Error(`${nombre} debe ser un número entero.`);
    }
    if (valor < minimo) {
      throw new Error(`${nombre} debe ser mayor o igual a ${minimo}.`);
    }
    return valor;
  }

  // Validar número (float o int)
  private validarFloat(valor: any, scale: number, minimo: number = 1, nombre: string = "valor"): number {
    if (typeof valor !== 'number' || isNaN(valor)) {
      throw new Error(`${nombre} debe ser numérico.`);
    }
    if (valor < minimo) {
      throw new Error(`${nombre} debe ser mayor o igual a ${minimo}.`);
    }
    if (valor > scale) {
      throw new Error(`${nombre} debe ser menor o igual a la escala ${scale}.`);
    }
    return valor;
  }

  // Categorizar resultado
  private categorizarValidez(promedioTotal: number): string {
    if (promedioTotal < 0.60) {
      return "Validez y concordancia inaceptables";
    } else if (promedioTotal <= 0.70) {
      return "Validez y concordancia deficientes";
    } else if (promedioTotal <= 0.80) {
      return "Validez y concordancia aceptables";
    } else if (promedioTotal <= 0.90) {
      return "Validez y concordancia buenas";
    } else {
      return "Validez y concordancia excelentes";
    }
  }

  // Función principal para calcular
  calcularIndices(
    VarNames: string[],
    N_items: number[],
    Scale: number,
    J: number,
    puntajes: number[][][]
  ) {
    // Validaciones iniciales
    const Vars = this.validarEntero(VarNames.length, 1, "Número de variables");
    this.validarEntero(Scale, 1, "Escala de medición");
    this.validarEntero(J, CalculosService.MIN_JUECES, "Número de jueces");

    if (N_items.length !== Vars || puntajes.length !== Vars) {
      throw new Error("Las longitudes de VarNames, N_items y puntajes no coinciden.");
    }

    // Calcular Pei = (1/J)^J, con J = número de jueces (Hernández-Nieto, 2002)
    const Pei = Math.pow(1.0 / J, J);

    const resultados: any = {
      version: CalculosService.VERSION,
      Pei: Pei,
      variables: []
    };

    // Recorrer variables
    for (let v = 0; v < Vars; v++) {
      let sumaTotal = 0.0;
      const itemsResultados: any[] = [];

      for (let n = 0; n < N_items[v]; n++) {
        // Validar puntajes de cada juez
        for (let j = 0; j < J; j++) {
          puntajes[v][n][j] = this.validarFloat(puntajes[v][n][j], Scale, 1, `Puntaje Var ${VarNames[v]}, Item ${n + 1}, Juez ${j + 1}`);
        }

        const suma = puntajes[v][n].reduce((a, b) => a + b, 0);
        const promedio = suma / J;
        const cvci = promedio / Scale;
        const cvciPei = cvci - Pei;

        itemsResultados.push({
          item: n + 1,
          suma: suma,
          promedio: promedio,
          CVCi: cvci,
          CVCi_Pei: cvciPei
        });

        sumaTotal += cvciPei;
      }

      const promedioTotal = sumaTotal / N_items[v];

      // v1.1.0: ya no se sustituye CVCt por 1.0 en unanimidad máxima. Se conserva el valor
      // de la fórmula (1 - Pei) y se informa la condición mediante una bandera.
      const todosMaximos = puntajes[v].flat().every(valor => valor === Scale);

      resultados.variables.push({
        nombre: VarNames[v],
        items: itemsResultados,
        promedio_total: promedioTotal,
        unanimidad_maxima: todosMaximos,
        // v1.1.0: la categoría se asigna sobre el CVCt redondeado a 4 decimales (el valor que se muestra
        // y exporta), para que un valor presentado como 0,7000 no se clasifique como si fuera 0,7000…02.
        categoria: this.categorizarValidez(Math.round(promedioTotal * 1e4) / 1e4)
      });
    }

    return resultados;
  }
  
}