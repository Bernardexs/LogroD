import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, Query } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, AuthCredential, fetchSignInMethodsForEmail, linkWithCredential } from 'firebase/auth';
import { User } from '../models/user.model';
import { Task } from '../models/task.model';
import { UtilsService } from './utils.service';
import { mergeMapTo, Observable, Subject } from 'rxjs';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var google: any;
declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  authState$!: Observable<any>;
  calendarItems!: any[];
  user$!: Observable<firebase.User>;

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilService = inject(UtilsService);
  router = inject(Router);
afMessaging = inject(AngularFireMessaging)
  private provider: FacebookAuthProvider;

  private tokenClient: any;
  private gapiInited = false;
  private gisInited = false;

  private offline = new Subject<boolean>();

  // Observable para que el componente se suscriba
  offlineLoaded$ = this.offline.asObservable();

  constructor(private http: HttpClient) {
    this.provider = new FacebookAuthProvider();
    this.initializeNetworkEvents();
    this.requestPermission();
  }

  requestPermission(){
    this.afMessaging.requestPermission.pipe(mergeMapTo(this.afMessaging.tokenChanges))
     .subscribe((token:any) => {
      localStorage.setItem('tokenPush',token)
        console.log('Permission granted!',token);
      })
  }

  async getCalendarEvents() {
    try {
      const events = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime'
      });

      return events.result.items.map((event: any) => ({
        title: event.summary,
        description: event.description,
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        allDay: false
      }));
    } catch (error) {
      console.error('Error fetching Google Calendar events', error);
      throw error;
    }
  }

  async insertEvent(task: Task) {
    const startTime = typeof task.startTime === 'string' ? new Date(task.startTime).toISOString() : (task.startTime as Date).toISOString();
    const endTime = typeof task.endTime === 'string' ? new Date(task.endTime).toISOString() : (task.endTime as Date).toISOString();

    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: startTime,
        timeZone: 'America/Bogota'
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/Bogota'
      },
    };

    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      console.log('Event created: ', response);
      return response;
    } catch (error) {
      console.error('Error creating event: ', error);
      throw error;
    }
  }

  getAuth() {
    return getAuth();
  }

  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  async updateUser(displayName: string): Promise<void> {
    const user = await this.auth.currentUser;
    if (user) {
      return updateProfile(user, { displayName });
    } else {
      throw new Error('No user is currently signed in.');
    }
  }

  sendRecoveryEmail(email: string): Promise<any> {
    const auth = getAuth();
    return sendPasswordResetEmail(auth, email)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  setDocument(path: string, data: any) {
    return this.firestore.doc(path).set(data);
  }

  async getDocument(path: string) {
    console.log(path)
    console.log('entro a getDocument')
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  async signOut() {
    const auth = getAuth();
    await auth.signOut();
    localStorage.removeItem('google_oauth_token');
    localStorage.removeItem('user');
    this.utilService.routerLink('/bienvenida');
  }

  signInWithGoogle() {
    return this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((result) => {
        const user = result.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          }));
          this.router.navigateByUrl('/home');
        } else {
          console.error('No se recibió el objeto usuario de Firebase.');
        }
      }).catch((error) => {
        console.error('Error durante el inicio de sesión:', error);
      });
  }

  async signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.setCustomParameters({ 'display': 'popup' });

    try {
      const result = await this.auth.signInWithPopup(provider);
      const user = result.user;
      if (result.credential) {
        const credential = result.credential as firebase.auth.OAuthCredential;
        const accessToken = credential.accessToken;
        console.log('Token de acceso', accessToken);
      }
      console.log('Inicio de sesión exitoso', user);
      this.router.navigateByUrl('/home');
      return user;
    } catch (error) {
      console.error('Error al iniciar sesión con Facebook', error);
      return null;
    }
  }

  async signUpWithFacebook() {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.setCustomParameters({ 'display': 'popup' });

    try {
      const result = await signInWithPopup(getAuth(), provider);
      const user = result.user;
      if (user) {
        const uid = user.uid;
        const userInfo = { uid, email: user.email, name: user.displayName || 'User' };
        await this.setDocument(`users/${uid}`, userInfo);
        this.utilService.saveInLocalStorage('user', userInfo);
        this.router.navigateByUrl('/home');
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
        const userInfo = { uid, email: user.email, name: user.displayName || 'User' };
        await this.setDocument(`users/${uid}`, userInfo);
        this.utilService.saveInLocalStorage('user', userInfo);
        this.router.navigateByUrl('/home');
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

  getSubCollection<T>(path: string, subCollection: string): Observable<T[]> {
    return this.firestore.collection<T>(`${path}/${subCollection}`).valueChanges({ idField: 'id' });
  }

  querySubCollection(path: string, subCollection: string, field: string, operation: any, value: any): Observable<Task[]> {
    return this.firestore.collection<Task>(`${path}/${subCollection}`, ref => ref.where(field, operation, value)).valueChanges({ idField: 'id' });
  }

  searchTasksByTitle(path: string, searchTerm: string, selectedCategory?: string): Observable<Task[]> {
    return this.firestore.collection<Task>(`${path}/tasks`, ref => {
      let query: Query = ref;
      console.log(query)
      // Filtrar por categoría si está definida y no es 'Todos'
      if (selectedCategory && selectedCategory !== 'Todos') {
        query = query.where('category', '==', selectedCategory);
      }
  
      console.log(query)
      // Filtrar por título si está definido
      if (searchTerm) {
        query = query.where('title', '>=', searchTerm).where('title', '<=', searchTerm + '\uf8ff');
      }

      console.log(query)
  
      return query;
    }).valueChanges({ idField: 'id' });
  }
  

  addToSubcollection(path: string, subcollectionName: string, object: any) {
    const collectionPath = `${path}/${subcollectionName}`;
    return this.firestore.collection(collectionPath).add(object);
  }

  updateDocument(path: string, object: any) {
    return this.firestore.doc(path).update(object);
  }

  deleteDocument(path: string) {
    return this.firestore.doc(path).delete();
  }

  private initializeNetworkEvents() {
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
  }

  async handleConnectionChange(isOnline: boolean) {
    if (isOnline) {
      console.log('Back online');
      this.syncData();
    } else {
      this.offline.next(true);
      console.log('You are offline');
    }
  }

  private async syncData() {
    // Aquí se implementa la lógica para sincronizar datos
    console.log('Sincronizando datos...');
  }


  private readonly apiUrl = 'https://fcm.googleapis.com/v1/projects/548073834016/messages:send';
  private readonly serverKey = 'AIzaSyCbwvYbyo_8_ZFVzspr2owyy4rSja5zkE0';

  sendNotification(token: string | null, title: string, body: string) {
    const message = {
      message: {
        token: token,
        notification: {
          title: title,
          body: body
        }
      }
    };

    const headers = new HttpHeaders({
      'Authorization': `key=${this.serverKey}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(this.apiUrl, message, { headers });
  }

}
