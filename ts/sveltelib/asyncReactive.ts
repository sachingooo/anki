import { Readable, derived } from "svelte/store";

interface AsyncReativeData<T, E> {
    value: Readable<T | null>;
    error: Readable<E | null>;
    loading: Readable<boolean>;
}

function useAsyncReactive<T, E>(
    asyncFunction: () => Promise<T>,
    dependencies: [Readable<unknown>, ...Readable<unknown>[]]
): AsyncReativeData<T, E> {
    const promise = derived(
        dependencies,
        (_, set: (value: Promise<T> | null) => void) => set(asyncFunction()),
        // initialize with null to avoid duplicate fetch on init
        null
    );

    const value = derived(
        promise,
        ($promise, set: (value: T) => void) => {
            $promise?.then((value: T) => set(value));
        },
        null
    );

    const error = derived(
        promise,
        ($promise, set: (error: E | null) => void) => {
            $promise?.catch((error: E) => set(error));
            return () => set(null);
        },
        null
    );

    const loading = derived(
        promise,
        ($promise, set: (value: boolean) => void) => {
            $promise?.finally(() => set(false));
            return () => set(true);
        },
        true
    );

    return { value, error, loading };
}

export default useAsyncReactive;
