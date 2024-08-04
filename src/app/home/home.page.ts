import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from '../services/firebase.service';
import { Task } from '../models/task.model';
import { AddUpdateTaskPage } from '../add-update-task/add-update-task.page';
import { CalendarComponent } from 'ionic2-calendar';
import { UtilsService } from '../services/utils.service';

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
    private firebase: FirebaseService,
    private utilsSVC: UtilsService
  ) {}

  async ngOnInit() {
    await this.loadGoogleCalendarEvents();
    this.getTasks();
  }

  async loadGoogleCalendarEvents() {
    try {
      const events = await this.firebase.getCalendarEvents();
      this.myData = events.map((event: any) => ({
        title: event.summary,
        description: event.description,
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        allDay: false
      }));
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
        this.updateTaskList(result.data);
        await this.addEventToGoogleCalendar(result.data);
        await this.loadGoogleCalendarEvents(); // Reload events after adding a new one
      }
    });

    return await modal.present();
  }

  updateTaskList(updatedTask: Task) {
    const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
    if (index > -1) {
      this.tasks[index] = updatedTask;
    } else {
      if (updatedTask && updatedTask.id) {
        this.tasks.push(updatedTask);
      }
    }
  }

  async deleteTask(taskId: string) {
    let user = this.utilsSVC.getFromLocalStorage('user');
    let path = `users/${user.uid}/tasks/${taskId}`;
    this.firebase.deleteDocument(path).then(() => {
      this.tasks = this.tasks.filter(task => task.id !== taskId);
    }).catch(error => {
      console.error('Error deleting task', error);
    });
  }

  async addEventToGoogleCalendar(task: Task) {
    await this.firebase.insertEvent(task);
  }

  async markAsCompleted(task: Task) {
    task.completed = !task.completed; // Toggle the completed status
    await this.firebase.updateDocument(`users/${this.utilsSVC.getFromLocalStorage('user').uid}/tasks/${task.id}`, task);
    this.updateTaskList(task);
  }

  getTasks() {
    let user = this.utilsSVC.getFromLocalStorage('user');
    let path = `users/${user.uid}`;
    this.firebase.getSubCollection(path, 'tasks').subscribe((docs: any[]) => {
      this.tasks = docs.map(doc => ({
        ...doc,
        startTime: doc.startTime.toDate(),
        endTime: doc.endTime.toDate()
      })) as Task[];
    });
  }

  getPercentage(task: Task): number {
    return task.completed ? 100 : 0;
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
  signOut() {
    this.firebase.signOut();
  }
}
