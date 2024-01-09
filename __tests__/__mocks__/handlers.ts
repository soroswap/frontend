import { http, HttpResponse } from 'msw'
import { factory, keys, pairs, tokens } from './__stubs__/api'

const coreUrl = 'http://localhost:8010' 

export const handlers = [
    http.get(`http://127.0.0.1:8010`, ({request, params, cookies})=>{
        console.log('🟢factory intercepted🟢')
        return HttpResponse.json(factory)
    }),
    http.get(`${coreUrl}/api/factory`, ({request, params, cookies})=>{
        console.log('🟢factory intercepted🟢')
        return HttpResponse.json(factory)
    }),
    http.get(`${coreUrl}/api/keys`, ({request, params, cookies})=>{
        console.log('🟢keys intercepted🟢')
        return HttpResponse.json(keys)
    }),
    http.get(`${coreUrl}/api/pairs`, ({request, params, cookies})=>{
        console.log('🟢pairs intercepted🟢')
        return HttpResponse.json(pairs)
    }),
    http.get(`${coreUrl}/api/tokens`, ({request, params, cookies})=>{
        console.log('🟢tokens intercepted🟢')
        return HttpResponse.json(tokens)
    }),
    http.get(`${coreUrl}/api/router`, ({request, params, cookies})=>{
        console.log('🟢router intercepted🟢')
        return HttpResponse.json(tokens)
    })
]