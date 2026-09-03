import { Component, signal } from '@angular/core';
import { CifradoComponent } from './components/cifrado/cifrado';

@Component({
  selector: 'app-root',
  imports: [CifradoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Cifrados');
}
