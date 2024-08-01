// Получение элементов DOM
const mainInput = document.getElementById('main-input');
const searchResults = document.querySelector('.search-results');
const addedRepsList = document.querySelector('.reps-list');

// Ключевые элементы
let repos = [];

// Функция для получения списка репозиториев от GitHub API
async function getRepositories(query) {
    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=5`, {
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Ошибка при получении репозиториев:', error);
        return [];
    }
}

// Функция для отображения результатов поиска в выпадающем меню
async function displaySearchResults() {
    const query = mainInput.value;
    const repositories = await getRepositories(query);

    searchResults.innerHTML = '';
    searchResults.style.display = 'block'; // Показываем выпадающее меню

    repositories.forEach((repo) => {
        const li = document.createElement('li');
        li.textContent = repo.name;
        li.addEventListener('click', () => {
            addRepository(repo);
            mainInput.value = '';
            searchResults.style.display = 'none';
        });
        searchResults.appendChild(li);
    });
}

// Функция для добавления репозитория в список
function addRepository(repo) {
    if (!repos.some((r) => r.id === repo.id)) {
        repos.push(repo);
        updateAddedRepositoriesList();
    }
}

// Функция для удаления репозитория из списка
function removeRepository(repo) {
    const index = repos.findIndex((r) => r.id === repo.id);
    if (index !== -1) {
        repos.splice(index, 1);
        updateAddedRepositoriesList();
    }
}

// Функция для обновления списка добавленных репозиториев
function updateAddedRepositoriesList() {
    addedRepsList.innerHTML = '';

    repos.forEach((repo) => {
        const li = document.createElement('li');
        const repoInfo = document.createElement('div');
        const deleteButton = document.createElement('button');

        repoInfo.textContent = `${repo.name} - ${repo.owner.login} - ${repo.stargazers_count} stars`;
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => {
            removeRepository(repo);
        });

        li.appendChild(repoInfo);
        li.appendChild(deleteButton);
        addedRepsList.appendChild(li);
    });
}

// Обработчик события ввода в основной input
mainInput.addEventListener('input', () => {
    displaySearchResults();
});