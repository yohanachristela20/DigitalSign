export const getProgress = (document) => {
    if (!document.LogSigns) return "0/0 done";

    const combos = new Map();

    document.LogSigns.forEach((log) => {
        const key = `${log.id_signers}-${log.id_item}`;
        if (!combos.has(key)) {
            combos.set(key, {completed: log.status === "Completed" && log.is_submitted === true ? 1 : 0});
        } else {
            if (log.status === "Completed") combos.get(key).completed = 1;
        }
    });

    const total = combos.size;
    const completed = Array.from (combos.values()).reduce((acc, v) => acc + v.completed, 0);

    return `${completed}/${total} done`;
}