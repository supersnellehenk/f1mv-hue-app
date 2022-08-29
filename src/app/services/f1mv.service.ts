import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, tap} from "rxjs";
import {Injectable} from "@angular/core";
import {FlagsEnum} from "../shared/enum/flags.enum";
import {F1mvToFlagsEnum} from "../shared/enum/f1mvToFlags.enum";

@Injectable({
  providedIn: "root"
})
export class F1mvService {
  private f1mvUrl = "http://localhost:10101/api/v1/live-timing/RaceControlMessages";
  public flagChange = new BehaviorSubject<number[]>(FlagsEnum.green);
  private lastMessage = null;

  constructor(private http: HttpClient) {
  }

  public consumeApi() {
    return this.http.get(this.f1mvUrl).pipe(tap((resp: any) => {
      const message = resp.Messages.filter((message: { Category: string; Flag: string; }) => message && message.Category === "Flag").reverse()[0];

      if (JSON.stringify(message) !== JSON.stringify(this.lastMessage)) {
        this.lastMessage = message;
        const keys = Object.keys(F1mvToFlagsEnum).filter((key: string) => message && key === message.Flag);
        if (keys.length === 1) {
          // @ts-ignore
          this.flagChange.next(F1mvToFlagsEnum[keys[0]]);
        }
      }
    }));
  }
}
