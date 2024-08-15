import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Task } from '../models/task.model';
import { AddUpdateTaskPage } from '../add-update-task/add-update-task.page';
import { CalendarComponent } from 'ionic2-calendar';
import { CalendarService } from '../services/calendar.service'; // Importa el servicio de calendario
import { FirebaseService } from '../services/firebase.service';
import { AlertController } from '@ionic/angular';
import { UtilsService } from '../services/utils.service';
import { Router } from '@angular/router';

interface AlertDismissEventDetail {
  role?: string;
}

interface AlertDismissEvent extends CustomEvent {
  detail: AlertDismissEventDetail;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(CalendarComponent) myCal!: CalendarComponent;
  tasks: Task[] = [];
  myDataFirebase: any[] = [];
  myDataGoogle: any[] = [];
  currentMonth: string = '';
  allEvents: any[] = [];
  allEventsBackup:any[] = [];
  calendar = {
    mode: 'month' as 'month',
    currentDate: new Date(),
    locale: 'es-ES',  // Configuración del idioma
    formatDay: 'dd',  // Formato para el día
    formatMonthTitle: 'MMMM yyyy', // Formato para el título del mes
    formatWeekTitle: 'MMM yyyy',
  };
  tokenGoogle: boolean = false;

  constructor(
    private modalController: ModalController,
    private calendarService: CalendarService,
    private firebaseService: FirebaseService, // Inyecta el servicio de calendario
    private alertController: AlertController,
    private utilSVC: UtilsService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit() {
    this.tokenGoogle = localStorage.getItem('google_oauth_token') ? true : false;
    this.cargaEventosFirebase();
    this.calendarService.eventsLoaded$.subscribe(async () => {
      this.cargaEventosFirebase();
    });
  }

  changeMode(mode: any) {
    this.calendar.mode = mode;
  }


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

  // Definir el tipo de ev explícitamente
  setResult(ev: AlertDismissEvent) {
    const role = ev.detail.role ?? 'unknown';
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
            await this.firebaseService.signOut();
            await loading.dismiss(); // Asegurarse de que el loader se cierra después de cerrar la sesión
          },
        },
      ],
      backdropDismiss: false,
      mode: 'ios'
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
  }


  selectTab(event: Event) {
    const tabButtons = document.querySelectorAll('ion-tab-button');
    tabButtons.forEach(button => button.classList.remove('selected', 'animated'));
    (event.currentTarget as HTMLElement).classList.add('selected', 'animated');
  }

  cargaEventosFirebase() {
    let user = this.utilSVC.getFromLocalStorage('user');
    let path = `users/${user.uid}`;

    this.firebaseService.searchTasksByTitle(path, "", "").subscribe((tasks) => {
      this.llenarCalendarioFirebase(tasks);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      if (error.code === 'failed-precondition' || error.code === 'unavailable') {
        alert('Parece que la consulta requiere un índice adicional en Firestore. Por favor, revisa la consola de Firebase para crear el índice.');
      }
    });
  }
  llenarCalendarioFirebase(datos: any) {
    // Datos de eventos de Firebase
    this.myDataFirebase = datos.map((event: any) => ({
      title: event.title,
      description: event.description,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      allDay: false,
      completed: event.completed
    }));
    this.allEvents = [...this.myDataFirebase];
    this.allEventsBackup = [...this.myDataFirebase];// O actualizas el array existente
    this.cdr.detectChanges();

  }

  llenarCalendarioGoogle(datos:any){
    this.myDataGoogle = datos.map((event: any) => ({
      title: event.summary,
      description: event.description,
      startTime: new Date(event.start.dateTime),
      endTime: new Date(event.end.dateTime),
      allDay: false
    }));
  }

  async loadGoogleCalendarEvents() {
    try {
      const events = await this.calendarService.listUpcomingEvents();
      this.llenarCalendarioGoogle(events);
      this.loadEventsForCurrentDate(this.calendar.currentDate);
    } catch (error) {
      console.error('Error loading Google Calendar events', error);
    }
  }

  onViewTitleChanged(title: string) {
    this.currentMonth = title;
  }

  async onCurrentDateChanged(event: Date) {
    await this.loadEventsForCurrentDate(event);
  }

  async loadEventsForCurrentDate(date: Date) {
    this.allEvents = this.allEventsBackup;
    // this.allEvents = this.myDataFirebase.filter(event => event.startTime.getMonth() === date.getMonth() && event.startTime.getFullYear() === date.getFullYear());
    let datos = this.allEvents.map(event => {
      return {
        ...event,
        title: `🔔 ${event.title} | ${event.description} | ${event.completed ? '✅ Completada' : 'En Espera'}`, // Agregar un icono o modificar el título
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        allDay: false,
      };
    });
    this.allEvents = [...datos];
    this.cdr.detectChanges();
  }

  async deleteTask(taskId: string) {
    // Implementar la lógica para eliminar la tarea tanto de Firebase como de Google Calendar si es necesario
    console.log('Eliminar tarea:', taskId);
  }

  async markAsCompleted(task: Task) {
    // Implementar la lógica para marcar la tarea como completada
    task.completed = !task.completed; // Alternar el estado de completado
  }

  navegar(){
    this.router.navigate(['/notificaciones']);
  }

  navegarPro(){
    this.router.navigate(['/productividad']);
  }

  back() {
    this.myCal.slidePrev();
  }

  next() {
    this.myCal.slideNext();
  }

  onEventSelected(event: any) {
    console.log('Event selected:', event);
  }

  async handleAuthClick() {
    this.calendarService.handleAuthClick();
    this.tokenGoogle = true;
  }

  async cambiarCuenta() {
    this.calendarService.switchGoogleAccount();
  }

  handleSignoutClick() {
    this.calendarService.handleSignoutClick();
  }

  enviarNotifi(){
    const token = localStorage.getItem('tokenPush'); // Reemplaza con el token del dispositivo
    const title = 'Hello';
    const body = 'World';

    this.firebaseService.sendNotification(token, title, body)
      .subscribe(
        response => {
          console.log('Notification sent successfully', response);
        },
        error => {
          console.error('Error sending notification', error);
        }
      );
  }

}
