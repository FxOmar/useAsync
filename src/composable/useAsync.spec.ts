import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { useAsync } from "./useAsync"; // Adjust the import path as needed

describe("useAsync", () => {
  it("should fetch data successfully", async () => {
    const fetchData = vi.fn(() => Promise.resolve(42));
    const taskRef = ref(fetchData);
    const wrapper = mount({
      template: "<div></div>",
      setup() {
        const { data, error, pending, execute } = useAsync(taskRef, {
          immediate: false,
        });
        return { data, error, pending, execute };
      },
    });
    const vm = wrapper.vm as any;

    await vm.execute();

    expect(fetchData).toHaveBeenCalled();
    expect(vm.data).toBe(42);
    expect(vm.error).toBeNull();
    expect(vm.pending).toBe(false);
  });

  it("should handle errors", async () => {
    const fetchError = vi.fn(() => Promise.reject(new Error("Fetch failed")));
    const taskRef = ref(fetchError);
    const wrapper = mount({
      template: "<div></div>",
      setup() {
        const { data, error, pending, execute } = useAsync(taskRef, {
          immediate: false,
        });
        return { data, error, pending, execute };
      },
    });

    const vm = wrapper.vm as any;

    await vm.execute();

    console.log(vm.error);

    expect(fetchError).toHaveBeenCalled();
    expect(vm.data).toBeNull();
    expect(vm.error.message).toBe("Fetch failed");
    expect(vm.pending).toBe(false);
  });

  it("should re-execute task when ref changes", async () => {
    const fetchData1 = vi.fn(() => Promise.resolve(42));
    const fetchData2 = vi.fn(() => Promise.resolve(99));

    const taskRef = ref(fetchData1);

    const wrapper = mount({
      template: "<div></div>",
      setup() {
        const { data, error, pending, execute } = useAsync(taskRef, {
          immediate: false,
        });
        return { data, error, pending, execute };
      },
    });

    const vm = wrapper.vm as any;

    await vm.execute();

    expect(fetchData1).toHaveBeenCalled();
    expect(vm.data).toBe(42);

    // Change the taskRef
    taskRef.value = fetchData2;

    await vm.$nextTick();
    await vm.execute();

    expect(fetchData2).toHaveBeenCalled();
    expect(vm.data).toBe(99);
  });

  it("should abort the task", async () => {
    const fetchData = vi.fn(
      () => new Promise((resolve) => setTimeout(() => resolve(42), 2000))
    );

    const taskRef = ref(fetchData);

    const wrapper = mount({
      template: "<div></div>",
      setup() {
        const { data, error, pending, execute, abort } = useAsync(taskRef, {
          immediate: false,
        });

        return { data, error, pending, execute, abort };
      },
    });
    const vm = wrapper.vm as any;

    try {
      await vm.execute();
      vm.abort();
    } catch (error) {
      console.log(error);
      expect({}).rejects.toThrow("The operation was aborted");
      expect(vm.pending).toBe(true);
    }
  });
});
