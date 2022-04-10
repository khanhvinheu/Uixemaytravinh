import request from '@/utils/ApiService'

export function fetchList(query) {
  return request({
    url: 'sanpham',
    method: 'get',
    params: query
  })
}
export function fetchDetailProduct(id) {
  return request({
    url: 'sanpham/'+id,
    method: 'get'   
  })
}


export function createProduct(data) {
  return request({
    url: 'sanpham',
    method: 'post',
    data
  })
}
export function updateProduct(data,id) {

  return request({
    url: 'sanpham/'+id,
    method: 'put',
    params: data
  })
}

export function deleteProduct(id) {
  return request({
    url: 'sanpham/'+id,
    method: 'delete',
  
  })
}
