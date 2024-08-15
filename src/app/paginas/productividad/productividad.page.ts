import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { single } from 'src/app/models/data';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-productividad',
  templateUrl: './productividad.page.html',
  styleUrls: ['./productividad.page.scss']
})
export class ProductividadPage implements OnInit {

  completedTasks = [
    { title: 'Tarea 1', endTime: '2024-08-01', category: 'Trabajo' },
  ];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedTasks: any[] = [];
  completedPercentage = 0;
  promedioTiempo = '0 minutos'
  pendingTasks = [
    { title: 'Tarea 3', endTime: '2024-08-15', category: 'Otros' },
  ];

  constructor(
    private alertController: AlertController,
    private utilSVC: UtilsService,
    private firebase: FirebaseService,
    private router: Router,
    private firebaseService: FirebaseService,
    private platform: Platform
  ) {
    // Object.assign(this, { single });
  }

  ngOnInit() {
    this.cargaEventosFirebase();
    this.renderizarGrafica(); // Asegura que la gráfica se renderice correctamente al cargar la página
  }

  cargaEventosFirebase() {
    let user = this.utilSVC.getFromLocalStorage('user');
    let path = `users/${user.uid}`;

    this.firebaseService.searchTasksByTitle(path, "", "").subscribe((tasks: any) => {
      this.completedTasks = tasks.filter((task: any) => task.completed);
      this.pendingTasks = tasks.filter((task: any) => !task.completed);
      this.calculateAverageTime();
      let countCompleted = this.completedTasks.length;
      let countPending = this.pendingTasks.length;

      let totalTasks = countCompleted + countPending;
      this.completedPercentage = (countCompleted / totalTasks) * 100;
       this.single = [{
        name: 'Completadas',
        value: countCompleted
      },
      {
        name: 'Pendientes',
        value: countPending
      }];
    }, (error) => {
      console.error('Error fetching tasks:', error);
    });
  }

  calculateAverageTime() {
    let totalDuration = 0;
    let taskCount = this.pendingTasks.length;
  
    this.pendingTasks.forEach((task: any) => {
      const startTime = new Date(task.startTime).getTime();
      const endTime = new Date(task.endTime).getTime();
      const duration = endTime - startTime;
  
      totalDuration += duration;
    });
  
    let averageDuration = totalDuration / taskCount;
  
    // Convertir el tiempo promedio de milisegundos a un formato más legible (opcional)
    let averageDurationInMinutes = Math.floor(averageDuration / (1000 * 60));
    // let averageDurationInSeconds = Math.floor((averageDuration % (1000 * 60)) / 1000);
    this.promedioTiempo = `${averageDurationInMinutes} minutos`;
    console.log(`El tiempo promedio de las tareas pendientes es: ${averageDurationInMinutes} minutos`);
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
            await loading.dismiss();
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

  navegar() {
    this.router.navigate(['/notificaciones']);
  }


  single: any[] = [];
  multi: any[] = [];

  view: any = [];

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Estados';
  showYAxisLabel = true;
  yAxisLabel = 'Tareas';

  colorScheme: Color = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
  };

  onSelect(event: any) {
    console.log(event);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.renderizarGrafica();
  }

  renderizarGrafica() {
    const width = this.platform.width();
    const height = this.platform.height();
    this.view = [width * 0.9, height * 0.4];
  }

}
