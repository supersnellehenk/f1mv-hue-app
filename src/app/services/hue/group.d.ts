export interface LightGroup {
  name: string;
  lights: string[];
  sensors: any[];
  type: string;
  state: State;
  recycle: boolean;
  action: Action;
  id: string;
}

export interface State {
  all_on: boolean;
  any_on: boolean;
}

export interface Action {
  on: boolean;
  bri: number;
  hue: number;
  sat: number;
  effect: string;
  xy: number[];
  ct: number;
  alert: string;
  colormode: string;
}
