// transpositor.js - Versão Corrigida (Baixos Invertidos + Tabelas Inteligentes)

// Tabelas cromáticas completas
const notasSustenido = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const notasBemol     = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Controle global da transposição
let semitonsAcumulados = 0;

function mudarTom(delta) {
    semitonsAcumulados += delta;
    atualizarCifra();
}

// Função chamada pelo botão "Tom Padrão" no cifra.html
function restaurarTomOriginal() {
    semitonsAcumulados = 0;
    atualizarCifra();
}

function atualizarCifra() {
    // Se não tivermos o HTML original salvo, não fazemos nada
    if (typeof cifraOriginalHtml === 'undefined' || cifraOriginalHtml === "") return;

    // Define o tom original
    let tomBase = window.tomPadrao || "C";
    
    // 1. Descobrir qual será o NOVO TOM PRINCIPAL
    let indexTomOriginal = obterIndexNota(tomBase);
    let indexNovoTom = (indexTomOriginal + semitonsAcumulados) % 12;
    if (indexNovoTom < 0) indexNovoTom += 12;

    // 2. Decidir se usamos Sustenidos ou Bemóis (Baseado na sua tabela)
    // F(5), Bb(10), Eb(3), Ab(8), Db(1), Gb(6) -> Preferem Bemóis
    const indicesPreferemBemol = [5, 10, 3, 8, 1, 6]; 
    let usarBemol = indicesPreferemBemol.includes(indexNovoTom);

    // Seleciona a escala correta
    const escalaDestino = usarBemol ? notasBemol : notasSustenido;

    // 3. REGEX CORRIGIDA: Captura TUDO dentro do <b>
    const regexAcordesHTML = /<b>(.*?)<\/b>/g;

    let novaCifra = cifraOriginalHtml.replace(regexAcordesHTML, function(match, conteudoAcorde) {
        
        // Exemplo: conteudoAcorde = "F7M/C" ou "G/B"
        
        // 1. Divide na barra do baixo
        let partes = conteudoAcorde.split('/');
        let parteRaiz = partes[0]; // "F7M" ou "G"
        let parteBaixo = partes.length > 1 ? partes[1] : null; // "C" ou "B"

        // 2. Processa a nota Principal (separando da extensão)
        // Regex: Pega a nota (A-G e #/b) e guarda o resto (m, 7, M, etc)
        let matchRaiz = parteRaiz.match(/^([A-G][#b]?)(.*)$/);
        
        if (!matchRaiz) return match; // Se não for nota válida, devolve sem mexer

        let notaRaiz = matchRaiz[1];     // Ex: "F"
        let extensaoRaiz = matchRaiz[2]; // Ex: "7M"

        let novaRaiz = transporNotaIndividual(notaRaiz, semitonsAcumulados, escalaDestino);

        // 3. Processa o Baixo (se existir)
        let novoBaixoStr = "";
        if (parteBaixo) {
            // O baixo também pode ter acidentes (ex: /C#)
            let matchBaixo = parteBaixo.match(/^([A-G][#b]?)(.*)$/);
            
            if (matchBaixo) {
                let notaBaixo = matchBaixo[1];
                let extensaoBaixo = matchBaixo[2]; // Raro em baixo, mas mantemos
                let novoBaixoNota = transporNotaIndividual(notaBaixo, semitonsAcumulados, escalaDestino);
                novoBaixoStr = "/" + novoBaixoNota + extensaoBaixo;
            } else {
                // Se o baixo não for uma nota reconhecida, mantemos igual
                novoBaixoStr = "/" + parteBaixo;
            }
        }

        // Remonta o acorde
        return `<b>${novaRaiz}${extensaoRaiz}${novoBaixoStr}</b>`;
    });

    // 4. Atualiza a tela
    document.getElementById('conteudo-cifra').innerHTML = novaCifra;
}

// Função auxiliar para calcular a nova nota
function transporNotaIndividual(nota, delta, escalaEscolhida) {
    let index = obterIndexNota(nota);
    if (index === -1) return nota; // Se não reconhecer, devolve igual

    let novoIndex = (index + delta) % 12;
    if (novoIndex < 0) novoIndex += 12;

    return escalaEscolhida[novoIndex];
}

// Função para descobrir o número da nota (0 a 11)
function obterIndexNota(nota) {
    if (notasSustenido.includes(nota)) return notasSustenido.indexOf(nota);
    if (notasBemol.includes(nota)) return notasBemol.indexOf(nota);
    
    const mapaEspecial = { "Cb": 11, "B#": 0, "Fb": 4, "E#": 5 };
    if (mapaEspecial[nota] !== undefined) return mapaEspecial[nota];

    return -1;
}
