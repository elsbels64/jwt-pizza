import { sleep, check } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '30s' },
        { target: 15, duration: '1m' },
        { target: 10, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
}

export function scenario_1() {
  let response

  const vars = {}

  // login
  response = http.put(
    'https://pizza-service.elisew.click/api/auth',
    '{"email":"a@jwt.com","password":"admin"}',
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        origin: 'https://pizza.elisew.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    }
  )
  check(response, { 'status equals 200': response => response.status.toString() === '200' })

  vars['token'] = jsonpath.query(response.json(), '$.token')[0]

  sleep(4)

  // open menu
  response = http.get('https://pizza-service.elisew.click/api/order/menu', {
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      authorization: `Bearer ${vars['token']}`,
      'content-type': 'application/json',
      'if-none-match': 'W/"1fc-cgG/aqJmHhElGCplQPSmgl2Gwk0"',
      origin: 'https://pizza.elisew.click',
      priority: 'u=1, i',
      'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
  })

  // get franchises
  response = http.get('https://pizza-service.elisew.click/api/franchise?page=0&limit=20&name=*', {
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      authorization: `Bearer ${vars['token']}`,
      'content-type': 'application/json',
      'if-none-match': 'W/"b2-Vbk4iLVzMTiEIPSw3HMnOA/f6L0"',
      origin: 'https://pizza.elisew.click',
      priority: 'u=1, i',
      'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
  })
  sleep(3)

  // checkout
  response = http.get('https://pizza-service.elisew.click/api/user/me', {
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      authorization: `Bearer ${vars['token']}`,
      'content-type': 'application/json',
      'if-none-match': 'W/"5e-inVfIKX/Al2rTpPQNZVcNQQTzkQ"',
      origin: 'https://pizza.elisew.click',
      priority: 'u=1, i',
      'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
  })
  sleep(2)

  // pay for order
  response = http.post(
    'https://pizza-service.elisew.click/api/order',
    '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        authorization: `Bearer ${vars['token']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.elisew.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    }
  )
  sleep(2)

  // verify order
  response = http.post(
    'https://pizza-factory.cs329.click/api/order/verify',
    '{"jwt":"eyJpYXQiOjE3NzQ5Mjg4MDgsImV4cCI6MTc3NTAxNTIwOCwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9TcF94VzhlM3kwNk1KS3ZIeW9sRFZMaXZXX2hnTWxhcFZSUVFQVndiY0UifQ.eyJ2ZW5kb3IiOnsiaWQiOiJ3aXJ0aDEwIiwibmFtZSI6IkVsaXNlIFdpcnRobGluIn0sImRpbmVyIjp7ImlkIjoxLCJuYW1lIjoi5bi455So5ZCN5a2XIiwiZW1haWwiOiJhQGp3dC5jb20ifSwib3JkZXIiOnsiaXRlbXMiOlt7Im1lbnVJZCI6MSwiZGVzY3JpcHRpb24iOiJWZWdnaWUiLCJwcmljZSI6MC4wMDM4fV0sInN0b3JlSWQiOiIxIiwiZnJhbmNoaXNlSWQiOjEsImlkIjoxNDR9fQ.GrdcmeDtJ77VmCOflPNJ4REIlVtql78yt8GLDycQgWhIHnIkPceKr6M_vZFMklvZWEc3h8-VpitX2Y8uJmN_z9sfRr3zQggmOt7BfY1tXk7b104Wb7exRKXFbnqpTDvuQaZJNdAWaWNYWDs7O3_sLke-bEGpCe6vsKHxFeLnoA35gpy_gQ_maKWfBB9LPvie8uW5VBSaLOlqBMvEsjDHC6yvaM9VA_Mx9_rTEY-UPuhgHy5SwQQziztc6FZQenFQr22_fMpSnKl7FvxdUFsb8NuZQBI0ABjj0SN4dJClwFS3fVLzwLDejn4KrwYF2DChzEYN5SSz7QOZXmRIdCX3Oxi1VRIyU0xMz73hlXVfhrUTWn5tFNcruBOva9G8GP0pN0klzoRygrhrPv7j9SUQ3WrAfiD1KUOAdvxlM4LQnbNB46fIp50ADuUNcprgYGUBREkNy84wNIeMHhuvuP0tLvdBNRycBgXTYkNeZ9UvIMLI7BWpYhYdwFJI9o8o7GKqmUsWixSeSsMeqJVxn2Jbg-51Xga8_8mK7S73dNx2m4efmhrzVePDe7JrEiGVdBs38D6WYHKXFSYZ1SsdHd-wuBQVzbBoWHqtxnmnZB292gO_1SAwdfH2jVpJ1Ce8JRS2slORJP1U4Wi22Yi8vwq3mZ60UJQe9iUmXKzWd2ULFNw"}',
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        authorization: `Bearer ${vars['token']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.elisew.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-storage-access': 'none',
      },
    }
  )
}
