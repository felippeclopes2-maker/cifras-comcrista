// transpositor.js - Versão Graus Funcionais (Baixo relativo ao Acorde)

// Tabelas cromáticas
const notasSustenido = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const notasBemol     = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Tabela 1: Graus do Acorde (Relativo ao TOM DA MÚSICA)
const tabelaGraus = ["1", "b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"];

// Tabela 2: Intervalos do Baixo (Relativo à RAIZ DO ACORDE)
// Ex: 4 semitons = Terça Maior ("3"); 7 semitons = Quinta Justa ("5")
const tabelaIntervalos = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];

// Controle global da transposição
let semitonsAcumulados = 0;

function mudarTom(delta) {
    semitonsAcumulados += delta;
    atualizarCifra();
}

function restaurarTomOriginal() {
    semitonsAcumulados = 0;
    atualizarCifra();
}

function atualizarCifra() {
    if (typeof cifraOriginalHtml === 'undefined' || cifraOriginalHtml === "") return;

    let tomBase = window.tomPadrao || "C";
    
    // 1. Calcular o Index do TOM ATUAL
    let indexTomOriginal = obterIndexNota(tomBase);
    let indexNovoTom = (indexTomOriginal + semitonsAcumulados) % 12;
    if (indexNovoTom < 0) indexNovoTom += 12;

    // 2. Decidir escala
    const indicesPreferemBemol = [5, 10, 3, 8, 1, 6]; 
    let usarBemol = indicesPreferemBemol.includes(indexNovoTom);
    const escalaDestino = usarBemol ? notasBemol : notasSustenido;

    // 3. Processar
    const regexAcordesHTML = /<b>(.*?)<\/b>/g;

    let novaCifra = cifraOriginalHtml.replace(regexAcordesHTML, function(match, conteudoAcorde) {
        
        let partes = conteudoAcorde.split('/');
        let parteRaiz = partes[0]; 
        let parteBaixo = partes.length > 1 ? partes[1] : null;

        // --- A. Processar a Raiz (Ex: G) ---
        let matchRaiz = parteRaiz.match(/^([A-G][#b]?)(.*)$/);
        if (!matchRaiz) return match; 

        let notaRaiz = matchRaiz[1];     
        let extensaoRaiz = matchRaiz[2]; 

        let resultadoRaiz;
        let indexNotaRaizAtual; // Precisamos guardar onde essa nota caiu para calcular o baixo depois

        if (window.exibindoGraus) {
            // Regra 1: Raiz relativa ao TOM (Ex: G em Dó = 5)
            resultadoRaiz = obterGrau(notaRaiz, indexNovoTom);
            
            // Para calcular o baixo, precisamos saber qual é a nota transposta REAL
            let indexOriginal = obterIndexNota(notaRaiz);
            indexNotaRaizAtual = (indexOriginal + semitonsAcumulados) % 12;
            if (indexNotaRaizAtual < 0) indexNotaRaizAtual += 12;

        } else {
            resultadoRaiz = transporNotaIndividual(notaRaiz, semitonsAcumulados, escalaDestino);
            indexNotaRaizAtual = obterIndexNota(resultadoRaiz);
        }

        // --- B. Processar o Baixo (Ex: /B) ---
        let resultadoBaixo = "";
        if (parteBaixo) {
            let matchBaixo = parteBaixo.match(/^([A-G][#b]?)(.*)$/);
            if (matchBaixo) {
                let notaBaixo = matchBaixo[1];
                let extensaoBaixo = matchBaixo[2];
                
                let novaNotaBaixo;
                
                if (window.exibindoGraus) {
                    // Regra 2: Baixo relativo à RAIZ DO ACORDE (Ex: B em G = 3)
                    
                    // Primeiro, descobrimos que nota o baixo virou na transposição
                    let indexBaixoOriginal = obterIndexNota(notaBaixo);
                    let indexBaixoAtual = (indexBaixoOriginal + semitonsAcumulados) % 12;
                    if (indexBaixoAtual < 0) indexBaixoAtual += 12;

                    // Agora calculamos a distância entre a RAIZ ATUAL e o BAIXO ATUAL
                    let intervalo = indexBaixoAtual - indexNotaRaizAtual;
                    if (intervalo < 0) intervalo += 12;

                    novaNotaBaixo = tabelaIntervalos[intervalo];

                } else {
                    novaNotaBaixo = transporNotaIndividual(notaBaixo, semitonsAcumulados, escalaDestino);
                }
                
                resultadoBaixo = "/" + novaNotaBaixo + extensaoBaixo;
            } else {
                resultadoBaixo = "/" + parteBaixo;
            }
        }

        return `<b>${resultadoRaiz}${extensaoRaiz}${resultadoBaixo}</b>`;
    });

    document.getElementById('conteudo-cifra').innerHTML = novaCifra;
}

// Retorna o Grau relativo ao Tom da Música (Para a Raiz)
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
