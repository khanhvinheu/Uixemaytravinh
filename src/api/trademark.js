import request from '@/utils/ApiService'

export function fetchListTrademark(query) {
  return request({
    url: 'thuong_hieu',
    method: 'get',
    params: query
  })
}
