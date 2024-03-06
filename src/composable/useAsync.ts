import {
  ref,
  onBeforeUnmount,
  watch,
  MaybeRef,
  Ref,
  UnwrapRef,
  isRef,
} from "vue";
import { until } from "@vueuse/core";

type UseAsyncOptions = {
  immediate?: boolean;
};

type Shell<T> = {
  data: T extends undefined ? Ref<unknown> : Ref<UnwrapRef<T>>;
  error: Ref<Error | null>;
  pending: Ref<boolean>;
  execute: () => Promise<void>;
  abort: () => void;
};

type UseAsyncStateReturn<Data> = Shell<Data> & PromiseLike<Shell<Data>>;

export const useAsync = <T = unknown>(
  task: MaybeRef<(arg0: AbortController) => Promise<T>>,
  options: UseAsyncOptions = { immediate: true }
): UseAsyncStateReturn<T> => {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const pending = ref(false);

  let abortController: AbortController | null = null;

  const execute = async () => {
    abortController = new AbortController();
    pending.value = true;
    error.value = null;

    try {
      const _task = isRef(task) ? task.value : task;

      const res = (await createCancelablePromise<T>(
        _task,
        abortController
      )) as UnwrapRef<T>;

      data.value = res;
    } catch (err) {
      console.log("Error:", err);
      error.value = err as Error;
    } finally {
      pending.value = false;
    }
  };

  const abort = () => {
    if (abortController) {
      abortController.abort();
      pending.value = false;
    }
  };

  if (options.immediate) {
    execute();
  }

  watch(task, () => {
    if (!pending.value) {
      execute();
    }
  });

  const shell: Shell<T> = {
    data: data as T extends undefined ? Ref<unknown> : Ref<UnwrapRef<T>>,
    error,
    pending,
    execute,
    abort,
  };

  const waitUntilIsLoaded = () => {
    return new Promise<Shell<T>>((resolve, reject) => {
      until(pending)
        .toBe(false)
        .then(() => resolve(shell))
        .catch(reject);
    });
  };

  onBeforeUnmount(() => {
    abort();
  });

  return {
    ...shell,
    // https://javascript.plainenglish.io/the-benefit-of-the-thenable-object-in-javascript-78107b697211
    then(...callback) {
      return waitUntilIsLoaded().then(...callback);
    },
  };
};

class CustomAbortError extends Error {
  constructor() {
    super("The operation was aborted");
    this.name = "AbortError";
  }
}

const createCancelablePromise = <U>(
  executor: (arg0: AbortController) => Promise<U>,
  abortController: AbortController
): Promise<U> => {
  return new Promise<U>((resolve, reject) => {
    // if (abortController) {
    //   window.addEventListener("abort", () => {
    //     reject(new CustomAbortError());
    //   });
    // }

    const wrappedExecutor = () => {
      executor(abortController)
        .then((res) => {
          if (!abortController.signal.aborted) {
            resolve(res);
          } else {
            reject(new CustomAbortError());
          }
        })
        .catch((error) => {
          reject(error);
        });
    };

    wrappedExecutor();
  });
};
