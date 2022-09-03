import { Component, Input } from '@angular/core';
import { faLightbulb } from '@fortawesome/free-regular-svg-icons';
import { Light } from '../../services/hue/light';
import { LightService } from '../../services/hue/light.service';
import { FlagsEnum } from '../../shared/enum/flags.enum';

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.scss'],
})
export class LightComponent {
  public faLightbulb = faLightbulb;
  public yellow = FlagsEnum.yellow;
  public white = FlagsEnum.white;

  @Input() light!: Light;

  constructor(public lightService: LightService) {}

  toggleSync() {
    this.lightService.toggleSync(this.light);
  }

  isSynced() {
    return this.lightService.checkIfSynced(this.light);
  }
}
