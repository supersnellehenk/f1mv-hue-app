import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-digi-flag-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss'],
})
export class DigiFlagFullComponent {
  @Input() digiColor: string = 'black';
}
