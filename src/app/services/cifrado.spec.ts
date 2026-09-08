import { TestBed } from '@angular/core/testing';

import { Cifrado } from './cifrado';

describe('Cifrado', () => {
  let service: Cifrado;

  // Conjunto con símbolos, del estilo de los que puede pedir el profesor.
  const CONJUNTO_SIMBOLOS = Array.from('a|b#cd%e/f');
  // Conjunto con emojis: cada emoji ocupa dos unidades UTF-16.
  const CONJUNTO_EMOJIS = Array.from('ab😀cd🔥ef');

  const TEXTO_LARGO =
    'la seguridad en sistemas de computo estudia como proteger la informacion ' +
    'frente a accesos no autorizados por personas ajenas al sistema';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cifrado);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('conjuntos con emojis', () => {
    it('trata cada emoji como un solo símbolo del conjunto', () => {
      expect(CONJUNTO_EMOJIS.length).toBe(8);
      expect(CONJUNTO_EMOJIS).toEqual(['a', 'b', '😀', 'c', 'd', '🔥', 'e', 'f']);
    });

    it('cifra y descifra sin romper los emojis', () => {
      const cifrado = service.cifradoCesar('abcdef', 2, CONJUNTO_EMOJIS);

      expect(cifrado).toBe('😀c🔥eab');
      expect(service.descifradoCesar(cifrado, 2, CONJUNTO_EMOJIS)).toBe('abcdef');
    });

    it('usa los emojis al cifrar, no los deja intactos', () => {
      expect(service.cifradoCesar('ab', 2, CONJUNTO_EMOJIS)).toBe('😀c');
    });
  });

  describe('conjuntos con símbolos', () => {
    it('usa los símbolos al cifrar con César', () => {
      expect(service.cifradoCesar('cada dedo', 3, CONJUNTO_SIMBOLOS)).toBe('e#/# /a/o');
    });

    it('recupera el texto original al descifrar con César', () => {
      const cifrado = service.cifradoCesar('cada dedo', 3, CONJUNTO_SIMBOLOS);

      expect(service.descifradoCesar(cifrado, 3, CONJUNTO_SIMBOLOS)).toBe('cada dedo');
    });

    it('Atbash es reversible aplicándolo dos veces', () => {
      const cifrado = service.cifrarAtbash('cada dedo', CONJUNTO_SIMBOLOS);

      expect(cifrado).not.toBe('cada dedo');
      expect(service.cifrarAtbash(cifrado, CONJUNTO_SIMBOLOS)).toBe('cada dedo');
    });

    it('ignora los símbolos en el análisis de frecuencias', () => {
      const frecuencias = service.obtenerFrecuenciasEsperadas();
      const { observadas } = service.calcularFrecuenciasParaChi(
        'abcdef|#%/',
        CONJUNTO_SIMBOLOS,
        frecuencias,
      );

      // Solo hay 6 categorías (a-f); los símbolos | # % / no cuentan.
      expect(observadas.length).toBe(6);
      expect(observadas.reduce((suma, n) => suma + n, 0)).toBe(6);
    });
  });

  describe('detectarYDescifrar', () => {
    it('detecta el desplazamiento correcto con un conjunto que mezcla letras y símbolos', () => {
      const frecuencias = service.obtenerFrecuenciasEsperadas();
      const cifrado = service.cifradoCesar(TEXTO_LARGO, 4, CONJUNTO_SIMBOLOS);

      const resultado = service.detectarYDescifrar(cifrado, CONJUNTO_SIMBOLOS, frecuencias);

      expect(resultado.metodo).toBe('cesar');
      expect(resultado.desplazamiento).toBe(4);
      expect(resultado.textoDescifrado).toBe(TEXTO_LARGO);
      expect(resultado.letrasAnalizadas).toBeGreaterThanOrEqual(
        service.LETRAS_MINIMAS_CONFIABLES,
      );
    });

    it('detecta Atbash con un conjunto que mezcla letras y símbolos', () => {
      const frecuencias = service.obtenerFrecuenciasEsperadas();
      const cifrado = service.cifrarAtbash(TEXTO_LARGO, CONJUNTO_SIMBOLOS);

      const resultado = service.detectarYDescifrar(cifrado, CONJUNTO_SIMBOLOS, frecuencias);

      expect(resultado.textoDescifrado).toBe(TEXTO_LARGO);
    });

    it('reporta pocas letras analizadas cuando el mensaje es muy corto', () => {
      const frecuencias = service.obtenerFrecuenciasEsperadas();
      const conjunto = Array.from('abcdefghijklmnñopqrstuvwxyz');
      const cifrado = service.cifradoCesar('hola', 3, conjunto);

      const resultado = service.detectarYDescifrar(cifrado, conjunto, frecuencias);

      expect(resultado.letrasAnalizadas).toBe(4);
      expect(resultado.letrasAnalizadas).toBeLessThan(service.LETRAS_MINIMAS_CONFIABLES);
    });

    it('no truena si el conjunto no tiene ninguna letra del abecedario', () => {
      const frecuencias = service.obtenerFrecuenciasEsperadas();
      const conjunto = Array.from('|#%/');

      const resultado = service.detectarYDescifrar('###|||', conjunto, frecuencias);

      expect(resultado.letrasAnalizadas).toBe(0);
    });
  });
});
