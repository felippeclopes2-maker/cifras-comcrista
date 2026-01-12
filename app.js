// app.js - Versão Estabilizada
const listaContainer = document.getElementById('listaLouvores');
const inputBusca = document.getElementById('inputBusca');

// Função auxiliar para organizar qualquer lista por Título (A-Z)
function ordenarLista(lista) {
    // Filtra itens inválidos para evitar erros de leitura
    const listaValida = lista.filter(item => item && item.titulo);
    return listaValida.sort((a, b) => a.titulo.localeCompare(b.titulo));
}

function renderizarLista(categorias) {
    if (!listaContainer) return;
    listaContainer.innerHTML = '';
    
    let todosOsLouvores = [];
    Object.keys(categorias).forEach(chave => {
        if (Array.isArray(categorias[chave])) {
            todosOsLouvores = todosOsLouvores.concat(categorias[chave]);
        }
    });

    const listaOrdenada = ordenarLista(todosOsLouvores);

    listaOrdenada.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => {
            window.location.href = `cifra.html?hino=${encodeURIComponent(item.num)}`;
        };
        div.innerHTML = `<div class="title">${item.titulo}</div>`;
        listaContainer.appendChild(div);
    });
}

function renderizarFiltrados(itens) {
    listaContainer.innerHTML = '';
    const itensOrdenados = ordenarLista(itens);

    itensOrdenados.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => window.location.href = `cifra.html?hino=${encodeURIComponent(item.num)}`;
        div.innerHTML = `<div class="title">${item.titulo}</div>`;
        listaContainer.appendChild(div);
    });
}

// Variável para guardar qual categoria está selecionada
let categoriaAtual = "TODOS";

function filtrarEExibir() {
    if (!inputBusca) return;
    const termo = inputBusca.value.toLowerCase().trim();
    let resultados = [];

    if (categoriaAtual === "TODOS") {
        Object.keys(coletanea).forEach(chave => {
            resultados = resultados.concat(coletanea[chave]);
        });
    } else {
        resultados = coletanea[categoriaAtual] || [];
    }

    const filtradosFinal = resultados.filter(l => 
        (l.titulo && l.titulo.toLowerCase().includes(termo)) || 
        (l.num && l.num.toLowerCase().includes(termo))
    );

    renderizarFiltrados(filtradosFinal);
}

// INICIALIZAÇÃO SEGURA
// Isso garante que o código só rode após o dados.js estar 100% carregado
window.addEventListener('DOMContentLoaded', () => {
    if (typeof coletanea !== 'undefined') {
        renderizarLista(coletanea);
    } else {
        console.error("A variável 'coletanea' não foi encontrada. Verifique o dados.js");
    }

    // Configura os cliques nos botões de filtro
    document.querySelectorAll('.filter-btn').forEach(botao => {
        botao.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            categoriaAtual = this.getAttribute('data-cat');
            filtrarEExibir();
        });
    });

    if (inputBusca) {
        inputBusca.addEventListener('input', filtrarEExibir);
    }
});
