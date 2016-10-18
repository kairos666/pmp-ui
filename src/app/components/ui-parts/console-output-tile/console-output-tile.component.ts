import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-console-output-tile',
  templateUrl: './console-output-tile.component.html',
  styleUrls: ['./console-output-tile.component.scss']
})
export class ConsoleOutputTileComponent {
  @Input() logs:Observable<string>;

  constructor() {}
}
