import { StormGlass } from '@src/clients/stormGlass';
import axios, { Axios } from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormGlass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormGlass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StormGlass cliente', () => {
  //mockando axios, "as" forçando typescript a inferir os tipos do jest junto com os tipos do axios
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  it('should return the normalize forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });
});
