<script lang="ts">
import { ref } from "vue";
import { useAsync } from "../composable/useAsync";
export default {
  setup() {
    // const task_1 = () => {
    //   return new Promise<string>((resolve) => {
    //     setTimeout(() => resolve(Math.random().toString(35).slice(1)), 2000);
    //   });
    // };

    // const task_2 = async () => {
    //   return new Promise<string>((resolve) => {
    //     setTimeout(() => resolve(Math.random().toString(35).slice(1)), 1000);
    //   });
    // };

    // const taskRef = ref(task_1);

    // const { data, error, pending, execute, abort } = await useAsync<string>(
    //   taskRef
    // );

    // const reExecute = () => {
    //   taskRef.value = task_2;
    // };

    // return { data, error, pending, execute, abort, reExecute };
    // let id = 1;
    // const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
    // const posts = await res.json();

    const task = useAsync(async ({ signal }) => {
      return new Promise<string>((resolve) => {
        setTimeout(() => console.log("sss"), 2000);
      });
    });

    return { task };
  },
};
</script>

<template>
  <!-- <div class="card">
    data: {{ data }} <br />
    pending: {{ pending }} <br />
    error: {{ error }} <br />
    <button type="button" @click="execute">Fetch</button>
    <button type="button" @click="abort">cancel</button>
  </div> -->
  <div>
    {{ task.data }}
    {{ task.pending }}
    {{ task.error }}
    <button type="button" @click="task.execute" :disabled="task.pending.value">
      {{ task.pending.value ? "loading..." : "Fetch" }}
    </button>
    <button type="button" @click="task.abort">cancel</button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
