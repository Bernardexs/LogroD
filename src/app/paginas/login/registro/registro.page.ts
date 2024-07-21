import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { passwordMatchValidator } from 'src/app/validators/password-match.validator';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)])
  }, { validators: passwordMatchValidator });

  utilsSVC = inject(UtilsService);
  firebase = inject(FirebaseService);

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSVC.loading();
      await loading.present();

      this.firebase.signUp(this.form.value as User).then(async res => {
        if (!this.form.value.name) {
          throw new Error("El campo 'name' no puede estar vacío");
        }
        await this.firebase.updateUser(this.form.value.name);
        let uid = res.user.uid;
        this.form.controls.uid.setValue(uid);
        this.setUserInfo(uid);
        
      }).catch(error => {
        console.log(error);
        this.utilsSVC.presentToast({
          message: error.message,
          duration: 2000,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline'
        });
      }).finally(() => {
        loading.dismiss();
      });
    }
  }

  async setUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSVC.loading();
      await loading.present();
      let path = `users/${uid}`;
      delete this.form.value.password;
      this.firebase.setDocument(path, this.form.value).then(async res => {
        this.utilsSVC.saveInLocalStorage('user', this.form.value);
        this.utilsSVC.routerLink('/home');
        this.form.reset();
      }).catch(error => {
        console.log(error);
        this.utilsSVC.presentToast({
          message: error.message,
          duration: 2000,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline'
        });
      }).finally(() => {
        loading.dismiss();
      });
    }
  }


  async signUpWithFacebook() {
    const loading = await this.utilsSVC.loading();
    await loading.present();

    this.firebase.signUpWithFacebook().then(async user => {
      if (user) {
        const uid = user.uid;
        const userInfo = {
          uid,
          email: user.email,
          name: user.displayName || 'User'
        };
        await this.firebase.setDocument(`users/${uid}`, userInfo);
        this.utilsSVC.saveInLocalStorage('user', userInfo);
        this.utilsSVC.routerLink('/home');
      }
    }).catch(error => {
      console.log(error);
      this.utilsSVC.presentToast({
        message: error.message,
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
    }).finally(() => {
      loading.dismiss();
    });
  }

  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  async signUpWithGoogle() {
    const loading = await this.utilsSVC.loading();
    await loading.present();

    this.firebase.signUpWithGoogle().then(async user => {
      if (user) {
        const uid = user.uid;
        const userInfo = {
          uid,
          email: user.email,
          name: user.displayName || 'User'
        };
        await this.firebase.setDocument(`users/${uid}`, userInfo);
        this.utilsSVC.saveInLocalStorage('user', userInfo);
        this.utilsSVC.routerLink('/home');
      }
    }).catch(error => {
      console.log(error);
      this.utilsSVC.presentToast({
        message: error.message,
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
    }).finally(() => {
      loading.dismiss();
    });
  }
}
