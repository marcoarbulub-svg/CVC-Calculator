import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CalculosService } from '../../core/services/calculos.service';
import { ContadorService } from '../../core/services/contador.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-calcular',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './calcular.component.html',
  styleUrls: ['./calcular.component.css']
})
export class CalcularComponent {
  // Inputs iniciales
  numVariables: number | null = null;
  numVariablesInput: number | null = null;
  scale: number | null = null;
  scaleInput: number | null = null;
  jueces: number | null = null;
  juecesInput: number | null = null;
  mostrarGenerarTablas: boolean = false;
  mostrarBotonRestablecer: boolean = false;


  // Configuración dinámica de variables
  variablesConfig: { nombre: string; nItems: number }[] = [];
  variablesConfigInput: { nombre: string; nItems: number }[] = [];


  // Variables para tabla
  variables: string[] = [];
  n_items: number[] = [];
  puntajes: (number | null)[][][] = [];

  // Resultados
  resultados: any = null;
  errorMessage: string = '';      
  errorCalculoMessage: string = '';

  // Mensajes de validación individuales
  erroresInputs = {
    numVariablesInput: '',
    scaleInput: '',
    juecesInput: '',
    variablesConfigInput: [] as { nombre: string; nItems: string }[]
  };
  // Por si falla el return de fallos
  errorReturn = 0;

  validarCampo(campo: string, index?: number) {
    if (!this.erroresInputs.variablesConfigInput) {
      this.erroresInputs.variablesConfigInput = [];
    }
    if (index !== undefined && !this.erroresInputs.variablesConfigInput[index]) {
      this.erroresInputs.variablesConfigInput[index] = { nombre: '', nItems: '' };
    }

    switch (campo) {
      case 'numVariablesInput':
        this.erroresInputs.numVariablesInput =
          (this.numVariablesInput === null || this.numVariablesInput < 1 || this.numVariablesInput > 4)
            ? 'Debe ingresar entre 1 y 4 variables.' : '';
        break;

      case 'scaleInput':
        this.erroresInputs.scaleInput =
          (this.scaleInput === null || this.scaleInput <= 2 || this.scaleInput > 20)
            ? 'La escala debe estar entre 3 y 20.' : '';
        break;

      case 'juecesInput':
        this.erroresInputs.juecesInput =
          (this.juecesInput === null || this.juecesInput < 3 || this.juecesInput > 15)
            ? 'Número de jueces entre 3 y 15 (Hernández-Nieto recomienda un mínimo de 3).' : '';
        break;

      case 'nombreVar':
        if (index !== undefined) {
          const nombre = this.variablesConfigInput[index]?.nombre?.trim() ?? '';
          this.erroresInputs.variablesConfigInput[index].nombre =
            !nombre ? 'El nombre de la variable es obligatorio.' : '';
        }
        break;

      case 'nItemsVar':
        if (index !== undefined) {
          const nItems = this.variablesConfigInput[index]?.nItems ?? 0;
          this.erroresInputs.variablesConfigInput[index].nItems =
            (nItems < 2 || nItems > 200)
              ? 'Los ítems deben estar entre 2 y 200.' : '';
        }
        break;
    }
  }

  constructor(
    private calculosService: CalculosService,
    private contadorService: ContadorService
  ) {}

  // Genera los inputs según la cantidad de variables
  generarVariables() {
    if (this.numVariablesInput === null || this.numVariablesInput < 1 || this.numVariablesInput > 4) {
      this.errorMessage = 'Debes ingresar un número válido de variables (mínimo 1).';
      return;
    }

    this.errorMessage = '';

    this.variablesConfigInput = Array.from({ length: this.numVariablesInput }, () => ({
      nombre: '',
      nItems: 2
    }));

    this.erroresInputs.variablesConfigInput = Array.from({ length: this.numVariablesInput }, () => ({
      nombre: '',
      nItems: ''
    }));
  }


  calcularPei() {
    if (this.jueces === null || this.jueces < 3) {
      this.errorMessage = 'Debe haber mínimo 3 jueces.';
      return;
    }
    const Pei = Math.pow(1.0 / this.jueces, this.jueces);
    this.errorMessage = '';
    // v1.1.0: notación científica cuando Pei < 0,0001 para no mostrar 0,0000
    return Pei < 1e-4 ? Pei.toExponential(2) : Pei.toFixed(4);
  }

  // Para mostrar boton de generar tabla
  onValoresInicialesCambiados() {
    this.mostrarGenerarTablas = true;
  }

  // Tabla de puntajes
  generarTabla() {
    this.errorReturn = 0;
    this.errorMessage = '';
    this.erroresInputs = {
      numVariablesInput: '',
      scaleInput: '',
      juecesInput: '',
      variablesConfigInput: this.variablesConfigInput.map(() => ({ nombre: '', nItems: '' }))
    };

    // Validaciones básicas
    if (this.numVariablesInput === null || this.numVariablesInput < 1 || this.numVariablesInput > 4) {
      this.erroresInputs.numVariablesInput = 'Debe ingresar entre 1 y 4 variables.';
      this.errorReturn = 1;
    } else {
      this.numVariables = this.numVariablesInput;
    }


    if (this.scaleInput === null || this.scaleInput <= 2 || this.scaleInput > 20) {
      this.erroresInputs.scaleInput = 'La escala debe estar entre 3 y 20.';
      this.errorReturn = 1;
    } else {
      this.scale = this.scaleInput;
    }


    if (this.juecesInput === null || this.juecesInput < 3 || this.juecesInput > 15) {
      this.erroresInputs.juecesInput = 'Número de jueces entre 3 y 15 (Hernández-Nieto recomienda un mínimo de 3).';
      this.errorReturn = 1;
    } else {
      this.jueces = this.juecesInput;
    }

    this.variablesConfigInput.forEach((v, i) => {
      if (!v.nombre || v.nombre.trim() === '') {
        this.erroresInputs.variablesConfigInput[i].nombre = 'El nombre de la variable es obligatorio.';
        this.errorReturn = 1;
      }
      if (v.nItems < 2 || v.nItems > 200) {
        this.erroresInputs.variablesConfigInput[i].nItems = 'Los ítems deben estar entre 2 y 200.';
        this.errorReturn = 1;
      }
    });

    const ErroreVariablesConfig =
      this.erroresInputs.variablesConfigInput.some(e => e.nombre || e.nItems);

    if (!ErroreVariablesConfig) {
      this.variablesConfig = this.variablesConfigInput.map(v => ({
        nombre: v.nombre.trim(),
        nItems: v.nItems
      }));
    }

    const tieneErrores =
      this.erroresInputs.numVariablesInput ||
      this.erroresInputs.scaleInput ||
      this.erroresInputs.juecesInput ||
      this.erroresInputs.variablesConfigInput.some(e => e.nombre || e.nItems);

    if (tieneErrores || this.errorReturn === 1) return;

    // Limpieza total y regeneracion
    this.resultados = null; 
    this.puntajes = [];    

    this.variables = this.variablesConfig.map(v => v.nombre.trim() || `Var${Math.random().toString(36).substring(2, 5)}`);
    this.n_items = this.variablesConfig.map(v => v.nItems);

    this.puntajes = this.n_items.map(n =>
      Array.from({ length: n }, () => Array(this.jueces!).fill(null))
    );

    this.mostrarGenerarTablas = false;
    //this.mostrarBotonRestablecer = true;
  }

  // Detectar cambio en alguna tabla para ahi poder restablecer 
  onEditarCelda() {
    this.mostrarBotonRestablecer = true;
  }


  // Limpieza de valores de la tabla y resultados
  restablecerTabla() {
    if (!this.puntajes || this.puntajes.length === 0) return;

    
    this.puntajes = this.puntajes.map(variable =>
      variable.map(item => item.map(() => null))
    );

    this.resultados = null;
    this.mostrarBotonRestablecer = false;
  }

  // Volver a los valores iniciales registrados
  anterioresInputs() {
    this.numVariablesInput = this.numVariables;
    this.scaleInput = this.scale;
    this.juecesInput = this.jueces;
    this.variablesConfigInput = this.variablesConfig.map(v => ({ ...v }));

    this.errorMessage = '';
    this.erroresInputs = {
      numVariablesInput: '',
      scaleInput: '',
      juecesInput: '',
      variablesConfigInput: this.variablesConfigInput.map(() => ({ nombre: '', nItems: '' }))
    };
  }

  // Reiniciar valores iniciales
  restablecerInputs() {
    this.numVariablesInput = null;
    this.juecesInput = null;
    this.scaleInput = null;
    this.variablesConfigInput = [];
    this.erroresInputs = { numVariablesInput: '', juecesInput: '', scaleInput: '', variablesConfigInput: [] };
  }

  // Calcular índices y actualizar resultados
  calcular() {
    this.errorMessage = '';
    this.errorCalculoMessage = '';
    this.resultados = null; 

    // Validaciones
    if (this.numVariables! > 4) {
      this.errorCalculoMessage = 'No se permiten más de 4 variables.';
      return;
    }
    if (this.scale! > 20) {
      this.errorCalculoMessage = 'La escala no puede ser mayor a 20.';
      return;
    }
    if (this.jueces! > 15 || this.jueces! < 3) {
      this.errorCalculoMessage = 'El número de jueces debe estar entre 3 y 15.';
      return;
    }
    if (this.n_items.some(n => n > 200)) {
      this.errorCalculoMessage = 'Cada variable no puede tener más de 200 ítems (límite).';
      return;
    }

    const fueraDeRango = this.puntajes.some(v => 
      v.some(item => 
        item.some(p => p !== null && (p < 1 || p > (this.scale as number)))
      )
    );
    if (fueraDeRango) {
      this.errorCalculoMessage = `Los puntajes deben estar entre 1 y ${this.scale}.`;
      return;
    }

    try {
      const puntajesCopia = JSON.parse(JSON.stringify(this.puntajes));
      this.resultados = this.calculosService.calcularIndices(
        [...this.variables],
        [...this.n_items],
        this.scale as number, 
        this.jueces as number, 
        puntajesCopia
      );

      const yaRegistro = localStorage.getItem('cvci_impacto_registrado');
        
      if (!yaRegistro) {
          this.contadorService.registrarImpacto();
          localStorage.setItem('cvci_impacto_registrado', 'true');
      }

    } catch (err) {
      this.errorCalculoMessage = 'Ocurrió un error en el cálculo. Verifica tus datos.';
    }
  }

  // Color resultado/categoría segun valor e interpretación
  getColorClass(categoria: string): string {
    if (!categoria) return '';

    categoria = categoria.toLowerCase();

    if (categoria.includes('inaceptable')) return 'color-inaceptable';
    if (categoria.includes('deficiente')) return 'color-deficiente';
    if (categoria.includes('aceptable')) return 'color-aceptable';
    if (categoria.includes('buenas')) return 'color-buena';
    if (categoria.includes('excelentes')) return 'color-excelente';

    return '';
  }

  // Flechas para moverse por la tabla
  moveFocus(event: Event, vIndex: number, nIndex: number, jIndex: number) {
    if (this.jueces === null) return; 
    const keyboardEvent = event as KeyboardEvent;
    const key = keyboardEvent.key;

    let nextV = vIndex;
    let nextN = nIndex;
    let nextJ = jIndex;

    if (key === 'Enter' || key === 'ArrowRight') {
      nextJ++;
      if (nextJ >= (this.jueces as number)) {
        nextJ = 0;
        nextN++;
        if (nextN >= this.n_items[vIndex]) {
          nextN = 0;
          nextV++;
        }
      }
    } else if (key === 'ArrowLeft') {
      nextJ--;
      if (nextJ < 0) {
        nextJ = (this.jueces as number) - 1;
        nextN--;
        if (nextN < 0) {
          nextV--;
          if (nextV >= 0) {
            nextN = this.n_items[nextV] - 1;
          }
        }
      }
    } else if (key === 'ArrowDown') {
      nextN++;
      if (nextN >= this.n_items[vIndex]) {
        nextN = 0;
        nextV++;
      }
    } else if (key === 'ArrowUp') {
      nextN--;
      if (nextN < 0) {
        nextV--;
        if (nextV >= 0) {
          nextN = this.n_items[nextV] - 1;
        }
      }
    } else {
      return;
    }

    keyboardEvent.preventDefault();

    if (nextV < 0 || nextV >= this.variables.length) return;

    const selector = `input[data-v-index="${nextV}"][data-n-index="${nextN}"][data-j-index="${nextJ}"]`;
    const nextInput = document.querySelector<HTMLInputElement>(selector);
    if (nextInput) {
      nextInput.focus();
    }
  }


  trackByIndex(index: number, item: any): number {
    return index;
  }

  exportarExcel() {
    if (!this.resultados) return;

    const workbook = XLSX.utils.book_new();

    // Fórmula general y Pei
    const hojaResumen: any[][] = [
      ['COEFICIENTE DE VALIDEZ DE CONTENIDO (CVC) - HERNÁNDEZ-NIETO (2002)'],
      ['CVC-Calculator v1.1.0 — https://cvc-calculator.vercel.app/'],
      [],
      ['Fórmula general del CVCi:'],
      ['CVCi = (Σ Xi / (N × Vmax))'],
      [],
      ['Fórmula del Pei:'],
      ['Pei = (1 / J) ^ J, donde J = número de jueces'],
      ['Valor calculado del Pei:', this.calcularPei()],
      ['Número de jueces (J):', this.jueces ?? ''],
      [],
      []
    ];

    // Hoja con fórmulas
    const resumenSheet = XLSX.utils.aoa_to_sheet(hojaResumen);
    XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

    // Hoja por variable
    this.resultados.variables.forEach((variable: any, vIndex: number) => {
      const nombre = this.variables[vIndex] || `Variable ${vIndex + 1}`;
      const nJueces = this.jueces ?? 0;
      const nItems = this.n_items[vIndex] ?? 0;
      const escala = this.scale ?? 0;

      const data: any[][] = [];

      data.push([`Variable: ${nombre}`]);
      data.push([`Descripción: ${nJueces} jueces evaluaron ${nItems} ítems con una escala de ${escala} puntos.`]);
      data.push([]);

      const headers = ['Ítem'];
      for (let j = 1; j <= nJueces; j++) headers.push(`Juez ${j}`);
      headers.push('Suma', 'Promedio', 'CVCi', 'CVCi-Pei');
      data.push(headers);

      variable.items.forEach((item: any, nIndex: number) => {
        data.push([
          nIndex + 1,
          ...this.puntajes[vIndex][nIndex],
          item.suma,
          item.promedio?.toFixed(4) ?? '',
          item.CVCi?.toFixed(4) ?? '',
          item.CVCi_Pei?.toFixed(4) ?? ''
        ]);
      });

      data.push([]);
      data.push(['CVCt (Promedio Total):', variable.promedio_total?.toFixed(4) ?? '']);
      data.push(['Categoría:', variable.categoria ?? '']);
      if (variable.unanimidad_maxima) {
        data.push(['Nota:', 'Unanimidad máxima: todos los jueces asignaron el puntaje máximo a todos los ítems; CVCt = 1 − Pei según la fórmula.']);
      }
      data.push([]);

      data.push(['Interpretación según Hernández-Nieto (2011):']);
      data.push(['a)  Menor a 0,60 → Validez y concordancia inaceptables']);
      data.push(['b)  0,60 ≤ CVC ≤ 0,70 → Deficientes']);
      data.push(['c)  0,71 ≤ CVC ≤ 0,80 → Aceptables']);
      data.push(['d)  0,81 ≤ CVC ≤ 0,90 → Buenas']);
      data.push(['e)  Mayor de 0,90 → Excelentes']);
      data.push([]);
      data.push([`Categoría obtenida: ${variable.categoria ?? ''}`]);

      const sheet = XLSX.utils.aoa_to_sheet(data);

      const range = XLSX.utils.decode_range(sheet['!ref']!);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = sheet[cellRef];
          if (!cell) continue;

          cell.s = {
            border: {
              top: { style: 'thin', color: { rgb: '999999' } },
              bottom: { style: 'thin', color: { rgb: '999999' } },
              left: { style: 'thin', color: { rgb: '999999' } },
              right: { style: 'thin', color: { rgb: '999999' } }
            },
            font: {
              bold: R <= 3 || cell.v?.toString()?.includes('Categoría obtenida:')
            },
            alignment: { vertical: 'center', horizontal: 'left', wrapText: false }
          };
        }
      }

      const colWidths = headers.map(() => ({ wch: 15 }));
      sheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, sheet, `Variable ${nombre}`);
    });

    // Exportar archivo
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'CVC_Resultados_Detallados.xlsx');
  }

}