import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-add-update-task',
  templateUrl: './add-update-task.page.html',
  styleUrls: ['./add-update-task.page.scss'],
})
export class AddUpdateTaskPage implements OnInit {
  form: FormGroup;
  task: Task | undefined;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private navParams: NavParams
  ) {
    this.task = this.navParams.get('task');
    this.form = this.fb.group({
      id: [this.task?.id],
      title: [this.task?.title || '', [Validators.required, Validators.minLength(4)]],
      description: [this.task?.description || '', [Validators.required, Validators.minLength(10)]],
      startTime: [this.task?.startTime || '', Validators.required],
      endTime: [this.task?.endTime || '', Validators.required]
    });
  }

  ngOnInit() {}

  async save() {
    if (this.form.valid) {
      const taskData: Task = this.form.value;
      await this.modalController.dismiss(taskData);
    }
  }

  async dismissModal() {
    await this.modalController.dismiss();
  }
}
