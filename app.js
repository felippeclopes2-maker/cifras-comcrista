// app.js atualizado para a estrutura de categorias
const listaContainer = document.getElementById('listaLouvores');
const inputBusca = document.getElementById('inputBusca');

function renderizarLista(categorias) {
    listaContainer.innerHTML = '';
    
    // Transformamos o objeto de categorias em uma lista única para exibir tudo
    let todosOsLouvores = [];
    Object.keys(categorias).forEach(chave => {
        todosOsLouvores = todosOsLouvores.concat(categorias[chave]);
    });

    todosOsLouvores.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => {
            // Usamos item.num porque você mudou de 'numero' para 'num' no dados.js
            window.location.href = `cifra.html?hino=${item.num}`;
        };
        div.innerHTML = `
            <div class="num">${item.num}</div>
            <div class="title">${item.titulo}</div>
        `;
        listaContainer.appendChild(div);
    });
}

// Filtro de busca atualizado
inputBusca.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    
    // Criamos um filtro que vasculha dentro das categorias
    let filtrados = [];
    Object.keys(coletanea).forEach(chave => {
        const buscaNaCategoria = coletanea[chave].filter(l => 
            l.titulo.toLowerCase().includes(termo) || 
            l.num.includes(termo)
        );
        filtrados = filtrados.concat(buscaNaCategoria);
    });
    
    // Chamamos a função de desenho com o formato que ela espera
    renderizarFiltrados(filtrados); 
});

// Função auxiliar para os filtrados
function renderizarFiltrados(itens) {
    listaContainer.innerHTML = '';
    itens.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => window.location.href = `cifra.html?hino=${item.num}`;
        div.innerHTML = `<div class="num">${item.num}</div><div class="title">${item.titulo}</div>`;
        listaContainer.appendChild(div);
    });
}

// Inicializar usando o objeto 'coletanea' do dados.js
renderizarLista(coletanea);

// Variável para guardar qual categoria está selecionada (padrão: TODOS)
let categoriaAtual = "TODOS";

// Configura os cliques nos botões de filtro
document.querySelectorAll('.filter-btn').forEach(botao => {
    botao.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove classe 'active' de todos e adiciona no clicado
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        categoriaAtual = this.getAttribute('data-cat');
        filtrarEExibir();
    });
});

// Função mestra que une Busca + Categoria
function filtrarEExibir() {
    const termo = inputBusca.value.toLowerCase();
    let resultados = [];

    // 1. Pega os hinos da categoria selecionada
    if (categoriaAtual === "TODOS") {
        Object.keys(coletanea).forEach(chave => {
            resultados = resultados.concat(coletanea[chave]);
        });
    } else {
        resultados = coletanea[categoriaAtual] || [];
    }

    // 2. Aplica o filtro de busca por texto/número em cima dos resultados da categoria
    const filtradosFinal = resultados.filter(l => 
        l.titulo.toLowerCase().includes(termo) || 
        l.num.includes(termo)
    );

    renderizarFiltrados(filtradosFinal);
}

// Substitua o evento de 'input' antigo por este mais simples
inputBusca.addEventListener('input', filtrarEExibir);