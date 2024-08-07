import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

interface AlertDismissEventDetail {
  role?: string;
}

interface AlertDismissEvent extends CustomEvent {
  detail: AlertDismissEventDetail;
}

@Component({
  selector: 'app-tareas-p',
  templateUrl: './tareas-p.page.html',
  styleUrls: ['./tareas-p.page.scss'],
})
export class TareasPPage implements OnInit {
  constructor(private alertController: AlertController) {}

  ngOnInit() {}

  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Alert canceled');
      },
    },
    {
      text: 'Si',
      role: 'confirm',
      handler: () => {
        console.log('Alert confirmed');
      },
    },
  ];

  setResult(ev: AlertDismissEvent) {
    const role = ev.detail.role ?? 'unknown';
    console.log(`Dismissed with role: ${role}`);
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Esta acción no se puede deshacer.', // Puedes agregar un mensaje adicional
      buttons: this.alertButtons,
      backdropDismiss: false,
      mode: 'ios' // Forzar el modo iOS
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    this.setResult(new CustomEvent('dismiss', { detail: { role: role ?? 'unknown' } }));
  }

  tareas = [
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
    { title: 'Ir al gym', date: 'junio 27' },
  ];
}
