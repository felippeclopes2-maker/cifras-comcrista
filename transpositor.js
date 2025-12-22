const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function transporAcorde(acorde, semitons) {
    // Essa regex identifica a nota principal do acorde (Ex: Am7, ela pega o A)
    return acorde.replace(/[CDEFGAB][#b]?/g, (match) => {
        let notaAtual = match;
        const mapaBemoís = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
        if (mapaBemoís[notaAtual]) notaAtual = mapaBemoís[notaAtual];

        let indiceDesejado = notas.indexOf(notaAtual) + semitons;
        while (indiceDesejado < 0) indiceDesejado += 12;
        while (indiceDesejado >= 12) indiceDesejado -= 12;

        return notas[indiceDesejado];
    });
}

function mudarTom(direcao) {
    const pre = document.getElementById('conteudo-cifra');
    if (!pre) return;
    
    const htmlAtual = pre.innerHTML;
    // Ele procura tudo que está entre <b> </b> e manda para a função transporAcorde
    const novoHtml = htmlAtual.replace(/<b>(.*?)<\/b>/g, (match, acorde) => {
        return `<b>${transporAcorde(acorde, direcao)}</b>`;
    });
    
    pre.innerHTML = novoHtml;
}