import request from '@/utils/ApiService'

export function fetchListSupplier(query) {
  return request({
    url: 'nha_cung_cap',
    method: 'get',
    params: query
  })
}
