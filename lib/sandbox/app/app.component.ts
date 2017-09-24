import {Component} from '@angular/core';

// export const MY_FORM_MODEL: DynamicFormControlModel[] = [
//
//   new DynamicInputModel({
//
//     id: 'exampleInput',
//     maxLength: 42,
//     placeholder: 'Jméno a příjmení'
//   }),
//
//   new DynamicRadioGroupModel<string>({
//
//     id: 'exampleRadioGroup',
//     options: [
//       {
//         label: 'Option 1',
//         value: 'option-1',
//       },
//       {
//         label: 'Option 2',
//         value: 'option-2'
//       },
//       {
//         label: 'Option 3',
//         value: 'option-3'
//       }
//     ],
//     value: 'option-3'
//   }),
//
//   new DynamicCheckboxModel({
//
//     id: 'exampleCheckbox',
//     label: 'I do agree'
//   })
// ];

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private config: any = {
    widgets: [
      ['name', 'Jméno a příjmení', 'char'],
      ['Adresa',
        ['street', 'Ulice'],
        {id: 'city', label: 'Město'},
        ['zipcode', 'PSČ'],
      ],
    ],
    buttons: [
      ['Uložit'],
      ['Zrušit']
    ]
  };

  private submit(value: any) {
    console.log('form submitted', value);
  }
}
