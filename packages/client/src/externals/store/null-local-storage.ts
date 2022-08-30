export default class NullLocalStorage implements Storage {
    length = 0;

    getItem(key: string) {
        return null;
    }
    setItem(key: string, value: any) {}

    clear() {}

    key(index: number) {
        return null;
    }

    removeItem(key: string) {}
}
