import { Injectable, inject } from '@angular/core';
import { AlertController, AlertOptions, LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Router } from '@angular/router';
import { Notification } from '../models/Ivent.models';

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
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
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

  async dismissLoading() {
    return await this.loadingCtrl.dismiss();
  }


  private notifications: Notification[] = [];

  addNotification(title: string, body?: string, icon?: string): void {
    this.notifications.push({
      title,
      body,
      icon:'assets/icon/alerta.png',
      timestamp: new Date(),
    });

   let option = {body: body, icon: 'assets/icon/alerta.png',vibrate: [200, 100, 200],};
    this.showNotification(title,option)
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  requestPermission(): void {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      });
    } else {
      console.log('This browser does not support notifications.');
    }
  }

  // Muestra una notificación
  showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, options);
        
      } else {
        console.log('Notification permission not granted.');
      }
    } else {
      console.log('This browser does not support notifications.');
    }
  }
}
