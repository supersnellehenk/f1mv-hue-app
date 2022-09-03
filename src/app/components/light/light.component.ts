import { Component, Input, OnInit } from '@angular/core';
import { faLightbulb } from '@fortawesome/free-regular-svg-icons';
import { Light } from '../../services/hue/light';
import { LightService } from '../../services/hue/light.service';
import { FlagsEnum } from '../../shared/enum/flags.enum';
import { LightGroup } from '../../services/hue/group';
import { LightGroupService } from '../../services/hue/light-group.service';

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.scss'],
})
export class LightComponent implements OnInit {
  public faLightbulb = faLightbulb;
  public green = FlagsEnum.green;
  public yellow = FlagsEnum.yellow;
  public red = FlagsEnum.red;
  public white = FlagsEnum.white;
  public isSynced = false;

  @Input() light!: Light;

  constructor(
    public lightService: LightService,
    public lightGroupService: LightGroupService
  ) {}

  ngOnInit(): void {
    this.lightGroupService.group$.subscribe((group: LightGroup | null) => {
      this.isSynced = group?.lights.includes(this.light.id) || false;
    });
  }

  toggleSync() {
    this.lightService.toggleSync(this.light);
  }
}
