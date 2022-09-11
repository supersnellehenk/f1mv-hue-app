import { Component, OnInit } from '@angular/core';
import { F1mvService } from '../../services/f1mv.service';
import { FlagsEnum } from '../../shared/enum/flags.enum';
import {
  Flag,
  TrackStatus,
  TrackStatusMessage,
} from '../../shared/enum/f1mvToFlags';
import addSeconds from 'date-fns/addSeconds';
import { interval } from 'rxjs';

@Component({
  selector: 'app-digi-flag',
  templateUrl: './digi-flag.component.html',
  styleUrls: ['./digi-flag.component.scss'],
})
export class DigiFlagComponent implements OnInit {
  digiColor: string = 'black';
  digiText: string = '';
  private trackStatus: TrackStatus = TrackStatus.ALL_CLEAR;
  private revertToWhiteDate: Date | null = null;

  constructor(private f1mvService: F1mvService) {}

  ngOnInit() {
    this.f1mvService.lastMessage$.subscribe(
      (message: TrackStatusMessage | null) => {
        let flagColor = this.digiColor;

        switch (message?.Message) {
          case TrackStatus.ALL_CLEAR:
            flagColor = Flag.GREEN;
            break;
          case TrackStatus.YELLOW:
            flagColor = Flag.YELLOW;
            break;
          case TrackStatus.SC_DEPLOYED:
          case TrackStatus.VSC_DEPLOYED:
            flagColor = '#f9ed45';
            break;
          case TrackStatus.RED:
            flagColor = Flag.RED;
            break;
        }

        if (flagColor === Flag.GREEN) {
          this.revertToWhiteDate = addSeconds(new Date(), 5);
        } else {
          this.revertToWhiteDate = null;
        }

        this.trackStatus =
          (message?.Message as TrackStatus) ?? TrackStatus.ALL_CLEAR;
        this.digiColor = flagColor;
      }
    );

    const interval$ = interval(1000);
    interval$.subscribe(() => {
      if (this.revertToWhiteDate && this.revertToWhiteDate <= new Date()) {
        this.revertToWhiteDate = null;
        this.digiColor = 'black';
      }
    });
  }

  get fullFlag(): boolean {
    switch (this.trackStatus) {
      case TrackStatus.ALL_CLEAR:
      case TrackStatus.YELLOW:
      case TrackStatus.RED:
        return true;
      default:
        return false;
    }
  }

  get textFlag(): boolean {
    switch (this.trackStatus) {
      case TrackStatus.SC_DEPLOYED:
        this.digiText = 'SC';
        return true;
      case TrackStatus.VSC_DEPLOYED:
        this.digiText = 'VSC';
        return true;
      default:
        this.digiText = '';
        return false;
    }
  }
}
