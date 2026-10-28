import { CalculosService } from './calculos.service';

describe('CalculosService v1.1.0', () => {
  const s = new CalculosService();

  it('reproduce el ejemplo "lealtad" (Vmax = 3, J = 5, 4 ítems): CVCt = 0.9163', () => {
    const r = s.calcularIndices(['lealtad'], [4], 3, 5,
      [[[3,3,2,3,3],[3,3,3,3,3],[2,3,3,2,3],[3,2,3,3,2]]]);
    expect(r.version).toBe('1.1.0');
    expect(r.Pei).toBeCloseTo(0.00032, 8);
    expect(r.variables[0].items[0].suma).toBe(14);
    expect(r.variables[0].items[0].CVCi).toBeCloseTo(0.93333, 5);
    expect(r.variables[0].promedio_total).toBeCloseTo(0.916347, 5);
    expect(r.variables[0].categoria).toBe('Validez y concordancia excelentes');
    expect(r.variables[0].unanimidad_maxima).toBeFalse();
  });

  it('en unanimidad máxima devuelve 1 - Pei y activa la bandera', () => {
    const r = s.calcularIndices(['V'], [3], 5, 3, [[[5,5,5],[5,5,5],[5,5,5]]]);
    expect(r.variables[0].promedio_total).toBeCloseTo(1 - Math.pow(1/3, 3), 12);
    expect(r.variables[0].unanimidad_maxima).toBeTrue();
  });

  it('clasifica sobre el valor redondeado a 4 decimales (frontera 0,70 con J = 3, Vmax = 5, 18 ítems)', () => {
    const m: number[][] = []; let rem = 199 - 54;
    for (let i = 0; i < 18; i++) { const row = [1,1,1]; for (let j = 0; j < 3 && rem > 0; j++) { const inc = Math.min(4, rem); row[j] += inc; rem -= inc; } m.push(row); }
    const r = s.calcularIndices(['V'], [18], 5, 3, [m]);
    expect(Math.round(r.variables[0].promedio_total * 1e4) / 1e4).toBe(0.7);
    expect(r.variables[0].categoria).toBe('Validez y concordancia deficientes');
  });

  it('asigna las cinco categorías de Hernández-Nieto (2011) en sus intervalos', () => {
    // J = 3, Vmax = 5, 1 ítem; Pei = 1/27 = 0.037037
    const cat = (sum: number) => s.calcularIndices(['V'], [2], 5, 3, [[[sum - 10, 5, 5], [sum - 10, 5, 5]]]).variables[0].categoria;
    // sumas 15,14,13,12,11 -> medias 5,4.667,4.333,4,3.667 -> CVCi-Pei = 0.963, 0.896, 0.830, 0.763, 0.696
    expect(cat(15)).toContain('excelentes');
    expect(cat(14)).toContain('buenas');
    expect(cat(13)).toContain('buenas');
    expect(cat(12)).toContain('aceptables');
    expect(cat(11)).toContain('deficientes');
    const low = s.calcularIndices(['V'], [1], 5, 3, [[[1, 1, 1]]]).variables[0].categoria;
    expect(low).toContain('inaceptables');
  });

  it('calcula varias variables en una sola llamada', () => {
    const r = s.calcularIndices(['a', 'b'], [1, 2], 4, 4, [[[4,4,4,4]], [[3,3,3,3],[2,2,2,2]]]);
    expect(r.variables.length).toBe(2);
    expect(r.variables[0].unanimidad_maxima).toBeTrue();
    expect(r.variables[1].promedio_total).toBeCloseTo((0.75 + 0.5) / 2 - Math.pow(0.25, 4), 12);
  });

  it('rechaza menos de 3 jueces', () => {
    expect(() => s.calcularIndices(['V'], [2], 5, 2, [[[5,5],[5,5]]])).toThrow();
    expect(() => s.calcularIndices(['V'], [2], 5, 1, [[[5],[5]]])).toThrow();
  });

  it('rechaza puntajes fuera de la escala y no numéricos', () => {
    expect(() => s.calcularIndices(['V'], [2], 5, 3, [[[5,6,5],[5,5,5]]])).toThrow();
    expect(() => s.calcularIndices(['V'], [2], 5, 3, [[[5,0,5],[5,5,5]]])).toThrow();
    expect(() => s.calcularIndices(['V'], [1], 5, 3, [[[5, 'x' as any, 5]]])).toThrow();
  });

  it('rechaza parámetros no enteros y longitudes inconsistentes', () => {
    expect(() => s.calcularIndices(['V'], [1], 4.5, 3, [[[4,4,4]]])).toThrow();
    expect(() => s.calcularIndices(['V', 'W'], [1], 4, 3, [[[4,4,4]]])).toThrow();
  });
});
