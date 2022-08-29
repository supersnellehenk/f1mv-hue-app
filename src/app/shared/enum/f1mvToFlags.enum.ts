import {FlagsEnum} from "./flags.enum";

export class F1mvToFlagsEnum {
  public static readonly "OPEN" = FlagsEnum.green;
  public static readonly "CLEAR" = FlagsEnum.green;
  public static readonly "DOUBLE YELLOW" = FlagsEnum.yellow;
  public static readonly "YELLOW" = FlagsEnum.yellow;
  public static readonly "BLUE" = FlagsEnum.blue;
  public static readonly "RED" = FlagsEnum.red;
}

export class TrackStatusToFlagsEnum {
  public static readonly "AllClear" = FlagsEnum.green;
  public static readonly "Yellow" = FlagsEnum.yellow;
  public static readonly "Red" = FlagsEnum.red;
}
