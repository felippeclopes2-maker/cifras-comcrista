// transpositor.js - Blindado para Tablaturas com ou sem negrito

const notasSustenido = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const notasBemol     = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const tabelaGraus    = ["1", "b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"];
const tabelaIntervalos = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];

let semitonsAcumulados = 0;

function mudarTom(delta) {
    semitonsAcumulados += delta;
    atualizarCifra();
}

function restaurarTomOriginal() {
    semitonsAcumulados = 0;
    atualizarCifra();
}

function formatarExtensao(texto) {
    if (!texto) return "";
    return texto.replace(/([0-9]|maj|dim|aug|sus|add|alt|min|M)/g, '<span class="num-ext">$1</span>');
}

function atualizarCifra() {
    if (typeof cifraOriginalHtml === 'undefined' || cifraOriginalHtml === "") return;

    let tomBase = window.tomPadrao || "C";
    let indexTomOriginal = obterIndexNota(tomBase);
    let indexNovoTom = (indexTomOriginal + semitonsAcumulados) % 12;
    if (indexNovoTom < 0) indexNovoTom += 12;

    const indicesPreferemBemol = [5, 10, 3, 8, 1, 6]; 
    let usarBemol = indicesPreferemBemol.includes(indexNovoTom);
    const escalaDestino = usarBemol ? notasBemol : notasSustenido;

    let novaCifra = cifraOriginalHtml;

    // --- PASSO 1: TABLATURAS (Blindado contra <b></b>) ---
    // Regex flexível: Aceita "E|" OU "<b>E</b>|" no início da linha
    const regexTablatura = /^((?:<b>)?[A-Ga-g][#b]?(?:<\/b>)?\|)(.*)$/gm;

    novaCifra = novaCifra.replace(regexTablatura, function(match, afinacao, corpoTab) {
        // Remove tags HTML da afinação para garantir que não quebre visualmente
        let afinacaoLimpa = afinacao; //.replace(/<\/?b>/g, ""); 
        
        let corpoTransposto = corpoTab.replace(/\d+/g, function(numero) {
            let novoNum = parseInt(numero) + semitonsAcumulados;
            if (novoNum < 0) novoNum += 12; // Evita traste negativo
            return novoNum;
        });

        return afinacaoLimpa + corpoTransposto;
    });

    // --- PASSO 2: ACORDES ---
    // Ignora o que for tablatura (seguido de |)
    const regexAcordesHTML = /<b>(.*?)<\/b>|\b(Em(?!\s[a-zçáéíóúà])|[A-G][#b]?(?:m|maj|dim|aug|sus|add|7M|M)?(?:\d{1,2})?(?:maj|M|min|7M)?(?:\/[A-G][#b]?)?)(?![a-z0-9|])/g;
    
    // Focamos apenas no que está dentro de <b> que NÃO seja tablatura
    const regexApenasAcordesJaFormatados = /<b>(.*?)<\/b>/g;

    novaCifra = novaCifra.replace(regexApenasAcordesJaFormatados, function(match, conteudoAcorde) {
        // Se o conteúdo tiver "|", é tablatura que passou despercebida, ignoramos
        if (conteudoAcorde.includes('|')) return match;

        let partes = conteudoAcorde.split('/');
        let parteRaiz = partes[0]; 
        let parteBaixo = partes.length > 1 ? partes[1] : null;

        let matchRaiz = parteRaiz.match(/^([A-G][#b]?)(.*)$/);
        if (!matchRaiz) return match; 

        let notaRaiz = matchRaiz[1];     
        let extensaoRaiz = matchRaiz[2]; 

        let resultadoRaiz;
        let indexNotaRaizAtual;

        if (window.exibindoGraus) {
            resultadoRaiz = obterGrau(notaRaiz, indexNovoTom);
            let indexOriginal = obterIndexNota(notaRaiz);
            indexNotaRaizAtual = (indexOriginal + semitonsAcumulados) % 12;
            if (indexNotaRaizAtual < 0) indexNotaRaizAtual += 12;
        } else {
            resultadoRaiz = transporNotaIndividual(notaRaiz, semitonsAcumulados, escalaDestino);
            indexNotaRaizAtual = obterIndexNota(resultadoRaiz);
        }

        let resultadoBaixo = "";
        if (parteBaixo) {
            let matchBaixo = parteBaixo.match(/^([A-G][#b]?)(.*)$/);
            if (matchBaixo) {
                let notaBaixo = matchBaixo[1];
                let extensaoBaixo = matchBaixo[2];
                let novaNotaBaixo;
                
                if (window.exibindoGraus) {
                    let indexBaixoOriginal = obterIndexNota(notaBaixo);
                    let indexBaixoAtual = (indexBaixoOriginal + semitonsAcumulados) % 12;
                    if (indexBaixoAtual < 0) indexBaixoAtual += 12;
                    let intervalo = indexBaixoAtual - indexNotaRaizAtual;
                    if (intervalo < 0) intervalo += 12;
                    novaNotaBaixo = tabelaIntervalos[intervalo];
                } else {
                    novaNotaBaixo = transporNotaIndividual(notaBaixo, semitonsAcumulados, escalaDestino);
                }
                resultadoBaixo = "/" + novaNotaBaixo + formatarExtensao(extensaoBaixo);
            } else {
                resultadoBaixo = "/" + parteBaixo;
            }
        }

        return `<b>${resultadoRaiz}${formatarExtensao(extensaoRaiz)}${resultadoBaixo}</b>`;
    });

    document.getElementById('conteudo-cifra').innerHTML = novaCifra;
}

function obterGrau(nota, indexTomAtual) {
    let indexNota = obterIndexNota(nota);
    let indexNotaAtual = (indexNota + semitonsAcumulados) % 12;
    if (indexNotaAtual < 0) indexNotaAtual += 12;
    let intervalo = indexNotaAtual - indexTomAtual;
    if (intervalo < 0) intervalo += 12;
    return tabelaGraus[intervalo];
}

function transporNotaIndividual(nota, delta, escalaEscolhida) {
    let index = obterIndexNota(nota);
    if (index === -1) return nota; 
    let novoIndex = (index + delta) % 12;
    if (novoIndex < 0) novoIndex += 12;
    return escalaEscolhida[novoIndex];
}

function obterIndexNota(nota) {
    if (notasSustenido.includes(nota)) return notasSustenido.indexOf(nota);
    if (notasBemol.includes(nota)) return notasBemol.indexOf(nota);
    const mapaEspecial = { "Cb": 11, "B#": 0, "Fb": 4, "E#": 5 };
    if (mapaEspecial[nota] !== undefined) return mapaEspecial[nota];
    return -1;
}
