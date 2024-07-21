import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeGuard } from './guards/no-auth.guard';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'bienvenida',
    pathMatch: 'full'
  },
 
  {
    path: 'bienvenida',
    loadChildren: () => import('./paginas/login/bienvenida/bienvenida.module').then( m => m.BienvenidaPageModule),canActivate:[AuthGuard]
  },
  {
    path: 'iniciar-sesion',
    loadChildren: () => import('./paginas/login/iniciar-sesion/iniciar-sesion.module').then( m => m.IniciarSesionPageModule),canActivate:[AuthGuard]
  },
  {
    path: 'registro',
    loadChildren: () => import('./paginas/login/registro/registro.module').then( m => m.RegistroPageModule),canActivate:[AuthGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),canActivate:[HomeGuard]
  },






];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
