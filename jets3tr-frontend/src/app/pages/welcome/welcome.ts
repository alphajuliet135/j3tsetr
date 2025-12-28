import { Component } from '@angular/core';
import {NzButtonComponent} from 'ng-zorro-antd/button';

@Component({
  selector: 'app-welcome',
  imports: [
    NzButtonComponent
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class Welcome {


  buttonSize = 'large'
}
