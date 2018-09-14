<template>
    <div style="margin: 20px;">
        <div style="margin: 20px 0;">
            <form action="">
            基础用法：
            <el-input v-model="input" autoComplete="on" placeholder="请输入内容"></el-input>
            <button type="submit">Submit</button>
            </form>
        </div>
        <div style="margin: 20px 0;">
            禁用状态：
            <el-input placeholder="请输入内容" v-model="input1" :disabled="true"></el-input>
        </div>
        <div style="margin: 20px 0;">
            可清空：
            <el-input placeholder="请输入内容" v-model="input10" clearable></el-input>
        </div>
        <div style="margin-top: 20px;">
            带icon的输入框——属性方式：
            <el-input
                placeholder="请选择日期"
                suffix-icon="el-icon-date"
                v-model="input2">
            </el-input>
            <el-input
                placeholder="请输入内容"
                prefix-icon="el-icon-search"
                v-model="input21">
            </el-input>
        </div>
        <div style="margin-bottom: 20px;">
            带icon的输入——slot 方式：
            <el-input placeholder="请选择日期" v-model="input22">
                <i slot="suffix" class="el-input__icon el-icon-date"></i>
            </el-input>
            <el-input placeholder="请输入内容" v-model="input23">
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
        </div>

        <div style="margin: 20px 0;">
            文本域:
            <el-input
                type="textarea"
                :rows="2"
                placeholder="请输入内容"
                v-model="textarea">
            </el-input>
        </div>

        <div style="margin: 20px 0;">
            可自适应文本高度的文本域:
            <el-input
                type="textarea"
                autosize
                placeholder="请输入内容"
                v-model="textarea2">
            </el-input>
            <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4}"
                placeholder="请输入内容"
                v-model="textarea3">
            </el-input>
        </div>

        <div style="margin: 20px 0;">
            复合型输入框:
            <div>
                <el-input placeholder="请输入内容" v-model="input3">
                    <template slot="prepend">Http://</template>
                </el-input>
            </div>

            <div style="margin-top: 15px;">
                <el-input placeholder="请输入内容" v-model="input4">
                    <template slot="append">.com</template>
                </el-input>
            </div>

            <!-- <div style="margin-top: 15px;">
                <el-input placeholder="请输入内容" v-model="input5" class="input-with-select">
                    <el-select v-model="select" slot="prepend" placeholder="请选择">
                    <el-option label="餐厅名" value="1"></el-option>
                    <el-option label="订单号" value="2"></el-option>
                    <el-option label="用户电话" value="3"></el-option>
                    </el-select>
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div> -->
        </div>

        <div style="margin: 20px 0;">
            尺寸：
            <div class="demo-input-size">
                <el-input
                    tabindex="1"
                    placeholder="请输入内容"
                    suffix-icon="el-icon-date"
                    v-model="input6">
                </el-input>
                <el-input
                    size="medium"
                    tabindex="3"
                    placeholder="请输入内容"
                    suffix-icon="el-icon-date"
                    v-model="input7">
                </el-input>
                <el-input
                    size="small"
                    tabindex="2"
                    placeholder="请输入内容"
                    suffix-icon="el-icon-date"
                    v-model="input8">
                </el-input>
                <el-input
                    size="mini"
                    tabindex="4"
                    placeholder="请输入内容"
                    suffix-icon="el-icon-date"
                    v-model="input9">
                </el-input>
            </div>
        </div>

        <div style="margin: 20px 0;"></div>
    </div>
</template>

<script>
export default {
  name:'TInput',
  data(){
      return {
          input: '基础用法',
          input1: '禁用状态',
          input10: '可清空',
          input2: '123456',
          input21: '',
          input22: '',
          input23: '',
          textarea: '',
          textarea2: '',
          textarea3: '',
          input3: '',
          input4: '',
          input5: '',
          select: '',
          input6: '',
          input7: '',
          input8: '',
          input9: ''
      }
  }
}
</script>

<style scoped>
.el-select .el-input {
  width: 130px;
}
</style>
