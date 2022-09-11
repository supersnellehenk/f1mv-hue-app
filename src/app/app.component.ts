import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from './services/hue/authorization.service';
import { LightService } from './services/hue/light.service';
import { FlagsEnum } from './shared/enum/flags.enum';
import { F1mvService } from './services/f1mv.service';
import { interval, Subject, takeUntil } from 'rxjs';
import { environment } from '../environments/environment';
import { LightGroupService } from './services/hue/light-group.service';
import { ConfigService } from './shared/config.service';
import { DigiFlagComponent } from './components/digi-flag/digi-flag.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'f1mvHueApp';

  public isProd = environment.production;
  public destroy$ = new Subject<void>();
  public isSubbed = false;
  public configService = ConfigService;

  constructor(
    public discoveryService: AuthorizationService,
    public lightService: LightService,
    public lightGroupService: LightGroupService,
    public f1mvService: F1mvService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.f1mvService.flagChange.subscribe((flags: number[]) => {
      const lights = this.lightService.getSyncedLights();
      if (lights.length > 0) {
        if (flags === FlagsEnum.green) {
          this.lightGroupService.flashGroup(
            flags,
            ConfigService.flagBrightness
          );
        } else {
          this.lightGroupService.setGroupColor(
            flags,
            ConfigService.flagBrightness
          );
        }
      }
    });
  }

  public unsubToApi() {
    this.isSubbed = false;
    this.destroy$.next();
  }

  public subToApi() {
    this.isSubbed = true;
    const interval$ = interval(200);
    interval$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.f1mvService.consumeApi().subscribe();
    });
  }

  setLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  getLights() {
    this.lightService.getLights();
    this.lightGroupService.getGroups();
  }

  syncAllLights() {
    this.lightGroupService.editGroup(this.lightService.lights.map(l => l.id));
    const flag = this.f1mvService.flagChange.getValue();
    if (flag === FlagsEnum.green) {
      this.lightGroupService.flashGroup(flag, ConfigService.flagBrightness);
    } else {
      this.lightGroupService.setGroupColor(
        flag,
        this.f1mvService.flagChange.getValue() === FlagsEnum.white
          ? ConfigService.brightness
          : ConfigService.flagBrightness
      );
    }
  }

  unsyncAllLights() {
    this.lightGroupService.setGroupColor(FlagsEnum.white);
    this.lightGroupService.editGroup([]);
  }

  formatLabel(value: number) {
    return ((value / 255) * 100).toFixed(0);
  }

  openDialog() {
    this.dialog.open(DigiFlagComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
    });
  }
}
