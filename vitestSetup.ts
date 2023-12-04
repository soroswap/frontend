// vitestSetup.ts
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest"
import { server } from "./__tests__/__mocks__/server"

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  
  server.events.on('request:start', ({ request, requestId }) => {
    console.log('🟢🟢Request intercepted🟢🟢')
  })
  server.events.on('request:unhandled', ({ request, requestId }) => {
    console.log('🟠🟠unhandled🟠🟠')
  })
  vi.mock("next/router", () => require("next-router-mock"));
})
beforeEach(()=>{
})
afterEach(()=>{ server.resetHandlers() })
afterAll(()=>{ server.close() })