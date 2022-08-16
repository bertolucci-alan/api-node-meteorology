export interface IBeach {
  lat: number;
  lng: number;
  name: string;
  position: BeachPosition;
  user: string;
}

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}
