import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from './services/hue/authorization.service';
import { LightService } from './services/hue/light.service';
import { FlagsEnum } from './shared/enum/flags.enum';
import { F1mvService } from './services/f1mv.service';
import { interval, Subject, takeUntil } from "rxjs";
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'f1mvHueApp';

  public yellow = FlagsEnum.yellow;
  public white = FlagsEnum.white;

  public isProd = environment.production;
  public destroy$ = new Subject<null>();

  constructor(
    public discoveryService: AuthorizationService,
    public lightService: LightService,
    public f1mvService: F1mvService
  ) {}

  ngOnInit(): void {
    this.f1mvService.flagChange.subscribe((flags: number[]) => {
      if (this.lightService.lights.length > 0) {
        for (let i = 0; i < 4; i++) {
          if (flags === FlagsEnum.green) {
            this.lightService.flashFlag(
              this.lightService.lights[i],
              flags,
              254
            );
          } else {
            this.lightService.setLightColor(
              this.lightService.lights[i],
              flags,
              254
            );
          }
        }
      }
    });
  }

  public subToApi() {
    const interval$ = interval(200);
    interval$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.f1mvService.consumeApi().subscribe();
    });
  }
}
