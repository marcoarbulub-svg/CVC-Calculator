# CVC-Calculator — CHANGELOG

## v1.1.0 (2026-10-27)
Cambios en el núcleo de cálculo y en la validación de entrada, derivados de la verificación
computacional realizada para el artículo (F1000Research, Software Tool Article).

### Corregido
- **Regla de unanimidad máxima.** En v1.0, cuando todos los jueces asignaban el puntaje máximo
  a todos los ítems de una variable, el servicio sustituía el CVCt por 1,0000. Ese valor no
  corresponde a la fórmula de Hernández-Nieto (2002), que produce CVCt = 1 − Pei; la diferencia
  es exactamente Pei (0,0370 con 3 jueces; 0,0039 con 4; 0,0003 con 5). En v1.1.0 se conserva el
  valor de la fórmula y se añade la bandera `unanimidad_maxima`, mostrada en pantalla y en el
  Excel exportado.
- **Mínimo de jueces.** v1.0 aceptaba 1 y 2 jueces, con los que Pei vale 1,00 y 0,25 y el CVC
  corregido resulta negativo o degenerado. v1.1.0 exige entre 3 y 15 jueces (Hernández-Nieto, 2002).
- **Visualización de Pei.** Con 8 o más jueces, Pei < 0,0001 se mostraba como 0,0000. Ahora se usa
  notación científica por debajo de ese umbral.

- **Categorización en la frontera de los umbrales.** En doble precisión, un CVCt cuyo valor exacto es
  0,70 puede almacenarse como 0,7000000000000002 y clasificarse como "aceptables" aunque la pantalla
  muestre 0,7000 (observado en 12 de 34 matrices de frontera del corpus de verificación). En v1.1.0 la
  categoría se asigna sobre el valor redondeado a 4 decimales, el mismo que se muestra y exporta.

### Añadido
- **Escala máxima ampliada de 7 a 20.** Permite introducir puntajes compuestos (p. ej., la suma de cuatro criterios
  valorados de 1 a 3, con máximo 12, como en Urra-Medina et al., 2024). El mínimo de la escala sigue siendo 3 y los
  puntajes admitidos van de 1 a Vmax.
- `CalculosService.VERSION` y campo `version` en el objeto de resultados.
- El Excel exportado declara la versión, el número de jueces (J) y la fórmula de Pei con J definido
  como número de jueces.

### Sin cambios
- Fórmulas CVCi = (ΣXi/J)/Vmax, Pei = (1/J)^J, CVCt = Σ(CVCi − Pei)/N y los umbrales de
  categorización (< 0,60; ≤ 0,70; ≤ 0,80; ≤ 0,90; > 0,90). Rangos de variables (1–4) e ítems (2–200).

## v1.0 (2025-11-14)
Versión registrada (solicitud de registro de software, UCV).
