import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DasboardComponent } from './pages/dasboard/dasboard.component';
import { ListeEntreComponent } from './pages/liste-entre/liste-entre.component';
import { ListeSortieComponent } from './pages/liste-sortie/liste-sortie.component';
import { ListePartenaireComponent } from './pages/liste-partenaire/liste-partenaire.component';
import { ListeDeviseComponent } from './pages/liste-devise/liste-devise.component';
import { ListeRembourserComponent } from './pages/liste-rembourser/liste-rembourser.component';
import { PayementsComponent } from './pages/payements/payements.component';
import { ListeDepenseComponent } from './pages/depenses/liste-depense.component';
import { ListeCreditComponent } from './pages/credits/liste-credit.component';
import { AuthGuard } from './services/guard/guard-service.guard';
import { ListeUtilisateursComponent } from './pages/liste-utilisateurs/liste-utilisateurs.component';
import { PayementComponent } from './pages/payementCredit/payement.component';
import { PayementEchangeComponent } from './pages/payement-echange/payement-echange.component';
import { ListeEchangeComponent } from './pages/liste-echange/liste-echange.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'inscription',
    component: InscriptionComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DasboardComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'entre',
        component: ListeEntreComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'echange',
        component: ListeEchangeComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'payementEchange',
        component: PayementEchangeComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'payement',
        component: PayementsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'sortie',
        component: ListeSortieComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'partenaire',
        component: ListePartenaireComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'devise',
        component: ListeDeviseComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'rembourser',
        component: ListeRembourserComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'depense',
        component: ListeDepenseComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'credit',
        component: ListeCreditComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'payementCredit',
        component: PayementComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'utilisateur',
        component: ListeUtilisateursComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
