import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductividadPage } from './productividad.page';

const routes: Routes = [
  {
    path: '',
    component: ProductividadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductividadPageRoutingModule {}
