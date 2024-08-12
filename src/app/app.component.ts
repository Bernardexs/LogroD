import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public router:Router,
    public platform: Platform 
  ) {
    this.routerDefault()
  }

  routerDefault(){
    this.platform.ready().then(()=>{
      this.router.navigateByUrl('bienvenida')
    })
  }
}
