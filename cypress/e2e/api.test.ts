const endpoints = ['/api/swap', '/api/swap/split', '/api/pairs'];

describe('API origin protection', () => {
  const sendRequestWithOrigin = (endpoint: string, origin: string, shouldBeBlocked: boolean) => {
    return cy.request({
      method: 'POST',
      url: endpoint,
      headers: { Origin: origin },
      failOnStatusCode: false,
    }).then((res) => {
      if (shouldBeBlocked) {
        expect(res.status).to.eq(403);
      } else {
        expect(res.status).to.not.eq(403);
      }
    });
  };

  const validOrigins = [
    'https://app.soroswap.finance',
    'https://paltalabs.vercel.app',
    'http://localhost:3000',
  ];

  const invalidOrigins = [
    'https://evil.com',
    'https://app.soroswap.finance.evil.com',
  ];

  for (const endpoint of endpoints) {
    it(`should allow valid origins for ${endpoint}`, () => {
      for (const origin of validOrigins) {
        cy.log(`Testing origin: ${origin}`);
        sendRequestWithOrigin(endpoint, origin, false);
      }
    });

    it(`should block invalid origins for ${endpoint}`, () => {
      for (const origin of invalidOrigins) {
        cy.log(`Testing origin: ${origin}`);
        sendRequestWithOrigin(endpoint, origin, true);
      }
    });
  }
});

