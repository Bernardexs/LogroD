import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

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
      text: 'OK',
      role: 'confirm',
      handler: () => {
        console.log('Alert confirmed');
      },
    },
  ];

  setResult(ev: CustomEvent<{ role: string }>) {
    const role = ev.detail.role ?? 'unknown';
    console.log(`Dismissed with role: ${role}`);
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Esta acción no se puede deshacer.',
      buttons: this.alertButtons,
      backdropDismiss: false,
      mode: 'ios', // Forzar el modo iOS
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    this.setResult(new CustomEvent('dismiss', { detail: { role: role ?? 'unknown' } }));
  }

  selectTab(event: Event) {
    const tabButtons = document.querySelectorAll('ion-tab-button');
    tabButtons.forEach(button => button.classList.remove('selected', 'animated'));
    (event.currentTarget as HTMLElement).classList.add('selected', 'animated');
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
