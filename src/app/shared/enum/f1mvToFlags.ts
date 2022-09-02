import { FlagsEnum } from './flags.enum';

export class F1mvToFlags {
  public static readonly 'OPEN' = FlagsEnum.green;
  public static readonly 'CLEAR' = FlagsEnum.green;
  public static readonly 'DOUBLE YELLOW' = FlagsEnum.yellow;
  public static readonly 'YELLOW' = FlagsEnum.yellow;
  public static readonly 'BLUE' = FlagsEnum.blue;
  public static readonly 'RED' = FlagsEnum.red;
}

export class TrackStatusToFlags {
  public static readonly 'AllClear' = FlagsEnum.green;
  public static readonly 'Yellow' = FlagsEnum.yellow;
  public static readonly 'Red' = FlagsEnum.red;
}

export enum TrackStatus {
  ALL_CLEAR = 'AllClear',
  YELLOW = 'Yellow',
  RED = 'Red',
}

export enum Flag {
  GREEN = 'green',
  BLUE = 'blue',
  RED = 'red',
  YELLOW = 'yellow',
  PURPLE = 'purple',
}

export const trackStatusToFlagMapping: { [trackStatus in TrackStatus]: Flag } =
  {
    [TrackStatus.RED]: Flag.RED,
    [TrackStatus.ALL_CLEAR]: Flag.GREEN,
    [TrackStatus.YELLOW]: Flag.YELLOW,
  };

export const flagToHueColorMapping: { [flag in Flag]: number[] } = {
  [Flag.GREEN]: FlagsEnum.green,
  [Flag.BLUE]: FlagsEnum.blue,
  [Flag.RED]: FlagsEnum.red,
  [Flag.YELLOW]: FlagsEnum.yellow,
  [Flag.PURPLE]: FlagsEnum.purple,
};
