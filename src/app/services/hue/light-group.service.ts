import { Injectable } from '@angular/core';
import { AuthorizationService } from './authorization.service';
import { HttpClient } from '@angular/common/http';
import { LightGroup } from './group';
import { BehaviorSubject, interval } from 'rxjs';
import { FlagsEnum } from '../../shared/enum/flags.enum';
import addSeconds from 'date-fns/addSeconds';

@Injectable({
  providedIn: 'root',
})
export class LightGroupService {
  private selectedGroup: BehaviorSubject<LightGroup | null> =
    new BehaviorSubject<LightGroup | null>(null);
  private revertToWhiteDate: Date | null = null;

  get group() {
    return this.selectedGroup.getValue();
  }

  get group$() {
    return this.selectedGroup.asObservable();
  }

  constructor(
    private discoveryService: AuthorizationService,
    private http: HttpClient
  ) {
    const interval$ = interval(1000);
    interval$.subscribe(() => {
      if (this.revertToWhiteDate && this.revertToWhiteDate <= new Date()) {
        this.revertToWhiteDate = null;

        this.setGroupColor(FlagsEnum.white);
      }
    });
  }

  public getGroups() {
    this.http
      .get(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/groups`
      )
      .subscribe((resp: Object) => {
        const groups: LightGroup[] = [];
        for (const key in resp) {
          // @ts-ignore
          const group: LightGroup = resp[key];
          group.id = key;
          groups.push(group);
        }
        const f1mvGroup = groups.filter(
          group => group.name.toLowerCase() === 'f1mv'
        );

        if (f1mvGroup.length > 0) {
          this.selectedGroup.next(f1mvGroup[0]);
        }
      });
  }

  public createGroup(lights: string[]) {
    if (this.group) {
      this.editGroup(lights);
      return;
    }

    this.http
      .post(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/groups`,
        {
          name: 'F1MV',
          lights,
        }
      )
      .subscribe(() => {
        this.getGroups();
      });
  }

  public editGroup(lights: string[]) {
    if (!this.group) {
      this.createGroup(lights);
      return;
    }
    if (lights.length === 0) {
      this.deleteGroup();
      return;
    }
    this.http
      .put(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/groups/${
          this.group?.id
        }`,
        {
          lights,
        }
      )
      .subscribe(() => {
        this.getGroups();
      });
  }

  public turnOnGroup() {
    this.http
      .put(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/groups/${
          this.group?.id
        }/action`,
        {
          on: true,
        }
      )
      .subscribe();
  }

  public turnOffGroup() {
    this.http
      .put(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/groups/${
          this.group?.id
        }/action`,
        {
          on: false,
        }
      )
      .subscribe();
  }

  public setGroupColor(color: number[], brightness: number = 77) {
    this.http
      .put(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/groups/${
          this.group?.id
        }/action`,
        {
          on: true,
          xy: color,
          bri: brightness,
        }
      )
      .subscribe();
  }

  private deleteGroup() {
    this.revertToWhiteDate = null;
    this.http
      .delete(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/groups/${
          this.group?.id
        }`
      )
      .subscribe(() => {
        this.selectedGroup.next(null);
      });
  }

  flashGroup(flagColor: number[], brightness: number = 77) {
    this.setGroupColor(flagColor, brightness);
    this.revertToWhiteDate = addSeconds(new Date(), 5);
  }
}
