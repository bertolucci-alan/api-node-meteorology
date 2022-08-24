import { Beach, BeachPosition, IBeach } from '@src/models/beach';

const wavesHeights = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waistHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};

export class Rating {
  constructor(private beach: IBeach) {}

  public getRatingBasedOnWindAndWavePosition(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): number {
    if (wavePosition == windPosition) {
      return 1;
    } else if (this.isWindOffShore(wavePosition, windPosition)) return 5;
    return 3;
  }

  public getRatingForSwellPeriod(period: number): number {
    if (period >= 7 && period < 10) return 2;
    if (period >= 10 && period < 14) return 4;
    if (period >= 14) return 5;
    return 1;
  }

  public getRatingForSwellSize(height: number): number {
    if (
      height >= wavesHeights.ankleToKnee.min &&
      height <= wavesHeights.ankleToKnee.max
    )
      return 2;
    if (
      height >= wavesHeights.waistHigh.min &&
      height <= wavesHeights.waistHigh.max
    )
      return 3;
    if (height >= wavesHeights.headHigh.min) return 5;
    return 1;
  }

  public getPositionFromLocation(coordinates: number): BeachPosition {
    if (coordinates >= 310 || (coordinates >= 0 && coordinates < 50))
      return BeachPosition.N;
    if (coordinates >= 50 && coordinates < 120) return BeachPosition.E;
    if (coordinates >= 120 && coordinates < 220) return BeachPosition.S;
    if (coordinates >= 220 && coordinates < 310) return BeachPosition.W;
    return BeachPosition.E;
  }

  private isWindOffShore(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): boolean {
    // return (
    //   wavePosition === this.beach.position &&
    //   ((wavePosition === BeachPosition.N && windPosition === BeachPosition.S) ||
    //     (wavePosition === BeachPosition.S &&
    //       windPosition === BeachPosition.N) ||
    //     (wavePosition === BeachPosition.E &&
    //       windPosition === BeachPosition.W) ||
    //     (wavePosition === BeachPosition.W && windPosition === BeachPosition.E))
    // );
    return (
      wavePosition === this.beach.position &&
      ('NESW'.indexOf(wavePosition) + 'NESW'.indexOf(windPosition)) % 2 == 0
    );
  }
}
