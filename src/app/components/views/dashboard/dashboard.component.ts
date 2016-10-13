import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private dogs = [
    {rows: 2, name: 'Mal', human: 'Jeremy', age: 5},
    {rows: 1, name: 'Molly', human: 'David', age: 5},
    { rows: 1, name: 'Sophie', human: 'Alex', age: 8},
    {rows: 2, name: 'Taz', human: 'Joey', age: '11 weeks'},
    { rows: 1, name: 'Kobe', human: 'Igor', age: 5},
    {rows: 2, name: 'Porter', human: 'Kara', age: 3},
    { rows: 1, name: 'Stephen', human: 'Stephen', age: 8},
    {rows: 1, name: 'Cinny', human: 'Jules', age: 3},
    { rows: 1, name: 'Hermes', human: 'Kara', age: 3},
  ];
  constructor() { }

  ngOnInit() {
  }

}
