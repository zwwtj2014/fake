<template>
    <div style="margin: 20px;">
        <div style="margin: 20px 0;">
            基础用法：
            <el-input v-model="input" placeholder="请输入内容"></el-input>
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
    </div>
</template>

<script>
export default {
    data(){
        return {
            input: '基础用法',
            input1: '禁用状态',
            input10: '可清空',
            input2: '',
            input21: '',
            input22: '',
            input23: '',
            textarea: '',
            textarea2: '',
            textarea3: ''
        }
    }
}
</script>

