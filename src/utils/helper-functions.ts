import { randomBytes } from "crypto";

export const singularize = (name: string): string => {
    if (name.endsWith('s')) {
        return name.slice(0, -1);
    }
    return name;
};

export const randomStringGenerator = (): string => {
    const length = Math.random() * 6;
    const phrase = randomBytes(length).toString('utf8');
    return phrase;
}