import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

//======firebase======

import { AngularFireModule } from '@angular/fire/compat'
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgCalendarModule } from 'ionic2-calendar';
import { SETTINGS } from '@angular/fire/compat/auth';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs, 'es');
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,BrowserAnimationsModule,CommonModule, IonicModule.forRoot({ mode: 'md' }), AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), 
    ReactiveFormsModule, 
    NgCalendarModule, 
    FormsModule,
    HttpClientModule,
    AngularFireMessagingModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
    })
  ], exports: [
    NgCalendarModule,
    NgCircleProgressModule
  ],
  providers: [{ provide: { RouteReuseStrategy, SETTINGS }, useValue: [{ persistence: true},'es'], useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }