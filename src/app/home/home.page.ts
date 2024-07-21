import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);

  ngOnInit() {
  }
  signOut() {
    this.firebaseSvc.signOut();
  }
  

}
