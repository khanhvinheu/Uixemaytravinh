<template>
  <div class="app-container">
      <el-form ref="dataForm" :rules="rules" :model="form" label-position="left" label-width="200px" style="padding-left:40px">       
            <el-form-item label="Mã sản phẩm">
                <el-input v-model="form.maSanPham" readonly type="text"/>
            </el-form-item>
            <el-form-item label="Tên sản phẩm">
              <el-input v-model="form.tenSanPham" type="text"  />
            </el-form-item>
            <el-form-item label="Giá nhập">
              <el-input v-model="form.giaNhap" type="number" />
            </el-form-item>
            <el-form-item label="Giá bán">
              <el-input v-model="form.giaBan" type="number"  />
            </el-form-item>
            <el-form-item label="Tên khách bán">
              <el-input v-model="form.tenKhachBan" type="text"  />
            </el-form-item>
            <el-form-item label="SĐT khách bán">
              <el-input v-model="form.sdtKhachban"  type="text" />
            </el-form-item>
            <el-form-item label="Số máy">
              <el-input v-model="form.soMay" type="text" />
            </el-form-item>
            <el-form-item label="Hồ sơ">
              <el-input v-model="form.hoSo" type="text" />
            </el-form-item>
            <el-form-item label="Tình trạng bảo hành">
              <el-input v-model="form.tinhTrangBaoHanh" type="text" />
            </el-form-item>
            <el-form-item label="Ngày mua">              
                  <el-date-picker v-model="form.ngayMua" value-format="yyyy-MM-dd" type="datetime" placeholder="Chọn ngày" />
            </el-form-item>         
            <el-form-item label="Danh mục">
                <el-select v-model="form.idDanhMuc" style="width: 100%">
                  <el-option v-for="item in dataSelect.category" :key="item.key" :label="item.tenDanhMuc" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="Thương hiệu">
                <el-select v-model="form.idThuongHieu" style="width: 100%">
                  <el-option v-for="item in dataSelect.tradeMark" :key="item.key" :label="item.tenThuongHieu" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="Nhà cung cấp" >
                <el-select v-model="form.idNhacCungCap" style="width: 100%" >
                  <el-option v-for="item in dataSelect.supplier" :key="item.key" :label="item.tenNCC" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="Mô tả">              
              <tinymce :height="300" v-model="form.moTa"/>     
            </el-form-item>  
            <el-form-item label="Hình ảnh">              
              <div class="upload-container">
                 <el-upload
                    :data="form.hinhAnh"
                    :multiple="true"
                    :file-list="fileList"
                    :show-file-list="true"
                    :on-remove="handleRemove"
                    :on-success="handleSuccess"
                    :before-upload="beforeUpload"
                    accept="video/*,image/png,image/gif,image/jpg,image/jpeg"
                    class="editor-slide-upload"
                    action="https://httpbin.org/post"
                    list-type="picture-card">                
                    <el-button size="small" type="primary">
                    Click upload
                    </el-button>
                </el-upload>
        </div>  
        </el-form-item>  
          <el-form-item>
               <el-button  @click="$router.push({name:'List'})">
                    Cancel
                </el-button>
                <el-button type="primary" @click="isUpdate?updateData(): createData()">
                    Confirm
                </el-button>
          </el-form-item>       
      </el-form>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import {fetchDetailProduct, fetchPv, createProduct, updateProduct } from '@/api/product'
import {fetchListCate} from '@/api/category'
import {fetchListTrademark} from '@/api/trademark'
import {fetchListSupplier} from '@/api/supplier'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]
// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination ,Tinymce},
  directives: { waves },
  
  data() {
    return {
      tableKey: 0,
      // data
      fileList: [],
      listObj: {},
      isShowVideo: false,
      list: null,
      dataSelectQuery:{
        page:1,
        limit:99999
      },
      dataSelect:{
        category: null,
        tradeMark:null,
        supplier:null
      },       
      imageUrl:'',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id',
        search:''
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      form:{},
      dialogFormVisible: false,
      dialogVisible: false,
      dialogImageUrl:'',
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Thêm Mới'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      isUpdate:false,
      dataUpdate:[]
    }
  },
  created() {
    
    if(this.$route.params && this.$route.params.id){
    //  alert(this.$route.params.id);
      fetchDetailProduct(this.$route.params.id).then(response=>{
        this.form= response.data   
        this.fileList= [{url: 'http://localhost:8000/'+this.form.hinhAnh}]
      })
      this.isUpdate=true
    }
     
    this.initPage()
  },
  methods: {    
    initPage(){         
      this.getCategory()
      this.getTradeMark()
      this.getSupplier()
      !this.isUpdate && (this.form.maSanPham = 'SP'+ parseInt(Math.random() * 100) + 1024)// mock a id
      this.isUpdate && this.getDetailProduct()
    },    
    handleSuccess(response, file) {        
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          this.listObj[objKeyArr[i]].url = response.files.file
          this.listObj[objKeyArr[i]].hasSuccess = true
          return
        }
      }
    
    },
    handleRemove(file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          delete this.listObj[objKeyArr[i]]
          return
        }
      }
    },
    async beforeUpload(file) {       
      this.form.hinhAnh = file     
      const _self = this
      const _URL = window.URL || window.webkitURL
      const fileName = file.uid
      this.listObj[fileName] = {}
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = _URL.createObjectURL(file)
        img.onload = function() {
          _self.listObj[fileName] = { hasSuccess: false, uid: file.uid, width: this.width, height: this.height }
        }
        resolve(true)
      })
    },
    checkPixel(file, dimensions) {
      return new Promise((resolve, reject) => {
        let isDimension = false;
        const img = new Image();
        img.src = URL.createObjectURL(file.raw);
        img.onload = function () {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          const [widthRule, heightRule] = dimensions.split('x');
          if (width === +widthRule && height === +heightRule) {
            isDimension = true;
          }
          resolve(isDimension);
        };
        img.onerror = reject;
      });
    },
    getDetailProduct(){        
      
    
        // this.form.tenSanPham=data.tenSanPham
    },
    getCategory(){
      fetchListCate(this.dataSelectQuery).then(response=>{
        this.dataSelect.category = response.data
      })
    },
    getTradeMark(){
      fetchListTrademark(this.dataSelectQuery).then(response=>{
        this.dataSelect.tradeMark = response.data
      })
    },
    getSupplier(){
      fetchListSupplier(this.dataSelectQuery).then(response=>{
        this.dataSelect.supplier = response.data
      })
    },    
    createData() {           
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
        this.form.maSanPham = 'SP'+ parseInt(Math.random() * 100) + 1024 // mock a id
        var formData = new FormData()
        formData.append('hinhAnh', this.form.hinhAnh)
        formData.append('giaNhap', this.form.giaNhap)
        formData.append('giaBan', this.form.giaBan)
        formData.append('hoSo', this.form.hoSo)
        formData.append('idDanhMuc', this.form.idDanhMuc)
        formData.append('idNhacCungCap', this.form.idNhacCungCap)
        formData.append('idThuongHieu', this.form.idThuongHieu)       
        formData.append('moTa', this.form.moTa)
        formData.append('ngayMua', this.form.ngayMua)
        formData.append('sdtKhachban', this.form.sdtKhachban)
        formData.append('soMay', this.form.soMay)
        formData.append('tenKhachBan', this.form.tenKhachBan)
        formData.append('tenSanPham', this.form.tenSanPham)
        formData.append('maSanPham', this.form.maSanPham)
        formData.append('tinhTrangBaoHanh', this.form.tinhTrangBaoHanh)
          createProduct( formData).then(() => {            
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
            this.form.maSanPham = 'SP'+ parseInt(Math.random() * 100) + 1024 // mock a id
        
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      // this.$refs['dataForm'].validate((valid) => {
      //   if (valid) {
      //     const tempData = Object.assign({}, this.temp)
      //     tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      //     updateArticle(tempData).then(() => {
      //       const index = this.list.findIndex(v => v.id === this.temp.id)
      //       this.list.splice(index, 1, this.temp)
      //       this.dialogFormVisible = false
      //       this.$notify({
      //         title: 'Success',
      //         message: 'Update Successfully',
      //         type: 'success',
      //         duration: 2000
      //       })
      //     })
      //   }
      // })
       this.$refs['dataForm'].validate((valid) => {
        if (valid) {        
        var formData = new FormData()
        formData.append('id', this.form.id)
        formData.append('hinhAnh', this.form.hinhAnh)
        formData.append('giaNhap', this.form.giaNhap)
        formData.append('giaBan', this.form.giaBan)
        formData.append('hoSo', this.form.hoSo)
        formData.append('idDanhMuc', this.form.idDanhMuc)
        formData.append('idNhacCungCap', this.form.idNhacCungCap)
        formData.append('idThuongHieu', this.form.idThuongHieu)       
        formData.append('moTa', this.form.moTa)
        formData.append('ngayMua', this.form.ngayMua)
        formData.append('sdtKhachban', this.form.sdtKhachban)
        formData.append('soMay', this.form.soMay)
        formData.append('tenKhachBan', this.form.tenKhachBan)
        formData.append('tenSanPham', this.form.tenSanPham)       
        formData.append('tinhTrangBaoHanh', this.form.tinhTrangBaoHanh)
          updateProduct( formData, this.form.id).then(() => {            
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })          
        
          })
        }
      })

    },
    
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  },
   computed: {
    
  },
}
</script>
