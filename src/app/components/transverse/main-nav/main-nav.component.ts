import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {
  @Output() onSelection = new EventEmitter();

  constructor() { }
}
