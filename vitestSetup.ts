// vitestSetup.ts
import { afterAll, afterEach, beforeAll, beforeEach} from "vitest"
import { server } from "./__tests__/__mocks__/server"

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  server.events.on('request:unhandled', ({ request, requestId }) => {
    console.log('🟠🟠unhandled🟠🟠')
  })
  vi.mock("next/router", () => require("next-router-mock"));
})
beforeEach(()=>{
})
afterEach(()=>{ server.resetHandlers() })
afterAll(()=>{ server.close() })