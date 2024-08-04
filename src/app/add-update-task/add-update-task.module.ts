import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddUpdateTaskPageRoutingModule } from './add-update-task-routing.module';

import { AddUpdateTaskPage } from './add-update-task.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddUpdateTaskPageRoutingModule,
    ReactiveFormsModule // Add ReactiveFormsModule here

  ],
  declarations: [AddUpdateTaskPage]
})
export class AddUpdateTaskPageModule {}
