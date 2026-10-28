import { Routes } from '@angular/router';
import { CalcularComponent } from './feats/calcular/calcular.component';
import { AcercaDeComponent } from './feats/acerca-de/acerca-de.component';
import { HeaderComponent } from './feats/header/header.component';
import { FooterComponent } from './feats/footer/footer.component';


export const routes: Routes = [
    { path: '', redirectTo: '/calcular', pathMatch: 'full' },
    { path: 'calcular', component: CalcularComponent },
    { path: 'acerca-de', component: AcercaDeComponent },
    { path: 'header', component: HeaderComponent },
    { path: 'footer', component: FooterComponent }
];
