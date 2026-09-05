import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Cifrado {
  constructor() {}

  private frecuenciasMinYMay: Record<string, number> = {
    a: 12.4286,
    b: 1.339374,
    c: 6.086271,
    d: 3.762064,
    e: 11.502856,
    f: 0.906047,
    g: 1.53634,
    h: 0.610597,
    i: 7.465038,
    j: 0.53181,
    k: 0,
    l: 3.801458,
    m: 3.427221,
    n: 6.381721,
    ñ: 0.216663,
    o: 8.371085,
    p: 3.407524,
    q: 0.35454,
    r: 12.034666,
    s: 4.707504,
    t: 5.554461,
    u: 3.545401,
    v: 1.024227,
    w: 0,
    x: 0.216663,
    y: 0.29545,
    z: 0.492417,
    A: 12.4286,
    B: 1.339374,
    C: 6.086271,
    D: 3.762064,
    E: 11.502856,
    F: 0.906047,
    G: 1.53634,
    H: 0.610597,
    I: 7.465038,
    J: 0.53181,
    K: 0,
    L: 3.801458,
    M: 3.427221,
    N: 6.381721,
    Ñ: 0.216663,
    O: 8.371085,
    P: 3.407524,
    Q: 0.35454,
    R: 12.034666,
    S: 4.707504,
    T: 5.554461,
    U: 3.545401,
    V: 1.024227,
    W: 0,
    X: 0.216663,
    Y: 0.29545,
    Z: 0.492417,
  };

  private FRECUENCIA_MINIMA = 0.01;

  // CLAVE-10
  obtenerFrecuenciasEsperadas(): Record<string, number> {
    return { ...this.frecuenciasMinYMay };
  }

  // CLAVE-01
  private validarConjunto(conjunto: string[]): void {
    if (conjunto.length === 0) {
      throw new Error('El conjunto no puede estar vacío.');
    }

    if (conjunto.some((simbolo) => simbolo.length === 0)) {
      throw new Error('El conjunto no puede contener elementos vacíos.');
    }

    if (new Set(conjunto).size !== conjunto.length) {
      throw new Error('El conjunto no puede contener elementos duplicados.');
    }
  }

  // CLAVE-02
  private normalizarParaAnalisis(simbolo: string): string {
    const simboloMinuscula = simbolo.toLocaleLowerCase('es');
    const equivalencias: Record<string, string> = {
      á: 'a',
      é: 'e',
      í: 'i',
      ó: 'o',
      ú: 'u',
      ü: 'u',
    };

    return equivalencias[simboloMinuscula] ?? simboloMinuscula;
  }

  // CLAVE-03
  cifradoCesar(texto: string, desplazamiento: number, conjunto: string[]): string {
    this.validarConjunto(conjunto);
    if (!Number.isFinite(desplazamiento)) {
      throw new Error('El desplazamiento debe ser un número finito.');
    }

    return Array.from(texto)
      .map((caracter) => {
        const indice = conjunto.indexOf(caracter);
        if (indice != -1) {
          return conjunto[
            (((indice + desplazamiento) % conjunto.length) + conjunto.length) % conjunto.length
          ];
        } else {
          return caracter;
        }
      })
      .join('');
  }

  // CLAVE-04
  cifrarAtbash(texto: string, conjunto: string[]): string {
    this.validarConjunto(conjunto);

    return Array.from(texto)
      .map((caracter) => {
        const indice = conjunto.indexOf(caracter);

        if (indice != -1) {
          return conjunto[conjunto.length - 1 - indice];
        } else {
          return caracter;
        }
      })
      .join('');
  }

  // CLAVE-05
  descifradoCesar(texto: string, desplazamiento: number, conjunto: string[]): string {
    this.validarConjunto(conjunto);
    if (!Number.isFinite(desplazamiento)) {
      throw new Error('El desplazamiento debe ser un número finito.');
    }

    return Array.from(texto)
      .map((caracter) => {
        const indice = conjunto.indexOf(caracter);
        if (indice != -1) {
          return conjunto[
            (((indice - desplazamiento) % conjunto.length) + conjunto.length) % conjunto.length
          ];
        } else {
          return caracter;
        }
      })
      .join('');
  }

  // CLAVE-06
  contarFrecuencias(texto: string): Record<string, number> {
    const frecuencias: Record<string, number> = {};

    for (const caracter of texto) {
      frecuencias[caracter] = (frecuencias[caracter] || 0) + 1;
    }
    return frecuencias;
  }

  // CLAVE-07
  calcularChi(observadas: number[], esperadas: number[]): number {
    if (observadas.length !== esperadas.length) {
      throw new Error('Los arreglos de observadas y esperadas deben tener la misma longitud.');
    }

    if (observadas.length === 0) {
      throw new Error('Los arreglos de observadas y esperadas no pueden estar vacíos.');
    }

    if (
      observadas.some((value) => value < 0 || !Number.isFinite(value)) ||
      esperadas.some((value) => value < 0 || !Number.isFinite(value))
    ) {
      throw new Error('Los valores de observadas y esperadas no pueden ser negativos.');
    }

    if (observadas.every((value) => value === 0) && esperadas.every((value) => value === 0)) {
      throw new Error('Los arreglos de observadas y esperadas no pueden ser todos ceros.');
    }

    for (let i = 0; i < esperadas.length; i++) {
      if (esperadas[i] === 0) {
        throw new Error('La frecuencia esperada en la posición ' + i + ' no puede ser cero.');
      }
    }

    return observadas.reduce((accumulator, obsValue, index) => {
      const expValue = esperadas[index];
      const difference = obsValue - expValue;
      const squaredDiff = Math.pow(difference, 2);

      return accumulator + squaredDiff / expValue;
    }, 0);
  }

  // CLAVE-08
  calcularFrecuenciasParaChi(
  texto: string,
  conjunto: string[],
  frecuenciasEsperadas: Record<string, number>,
): { observadas: number[]; esperadas: number[] } {
  this.validarConjunto(conjunto);

  const conteoObservado = this.contarFrecuencias(texto);

  const categorias = [
    ...new Set(
      conjunto
        .map((simbolo) => this.normalizarParaAnalisis(simbolo))
        .filter((categoria) => frecuenciasEsperadas[categoria] !== undefined)
    ),
  ];

  const conteoNormalizado: Record<string, number> = {};

  for (const [simbolo, cantidad] of Object.entries(conteoObservado)) {
    const categoria = this.normalizarParaAnalisis(simbolo);
    conteoNormalizado[categoria] = (conteoNormalizado[categoria] || 0) + cantidad;
  }

  const totalLetras = categorias.reduce(
    (suma, categoria) => suma + (conteoNormalizado[categoria] || 0),
    0,
  );

  if (totalLetras === 0) {
    return {
      observadas: categorias.map(() => 0),
      esperadas: categorias.map(() => this.FRECUENCIA_MINIMA),
    };
  }

  const observadas = categorias.map((categoria) => conteoNormalizado[categoria] || 0);
  const pesos = categorias.map((categoria) =>
    Math.max(frecuenciasEsperadas[categoria], this.FRECUENCIA_MINIMA)
  );
  const sumaPesos = pesos.reduce((suma, peso) => suma + peso, 0);
  const esperadas = pesos.map((peso) => (peso / sumaPesos) * totalLetras);

  return { observadas, esperadas };
}

  // CLAVE-09
  detectarYDescifrar(
    textoCifrado: string,
    conjunto: string[],
    frecuenciasEsperadas: Record<string, number>,
  ): ResultadoDeteccion {
    this.validarConjunto(conjunto);

    const candidatos: ResultadoDeteccion[] = [];

    const textoDescifradoAtbash = this.cifrarAtbash(textoCifrado, conjunto);
    const frecuenciasAtbash = this.calcularFrecuenciasParaChi(
      textoDescifradoAtbash,
      conjunto,
      frecuenciasEsperadas,
    );
    const candidatoAtbash: ResultadoDeteccion = {
      metodo: 'atbash',
      desplazamiento: null,
      textoDescifrado: textoDescifradoAtbash,
      score: this.calcularChi(frecuenciasAtbash.observadas, frecuenciasAtbash.esperadas),
    };
    candidatos.push(candidatoAtbash);

    for (let k = 1; k < conjunto.length; k++) {
      const textoDescifradoCesar = this.descifradoCesar(textoCifrado, k, conjunto);
      const frecuenciasCesar = this.calcularFrecuenciasParaChi(
        textoDescifradoCesar,
        conjunto,
        frecuenciasEsperadas,
      );
      const candidato: ResultadoDeteccion = {
        metodo: 'cesar',
        desplazamiento: k,
        textoDescifrado: textoDescifradoCesar,
        score: this.calcularChi(frecuenciasCesar.observadas, frecuenciasCesar.esperadas),
      };
      candidatos.push(candidato);
    }

    const mejorCandidato = candidatos.reduce((mejor, actual) => {
      return actual.score < mejor.score ? actual : mejor;
    }, candidatos[0]);

    return mejorCandidato;
  }
}

export interface ResultadoDeteccion {
  metodo: 'cesar' | 'atbash';
  desplazamiento: number | null;
  textoDescifrado: string;
  score: number;
}
