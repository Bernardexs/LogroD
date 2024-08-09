import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Task } from '../models/task.model';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-add-update-task',
  templateUrl: './add-update-task.page.html',
  styleUrls: ['./add-update-task.page.scss'],
})
export class AddUpdateTaskPage implements OnInit {
  form: FormGroup;
  task: Task | undefined;
  user!: User;
  categorias: string[] = ['Calle', 'Trabajo', 'Hogar', 'Otro']; // Definir las categorías aquí

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private navParams: NavParams,
    private firebase: FirebaseService,
    private utilSVC: UtilsService
  ) {
    this.task = this.navParams.get('task');
    const now = new Date();
    this.form = this.fb.group({
      id: [this.task?.id],
      title: [this.task?.title || '', [Validators.required, Validators.minLength(4)]],
      description: [this.task?.description || '', [Validators.required, Validators.minLength(10)]],
      startTime: [this.task?.startTime || now.toISOString(), Validators.required],
      endTime: [this.task?.endTime || new Date(now.getTime() + 60 * 60 * 1000).toISOString(), Validators.required],
      category: [this.task?.category || '', Validators.required] // Control de categoría
    });
  }

  ngOnInit() {
    // Obtener el usuario desde el localStorage
    this.user = this.utilSVC.getFromLocalStorage('user');
  }

  async save() {
    if (this.form.valid) {
        const formValue = this.form.value;
        const taskData: Task = {
            ...formValue, // Incluye title, description, startTime, endTime, y category
            completed: this.task?.completed || false // Mantener el estado de completado
        };

        this.utilSVC.loading(); // Mostrar indicador de carga

        try {
            if (this.task && this.task.id) {
                // Actualizar tarea existente
                const taskPath = `users/${this.user.uid}/tasks/${this.task.id}`;
                await this.firebase.updateDocument(taskPath, taskData);

                // Mostrar mensaje de éxito
                this.utilSVC.presentToast({
                    message: 'Tarea actualizada exitosamente',
                    color: 'success',
                    icon: 'checkmark-circle-outline',
                    duration: 1500
                });
            } else {
                // Crear nueva tarea
                await this.firebase.addToSubcollection(`users/${this.user.uid}`, 'tasks', taskData);

                // Mostrar mensaje de éxito
                this.utilSVC.presentToast({
                    message: 'Tarea creada exitosamente',
                    color: 'success',
                    icon: 'checkmark-circle-outline',
                    duration: 1500
                });
            }

            // Emitir un evento con los datos de la tarea creada/actualizada, incluyendo la categoría
            await this.modalController.dismiss(this.form.value);

        } catch (error) {
            // Mostrar mensaje de error
            this.utilSVC.presentToast({
                message: String(error), // Convertir el error a string
                color: 'warning',
                icon: 'alert-circle-outline',
                duration: 5000
            });

        } finally {
            this.utilSVC.dismissLoading(); // Ocultar indicador de carga
        }
    }
}


  async dismissModal() {
    await this.modalController.dismiss();
  }
}
