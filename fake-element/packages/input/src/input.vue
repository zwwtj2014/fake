<template>
    <div>
      <template v-if="type !== 'textarea'">
        <input v-bind="$attrs" type="text">
      </template>
      <textarea v-else></textarea>
    </div>
</template>

<script>
export default {
  name: 'ElInput',
  componentName: 'ElInput',
  mixins: [],
  props: {
    type: {
      type: String,
      default: 'text'
    }
  }
};
</script>

