import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProductividadPageRoutingModule } from './productividad-routing.module';
import { ProductividadPage } from './productividad.page';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductividadPageRoutingModule,
    NgxChartsModule
  ],
  declarations: [ProductividadPage]
})
export class ProductividadPageModule {}
