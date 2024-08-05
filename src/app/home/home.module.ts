import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { NgCalendarModule  } from 'ionic2-calendar';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HomePageRoutingModule,
    NgCircleProgressModule,
    NgCalendarModule,
  ],
 
  declarations: [HomePage]
})
export class HomePageModule {}
