const mainInput = document.getElementById('main-input');
const searchResults = document.querySelector('.search-results');
const addedRepsList = document.querySelector('.reps-list');
let repos = [];

let searchDebounceTimeout;
let searchCache = {};

function debounce(func, delay) {
    return function (...args) {
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

async function getRepositories(query) {
    if (searchCache[query]) {
        return searchCache[query];
    }

    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=5`, {
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        const data = await response.json();
        searchCache[query] = data.items;
        return data.items;
    } catch (error) {
        console.error('Ошибка при получении репозиториев:', error);
        return [];
    }
}

const displaySearchResults = debounce(async () => {
    const query = mainInput.value;
    const repositories = await getRepositories(query);

    searchResults.innerHTML = '';
    searchResults.style.display = 'block';

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
}, 500);

function addRepository(repo) {
    if (!repos.some((r) => r.id === repo.id)) {
        repos.push(repo);
        updateAddedRepositoriesList();
    }
}

function removeRepository(repo) {
    const index = repos.findIndex((r) => r.id === repo.id);
    if (index !== -1) {
        repos.splice(index, 1);
        updateAddedRepositoriesList();
    }
}

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

mainInput.addEventListener('input', () => {
    displaySearchResults();
});