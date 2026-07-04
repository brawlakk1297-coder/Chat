// Базовый список видео
let defaultVideos = [
    {
        id: 1,
        title: "Гайд по Kaisu Script (Тестовое видео)",
        url: "dQw4w9WgXcQ", 
        desc: "Добро пожаловать на новый сайт Kaisu script! Проверьте поиск и добавление видео.",
        comments: [{ user: "BloxFruitsFan", text: "Сайт стал просто пушка! 🔥", isOwner: false }]
    }
];

// Инициализация хранилища данных
if (!localStorage.getItem('kaisu_videos')) {
    localStorage.setItem('kaisu_videos', JSON.stringify(defaultVideos));
}

let currentUser = JSON.parse(localStorage.getItem('kaisu_user')) || null;
let currentVideoId = null;

// Запуск при полной загрузке страницы браузером
window.onload = function() {
    updateAuthUI();
    renderVideos();
    
    // Подключение поиска
    let searchBtn = document.getElementById('searchBtn');
    let searchInput = document.getElementById('searchInput');
    if (searchBtn) searchBtn.onclick = handleSearch;
    if (searchInput) {
        searchInput.onkeyup = function(e) {
            if (e.key === 'Enter') handleSearch();
        };
    }

    // Подключение форм
    let commentForm = document.getElementById('commentForm');
    if (commentForm) commentForm.onsubmit = handleCommentSubmit;

    let addVideoForm = document.getElementById('addVideoForm');
    if (addVideoForm) addVideoForm.onsubmit = handleAddVideoSubmit;
};

// Функция переключения страниц
function showSection(sectionId) {
    let pages = document.querySelectorAll('.page');
    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.add('hidden');
    }
    let target = document.getElementById(sectionId);
    if (target) target.classList.remove('hidden');
    if (sectionId === 'main-page') renderVideos();
}

// Отображение интерфейса входа
function updateAuthUI() {
    let authBlock = document.getElementById('authBlock');
    if (!authBlock) return;

    let commentForm = document.getElementById('commentForm');
    let commentAuthWarning = document.getElementById('commentAuthWarning');
    let adminPanelBtn = document.getElementById('adminPanelBtn');

    if (currentUser) {
        let nameHTML = currentUser.isOwner 
            ? `<span class="owner-nickname">Admin <span class="owner-tag">Владелец</span></span>`
            : `<span style="color:#60a5fa; font-weight:500; font-size:0.85rem;">🔹 ${currentUser.name}</span>`;
            
        authBlock.innerHTML = `
            <div style="display:flex; align-items:center; gap:6px;">
                ${nameHTML} 
                <button onclick="logout()" class="btn btn-secondary" style="padding: 4px 8px; font-size:0.75rem; border-radius:8px;">Выйти</button>
            </div>`;
            
        if (commentForm) commentForm.classList.remove('hidden');
        if (commentAuthWarning) commentAuthWarning.classList.add('hidden');
        
        if (adminPanelBtn) {
            if (currentUser.isOwner) adminPanelBtn.classList.remove('hidden');
            else adminPanelBtn.classList.add('hidden');
        }
    } else {
        authBlock.innerHTML = `<button onclick="openAuthModal()" class="btn btn-primary" style="padding: 5px 12px; font-size:0.8rem;">Войти</button>`;
        if (commentForm) commentForm.classList.add('hidden');
        if (commentAuthWarning) commentAuthWarning.classList.remove('hidden');
        if (adminPanelBtn) adminPanelBtn.classList.add('hidden');
    }
}

// Управление окном авторизации
function openAuthModal() {
    let modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('hidden');
}
function closeAuthModal() {
    let modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
}

// Вход в систему (Пароль проверяется здесь)
function simulateGoogleLogin(isAdminRole) {
    if (isAdminRole) {
        let password = prompt("Введите секретный код владельца:");
        if (password === '12MendalKaisuu21') { 
            currentUser = { name: 'Admin', isOwner: true };
            alert("Успешный вход!");
        } else {
            alert("Неверный пароль!");
            return; 
        }
    } else {
        let randomNames = ["User_Google5", "Script_Tester", "FruitGamer", "KaisuVisitor"];
        let name = randomNames[Math.floor(Math.random() * randomNames.length)];
        currentUser = { name: name, isOwner: false };
    }

    localStorage.setItem('kaisu_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    if (currentVideoId) watchVideo(currentVideoId);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('kaisu_user');
    updateAuthUI();
    showSection('main-page');
}

// Показ сетки видео роликов
function renderVideos(searchQuery = "") {
    let videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;

    let videos = JSON.parse(localStorage.getItem('kaisu_videos')) || [];
    videoGrid.innerHTML = "";
    
    let filtered = videos.filter(function(v) {
        return v.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    if (filtered.length === 0) {
        videoGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; color:var(--text-muted);'>Ничего не найдено.</p>";
        return;
    }

    for (let i = 0; i < filtered.length; i++) {
        let video = filtered[i];
        let item = document.createElement('div');
        item.className = 'video-item';
        item.onclick = (function(id) {
            return function() { watchVideo(id); };
        })(video.id);
        
        item.innerHTML = `
            <div class="thumbnail-placeholder">▶</div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <small style="color:var(--text-muted);">Перейти к просмотру</small>
            </div>
        `;
        videoGrid.appendChild(item);
    }
}

function handleSearch() {
    let searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    let query = searchInput.value;
    let pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = query ? `Результаты для: "${query}"` : "Рекомендации";
    showSection('main-page');
    renderVideos(query);
}

// Страница просмотра видео плеера
function watchVideo(id) {
    currentVideoId = id;
    let videos = JSON.parse(localStorage.getItem('kaisu_videos')) || [];
    let video = videos.find(function(v) { return v.id === id; });
    if (!video) return;

    showSection('watch-page');
    
    let watchTitle = document.getElementById('watchTitle');
    let watchDesc = document.getElementById('watchDesc');
    let playerWrapper = document.getElementById('videoPlayerWrapper');
    
    if (watchTitle) watchTitle.textContent = video.title;
    if (watchDesc) watchDesc.textContent = video.desc;

    if (playerWrapper) {
        if (video.url.length === 11 || !video.url.includes('.')) {
            playerWrapper.innerHTML = `<iframe src="https://youtube.com{video.url}" allowfullscreen></iframe>`;
        } else {
            playerWrapper.innerHTML = `<video src="${video.url}" controls autoplay></video>`;
        }
    }

    renderComments(video.comments || []);
}

function renderComments(comments) {
    let commentsCount = document.getElementById('commentsCount');
    let list = document.getElementById('commentsList');
    if (commentsCount) commentsCount.textContent = comments.length;
    if (!list) return;
    list.innerHTML = "";

    for (let i = 0; i < comments.length; i++) {
        let c = comments[i];
        let div = document.createElement('div');
        div.className = 'comment-node';
        
        let userHTML = c.isOwner 
            ? `<span class="owner-nickname">Admin <span class="owner-tag">Владелец</span></span>`
            : `<span style="color:#60a5fa; font-weight:500;">🔹 ${c.user}</span>`;

        div.innerHTML = `
            <div class="comment-user">${userHTML}</div>
            <div class="comment-text" style="color:#e4e4e7; padding-left:2px;">${c.text}</div>
        `;
        list.appendChild(div);
    }
}

// Обработчик отправки комментариев
function handleCommentSubmit(e) {
    e.preventDefault();
    if (!currentUser || !currentVideoId) return;

    let commentInput = document.getElementById('commentInput');
    if (!commentInput) return;
    let text = commentInput.value.trim();
    if (!text) return;

    let videos = JSON.parse(localStorage.getItem('kaisu_videos')) || [];
    let videoIndex = videos.findIndex(function(v) { return v.id === currentVideoId; });
    
    if (videoIndex !== -1) {
        if (!videos[videoIndex].comments) videos[videoIndex].comments = [];
        videos[videoIndex].comments.push({
            user: currentUser.name,
            text: text,
            isOwner: currentUser.isOwner
        });
        localStorage.setItem('kaisu_videos', JSON.stringify(videos));
        commentInput.value = "";
        renderComments(videos[videoIndex].comments);
    }
}

// Обработчик добавления видео владельцем
function handleAddVideoSubmit(e) {
    e.preventDefault();
    if (!currentUser || !currentUser.isOwner) return;

    let title = document.getElementById('videoTitleInput').value.trim();
    let url = document.getElementById('videoUrlInput').value.trim();
    let desc = document.getElementById('videoDescInput').value.trim();

    let videos = JSON.parse(localStorage.getItem('kaisu_videos')) || [];
    let newVideo = {
        id: Date.now(),
        title: title,
        url: url,
        desc: desc,
        comments: []
    };

    videos.push(newVideo);
    localStorage.setItem('kaisu_videos', JSON.stringify(videos));
    
    e.target.reset();
    showSection('main-page');
}
