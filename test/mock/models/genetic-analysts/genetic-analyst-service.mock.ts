export const geneticAnalystServiceDataMock = {
  id: 'string',
  ownerId: 'string',
  info: {
    name: 'string',
    pricesByCurrency: [
      {
        currency: 'USDT',
        totalPrice: BigInt('10000000'),
        priceComponents: [
          {
            component: 'string',
            value: BigInt('9000000'),
          },
        ],
        additionalPrices: [
          {
            component: 'string',
            value: BigInt('1000000'),
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
