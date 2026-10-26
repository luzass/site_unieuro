// Injeta o CSS compilado do Tailwind no <style id="tw"> do index.html (evita CSS inline desatualizado).
const fs = require("fs");

const css = fs.readFileSync("assets/css/styles.css", "utf8").trim();
const html = fs.readFileSync("index.html", "utf8");
const bloco = /(<style id="tw">\n)[\s\S]*?(\n\s*<\/style>)/;

if (!bloco.test(html)) {
    throw new Error('Bloco <style id="tw"> nao encontrado no index.html');
}

fs.writeFileSync("index.html", html.replace(bloco, (_, abre, fecha) => abre + css + fecha));
console.log(`CSS inline atualizado (${css.length} bytes).`);
