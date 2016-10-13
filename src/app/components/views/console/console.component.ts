/* tslint:disable:no-unused-variable */
import { Component, ViewChild } from '@angular/core';
import { ConsoleOutputComponent } from '../../ui-parts/console-output/console-output.component';
import { LogsService } from '../../../model/logs-model.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent {
  @ViewChild('consoleOutput') consoleOutput:ConsoleOutputComponent;
  private isClearAllowed                = false;
  private isGoBottomAllowed             = false;
  private logStream:Observable<string[]>;

  constructor(private logsService:LogsService) {
    // handle clearability
    this.logsService.isClearable.subscribe(isClearable => { this.isClearAllowed = isClearable; });
  }

  private onClearClick():void {
    this.logsService.clear();
  }

  private onGoBottomClick():void {
    this.consoleOutput.goToBottom();
  }
}
