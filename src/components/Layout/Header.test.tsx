import { ThemeProvider } from 'soroswap-ui';
import { screen, render } from '@testing-library/react';
import { expect, test, it, describe } from 'vitest';

import MySorobanReactProvider from 'soroban/MySorobanReactProvider';
import { theme } from 'soroswap-ui';
import Header from 'components/Layout/Header';

describe('Header component', () => {
  beforeEach(() => {
    render(
      <ThemeProvider theme={theme('dark')}>
        <MySorobanReactProvider>
          <Header isDrawerOpen={false} setDrawerOpen={() => {}} />
        </MySorobanReactProvider>
      </ThemeProvider>,
    );
  });

  test('The navbar is rendered', async () => {
    const navbar = await screen.findByTestId('nav');
    expect(navbar).toBeDefined();
  });
  test('All the navbar links are rendered', async () => {
    const expected_links = ['Balance', 'Swap', 'Liquidity'];
    const links = [];
    for (const link in expected_links) {
      const element = expected_links[link];
      const exists = await screen.findByText(element);
      if (exists) {
        links.push(exists);
      }
    }

    expect(links.length).toBe(expected_links.length);
  });
});
