import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TareasPPageRoutingModule } from './tareas-p-routing.module';

import { TareasPPage } from './tareas-p.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TareasPPageRoutingModule
  ],
  declarations: [TareasPPage]
})
export class TareasPPageModule {}
