import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddUpdateTaskPage } from './add-update-task.page';

const routes: Routes = [
  {
    path: '',
    component: AddUpdateTaskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddUpdateTaskPageRoutingModule {}
