// app.js corrigido: Ordem Alfabética e Exibição Limpa
const listaContainer = document.getElementById('listaLouvores');
const inputBusca = document.getElementById('inputBusca');

// Função auxiliar para organizar qualquer lista por Título (A-Z)
function ordenarLista(lista) {
    return lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
}

function renderizarLista(categorias) {
    listaContainer.innerHTML = '';
    
    let todosOsLouvores = [];
    Object.keys(categorias).forEach(chave => {
        todosOsLouvores = todosOsLouvores.concat(categorias[chave]);
    });

    // Aplica a ordem alfabética
    const listaOrdenada = ordenarLista(todosOsLouvores);

    listaOrdenada.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => {
            window.location.href = `cifra.html?hino=${encodeURIComponent(item.num)}`;
        };
        // Removido a div class="num" para aparecer apenas o título
        div.innerHTML = `
            <div class="title">${item.titulo}</div>
        `;
        listaContainer.appendChild(div);
    });
}

// Função de renderização para resultados filtrados (Busca/Categorias)
function renderizarFiltrados(itens) {
    listaContainer.innerHTML = '';
    
    // Ordena os resultados antes de exibir
    const itensOrdenados = ordenarLista(itens);

    itensOrdenados.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => window.location.href = `cifra.html?hino=${encodeURIComponent(item.num)}`;
        // Exibição apenas do título
        div.innerHTML = `<div class="title">${item.titulo}</div>`;
        listaContainer.appendChild(div);
    });
}

// Inicializar usando o objeto 'coletanea' do dados.js
renderizarLista(coletanea);

// Variável para guardar qual categoria está selecionada
let categoriaAtual = "TODOS";

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

// Função mestra que une Busca + Categoria + Ordem Alfabética
function filtrarEExibir() {
    const termo = inputBusca.value.toLowerCase();
    let resultados = [];

    if (categoriaAtual === "TODOS") {
        Object.keys(coletanea).forEach(chave => {
            resultados = resultados.concat(coletanea[chave]);
        });
    } else {
        resultados = coletanea[categoriaAtual] || [];
    }

    const filtradosFinal = resultados.filter(l => 
        l.titulo.toLowerCase().includes(termo) || 
        l.num.toLowerCase().includes(termo)
    );

    renderizarFiltrados(filtradosFinal);
}

// Evento de busca
inputBusca.addEventListener('input', filtrarEExibir);
