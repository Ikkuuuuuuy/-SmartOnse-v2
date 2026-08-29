export function getOfficialImageUrl(imagePath: string | null | undefined, name = 'Official'): string {
    if (!imagePath) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9C2007&color=fff`;
    }

    const path = imagePath.replace(/^\//, '');

    if (path.startsWith('images/')) {
        return `/${path}`;
    }

    if (path.startsWith('storage/')) {
        return `/${path}`;
    }

    return `/storage/${path}`;
}

export function isSkOfficial(official: { type?: string; role: string }): boolean {
    if (official.type) {
        return official.type === 'sk';
    }

    return /\bsk\b/i.test(official.role);
}
