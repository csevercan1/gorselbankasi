document.addEventListener('DOMContentLoaded', () => {
    // BURAYA KENDİ BİLGİLERİNİZİ GİRİN
    const API_KEY = 'BURAYA_API_ANAHTARINIZI_YAZIN';
    const FOLDER_ID = 'BURAYA_KLASOR_ID_YAZIN';

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const gallery = document.getElementById('gallery');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    // Enter tuşuna basıldığında aramayı tetikle
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    searchBtn.addEventListener('click', () => {
        if (API_KEY === 'BURAYA_API_ANAHTARINIZI_YAZIN' || FOLDER_ID === 'BURAYA_KLASOR_ID_YAZIN') {
            showError("Lütfen kodun (app.js) içindeki API_KEY ve FOLDER_ID alanlarını doldurun!");
            return;
        }

        const searchTerm = searchInput.value.trim();
        fetchImages(searchTerm);
    });

    // Sayfa ilk açıldığında otomatik olarak tüm resimleri listelemek isterseniz aşağıdaki satırı aktif edebilirsiniz:
    // fetchImages('');

    async function fetchImages(searchTerm) {
        gallery.innerHTML = '';
        hideError();
        loader.classList.remove('hidden');

        try {
            // Temel sorgu: Klasörün içi, sadece resimler ve silinmemiş olanlar
            let query = `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`;
            
            // Eğer arama terimi girildiyse isme göre filtrele
            if (searchTerm) {
                query += ` and name contains '${searchTerm}'`;
            }

            const fields = 'files(id, name, thumbnailLink, webContentLink, mimeType)';
            const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&key=${API_KEY}&pageSize=100`;

            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || "Bilinmeyen bir hata oluştu.");
            }

            const data = await response.json();
            const files = data.files;

            if (files && files.length > 0) {
                renderImages(files);
            } else {
                if(searchTerm) {
                    showError(`"${searchTerm}" aramasıyla eşleşen görsel bulunamadı.`);
                } else {
                    showError("Bu klasörde hiç görsel bulunamadı.");
                }
            }

        } catch (error) {
            showError(`Hata: ${error.message}`);
        } finally {
            loader.classList.add('hidden');
        }
    }

    function renderImages(files) {
        files.forEach((file, index) => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.style.animationDelay = `${index * 0.05}s`;
            
            let imgUrl = file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s800') : 'https://via.placeholder.com/400x300?text=Önizleme+Yok';
            let downloadUrl = file.webContentLink || `https://drive.google.com/uc?export=download&id=${file.id}`;

            card.innerHTML = `
                <img src="${imgUrl}" alt="${file.name}" class="image-preview" loading="lazy">
                <div class="image-info">
                    <div class="image-name" title="${file.name}">${file.name}</div>
                    <a href="${downloadUrl}" class="download-btn" target="_blank" download="${file.name}">
                        <i class="fas fa-download"></i> İndir
                    </a>
                </div>
            `;
            
            gallery.appendChild(card);
        });
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
});
