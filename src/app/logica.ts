// Tabla de frecuencias esperadas del español, fuente: DEM - Colegio de México
// https://dem.colmex.mx/Frecuencia/Letras (García Camarero / DEM, uso académico con cita)
const frecuenciasEsperadasES: Record<string, number> = {
  'a': 12.4286,   'b': 1.339374,  'c': 6.086271,  'd': 3.762064,
  'e': 11.502856, 'f': 0.906047,  'g': 1.53634,   'h': 0.610597,
  'i': 7.465038,  'j': 0.53181,   'k': 0,         'l': 3.801458,
  'm': 3.427221,  'n': 6.381721,  'ñ': 0.216663,  'o': 8.371085,
  'p': 3.407524,  'q': 0.35454,   'r': 12.034666, 's': 4.707504,
  't': 5.554461,  'u': 3.545401,  'v': 1.024227,  'w': 0,
  'x': 0.216663,  'y': 0.29545,   'z': 0.492417
};

function cifradoCesar(texto: string, desplazamiento: number, conjunto: string[]): string {
  return texto.split('').map(caracter => {
    const indice = conjunto.indexOf(caracter);
    if (indice != -1){
      return conjunto[((indice + desplazamiento) % conjunto.length + conjunto.length) % conjunto.length];
    }else{
      return caracter
    }
    
  }).join('');
}

function cifrarAtbash(texto: string, conjunto: string[]): string {
  return texto.split('').map(caracter => {
    const indice = conjunto.indexOf(caracter);

    if (indice != -1){
      return conjunto[(conjunto.length - 1) - indice];
    }else{
      return caracter
    }
    
  }).join('');
}

function descifradoCesar(texto: string, desplazamiento: number, conjunto: string[]): string {
  return texto.split('').map(caracter => {
    const indice = conjunto.indexOf(caracter);
    if (indice != -1){
      return conjunto[((indice - desplazamiento) % conjunto.length + conjunto.length) % conjunto.length];
    }else{
      return caracter
    }
    
  }).join('');
}

function contarFrecuencias(texto: string) : Record<string, number>{
  const textoNormalizado = texto.toLowerCase();
  const frecuencias: Record<string, number> = {};

  for(const caracter of textoNormalizado){
    frecuencias[caracter] = (frecuencias[caracter] || 0) + 1;
  }
  return frecuencias;
}

function calcularChi(observadas: number[], esperadas: number[]): number {
  

  
  for (let i = 0; i < esperadas.length; i++) {
    if (esperadas[i] === 0) {
      throw new Error("La frecuencia esperada en la posición " + i + " no puede ser cero.");
    }
  }

  return observadas.reduce((accumulator, obsValue, index) => {
    const expValue = esperadas[index];
    const difference = obsValue - expValue;
    const squaredDiff = Math.pow(difference, 2);
    
    return accumulator + (squaredDiff / expValue);
  }, 0);
}

const FRECUENCIA_MINIMA = 0.01; // valor simbólico para evitar división entre cero en chi-cuadrada

function calcularFrecuenciasParaChi(
  texto: string,
  frecuenciasEsperadas: Record<string, number>
): { observadas: number[]; esperadas: number[] } {

  const letras = Object.keys(frecuenciasEsperadas);
  const conteoObservado = contarFrecuencias(texto);

  const totalLetras = letras.reduce(
    (suma, letra) => suma + (conteoObservado[letra] || 0),
    0
  );

  if (totalLetras === 0) {
    return {
      observadas: letras.map(() => 0),
      esperadas: letras.map(() => FRECUENCIA_MINIMA),
    };
  }

  const observadas = letras.map((letra) => conteoObservado[letra] || 0);
  const esperadas = letras.map((letra) => {
    const porcentaje = frecuenciasEsperadas[letra] || FRECUENCIA_MINIMA; // <- aquí el cambio clave
    return (porcentaje / 100) * totalLetras;
  });

  return { observadas, esperadas };
}

interface ResultadoDeteccion {
  metodo: 'cesar' | 'atbash';
  desplazamiento: number | null; // null si es Atbash
  textoDescifrado: string;
  score: number; // opcional guardarlo, útil para pruebas/debug
}

function detectarYDescifrar(
  textoCifrado: string,
  conjunto: string[],
  frecuenciasEsperadas: Record<string, number>
): ResultadoDeteccion {

  const candidatos: ResultadoDeteccion[] = [];

  // 1. Candidato de Atbash
  const textoDescifradoAtbash = cifrarAtbash(textoCifrado, conjunto);
  const frecuenciasAtbash = calcularFrecuenciasParaChi(textoDescifradoAtbash, frecuenciasEsperadasES);
  const candidatoAtbash : ResultadoDeteccion = {
    metodo: 'atbash',
    desplazamiento: null,
    textoDescifrado: textoDescifradoAtbash,
    score: calcularChi(frecuenciasAtbash.observadas, frecuenciasAtbash.esperadas),
  };
  candidatos.push(candidatoAtbash);

  
  // 2. Candidatos de César, uno por cada desplazamiento posible
  for(let k=1; k<conjunto.length; k++){
    const textoDescifradoCesar = descifradoCesar(textoCifrado, k, conjunto);
    const frecuenciasCesar = calcularFrecuenciasParaChi(textoDescifradoCesar, frecuenciasEsperadasES);
    const candidato : ResultadoDeteccion = {
    metodo: 'cesar',
    desplazamiento: k,
    textoDescifrado: textoDescifradoCesar,
    score: calcularChi(frecuenciasCesar.observadas, frecuenciasCesar.esperadas),
  };
  candidatos.push(candidato);
  }
 

  // 3. De todos los candidatos, quedarte con el de menor score (chi-cuadrada más bajo)
  const mejorCandidato = candidatos.reduce((mejor, actual) => {
    return (actual.score < mejor.score) ? actual : mejor;
  }, candidatos[0]);
  

  // 4. Devolver únicamente ese mejor candidato (la rúbrica pide que NO se muestren
  //    las demás opciones al usuario — aquí es donde se cumple ese requisito)
  return mejorCandidato;
}

const conjuntoPrueba = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n', 'ñ','o','p','q','r','s','t','u','v','w','x','y','z']; // el que estés usando
const textoOriginal = "Pero lo tengo que leer especificamente asi de frente ese seria el unico detalle";
const textoCifrado = "oeailna ienw dwyew wzahawjpa";
// (o usa cifradoCesar con desplazamiento 5, es lo mismo)
console.log(textoCifrado); // para ver qué texto cifrado se generó

const resultado = detectarYDescifrar(textoCifrado, conjuntoPrueba, frecuenciasEsperadasES);
console.log(resultado);
// esperas: metodo: 'cesar', desplazamiento: 5, textoDescifrado === textoOriginal

