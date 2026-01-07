// transpositor.js - Versão Inteligente (Sustenidos e Bemóis)

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
    // Se não tivermos o HTML original salvo, não fazemos nada (segurança)
    if (typeof cifraOriginalHtml === 'undefined' || cifraOriginalHtml === "") return;

    // Define o tom original (se não estiver definido no window, assume C)
    let tomBase = window.tomPadrao || "C";
    
    // 1. Descobrir qual será o NOVO TOM PRINCIPAL da música
    let indexTomOriginal = obterIndexNota(tomBase);
    let indexNovoTom = (indexTomOriginal + semitonsAcumulados) % 12;
    if (indexNovoTom < 0) indexNovoTom += 12;

    // 2. Decidir se usamos a tabela de SUSTENIDOS ou BEMÓIS baseado nas suas planilhas
    // Mapeamento baseado nas colunas "Maior" das suas tabelas:
    // Sustenidos: C(0), G(7), D(2), A(9), E(4), B(11) -> Usam escala Sustenido
    // Bemóis: F(5), Bb(10), Eb(3), Ab(8), Db(1), Gb(6), Cb(11-raro) -> Usam escala Bemol
    
    // Lista de índices que OBRIGATORIAMENTE usam Bemóis (F, Bb, Eb, Ab, Db, Gb)
    const indicesPreferemBemol = [5, 10, 3, 8, 1, 6]; 
    
    let usarBemol = indicesPreferemBemol.includes(indexNovoTom);

    // Seleciona a escala correta para aplicar em TODOS os acordes
    const escalaDestino = usarBemol ? notasBemol : notasSustenido;

    // 3. Processar a substituição no texto original
    // Regex que captura acordes, baixos e extensões
    const regexAcordes = /<b>([A-G][#b]?)(.*?)<\/b>/g;

    let novaCifra = cifraOriginalHtml.replace(regexAcordes, function(match, nota, resto) {
        
        // Separa o acorde de possíveis baixos invertidos (ex: G/B)
        let partes = nota.split('/');
        let notaPrincipal = partes[0];
        let notaBaixo = partes.length > 1 ? partes[1] : null;

        // Transpõe a nota principal
        let novaPrincipal = transporNotaIndividual(notaPrincipal, semitonsAcumulados, escalaDestino);
        
        // Transpõe o baixo se existir
        let novoBaixo = "";
        if (notaBaixo) {
            // Verifica se o baixo é uma nota válida antes de tentar transpor
            if (obterIndexNota(notaBaixo) !== -1) {
                novoBaixo = "/" + transporNotaIndividual(notaBaixo, semitonsAcumulados, escalaDestino);
            } else {
                novoBaixo = "/" + notaBaixo; // Mantém original se não for nota (raro)
            }
        }

        return `<b>${novaPrincipal}${novoBaixo}${resto}</b>`;
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

// Função para descobrir o número da nota (0 a 11) independente se é # ou b
function obterIndexNota(nota) {
    // Normaliza para buscar nas listas
    if (notasSustenido.includes(nota)) return notasSustenido.indexOf(nota);
    if (notasBemol.includes(nota)) return notasBemol.indexOf(nota);
    
    // Tratamento de casos especiais ou erros de digitação comuns
    // Ex: Cb = B (11), E# = F (5) - Opcional, mas ajuda na robustez
    const mapaEspecial = { "Cb": 11, "B#": 0, "Fb": 4, "E#": 5 };
    if (mapaEspecial[nota] !== undefined) return mapaEspecial[nota];

    return -1;
}
