// transpositor.js - Versão Final: Graus, Baixos Funcionais, Cores e TABLATURAS

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

    // --- PASSO 1: Preparar o texto ---
    // Fazemos uma cópia da cifra original para processar
    let novaCifra = cifraOriginalHtml;

    // --- PASSO 2: Processar TABLATURAS (Antes dos acordes) ---
    // Regex: Procura início de linha (^), Nota (A-G), opcional #/b, seguido de barra vertical |
    // Ex: E|---0--- ou Eb|---
    const regexTablatura = /^([A-Ga-g][#b]?\|)(.*)$/gm;

    novaCifra = novaCifra.replace(regexTablatura, function(match, afinacao, corpoTab) {
        // 'afinacao' é a parte fixa (Ex: "E|")
        // 'corpoTab' é o restante da linha (Ex: "---7---8---")
        
        // Substitui apenas os números dentro da linha da tablatura
        let corpoTransposto = corpoTab.replace(/\d+/g, function(numero) {
            let novoNum = parseInt(numero) + semitonsAcumulados;
            
            // Lógica de segurança: Se o traste ficar negativo (ex: corda solta 0 descendo tom),
            // somamos 12 para jogar uma oitava acima e manter tocável, ou mantemos 0 se preferir.
            // Aqui optamos por jogar para a oitava superior se ficar negativo.
            if (novoNum < 0) novoNum += 12; 
            
            return novoNum;
        });

        return afinacao + corpoTransposto;
    });

    // --- PASSO 3: Processar ACORDES ---
    // ATENÇÃO: Adicionei '|' no final do regex para IGNORAR o que for tablatura
    // (?![a-z|]) impede que E| seja lido como acorde E
    const regexAcordesHTML = /<b>(.*?)<\/b>|\b(Em(?!\s[a-zçáéíóúà])|[A-G][#b]?(?:m|maj|dim|aug|sus|add|7M|M)?(?:\d{1,2})?(?:maj|M|min|7M)?(?:\/[A-G][#b]?)?)(?![a-z0-9|])/g;

    // Se o texto original já tiver tags <b> (do admin), usamos o regex simples.
    // Se for texto puro, usamos o regex complexo acima.
    // Para simplificar, assumimos que seu JSON já vem com <b> nos acordes ou usamos a lógica mista.
    
    // Como seu Admin já coloca <b>, vamos focar em substituir o que está dentro de <b>
    // Mas se houver tablaturas, elas não terão <b>, então passarão ilesas.
    
    const regexApenasAcordesJaFormatados = /<b>(.*?)<\/b>/g;

    novaCifra = novaCifra.replace(regexApenasAcordesJaFormatados, function(match, conteudoAcorde) {
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
