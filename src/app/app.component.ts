import { Component } from '@angular/core';
import {DiscoveryService} from "./services/hue/discovery.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'f1mvHueApp';

  constructor(public discoveryService: DiscoveryService) {
  }
}
