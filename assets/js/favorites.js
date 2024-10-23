import { GithubUsers } from "./GithubUser.js";

// Classe que vai conter a lógica
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.loadData();
    }

    loadData() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
    }

    saveData() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
    }

    async addUser(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username);

            if (userExists) {
                throw new Error(`${username} já foi adicionado aos seus Favoritos!`);
            }

            const user = await GithubUsers.search(username);
            if (user.login === undefined) {
                throw new Error(`Usuário Não Encontrado`);
            }

            this.entries = [user, ...this.entries];
            this.saveData();
            this.update();
        } catch (error) {
            alert(error.message);
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login);
        this.entries = filteredEntries;
        this.saveData();
        this.update(); // Atualiza a lista após a deleção
    }
}

// Classe que vai conter o conteúdo e eventos do HTML
export class favoritesView extends Favorites {
    constructor(root) {
        super(root);
        this.tbody = document.querySelector('table tbody');
        this.update();
        this.onAddUser();
    }

    onAddUser() {
        const addButton = this.root.querySelector('.search button');

        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input');
            this.addUser(value);
            this.root.querySelector('.search input').value = ''; // Limpa o campo de entrada após adicionar
        };
    }

    update() {
        this.removeAllTr(); // Limpa a tabela antes de adicionar novos usuários

        // Se não houver favoritos, mostra a mensagem
        if (this.entries.length === 0) {
            this.showNoFavoritesMessage();
        } else {
            this.entries.forEach(user => {
                const row = this.createRow();

                row.querySelector('.userPrincipalInfo img').src = `https://github.com/${user.login}.png`;
                row.querySelector('.userPrincipalInfo img').alt = `Foto de ${user.name}`;
                row.querySelector('.userPrincipalInfo a').href = `https://github.com/${user.login}`;
                row.querySelector('.userPrincipalInfo p').textContent = user.name || user.login; // Adiciona login caso o nome esteja indisponível
                row.querySelector('.userPrincipalInfo span').textContent = user.login;
                row.querySelector('.userRepositories').textContent = user.public_repos;
                row.querySelector('.userFollowers').textContent = user.followers;
                row.querySelector('.remove').onclick = () => {
                    const isOk = confirm(`Deletar ${user.login} dos seus favoritos?`);
                    if (isOk) {
                        this.delete(user);
                    }
                };

                this.tbody.append(row);
            });
        }
    }

    showNoFavoritesMessage() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                    <td colspan="4" class="noFavoriteMessage"><div class="favoriteFlex"><img src="./assets/images/noFavorite-icon.svg" alt=""><p>Nenhum favorito ainda</p></div></td>
                </tr>
        `;
        this.tbody.append(tr);
    }

    // Criando linhas da aplicação
    createRow() {
        const tr = document.createElement('tr');

        tr.innerHTML = `
           <td class="userPrincipalInfo">
               <img src="https://github.com/guilhermepacola.png" alt="imagem de Guilherme Pacola">
               <a href="https://github.com/guilhermepacola" target="_blank">
                   <p>Guilherme Pacola</p>
                   <span>guilhermepacola</span>
               </a>
           </td>
           <td class="userRepositories">12</td>
           <td class="userFollowers">100.000</td>
           <td>
               <button class="remove">Remover</button>
           </td>
        `;

        return tr;
    }

    // Removendo todas as linhas da tabela
    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach(tr => tr.remove());
    }
}
