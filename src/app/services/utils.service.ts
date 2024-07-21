import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, AlertOptions, LoadingController, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  loadingCtrl=inject(LoadingController)
  toastCtrl=inject(ToastController)
  router=inject(Router)
  alertController=inject(AlertController)


  //=====Loading======

  loading(){
    return this.loadingCtrl.create({spinner:"crescent"})
  }



//============== Toast ====================

  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts
    );
    toast.present();
  }

  //================= Enruta a cualquier pagina disponible ===============

  routerLink(url:string){
    return this.router.navigateByUrl(url);
  }




  //================ Guarda un elemento en LocalStorage =======================
  saveInLocalStorage(key:string,value:any){
    return localStorage.setItem(key,JSON.stringify(value))
  }




   //======================Obtener un elemento del LocalStorage ====================
   getFromLocalStorage(key: string) {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null; // O un valor por defecto que consideres apropiado
  }
  
  //====================== Alert ===========================
  async presentAlert(opts: AlertOptions) {
    const alert = await this.alertController.create(opts);
    await alert.present();
  }

}
