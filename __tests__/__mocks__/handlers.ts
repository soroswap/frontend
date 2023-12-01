import { http, HttpResponse } from 'msw'
import { factory, keys, pairs, tokens } from './__stubs__/api'

const coreUrl = 'http://127.0.0.1:8010' 

export const handlers = [
    http.get(`${coreUrl}`, ({request, params, cookies})=>{
        return HttpResponse.json('isHealthy')
    }),
    http.get(`${coreUrl}/factory`, ({request, params, cookies})=>{
        return HttpResponse.json(factory)
    }),
    http.get(`${coreUrl}/keys`, ({request, params, cookies})=>{
        return HttpResponse.json(keys)
    }),
    http.get(`${coreUrl}/pairs`, ({request, params, cookies})=>{
        return HttpResponse.json(pairs)
    }),
    http.get(`${coreUrl}/tokens`, ({request, params, cookies})=>{
        return HttpResponse.json(tokens)
    }),
    http.get(`${coreUrl}/router`, ({request, params, cookies})=>{
        console.log('router')
        return HttpResponse.json(tokens)
    }),
    
]