import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword,fetchSignInMethodsForEmail, linkWithCredential,FacebookAuthProvider , updateProfile, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, AuthCredential } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  authState$!: Observable<any>;

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilService = inject(UtilsService);
  router=inject(Router)
  private provider: FacebookAuthProvider;  // ======================= Autenticación =======================
  constructor() {
    this.provider = new FacebookAuthProvider(); // Inicializa provider en el constructor
  }
  getAuth() {
    return getAuth();
  }

  // ========== Acceder ==========
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ========== Crear usuario ==========
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ======= Actualizar usuario =======
  async updateUser(displayName: string): Promise<void> {
    const user = await this.auth.currentUser;

    if (user) {
      return updateProfile(user, { displayName });
    } else {
      throw new Error('No user is currently signed in.');
    }
  }

  // ======= Enviar email para reestablecer contraseña =======
  sendRecoveryEmail(email: string): Promise<any> {
    const auth = getAuth();
    return sendPasswordResetEmail(auth, email)
      .then((response) => {
        // Aquí retornamos toda la información que devuelve Firebase
        return response;
      })
      .catch((error) => {
        // En caso de error, también retornamos toda la información del error
        return Promise.reject(error);
      });
  }

  // ================= Base de datos =================

  //======== Setear un documento =============
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  //======== Obtener un documento =============
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  // ====== Cerrar Sesión ======
  async signOut() {
    const auth = getAuth();
    await auth.signOut();
  
    // Cerrar sesión de Facebook si es necesario
  
  
    localStorage.removeItem('user');
    this.utilService.routerLink('/bienvenida');
  }
  signInWithGoogle() {
    return this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((result) => {
        console.log('Usuario autenticado:', result.user);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
          console.log('Usuario almacenado en localStorage:', JSON.stringify(result.user));
          this.router.navigateByUrl('/home');
        } else {
          console.error('No se recibió el objeto usuario de Firebase.');
        }
        // Redireccionar a la ruta deseada
      }).catch((error) => {
        console.error('Error durante el inicio de sesión:', error);
      });
  }

  async signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.setCustomParameters({
      'display': 'popup'
    });

    try {
      const result = await this.auth.signInWithPopup(provider);
      const user = result.user;

      if (result.credential) {
        const credential = result.credential as firebase.auth.OAuthCredential;
        const accessToken = credential.accessToken;
        console.log('Token de acceso', accessToken);
      }

      console.log('Inicio de sesión exitoso', user);
      this.router.navigateByUrl('/home'); // Redirigir a la página de inicio

      return user;
    } catch (error) {
      console.error('Error al iniciar sesión con Facebook', error);
      return null;
    }
  }


  async signUpWithFacebook() {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.setCustomParameters({
      'display': 'popup'
    });

    try {
      const result = await signInWithPopup(getAuth(), provider);
      const user = result.user;

      if (user) {
        const uid = user.uid;
        const userInfo = {
          uid,
          email: user.email,
          name: user.displayName || 'User'
        };

        await this.setDocument(`users/${uid}`, userInfo);
        this.utilService.saveInLocalStorage('user', userInfo);
        this.router.navigateByUrl('/home'); // Redirigir a la página de inicio
        return user;
      } else {
        throw new Error('No se pudo obtener la información del usuario.');
      }
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const pendingCred = error.credential as AuthCredential;
        const email = error.customData.email;

        try {
          const methods = await fetchSignInMethodsForEmail(getAuth(), email);

          if (methods.includes('password')) {
            const password = prompt('Ingrese su contraseña para vincular su cuenta de Facebook:');
            if (password) {
              const existingUser = await signInWithEmailAndPassword(getAuth(), email, password);
              await linkWithCredential(existingUser.user, pendingCred);
              console.log('Cuentas vinculadas con éxito');
              this.router.navigateByUrl('/home');
            } else {
              throw new Error('Contraseña no proporcionada.');
            }
          } else if (methods.includes('google.com')) {
            const googleProvider = new GoogleAuthProvider();
            const googleResult = await signInWithPopup(getAuth(), googleProvider);
            await linkWithCredential(googleResult.user, pendingCred);
            console.log('Cuentas vinculadas con éxito');
            this.router.navigateByUrl('/home');
          }
        } catch (linkError) {
          console.error('Error al vincular cuentas', linkError);
        }
      } else {
        console.error('Error al registrar con Facebook', error);
      }
      return null;
    }
  }

  async signUpWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');

    try {
      const result = await signInWithPopup(getAuth(), provider);
      const user = result.user;

      if (user) {
        const uid = user.uid;
        const userInfo = {
          uid,
          email: user.email,
          name: user.displayName || 'User'
        };

        await this.setDocument(`users/${uid}`, userInfo);
        this.utilService.saveInLocalStorage('user', userInfo);
        this.router.navigateByUrl('/home'); // Redirigir a la página de inicio
        return user;
      } else {
        throw new Error('No se pudo obtener la información del usuario.');
      }
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const pendingCred = error.credential as AuthCredential;
        const email = error.customData.email;

        try {
          const methods = await fetchSignInMethodsForEmail(getAuth(), email);

          if (methods.includes('password')) {
            const password = prompt('Ingrese su contraseña para vincular su cuenta de Google:');
            if (password) {
              const existingUser = await signInWithEmailAndPassword(getAuth(), email, password);
              await linkWithCredential(existingUser.user, pendingCred);
              console.log('Cuentas vinculadas con éxito');
              this.router.navigateByUrl('/home');
            } else {
              throw new Error('Contraseña no proporcionada.');
            }
          } else if (methods.includes('facebook.com')) {
            const facebookProvider = new FacebookAuthProvider();
            const facebookResult = await signInWithPopup(getAuth(), facebookProvider);
            await linkWithCredential(facebookResult.user, pendingCred);
            console.log('Cuentas vinculadas con éxito');
            this.router.navigateByUrl('/home');
          }
        } catch (linkError) {
          console.error('Error al vincular cuentas', linkError);
        }
      } else {
        console.error('Error al registrar con Google', error);
      }
      return null;
    }
  }
}
