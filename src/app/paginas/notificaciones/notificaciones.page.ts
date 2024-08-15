import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Notification } from 'src/app/models/Ivent.models';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit {

  notifications: Notification[] = [];
  constructor(private alertController: AlertController,
    private utilSVC: UtilsService,private firebase: FirebaseService, private router: Router,
    
  ) { }

  ngOnInit() {
    this.utilSVC.requestPermission();
    this.notifications = this.utilSVC.getNotifications();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Alerta cancelada');
          },
        },
        {
          text: 'Sí',
          role: 'confirm',
          handler: async () => {
            const loading = await this.utilSVC.loading();
            await loading.present();
            await this.firebase.signOut();
            await loading.dismiss(); // Asegurarse de que el loader se cierra después de cerrar la sesión
          },
        },
      ],
      backdropDismiss: false,
      mode: 'ios'
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    console.log(`Dismissed with role: ${role}`);
  }


  navegarPro(){
    this.router.navigate(['/productividad']);
  }

}
