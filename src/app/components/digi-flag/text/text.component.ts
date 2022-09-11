import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-digi-flag-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class DigiFlagTextComponent {
  @Input() digiColor: string = 'black';
  @Input() digiText: string = '';
}
