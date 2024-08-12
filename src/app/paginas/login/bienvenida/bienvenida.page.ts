import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

Router
@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
})
export class BienvenidaPage implements OnInit {

  constructor(public router:Router) { 
    setTimeout(()=>{
      this.router.navigateByUrl('iniciar-sesion')
    },4000)
  }

  ngOnInit() {
  }

}
