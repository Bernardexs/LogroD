import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSelect, ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Task } from 'src/app/models/task.model';
import { AddUpdateTaskPage } from 'src/app/add-update-task/add-update-task.page';

@Component({
  selector: 'app-tareas-p',
  templateUrl: './tareas-p.page.html',
  styleUrls: ['./tareas-p.page.scss'],
})
export class TareasPPage implements OnInit {
  @ViewChild('categorySelect', { static: false }) categorySelect!: IonSelect;

  categorias: string[] = ['Todos', 'Calle', 'Trabajo', 'Hogar', 'Otro'];
  tasks: Task[] = []; // Todas las tareas
  filteredTasks: Task[] = []; // Tareas filtradas por categoría
  searchResults: Task[] = []; // Tareas filtradas por búsqueda
  searchQuery: string = ''; // Para almacenar la consulta de búsqueda
  selectedCategory: string = 'Todos'; // Variable para almacenar la categoría seleccionada

  constructor(
    private alertController: AlertController,
    private utilSVC: UtilsService, 
    private firebase: FirebaseService,
    private modalController: ModalController,
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.getTasks();

    // Restablecer el valor del ion-select
    if (this.categorySelect) {
      this.categorySelect.value = 'Todos'; // Establecer el valor predeterminado a 'Todos'
    }
  }

  getTasks() {
    let user = this.utilSVC.getFromLocalStorage('user');
    let path = `users/${user.uid}`;

    let sub = this.firebase.getSubCollection<Task>(path, 'tasks').subscribe({
      next: (res: Task[]) => {
        this.tasks = res;
        this.filteredTasks = res;
        this.applyFilters(); // Aplicar filtros si hay algún establecido
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
      }
    });
  }

  filterTasks(event: any) {
    this.selectedCategory = event.detail.value || 'Todos'; // Almacenar la categoría seleccionada
    this.applyFilters();
  }

  applyFilters() {
    let tasksToFilter = this.tasks;

    if (this.selectedCategory && this.selectedCategory !== 'Todos') {
      tasksToFilter = this.tasks.filter(task => task.category === this.selectedCategory);
    }

    this.filteredTasks = tasksToFilter;
    this.applySearch(); // Aplicar búsqueda después del filtro
  }

  applySearch() {
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      this.searchResults = this.filteredTasks.filter(task =>
        task.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.searchResults = this.filteredTasks; // Mostrar las tareas filtradas si no hay búsqueda
    }

    console.log('Search Results:', this.searchResults);
  }

  searchTasks(searchTerm: string) {
    this.searchQuery = searchTerm;  // Almacenar la búsqueda actual
    this.applySearch(); // Aplicar la búsqueda
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
        console.log('Task data received:', result.data); 
        this.getTasks(); // Refrescar la lista de tareas después de agregar/actualizar
      }
    });

    return await modal.present();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Esta acción no se puede deshacer.', 
      buttons: [
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
          handler: async () => {
            const loading = await this.utilSVC.loading();
            await loading.present();
            this.firebase.signOut();
            loading.dismiss();
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
