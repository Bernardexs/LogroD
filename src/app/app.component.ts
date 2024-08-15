import { Component } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from './services/firebase.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { mergeMapTo } from 'rxjs';
import { UtilsService } from './services/utils.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public router: Router,
    public platform: Platform,
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private firebaseService: FirebaseService,
    private afMessaging: AngularFireMessaging,
    private utilSVC: UtilsService,
  ) {
    this.routerDefault()
    setInterval(() => {
      let user = localStorage.getItem('user');
      if(user){
        this.cargaEventosFirebaseAntes();
      }
    }, 10000);

    setInterval(() => {
      let user = localStorage.getItem('user');
      if(user){
        this.cargaEventosFirebaseDurante();
      }
    }, 100000); // Aqui se cambia el tiempo de los segundo cuando hay una actividad den proceso
    this.firestore.firestore.enablePersistence()
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code == 'unimplemented') {
          console.log('The current browser does not support all of the features required to enable persistence');
        }
      });
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruye
   
  }

  cargaEventosFirebaseAntes() {
    
    let user = this.utilSVC.getFromLocalStorage('user');
    let path = `users/${user.uid}`;

    this.firebaseService.searchTasksByTitle(path, "", "").subscribe((tasks: any) => {
      tasks.forEach((task: any) => {
          this.checkTaskTime(task);
      });
    }, (error) => {
      console.error('Error fetching tasks:', error);
    });
  }

  cargaEventosFirebaseDurante() {
    let user = this.utilSVC.getFromLocalStorage('user');
    let path = `users/${user.uid}`;

    this.firebaseService.searchTasksByTitle(path, "", "").subscribe((tasks: any) => {
      tasks.forEach((task: any) => {
          this.tareaPendiente(task);
      });
    }, (error) => {
      console.error('Error fetching tasks:', error);
    });
  }
  
  routerDefault() {
    this.platform.ready().then(() => {
      this.router.navigateByUrl('bienvenida')
    })
  }

  checkTaskTime(task: any) {
    const endTime = new Date(task.endTime).getTime();
    const currentTime = Date.now();
    const timeDifference = endTime - currentTime;

    // Si el tiempo restante es entre 0 y 10 segundos
    if (timeDifference > 0 && timeDifference <= 10000) {
      this.utilSVC.addNotification('Pronto iniciara una tarea ','En poco tiempo iniciara una tarea, revisa tu calendario','assets/icon.png');
    }
  }

  tareaPendiente(task:any){
    const startTime = new Date(task.startTime).getTime();
    const endTime = new Date(task.endTime).getTime();
    const currentTime = Date.now();

    // Verificar si la hora actual está entre startTime y endTime, y si completed es falso
    if (currentTime >= startTime && currentTime <= endTime && task.completed === false) {
      this.utilSVC.addNotification('Tarea Pendiente ','Tienes una tarea pendiente, revisa tu calendario','assets/icon.png');

    }
  }

  executeAction() {
    // Coloca aquí la función que quieres ejecutar cuando se cumpla la condición
    console.log('Executing action because task.endTime is within 10 seconds from now!');
  }

}
