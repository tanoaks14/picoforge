const API_BASE = import.meta.env.VITE_API_BASE ?? '';

function toUrl(path: string) {
    if (path.startsWith('http')) return path;
    if (!API_BASE) return path;
    const prefix = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${prefix}${suffix}`;
}

export async function getJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(toUrl(path), {
        ...init,
        headers: {
            Accept: 'application/json',
            ...init.headers,
        },
    });

    if (!res.ok) {
        throw new Error(`Request failed (${res.status} ${res.statusText}) for ${path}`);
    }

    return res.json() as Promise<T>;
}
