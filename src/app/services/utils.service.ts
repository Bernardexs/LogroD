import { Injectable, inject } from '@angular/core';
import { AlertController, AlertOptions, LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Task } from '../models/task.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  alertController = inject(AlertController);
  modalController = inject(ModalController);
  router = inject(Router);

  loading(){
    return this.loadingCtrl.create({spinner: "crescent"});
  }

  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  getFromLocalStorage(key: string) {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  }

  async presentAlert(opts: AlertOptions) {
    const alert = await this.alertController.create(opts);
    await alert.present();
  }

  async presentModal(opts: ModalOptions) {
    const modal = await this.modalController.create(opts);
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      return data;
    }
  }

  dismissModal(data?: any) {
    this.modalController.dismiss(data);
  }

  getPercentage(task: Task) {
    return task.completed ? 100 : 0;
  }

  async dismissLoading() {
    return await this.loadingCtrl.dismiss();
  }
}
