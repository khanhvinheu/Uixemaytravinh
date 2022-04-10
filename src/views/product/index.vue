<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.search" placeholder="Nhập để tìm kiếm" style="width: 400px;" class="filter-item" @keyup.enter.native="handleFilter" />   
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter"> 
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>  
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      max-height="600"      
      @sort-change="sortChange"
    >
      <el-table-column label="ID"  fixed  align="center" prop="id" width="80" sortable="id" >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Tên sản phẩm"  width="180"  prop="tenSanPham" sortable="tenSanPham"> 
        <template slot-scope="{row}">
          <span>{{ row.tenSanPham }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="Giá nhập"  width="180">
        <template slot-scope="{row}">
          <span>{{ row.giaNhap }} đ</span>
        </template>
      </el-table-column>-->
      <!-- <el-table-column label="Giá bán"   width="180">
        <template slot-scope="{row}">
          <span>{{ row.giaBan}} đ</span>
        </template>
      </el-table-column>  -->
      <el-table-column label="Hồ sơ"  width="180">
        <template slot-scope="{row}">
          <span>{{ row.hoSo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Danh mục"  width="180">
        <template slot-scope="{row}">
          <span>{{ row.danh_muc.tenDanhMuc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Thương hiệu"  width="180">
        <template slot-scope="{row}">
          <span>{{ row.thuong_hieu.tenThuongHieu }}</span>
        </template>
      </el-table-column> 
      <el-table-column label="Nhà cung cấp"  width="180">
        <template slot-scope="{row}">
          <span>{{ row.nha_cung_cap.tenNCC }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Số máy"  width="180">
        <template slot-scope="{row}">
          <span>{{ row.soMay }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Tình trạng bảo hành"  width="180">
        <template slot-scope="{row}">
          <span>{{ row.tinhTrangBaoHanh }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Hình ảnh"  width="110">
        <template slot-scope="{row}">      
       <div class="demo-image__preview" v-if="row.hinhAnh">
        <el-image 
          style="width: 100px; height: 100px"
          :src="'http://localhost:8000/'+ row.hinhAnh"
          :preview-src-list="['http://localhost:8000/'+ row.hinhAnh]">
        </el-image>
      </div>   
        </template>
      </el-table-column>  
      <el-table-column label="Actions"  fixed="right" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="$router.push({name:'updateProduct',params:{id:row.id}})">
            Edit
          </el-button>        
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" f :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />    
  </div>
</template>

<script>
import { fetchList, deleteProduct} from '@/api/product'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,     
      list: null,    
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id',
        search:''
      },
      importanceOptions: [1, 2, 3],         
      sortOptions: [{ label: 'San Pham Ascending', key: '+tenSanPham' }, { label: 'San Pham Descending', key: '--tenSanPham' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    
    initPage(){
      this.getList()
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.count

        // Just to simulate the time of the request
        // setTimeout(() => {
          this.listLoading = false
        // }, 1.5 * 1000)
      })
    },   
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
  
    sortChange(data) {
      const { prop, order } = data  
      this.sortData(order,prop)     
    },
    sortData(order , prop){
      this.listQuery.orderBy = prop
       if (order === 'ascending') {
        this.listQuery.ascending = 1
      } else {
        this.listQuery.ascending = 0
      }
      this.handleFilter()
    },
  
    handleCreate() {      
      this.$router.push({path:'create'})
    },
    handleDelete(row, index) {     
      this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
           deleteProduct(row.id).then(() => {            
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()   
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          });          
        });       
    }    
  }
}
</script>