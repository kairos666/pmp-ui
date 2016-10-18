import { Component, OnInit } from '@angular/core';
import { LogsService } from '../../../model/logs-model.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(
    private logsService:LogsService
  ) {}
}
