import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DocumentData } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.page.html',
  styleUrls: ['./iniciar-sesion.page.scss'],
})
export class IniciarSesionPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  router = inject(Router);
  utilsSVC = inject(UtilsService);
  firebase = inject(FirebaseService);

  ngOnInit() {}

  showPassword: boolean = false;

  async signInWithGoogle() {
    try {
      await this.firebase.signInWithGoogle();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error during sign-in', error);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async submit(){
    if(this.form.valid){
      const loading= await this.utilsSVC.loading()
      await loading.present()
      this.firebase.signIn(this.form.value as User).then(res=>{

        console.log(res)

        this.getUserInfo(res.user.uid)
      }).catch(error=>{
        console.log(error)
        this.utilsSVC.presentToast({
          message: error.message,
          duration: 2000,
          color:'danger',
          position: 'bottom',
          icon: 'alert-circle-outline'
        })
      }).finally(()=>{
        loading.dismiss()
      })
    }
  }



  async getUserInfo(uid: string) {
    const loading = await this.utilsSVC.loading();
    await loading.present();
    
    let path = `users/${uid}`;
    console.log('entro a getuserinfo')
    this.firebase.getDocument(path).then((data: DocumentData | undefined) => {
      if (data) {
        const user = data as User; // Cast to User if not undefined
        // Aquí puedes manejar la respuesta de la operación de Firebase
        this.utilsSVC.saveInLocalStorage('user', user);
        this.utilsSVC.routerLink('/home');
        this.form.reset();
        this.utilsSVC.presentToast({
          message: `Te damos la bienvenida ${user.name}`,
          duration: 2500,
          color: 'primary',
          position: 'bottom',
          icon: 'person-circle-outline'
        });
      } else {
        // Manejo del caso cuando data es undefined
        console.error('No user data found');
      }
    }).catch(error => {
      console.error('Error getting document:', error);
    }).finally(() => {
      loading.dismiss();
    });
  }


  loginWithFacebook() {
    this.firebase.signInWithFacebook();
  }
}
