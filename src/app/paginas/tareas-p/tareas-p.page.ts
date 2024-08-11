import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSelect, ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Task } from 'src/app/models/task.model';
import { AddUpdateTaskPage } from 'src/app/add-update-task/add-update-task.page';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-tareas-p',
  templateUrl: './tareas-p.page.html',
  styleUrls: ['./tareas-p.page.scss'],
})
export class TareasPPage implements OnInit {
  @ViewChild('categorySelect', { static: false }) categorySelect!: IonSelect;

  categorias: string[] = ['Calle', 'Trabajo', 'Hogar', 'Otro'];
  filteredTasks: Task[] = [];
  searchQuery: string = ''; // Para almacenar la consulta de búsqueda
  selectedCategory: string = ''; // Variable para almacenar la categoría seleccionada

  private searchSubject = new Subject<string>(); // Para controlar la búsqueda dinámica

  constructor(
    private alertController: AlertController,
    private utilSVC: UtilsService, 
    private firebase: FirebaseService,
    private modalController: ModalController,
  ) {}

  ngOnInit() {
    // Configurar búsqueda dinámica con debounce
    this.searchSubject.pipe(
      debounceTime(300), // Espera 300ms después de que el usuario deje de escribir
      distinctUntilChanged() // Realiza la búsqueda solo si el término ha cambiado
    ).subscribe(searchTerm => {
      this.searchTasks(searchTerm);
    });
  }

  ionViewWillEnter() {
    this.getTasks();
    // Restablecer el valor del ion-select
    if (this.categorySelect) {
      this.categorySelect.value = ''; // Establecer el valor predeterminado a quitar filtro
    }
  }

  getTasks() {
    this.searchTasks(''); // Inicialmente cargar todas las tareas
  }

  filterTasks(event: any) {
    this.selectedCategory = event.detail.value || ''; // Almacenar la categoría seleccionada
    this.searchTasks(this.searchQuery); // Aplicar búsqueda con el filtro actual
  }

  clearFilter() {
    this.selectedCategory = ''; // Quitar el filtro seleccionando vacío
    if (this.categorySelect) {
      this.categorySelect.value = ''; // Reiniciar el select a sin filtro
    }
    this.getTasks(); // Recargar la lista completa de tareas
  }
  

searchTasks(searchTerm: string) {
  this.searchQuery = searchTerm; // Almacenar la búsqueda actual
  let user = this.utilSVC.getFromLocalStorage('user');
  let path = `users/${user.uid}`;

  this.firebase.searchTasksByTitle(path, searchTerm, this.selectedCategory).subscribe((tasks) => {
    this.filteredTasks = tasks;
    console.log('Searched and Filtered Tasks:', this.filteredTasks);
  }, (error) => {
    console.error('Error fetching tasks:', error);
    if (error.code === 'failed-precondition' || error.code === 'unavailable') {
      alert('Parece que la consulta requiere un índice adicional en Firestore. Por favor, revisa la consola de Firebase para crear el índice.');
    }
  });
}

  onSearchChange(event: any) {
    const searchTerm = event.target.value || '';
    this.searchSubject.next(searchTerm); // Emitir el término de búsqueda al subject
  }

  async addOrUpdateTask(task?: Task) {
    const modal = await this.modalController.create({
      component: AddUpdateTaskPage,
      componentProps: { task } // Pasar la tarea para editar si existe
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data) {
        result.data.startTime = new Date(result.data.startTime);
        result.data.endTime = new Date(result.data.endTime);
        console.log('Task data received:', result.data); 
        this.getTasks(); // Refrescar la lista de tareas después de agregar/actualizar
      }
    });

    return await modal.present();
  }

  async toggleTaskCompletion(task: Task) {
    try {
      task.completed = !task.completed; // Cambiar el estado de completado
      let user = this.utilSVC.getFromLocalStorage('user');
      let path = `users/${user.uid}/tasks/${task.id}`;
      
      await this.firebase.updateDocument(path, { completed: task.completed });
      
      // Opcional: puedes mostrar un mensaje de éxito
      this.utilSVC.presentToast({
        message: `La tarea "${task.title}" ha sido marcada como ${task.completed ? 'completada' : 'pendiente'}.`,
        color: 'success',
        duration: 1500
      });
    } catch (error) {
      console.error('Error updating task:', error);
      this.utilSVC.presentToast({
        message: 'Hubo un error al actualizar la tarea.',
        color: 'danger',
        duration: 3000
      });
    }
  }
  

  async deleteTask(task: Task) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            let user = this.utilSVC.getFromLocalStorage('user');
            let path = `users/${user.uid}/tasks/${task.id}`;
            await this.firebase.deleteDocument(path);
            this.getTasks(); // Refrescar la lista de tareas después de eliminar
          },
        },
      ],
    });

    await alert.present();
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
  
}
