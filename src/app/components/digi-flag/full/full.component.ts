import { Component, OnInit } from '@angular/core';
import { F1mvService } from '../../../services/f1mv.service';
import { Flag } from '../../../shared/enum/f1mvToFlags';
import { FlagsEnum } from '../../../shared/enum/flags.enum';
import { interval } from 'rxjs';
import addSeconds from 'date-fns/addSeconds';

@Component({
  selector: 'app-digi-flag-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss'],
})
export class DigiFlagFullComponent implements OnInit {
  digiColor: string = 'black';
  private revertToWhiteDate: Date | null = null;

  constructor(private f1mvService: F1mvService) {}

  ngOnInit() {
    this.f1mvService.flagChange.subscribe((flags: number[]) => {
      let flagColor = this.digiColor;

      switch (flags) {
        case FlagsEnum.green:
          flagColor = Flag.GREEN;
          break;
        case FlagsEnum.yellow:
          flagColor = Flag.YELLOW;
          break;
        case FlagsEnum.red:
          flagColor = Flag.RED;
          break;
        case FlagsEnum.blue:
          flagColor = Flag.BLUE;
          break;
        case FlagsEnum.purple:
          flagColor = Flag.PURPLE;
          break;
      }

      if (flagColor === Flag.GREEN) {
        this.revertToWhiteDate = addSeconds(new Date(), 5);
      } else {
        this.revertToWhiteDate = null;
      }

      this.digiColor = flagColor;
    });

    const interval$ = interval(1000);
    interval$.subscribe(() => {
      if (this.revertToWhiteDate && this.revertToWhiteDate <= new Date()) {
        this.revertToWhiteDate = null;
        this.digiColor = 'black';
      }
    });
  }
}
