function wireCopyButtons() {
    document.querySelectorAll(".codewrap").forEach(e => {
        const t = e.querySelector(".copybtn"),
            n = e.querySelector("pre code");
        if (!t || !n) return;
        t.addEventListener("click", async () => {
            const e = n.textContent.replace(/\n$/, "");
            try {
                await navigator.clipboard.writeText(e);
                const n = t.textContent;
                t.textContent = "Tersalin", setTimeout(() => t.textContent = n, 900)
            } catch {
                const n = document.createElement("textarea");
                n.value = e, document.body.appendChild(n), n.select(), document.execCommand("copy"), n.remove();
                const s = t.textContent;
                t.textContent = "Tersalin", setTimeout(() => t.textContent = s, 900)
            }
        })
    })
}
document.addEventListener("DOMContentLoaded", wireCopyButtons)