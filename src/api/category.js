import request from '@/utils/ApiService'

export function fetchListCate(query) {
  return request({
    url: 'danh_muc',
    method: 'get',
    params: query
  })
}
