import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Task } from '../models/task.model';
import { AddUpdateTaskPage } from '../add-update-task/add-update-task.page';
import { CalendarComponent } from 'ionic2-calendar';
import { CalendarService } from '../services/calendar.service'; // Importa el servicio de calendario
import { FirebaseService } from '../services/firebase.service';
import { AlertController } from '@ionic/angular';

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
  myData: any[] = [];
  currentMonth: string = '';
  allEvents: any[] = [];
  calendar = {
    mode: 'month' as 'month',
    currentDate: new Date()
  };

  constructor(
    private modalController: ModalController,
    private calendarService: CalendarService,
    private firebase:FirebaseService, // Inyecta el servicio de calendario
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.loadGoogleCalendarEvents();
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

  async loadGoogleCalendarEvents() {
    try {
      const events = await this.calendarService.listUpcomingEvents();
      this.myData = events.map((event: any) => ({
        title: event.summary,
        description: event.description,
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        allDay: false
      }));
      this.loadEventsForCurrentDate(this.calendar.currentDate);
    } catch (error) {
      console.error('Error loading Google Calendar events', error);
    }
  }

  onViewTitleChanged(title: string) {
    this.currentMonth = title;
  }

  onCurrentDateChanged(event: Date) {
    this.loadEventsForCurrentDate(event);
  }

  loadEventsForCurrentDate(date: Date) {
    this.allEvents = this.myData.filter(event => event.startTime.getMonth() === date.getMonth() && event.startTime.getFullYear() === date.getFullYear());
  }

  async addOrUpdateTask(task?: Task) {
    const modal = await this.modalController.create({
      component: AddUpdateTaskPage,
      componentProps: { task }
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data) {
        result.data.startTime = new Date(result.data.startTime);
        result.data.endTime = new Date(result.data.endTime);
        await this.addEventToGoogleCalendar(result.data);
        await this.loadGoogleCalendarEvents(); // Reload events after adding a new one
      }
    });

    return await modal.present();
  }

  async addEventToGoogleCalendar(task: Task) {
    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: (task.startTime as Date).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: (task.endTime as Date).toISOString(),
        timeZone: 'UTC'
      }
    };

    try {
      await this.calendarService.insertEvent(event);
    } catch (error) {
      console.error('Error adding event to Google Calendar', error);
    }
  }

  async deleteTask(taskId: string) {
    // Implementar la lógica para eliminar la tarea tanto de Firebase como de Google Calendar si es necesario
    console.log('Eliminar tarea:', taskId);
  }

  async markAsCompleted(task: Task) {
    // Implementar la lógica para marcar la tarea como completada
    task.completed = !task.completed; // Alternar el estado de completado
    console.log('Marcar tarea como completada:', task);
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

  handleAuthClick() {
    this.calendarService.handleAuthClick();
  }

  handleSignoutClick() {
    this.calendarService.handleSignoutClick();
  }

signOut() {
this.firebase.signOut()  }
}
