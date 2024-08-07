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
  {
    path: 'add-update-task',
    loadChildren: () => import('./add-update-task/add-update-task.module').then( m => m.AddUpdateTaskPageModule)
  },
  {
    path: 'tareas-p',
    loadChildren: () => import('./paginas/tareas-p/tareas-p.module').then( m => m.TareasPPageModule)
  },  {
    path: 'explorar',
    loadChildren: () => import('./paginas/explorar/explorar.module').then( m => m.ExplorarPageModule)
  },








];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
