export function diffObjects(oldObj: any, newObj: any): string[] {
    const diffs: string[] = [];

    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    allKeys.forEach((key) => {
        const oldVal = JSON.stringify(oldObj?.[key]);
        const newVal = JSON.stringify(newObj?.[key]);

        if (oldVal === undefined) {
            diffs.push(`➕ Ajout de "${key}" : ${newVal}`);
        } else if (newVal === undefined) {
            diffs.push(`❌ Suppression de "${key}" : ${oldVal}`);
        } else if (oldVal !== newVal) {
            diffs.push(`🔄 Modification "${key}" : ${oldVal} ➡️ ${newVal}`);
        }
    });

    return diffs;
}  