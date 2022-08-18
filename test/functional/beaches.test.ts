describe('Beaches functional test', () => {
  describe('When creating a beach', () => {
    it('should create a beache with sucess', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest.post('/beaches').send(newBeach);
      expect(response.status).toBe(201);
      //colocando para checar somente os campos relacionados à praia
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });
  });
});
