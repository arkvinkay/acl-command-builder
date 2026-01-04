const $ = e => document.getElementById(e);
let lastMode = null;

function setStatus(e, t) {
    const n = $("statusLine");
    n.innerHTML = "";
    const s = document.createElement("span");
    s.className = e, s.textContent = e === "err" ? "Error:" : e === "ok" ? "Berhasil:" : "Info:";
    const o = document.createElement("span");
    o.textContent = t, n.appendChild(s), n.appendChild(o)
}

function guessTargetTypeFromPath(e) {
    if (!e) return "auto";
    const t = e.trim();
    return /[\\/]$/.test(t) ? "dir" : "auto"
}

function quoteWinPath(e) {
    return e ? (e = String(e), e.includes('"') && (e = e.replace(/"/g, '\\"')), /[\s&()^]/.test(e) ? `"${e}"` : e) : '""'
}

function quoteShPath(e) {
    return e ? (e = String(e), `'${e.replace(/'/g,`'\\''`)}'`) : "''"
}

function joinCommands(e, t) {
    const n = (e || []).map(e => (e || "").trim()).filter(Boolean);
    return n.length === 0 ? "" : t === "oneliner" ? n.join(" && ") : n.join(`
`)
}
async function copyToClipboard(e) {
    if (!e) return;
    try {
        await navigator.clipboard.writeText(e), setStatus("ok", "Perintah berhasil disalin ke clipboard.")
    } catch {
        const e = $("out");
        e.focus(), e.select(), document.execCommand("copy"), setStatus("ok", "Perintah disalin (mode kompatibilitas).")
    }
    setTimeout(() => generate(), 700)
}

function collectWindowsInheritanceFlags(e) {
    const n = e === "this_children" || e === "children";
    if (!n) return "";
    const t = [];
    return $("wOI").checked && t.push("(OI)"), $("wCI").checked && t.push("(CI)"), $("wIO").checked && t.push("(IO)"), $("wNP").checked && t.push("(NP)"), t.join("")
}

function collectWindowsRights() {
    const e = [];
    $("wF").checked && e.push("F"), $("wM").checked && e.push("M"), $("wRX").checked && e.push("RX"), $("wR").checked && e.push("R"), $("wW").checked && e.push("W"), $("wD").checked && e.push("D");
    const t = [];
    if (document.querySelectorAll("[data-wadv]").forEach(e => {
            e.checked && t.push(e.getAttribute("data-wadv"))
        }), t.length > 0) {
        const n = [...t, ...e];
        return "(" + n.join(",") + ")"
    }
    return e.length === 0 ? "" : e.length === 1 ? e[0] : "(" + e.join(",") + ")"
}

function buildWindowsCommands() {
    const d = $("mode").value,
        t = $("winAction").value,
        c = $("path").value.trim(),
        l = $("targetType").value,
        u = l === "auto" ? guessTargetTypeFromPath(c) : l;
    void u;
    const a = $("recursive").checked,
        n = d === "expert" ? $("winRawFlags").value.trim() : "",
        s = $("wContOnErr").checked ? "/c" : "",
        i = $("winCmdJoin").value;
    if (!c && t !== "save" && t !== "restore") throw new Error("Path wajib diisi.");
    const o = quoteWinPath(c),
        e = [];
    if (t === "takeown") {
        const t = ["takeown", "/f", o];
        return a && t.push("/r", "/d", "Y"), $("wTakeownAdmin").checked && t.push("/a"), e.push(t.join(" ")), {
            cmds: e,
            joinMode: i
        }
    }
    if (t === "attrib_ro") {
        const t = $("winAttribMode").value,
            n = $("winAttribTarget").value;
        return n === "recursive" ? e.push(`attrib ${t} ${o} /s /d`) : e.push(`attrib ${t} ${o}`), {
            cmds: e,
            joinMode: i
        }
    }
    if (t === "show") return e.push(`icacls ${o}`), {
        cmds: e,
        joinMode: i
    };
    if (t === "save" || t === "restore") {
        const o = $("winAclFile").value.trim(),
            r = $("winRoot").value.trim();
        if (!o) throw new Error("File cadangan ACL wajib diisi untuk save/restore.");
        if (!r) throw new Error("Root folder wajib diisi untuk save/restore.");
        if (t === "save") {
            let t = r;
            /[\\/]\*$/.test(t) || (t = t.replace(/[\\/]$/, "") + "\\*");
            const i = ["icacls", quoteWinPath(t), "/save", quoteWinPath(o)];
            a && i.push("/t"), s && i.push(s), n && i.push(n), e.push(i.join(" "))
        } else {
            const t = ["icacls", quoteWinPath(r), "/restore", quoteWinPath(o)];
            s && t.push(s), n && t.push(n), e.push(t.join(" "))
        }
        return {
            cmds: e,
            joinMode: i
        }
    }
    if ($("wPreTakeown").checked) {
        const t = ["takeown", "/f", o];
        a && t.push("/r", "/d", "Y"), $("wTakeownAdmin").checked && t.push("/a"), e.push(t.join(" "))
    }
    if ($("wPreReset").checked) {
        const t = ["icacls", o, "/reset"];
        a && t.push("/t"), s && t.push(s), n && t.push(n), e.push(t.join(" "))
    }
    if (t === "reset") {
        const t = ["icacls", o, "/reset"];
        return a && t.push("/t"), s && t.push(s), n && t.push(n), e.push(t.join(" ")), {
            cmds: e,
            joinMode: i
        }
    }
    if (t === "inheritance") {
        const r = $("winInheritanceMode").value,
            t = ["icacls", o, `/inheritance:${r}`];
        return a && t.push("/t"), s && t.push(s), n && t.push(n), e.push(t.join(" ")), {
            cmds: e,
            joinMode: i
        }
    }
    const r = $("winPrincipal").value.trim();
    if (["grant", "grant_r", "deny", "remove", "setowner"].includes(t) && !r) throw new Error("Principal wajib diisi untuk aksi ini.");
    if (t === "setowner") {
        const t = ["icacls", o, "/setowner", r];
        return a && t.push("/t"), s && t.push(s), n && t.push(n), e.push(t.join(" ")), {
            cmds: e,
            joinMode: i
        }
    }
    if (t === "remove") {
        const t = ["icacls", o, "/remove", r];
        return a && t.push("/t"), s && t.push(s), n && t.push(n), e.push(t.join(" ")), {
            cmds: e,
            joinMode: i
        }
    }
    if (["grant", "grant_r", "deny"].includes(t)) {
        const c = $("winApplyScope").value;
        c === "children" && !$("wIO").checked && ($("wIO").checked = !0);
        const u = c === "this_children" || c === "children";
        if (u) {
            const e = $("wOI").checked || $("wCI").checked;
            if (!e) {
                const e = $("winApplyTo").value;
                e === "files" ? $("wOI").checked = !0 : e === "folders" ? $("wCI").checked = !0 : ($("wOI").checked = !0, $("wCI").checked = !0)
            }
        }
        const h = collectWindowsInheritanceFlags(c),
            d = collectWindowsRights();
        if (!d) throw new Error("Pilih minimal 1 izin Windows (standar atau lanjutan).");
        const l = `${r}:${h}${d}`,
            a = ["icacls", o];
        return t === "grant" && a.push("/grant", l), t === "grant_r" && a.push("/grant:r", l), t === "deny" && a.push("/deny", l), $("recursive").checked && a.push("/t"), s && a.push(s), n && a.push(n), e.push(a.join(" ")), {
            cmds: e,
            joinMode: i
        }
    }
    throw new Error("Aksi Windows tidak dikenali.")
}

function permBit(e, t, n) {
    return (e ? 4 : 0) + (t ? 2 : 0) + (n ? 1 : 0)
}

function linuxPermFromCheckboxes(e) {
    const t = {
            r: $("luR").checked,
            w: $("luW").checked,
            x: $("luX").checked
        },
        n = {
            r: $("lgR").checked,
            w: $("lgW").checked,
            x: $("lgX").checked
        },
        s = {
            r: $("loR").checked,
            w: $("loW").checked,
            x: $("loX").checked
        },
        i = "" + permBit(t.r, t.w, t.x) + permBit(n.r, n.w, n.x) + permBit(s.r, s.w, s.x);

    function o(t) {
        let n = "";
        return t.r && (n += "r"), t.w && (n += "w"), t.x && (n += e ? "X" : "x"), n
    }
    const a = `u=${o(t)},g=${o(n)},o=${o(s)}`;
    return {
        numeric: i,
        sym: a
    }
}

function applyLinuxPresetToCheckboxes(e) {
    if (!/^\d{3}$/.test(e)) return;
    const [n, s, o] = e.split("").map(e => parseInt(e, 10)), t = (e, t, n, s) => {
        $(t).checked = !!(e & 4), $(n).checked = !!(e & 2), $(s).checked = !!(e & 1)
    };
    t(n, "luR", "luW", "luX"), t(s, "lgR", "lgW", "lgX"), t(o, "loR", "loW", "loX")
}

function buildFindWrapped(e, t, n) {
    return `find ${e} -type ${t} -exec ${n} {} +`
}

function buildLinuxCommands() {
    const p = $("mode").value,
        o = $("linAction").value,
        c = $("path").value.trim(),
        d = $("targetType").value,
        u = d === "auto" ? guessTargetTypeFromPath(c) : d,
        i = $("recursive").checked,
        a = $("linApplyTo").value,
        f = $("linSudo").checked,
        m = $("linUseX").checked && i,
        h = $("linChmodMode").value,
        r = $("linCmdJoin2")?.value || "multiline",
        l = p === "expert" ? $("linRawArgs").value.trim() : "";
    if (!c) throw new Error("Path wajib diisi.");
    const n = quoteShPath(c),
        t = f ? "sudo " : "",
        s = l ? " " + l : "",
        e = [];
    if (o === "acl_backup" || o === "acl_restore") {
        const s = $("linAclFile").value.trim();
        if (!s) throw new Error("Path file ACL wajib diisi untuk backup/restore.");
        const i = quoteShPath(s);
        return o === "acl_backup" ? e.push(`${t}getfacl -R ${n} > ${i}`.trim()) : e.push(`${t}setfacl --restore=${i}`.trim()), {
            cmds: e,
            joinMode: $("linCmdJoin").value || r
        }
    }
    if (o === "chmod") {
        const o = $("linPreset").value;
        o && o !== "none" && o !== "auto" && applyLinuxPresetToCheckboxes(o), o === "auto" && applyLinuxPresetToCheckboxes(u === "file" ? "644" : "755");
        const c = linuxPermFromCheckboxes(m);
        if (h === "numeric") {
            const o = `chmod${i?" -R":""}${s} ${c.numeric}`;
            if (i && a !== "both") {
                const o = `${t}chmod${s} ${c.numeric}`.trim();
                e.push(buildFindWrapped(n, a === "files" ? "f" : "d", o))
            } else e.push(`${t}${o} ${n}`.trim())
        } else {
            const o = `chmod${i?" -R":""}${s} ${c.sym}`;
            if (i && a !== "both") {
                const o = `${t}chmod${s} ${c.sym}`.trim();
                e.push(buildFindWrapped(n, a === "files" ? "f" : "d", o))
            } else e.push(`${t}${o} ${n}`.trim())
        }
        return {
            cmds: e,
            joinMode: r
        }
    }
    if (o === "chown") {
        const c = $("linOwner").value.trim(),
            o = $("linGroup").value.trim();
        if (!c && !o) throw new Error("Isi owner atau group untuk chown.");
        const l = `${c||""}${o?":"+o:""}`,
            d = `chown${i?" -R":""}${s} ${l}`;
        if (i && a !== "both") {
            const o = `${t}chown${s} ${l}`.trim();
            e.push(buildFindWrapped(n, a === "files" ? "f" : "d", o))
        } else e.push(`${t}${d} ${n}`.trim());
        return {
            cmds: e,
            joinMode: r
        }
    }
    if (o === "chgrp") {
        const o = $("linGroup").value.trim();
        if (!o) throw new Error("Group wajib diisi untuk chgrp.");
        const c = `chgrp${i?" -R":""}${s} ${o}`;
        if (i && a !== "both") {
            const i = `${t}chgrp${s} ${o}`.trim();
            e.push(buildFindWrapped(n, a === "files" ? "f" : "d", i))
        } else e.push(`${t}${c} ${n}`.trim());
        return {
            cmds: e,
            joinMode: r
        }
    }
    if (o === "getfacl") return e.push(`${t}getfacl${s} ${n}`.trim()), {
        cmds: e,
        joinMode: r
    };
    if (o === "setfacl_b") {
        const o = `setfacl${i?" -R":""}${s} -b`;
        if (i && a !== "both") {
            const o = `${t}setfacl${s} -b`.trim();
            e.push(buildFindWrapped(n, a === "files" ? "f" : "d", o))
        } else e.push(`${t}${o} ${n}`.trim());
        return {
            cmds: e,
            joinMode: r
        }
    }
    if (o === "setfacl_k") return e.push(`${t}setfacl${s} -k ${n}`.trim()), {
        cmds: e,
        joinMode: r
    };
    if (o === "setfacl_m" || o === "setfacl_x") {
        const c = $("linAclType").value,
            d = $("linAclName").value.trim(),
            u = $("linAclPerm").value.trim(),
            l = $("linDefaultAcl").checked ? "d:" : "",
            m = c === "u" || c === "g";
        if (m && !d) throw new Error("Nama wajib diisi untuk tipe ACL u/g.");
        if (o === "setfacl_m" && !u) throw new Error("Permission ACL wajib diisi untuk setfacl -m.");
        const h = c === "m" || c === "o" ? `${l}${c}::${o==="setfacl_m"?u:""}`.replace(/:$/, "") : `${l}${c}:${d}:${o==="setfacl_m"?u:""}`.replace(/:$/, "");
        if (o === "setfacl_m") {
            const o = `setfacl${i?" -R":""}${s} -m ${h}`;
            if (i && a !== "both") {
                const o = `${t}setfacl${s} -m ${h}`.trim();
                e.push(buildFindWrapped(n, a === "files" ? "f" : "d", o))
            } else e.push(`${t}${o} ${n}`.trim())
        } else {
            const o = c === "m" || c === "o" ? `${l}${c}::` : `${l}${c}:${d}`,
                r = `setfacl${i?" -R":""}${s} -x ${o}`;
            if (i && a !== "both") {
                const i = `${t}setfacl${s} -x ${o}`.trim();
                e.push(buildFindWrapped(n, a === "files" ? "f" : "d", i))
            } else e.push(`${t}${r} ${n}`.trim())
        }
        return {
            cmds: e,
            joinMode: r
        }
    }
    throw new Error("Aksi Linux tidak dikenali.")
}

function updateVisibility() {
    const s = document.querySelector('input[name="os"]:checked')?.value || "windows",
        t = $("mode").value;
    $("winPanel").classList.toggle("hidden", s !== "windows"), $("linuxPanel").classList.toggle("hidden", s !== "linux"), $("osChip").textContent = s === "windows" ? "Windows" : "Linux", lastMode !== t && (t !== "basic" && ($("winAdvancedBlock").open = !0, $("winAdvRights").open = !0, $("linAdvancedBlock").open = !0), lastMode = t);
    const n = $("winAction").value,
        r = ["grant", "grant_r", "deny", "remove", "setowner"].includes(n);
    $("winPrincipalField").classList.toggle("hidden", !r);
    const o = ["grant", "grant_r", "deny"].includes(n);
    $("winScopeRow").classList.toggle("hidden", !o), $("winInheritFlagsRow").classList.toggle("hidden", !o), $("winPermSection").classList.toggle("hidden", !o), $("winSaveRestoreRow").classList.toggle("hidden", n !== "save" && n !== "restore"), $("winAttribRow").classList.toggle("hidden", n !== "attrib_ro"), $("winRawFlags").disabled = t !== "expert", $("linRawArgs").disabled = t !== "expert";
    const e = $("linAction").value,
        i = e === "chmod";
    $("linChmodModeRow").classList.toggle("hidden", !i), $("linPermSection").classList.toggle("hidden", !i);
    const c = e === "chown" || e === "chgrp";
    $("linOwnerRow").classList.toggle("hidden", !c), e === "chgrp" ? ($("linOwner").closest(".field").classList.add("hidden"), $("linGroup").closest(".field").classList.remove("hidden")) : ($("linOwner").closest(".field").classList.remove("hidden"), $("linGroup").closest(".field").classList.remove("hidden"));
    const a = e === "setfacl_m" || e === "setfacl_x";
    $("linAclRow").classList.toggle("hidden", !a), $("linAclPermRow").classList.toggle("hidden", !a);
    const l = e === "acl_backup" || e === "acl_restore";
    $("linAclFileRow").classList.toggle("hidden", !l)
}

function generate() {
    const e = document.querySelector('input[name="os"]:checked')?.value || "windows";
    try {
        updateVisibility();
        let t;
        e === "windows" ? t = buildWindowsCommands() : t = buildLinuxCommands();
        const n = joinCommands(t.cmds, t.joinMode || "multiline");
        $("out").value = n, $("btnCopy").disabled = !n, $("btnCopy").dataset.payload = n, setStatus("ok", n ? "Perintah berhasil dibuat." : "Isi opsi untuk menghasilkan perintah.")
    } catch (e) {
        $("out").value = "", $("btnCopy").disabled = !0, setStatus("err", e.message || "Input tidak valid.")
    }
}

function wire() {
    document.querySelectorAll('input[name="os"]').forEach(e => {
        e.addEventListener("change", generate)
    }), $("linPreset").addEventListener("change", () => {
        const e = $("linPreset").value;
        if (e === "none") return generate();
        if (e === "auto") {
            const t = $("path").value.trim(),
                e = $("targetType").value,
                n = e === "auto" ? guessTargetTypeFromPath(t) : e;
            applyLinuxPresetToCheckboxes(n === "file" ? "644" : "755")
        } else applyLinuxPresetToCheckboxes(e);
        generate()
    }), $("mode").addEventListener("change", () => {
        generate()
    }), document.querySelectorAll("input,select").forEach(e => {
        e.addEventListener("input", generate), e.addEventListener("change", generate)
    }), $("btnCopy").addEventListener("click", () => copyToClipboard($("btnCopy").dataset.payload || $("out").value)), setStatus("warn", "Isi pengaturan untuk menghasilkan perintah."), updateVisibility(), generate()
}
document.addEventListener("DOMContentLoaded", wire)