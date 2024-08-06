import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TareasPPage } from './tareas-p.page';

const routes: Routes = [
  {
    path: '',
    component: TareasPPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TareasPPageRoutingModule {}
