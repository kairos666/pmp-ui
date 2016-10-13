import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { RouterModule }   from '@angular/router';

/* GLOBAL SERVICES */
import { LocalStorageService } from './services/local-storage.service';
import { ConfigStorageService } from './services/config-storage.service';
import { SocketConnectorService } from './services/socket-connector.service';
import { PmpEngineConnectorService } from './services/pmp-engine-connector.service';
import { ConfigModelService } from './model/config-model.service';
import { LogsService } from './model/logs-model.service';

/* COMPONENTS */
import { AppComponent } from './app.component';
import { MainNavComponent } from './components/transverse/main-nav/main-nav.component';
import { DashboardComponent } from './components/views/dashboard/dashboard.component';
import { ConfigComponent } from './components/views/config/config.component';
import { ConsoleComponent } from './components/views/console/console.component';
import { HelpComponent } from './components/views/help/help.component';
import { HeaderComponent } from './components/transverse/header/header.component';
import { ConsoleOutputComponent } from './components/ui-parts/console-output/console-output.component';

let routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'console', component: ConsoleComponent },
  { path: 'configuration', component: ConfigComponent },
  { path: 'help', component: HelpComponent },
  { path: '', redirectTo:'/dashboard', pathMatch: 'full'},
  { path: '**', redirectTo:'/dashboard', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    DashboardComponent,
    ConsoleComponent,
    ConfigComponent,
    HelpComponent,
    HeaderComponent,
    ConsoleOutputComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    MaterialModule.forRoot()
  ],
  providers: [ConfigModelService, LocalStorageService, ConfigStorageService, SocketConnectorService, PmpEngineConnectorService, LogsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
