import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://10.0.2.5:3333', // this is localhost
  // baseURL: 'http://localhost:3333', // this is localhost
  // baseURL: 'http://192.168.0.101:3333/', // this is localhost (multlaszer)
  
  // validateStatus: function () { return true; }
  
  // baseURL: 'http://10.0.0.13:3333/', // this is localhost (telenews)
  baseURL: 'http://192.168.0.101:3333', // this is localhost
  headers: {
    'Access-Control-Allow-Origin': '*',
    Connection: 'keep-alive'
  }
})

export default api