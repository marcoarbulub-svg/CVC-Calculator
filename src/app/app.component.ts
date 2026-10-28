import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CalcularComponent } from './feats/calcular/calcular.component';
import { HeaderComponent } from "./feats/header/header.component";
import { AcercaDeComponent } from "./feats/acerca-de/acerca-de.component";
import { FooterComponent } from "./feats/footer/footer.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'calculadora-cvci';
}
