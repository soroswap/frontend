// vitestSetup.ts
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest"
import { server } from "./__tests__/__mocks__/server"
import { before } from "node:test"

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  server.events.on('newListener', () => {
    console.log('⭕⭕listening⭕⭕')
  })
  server.events.on('request:start', ({ request, requestId }) => {
    console.log('⭕⭕unhandled⭕⭕')
  })
  vi.mock("next/router", () => require("next-router-mock"));
})
beforeEach(()=>{
  server.events.on('request:unhandled', ({ request, requestId }) => {
    console.log('server listening')
  })
})
afterEach(()=>{ server.resetHandlers() })
afterAll(()=>{ server.close() })