import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CalcularComponent } from './calcular.component';
import { ContadorService } from '../../core/services/contador.service';

// v1.1.0: el contador de uso (Firebase) se sustituye por un doble de prueba; los tests no tocan la red.
const contadorMock = { obtenerContador: () => of(0), registrarImpacto: () => {} };

describe('CalcularComponent (v1.1.0)', () => {
  let component: CalcularComponent;
  let fixture: ComponentFixture<CalcularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalcularComponent],
      providers: [{ provide: ContadorService, useValue: contadorMock }]
    }).compileComponents();
    fixture = TestBed.createComponent(CalcularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea', () => { expect(component).toBeTruthy(); });

  it('rechaza menos de 3 jueces en la validación del formulario', () => {
    component.juecesInput = 2; component.validarCampo('juecesInput');
    expect(component.erroresInputs.juecesInput).toContain('3 y 15');
    component.juecesInput = 3; component.validarCampo('juecesInput');
    expect(component.erroresInputs.juecesInput).toBe('');
  });

  it('genera una matriz por variable con las dimensiones declaradas', () => {
    component.numVariablesInput = 2; component.scaleInput = 4; component.juecesInput = 5;
    component.generarVariables();
    component.variablesConfigInput = [{ nombre: 'claridad', nItems: 3 }, { nombre: 'relevancia', nItems: 2 }];
    component.erroresInputs.variablesConfigInput = component.variablesConfigInput.map(() => ({ nombre: '', nItems: '' }));
    component.generarTabla();
    expect(component.puntajes.length).toBe(2);
    expect(component.puntajes[0].length).toBe(3);
    expect(component.puntajes[0][0].length).toBe(5);
  });

  it('bloquea el cálculo con puntajes fuera de rango y calcula con datos válidos', () => {
    component.numVariablesInput = 1; component.scaleInput = 3; component.juecesInput = 5;
    component.generarVariables();
    component.variablesConfigInput = [{ nombre: 'lealtad', nItems: 2 }];
    component.erroresInputs.variablesConfigInput = [{ nombre: '', nItems: '' }];
    component.generarTabla();
    component.puntajes = [[[3, 3, 3, 3, 3], [3, 3, 2, 3, 4]]];
    component.calcular();
    expect(component.resultados).toBeNull();
    expect(component.errorCalculoMessage).toContain('entre 1 y 3');
    component.puntajes = [[[3, 3, 3, 3, 3], [3, 3, 2, 3, 2]]];
    component.calcular();
    expect(component.resultados.variables[0].promedio_total).toBeCloseTo(0.933, 3);
    expect(component.resultados.version).toBe('1.1.0');
  });

  it('muestra Pei en notación científica cuando es menor que 0,0001', () => {
    component.jueces = 10;
    expect(component.calcularPei()).toBe('1.00e-10');
    component.jueces = 5;
    expect(component.calcularPei()).toBe('0.0003');
  });
});
