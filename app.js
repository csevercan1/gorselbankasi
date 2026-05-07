document.addEventListener('DOMContentLoaded', () => {
    // BURAYA KENDİ BİLGİLERİNİZİ GİRİN
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwNqfCTIQ6x8y9pt0trifnaxm1Yb8ZYefTeszc75_IAegwIHssUc0l1O-Zxyw13ZsgZww/exec';
    const FOLDER_ID = '1IIs4wmDMvE6DDNS3oI5f84QfYrMd7cT1';

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const gallery = document.getElementById('gallery');
    const resultCount = document.getElementById('resultCount');
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
        resultCount.classList.add('hidden');
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
                resultCount.textContent = `Toplam ${files.length} görsel bulundu.`;
                resultCount.classList.remove('hidden');
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
            
            // Küçük önizleme resmi (neon renk problemini kökten çözer ve hızlı yüklenir)
            let imgUrl = file.thumbnailLink.replace('sz=w1200', 'sz=w400');

            card.innerHTML = `
                <img src="${imgUrl}" alt="${file.name}" class="image-preview" loading="lazy">
                <div class="image-info">
                    <div class="image-name" title="${file.name}">${file.name}</div>
                    <a href="${file.webContentLink}" class="download-btn" target="_blank" download="${file.name}">
                        <i class="fas fa-download"></i> İndir
                    </a>
                </div>
            `;
            
            gallery.appendChild(card);

            // Lightbox açma işlemi
            const imgPreview = card.querySelector('.image-preview');
            imgPreview.addEventListener('click', () => {
                // TIF dosyalarındaki Neon Renk problemini ortadan kaldırmak için en stabil boyut w800'dür
                const highResUrl = file.thumbnailLink.replace('sz=w1200', 'sz=w800');
                
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightboxImage');
                const lightboxCaption = document.getElementById('lightboxCaption');
                
                lightboxImg.src = highResUrl;
                lightboxCaption.textContent = file.name;
                lightbox.classList.remove('hidden');
            });
        });
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    // Lightbox kapatma işlemleri
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightboxClose');

    // Kapatma butonuna (X) basıldığında
    lightboxClose.addEventListener('click', () => {
        lightbox.classList.add('hidden');
    });

    // Resmin dışındaki karanlık alana tıklandığında
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.add('hidden');
        }
    });

    // Klavyeden ESC tuşuna basıldığında
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            lightbox.classList.add('hidden');
        }
    });
});
