export function round(num: number, decimals: number) {
    const pow = 10 ** decimals; // TODO: Use the faster method for 32 bit numbers
    return Math.round((num + Number.EPSILON) * pow) / pow;
}
