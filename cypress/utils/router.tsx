import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { NextRouter } from 'next/router';

const createRouter = (params: Partial<NextRouter>) => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '',
  defaultLocale: 'en',
  domainLocales: [],
  isLocaleDomain: false,
  push: cy.spy().as('push'),
  replace: cy.spy().as('replace'),
  reload: cy.spy().as('reload'),
  back: cy.spy().as('back'),
  forward: cy.spy().as('forward'),
  prefetch: cy.stub().as('prefetch').resolves(),
  beforePopState: cy.spy().as('beforePopState'),
  events: {
    emit: cy.spy().as('emit'),
    off: cy.spy().as('off'),
    on: cy.spy().as('on'),
  },
  isFallback: false,
  isReady: true,
  isPreview: false,
  ...params,
});

interface MockRouterProps extends Partial<NextRouter> {
  children: React.ReactNode;
}

const MockRouter = ({ children, ...props }: MockRouterProps) => {
  const router = createRouter(props);

  return <RouterContext.Provider value={router}>{children}</RouterContext.Provider>;
};

export default MockRouter;
