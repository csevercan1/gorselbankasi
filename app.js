document.addEventListener('DOMContentLoaded', () => {
    // BURAYA KENDİ BİLGİLERİNİZİ GİRİN
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbywDPN3AxB5LRwXBBMK7qMTlA4oI6xJA6Qr2IxNh1CXR3EFm8xhq6yC6YcPEE_Nxoz7ow/exec';
    const FOLDER_ID = '1IIs4wmDMvE6DDNS3oI5f84QfYrMd7cT1';

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
        if (WEB_APP_URL === 'BURAYA_APPS_SCRIPT_LINKINI_YAPISTIRIN' || FOLDER_ID === 'BURAYA_KLASOR_ID_YAZIN') {
            showError("Lütfen kodun (app.js) içindeki WEB_APP_URL ve FOLDER_ID alanlarını doldurun!");
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
            // Google Apps Script URL'sine istek atıyoruz
            // Tarayıcının eski (boş) sonucu önbellekten getirmesini engellemek için sonuna tarih damgası ekliyoruz
            const url = `${WEB_APP_URL}?folderId=${FOLDER_ID}&search=${encodeURIComponent(searchTerm)}&t=${new Date().getTime()}`;

            const response = await fetch(url, { redirect: 'follow' });
            
            if (!response.ok) {
                throw new Error("Sunucuya bağlanırken hata oluştu.");
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Görseller yüklenirken bir hata oluştu.");
            }

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
            
            card.innerHTML = `
                <img src="${file.thumbnailLink}" alt="${file.name}" class="image-preview" loading="lazy">
                <div class="image-info">
                    <div class="image-name" title="${file.name}">${file.name}</div>
                    <a href="${file.webContentLink}" class="download-btn" target="_blank" download="${file.name}">
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
