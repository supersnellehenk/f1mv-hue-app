import { Injectable } from '@angular/core';
import { AuthorizationService } from './authorization.service';
import { HttpClient } from '@angular/common/http';
import { LightGroup } from './group';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LightGroupService {
  private selectedGroup: BehaviorSubject<LightGroup | null> =
    new BehaviorSubject<LightGroup | null>(null);

  get group() {
    return this.selectedGroup.getValue();
  }

  get group$() {
    return this.selectedGroup.asObservable();
  }

  constructor(
    private discoveryService: AuthorizationService,
    private http: HttpClient
  ) {}

  public getGroups() {
    this.http
      .get(
        `http://${
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
        `http://${
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
        `http://${
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
        `http://${
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
        `http://${
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
        `http://${
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
    this.http
      .delete(
        `http://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/groups/${
          this.group?.id
        }`
      )
      .subscribe(() => {
        this.selectedGroup.next(null);
      });
  }
}
