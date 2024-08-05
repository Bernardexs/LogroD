import { Injectable } from '@angular/core';

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
    'https://www.googleapis.com/auth/calendar.app.created',
    'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
    'https://www.googleapis.com/auth/calendar.events.freebusy',
    'https://www.googleapis.com/auth/calendar.events.public.readonly',
    'https://www.googleapis.com/auth/calendar.settings.readonly',
    'https://www.googleapis.com/auth/calendar.freebusy',
    'https://www.googleapis.com/auth/calendar'
  ].join(' ');

  private gapiInited = false;
  private gisInited = false;
  private tokenClient: any;

  constructor() {
    this.loadGapi();
    this.loadGis();
  }

  private loadGapi() {
    gapi.load('client', () => this.initializeGapiClient());
  }

  private async initializeGapiClient() {
    await gapi.client.init({
      clientId: this.CLIENT_ID,
      discoveryDocs: [this.DISCOVERY_DOC],
      scope: this.SCOPES,
    });
    this.gapiInited = true;
    this.maybeEnableButtons();
  }

  private loadGis() {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: '', // definido más adelante
    });
    this.gisInited = true;
    this.maybeEnableButtons();
  }

  private maybeEnableButtons() {
    if (this.gapiInited && this.gisInited) {
      document.getElementById('authorize_button')!.style.visibility = 'visible';
    }
  }

  public handleAuthClick() {
    this.tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      document.getElementById('signout_button')!.style.visibility = 'visible';
      document.getElementById('authorize_button')!.innerText = 'Refresh';
      await this.listUpcomingEvents();
    };

    if (gapi.client.getToken() === null) {
      this.tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      this.tokenClient.requestAccessToken({prompt: ''});
    }
  }

  public handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
      document.getElementById('content')!.innerText = '';
      document.getElementById('authorize_button')!.innerText = 'Authorize';
      document.getElementById('signout_button')!.style.visibility = 'hidden';
    }
  }

  public async listUpcomingEvents(): Promise<any[]> {
    let response;
    try {
      const request = {
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime',
      };
      response = await gapi.client.calendar.events.list(request);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error fetching events:', err.message);
        throw err;
      } else {
        console.error('Error fetching events:', String(err));
        throw new Error(String(err));
      }
    }

    return response.result.items || [];
  }

  public async insertEvent(event: any) {
    return gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    }).then((response: any) => {
      return response.result;
    }).catch((error: any) => {
      console.error('Error adding event to Google Calendar', error);
      throw error;
    });
  }
}
