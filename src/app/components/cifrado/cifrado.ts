import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cifrado, ResultadoDeteccion } from '../../services/cifrado';

// Se usa Array.from y no split('') porque split('') separa por unidades UTF-16 y
// parte a la mitad los caracteres que ocupan dos, como los emojis. Array.from
// separa por caracteres reales, igual que el Array.from(texto) del servicio.
const CONJUNTOS_PREDEFINIDOS: Record<string, string[]> = {
  minusculas: Array.from('abcdefghijklmnñopqrstuvwxyz'),
  minusculasMayusculas: Array.from('abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ'),
  minusculasConAcentos: Array.from('abcdefghijklmnñopqrstuvwxyzáéíóúü'),
  completo: Array.from('abcdefghijklmnñopqrstuvwxyzáéíóúüABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ'),
};

@Component({
  selector: 'app-cifrado',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cifrado.html',
  styleUrl: './cifrado.css',
})
export class CifradoComponent {
  miFormulario: FormGroup;
  resultado: string = '';
  deteccion: ResultadoDeteccion | null = null;

  // Debajo de esta cantidad de letras el análisis de frecuencias no es confiable.
  letrasMinimas: number;

  constructor(private cifradoService: Cifrado) {
    this.letrasMinimas = cifradoService.LETRAS_MINIMAS_CONFIABLES;
    this.miFormulario = new FormGroup({
      mensaje: new FormControl(''),
      modo: new FormControl('cifrar'),
      tipoConjunto: new FormControl('predefinido'),
      conjuntoPredefinido: new FormControl('minusculas'),
      conjuntoPersonalizado: new FormControl(''),
      metodo: new FormControl('cesar'),
      desplazamiento: new FormControl(0),
    });
  }

  // CLAVE-11
  private obtenerConjuntoActivo(): string[] {
    const tipoConjunto = this.miFormulario.get('tipoConjunto')?.value;

    if (tipoConjunto === 'predefinido') {
      const clave = this.miFormulario.get('conjuntoPredefinido')?.value;
      return CONJUNTOS_PREDEFINIDOS[clave];
    } else {
      const textoPersonalizado = this.miFormulario.get('conjuntoPersonalizado')?.value as string;
      const sinDuplicados = [...new Set(Array.from(textoPersonalizado))];
      return sinDuplicados;
    }
  }

  // CLAVE-12
  onSubmit(): void {
    const conjunto = this.obtenerConjuntoActivo();
    const mensaje = this.miFormulario.get('mensaje')?.value;
    const modo = this.miFormulario.get('modo')?.value;

    if (modo === 'cifrar') {
      this.deteccion = null;
      const metodo = this.miFormulario.get('metodo')?.value;

      if (metodo === 'cesar') {
        const desplazamiento = this.miFormulario.get('desplazamiento')?.value;
        this.resultado = this.cifradoService.cifradoCesar(mensaje, desplazamiento, conjunto);
      } else {
        this.resultado = this.cifradoService.cifrarAtbash(mensaje, conjunto);
      }
    } else {
      const frecuenciasEsperadas = this.cifradoService.obtenerFrecuenciasEsperadas();
      const deteccion: ResultadoDeteccion = this.cifradoService.detectarYDescifrar(
        mensaje,
        conjunto,
        frecuenciasEsperadas,
      );
      this.resultado = deteccion.textoDescifrado;
      this.deteccion = deteccion;
    }
  }
}
