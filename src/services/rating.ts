import { ForecastPoint } from '@src/clients/types/ForecastPoint';
import { GeoPosition, IBeach } from '@src/models/beach';

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

  public getRateForPoint(point: ForecastPoint): number {
    //get directions
    const swellDirection = this.getPositionFromLocation(point.swellDirection);
    const windDirection = this.getPositionFromLocation(point.windDirection);
    //get rating
    const windAndWaveRating = this.getRatingBasedOnWindAndWavePosition(
      swellDirection,
      windDirection
    );
    const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
    const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);
    //calculating final rating
    const finalRating =
      (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3;
    return Math.round(finalRating);
  }

  public getRatingBasedOnWindAndWavePosition(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
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

  public getPositionFromLocation(coordinates: number): GeoPosition {
    if (coordinates < 50) return GeoPosition.N;
    if (coordinates < 120) return GeoPosition.E;
    if (coordinates < 220) return GeoPosition.S;
    if (coordinates < 310) return GeoPosition.W;
    return GeoPosition.N;
  }

  private isWindOffShore(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): boolean {
    // return (
    //   wavePosition === this.beach.position &&
    //   ((wavePosition === GeoPosition.N && windPosition === GeoPosition.S) ||
    //     (wavePosition === GeoPosition.S &&
    //       windPosition === GeoPosition.N) ||
    //     (wavePosition === GeoPosition.E &&
    //       windPosition === GeoPosition.W) ||
    //     (wavePosition === GeoPosition.W && windPosition === GeoPosition.E))
    // );
    return (
      wavePosition === this.beach.position &&
      ('NESW'.indexOf(wavePosition) + 'NESW'.indexOf(windPosition)) % 2 == 0
    );
  }
}
