import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare var gapi: any;
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private CLIENT_ID = '548073834016-57t9d1t9mb6s4j877sbbuu07t37fo617.apps.googleusercontent.com';
  private DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  private SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar'
  ].join(' ');

  private tokenClient: any;

  // Subject para emitir eventos cuando los eventos se cargan
  private eventsLoadedSource = new Subject<string>();

  // Observable para que el componente se suscriba
  eventsLoaded$ = this.eventsLoadedSource.asObservable();



  constructor() {
    this.initializeGapi();
    this.initializeGis();
  }

  private async initializeGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            discoveryDocs: [this.DISCOVERY_DOC],
            scope: this.SCOPES,
          });
  
          const storedToken = localStorage.getItem('google_oauth_token');
          if (storedToken) {
            gapi.client.setToken(JSON.parse(storedToken));
          }
  
          resolve(); // La inicialización se ha completado con éxito
        } catch (error) {
          console.error('Error initializing GAPI client', error);
          reject(error); // Hubo un error al inicializar
        }
      });
    });
  }
  

  private initializeGis() {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: (response: any) => {
        if (response.error) {
          console.error(response.error);
          return;
        }
        localStorage.setItem('google_oauth_token', JSON.stringify(gapi.client.getToken()));
      },
    });
  }

  public switchGoogleAccount() {
    const token = gapi.client.getToken();
    if (token) {
      // Revocar el token actual
      google.accounts.oauth2.revoke(token.access_token, () => {
        gapi.client.setToken(null);
        localStorage.removeItem('google_oauth_token');
        // Luego de revocar el token, solicitar uno nuevo
        this.handleAuthClick();
      });
    } else {
      // Si no hay un token actual, simplemente solicita uno nuevo
      this.handleAuthClick();
    }
  }

  emitirEventoGoogle(text:string){
    this.eventsLoadedSource.next(text);
  }

  public handleAuthClick() {
    this.tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        console.error(resp.error);
        return;
      }
  
      const token = gapi.client.getToken();
      if (token) {
        localStorage.setItem('google_oauth_token', JSON.stringify(token));
      }
  
      // Emitir evento para cargar eventos después de obtener el token
      this.eventsLoadedSource.next('updateGoogle');
    };
  
    // Si no hay un token, solicitar uno
    if (!gapi.client.getToken()) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Si ya existe un token, utilizarlo directamente
      this.eventsLoadedSource.next('calendario');
    }
  }
  

  public handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, () => {
        gapi.client.setToken(null);
        localStorage.removeItem('google_oauth_token');
        // Aquí puedes redirigir o actualizar la interfaz para que el usuario pueda iniciar sesión con otra cuenta.
      });
    }
  }
  

  public async listUpcomingEvents(): Promise<any[]> {
    // Asegurarse de que gapi.client se haya inicializado
    if (!gapi.client || !gapi.client.calendar) {
      await this.initializeGapi();
    }
  
    try {
      const request = {
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime',
      };
      const response = await gapi.client.calendar.events.list(request);
      return response.result.items || [];
    } catch (err) {
      console.error('Error fetching events:', err instanceof Error ? err.message : String(err));
      throw err;
    }
  }
  

  public async insertEvent(event: any) {
    return gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    }).then((response: any) => {
      this.eventsLoadedSource.next('calendario');
      return response.result;
    }).catch((error: any) => {
      console.error('Error adding event to Google Calendar', error);
      throw error;
    });
  }

  public async deleteEvent(eventId: string | undefined): Promise<void> {
    try {
      await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      this.eventsLoadedSource.next('calendario')
      console.log('Evento eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar el evento de Google Calendar', error);
      throw error;
    }
  }

  public async updateEvent(eventId: string | undefined, updatedEvent: any): Promise<void> {
    try {
      await gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updatedEvent,
      });
      this.eventsLoadedSource.next('calendario')
      console.log('Evento actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar el evento de Google Calendar', error);
      throw error;
    }
  }
  
  
}
