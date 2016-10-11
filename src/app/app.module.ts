import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { RouterModule }   from '@angular/router';

import { AppComponent } from './app.component';
import { MainNavComponent } from './components/transverse/main-nav/main-nav.component';
import { DashboardComponent } from './components/views/dashboard/dashboard.component';
import { ConfigComponent } from './components/views/config/config.component';
import { ConsoleComponent } from './components/views/console/console.component';
import { HelpComponent } from './components/views/help/help.component';
import { HeaderComponent } from './components/transverse/header/header.component';

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
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    MaterialModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
