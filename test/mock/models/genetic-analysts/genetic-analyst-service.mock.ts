export const geneticAnalystServiceDataMock = {
  id: 'string',
  ownerId: 'string',
  info: {
    name: 'string',
    pricesByCurrency: [
      {
        currency: 'DAI',
        totalPrice: BigInt('1000000000000000000'),
        priceComponents: [
          {
            component: 'string',
            value: BigInt('900000000000000000'),
          },
        ],
        additionalPrices: [
          {
            component: 'string',
            value: BigInt('100000000000000000'),
          },
        ],
      },
    ],
    expectedDuration: {
      duration: '1',
      durationType: 'WorkingDays',
    },
    description: 'string',
    testResultSample: 'string',
  },
};
