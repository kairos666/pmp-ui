import { Component } from '@angular/core';
import { LogsService } from '../../../model/logs-model.service';
import { ConfigModelService } from '../../../model/config-model.service';
import { PmpEngineConnectorService } from '../../../services/pmp-engine-connector.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(
    private logsService:LogsService,
    private configService:ConfigModelService,
    private engineService:PmpEngineConnectorService
  ) {}
}
