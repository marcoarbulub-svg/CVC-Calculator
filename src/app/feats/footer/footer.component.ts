import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContadorService } from '../../core/services/contador.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  private contadorService = inject(ContadorService);
  usos$: Observable<number> = this.contadorService.obtenerContador();

}
