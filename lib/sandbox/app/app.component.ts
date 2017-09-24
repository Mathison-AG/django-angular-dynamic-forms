import {Component} from '@angular/core';

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private config = {
    layout: [
      ['name', 'Jméno a příjmení', 'string'],
      ['Adresa',
        ['street', 'Ulice'],
        {id: 'city', label: 'Město'},
        ['zipcode', 'PSČ'],
      ],
    ],
    actions: [
      ['Ulož'],
      ['Zpět']
    ]
  };

  private url = 'http://localhost:8000/api/1.0/cities/1/';

  private submit(value: any) {
    console.log('form submitted', value);
  }

  private cancel(value: any) {
    console.log('form cancelled', value);
  }
}
