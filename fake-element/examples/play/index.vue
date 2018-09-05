<template>
    <div style="margin: 20px;">
        <el-input v-model="input" placeholder="请输入内容"></el-input>
        <el-input placeholder="请输入内容" v-model="input1" :disabled="true"></el-input>
        <el-input placeholder="请输入内容" v-model="input10" clearable></el-input>
    </div>
</template>

<script>
export default {
    data(){
        return {
            input: '基础用法',
            input1: '禁用状态',
            input10: '可清空'
        }
    }
}
</script>

