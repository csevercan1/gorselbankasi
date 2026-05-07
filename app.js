document.addEventListener('DOMContentLoaded', () => {
    // BURAYA KENDİ BİLGİLERİNİZİ GİRİN
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwNqfCTIQ6x8y9pt0trifnaxm1Yb8ZYefTeszc75_IAegwIHssUc0l1O-Zxyw13ZsgZww/exec';
    // Birden fazla klasör eklemek isterseniz aralarına virgül koyarak yazabilirsiniz: 'ID1,ID2,ID3'
    const FOLDER_ID = '1NdB7NbAAojd5Y3JgRIWuSNnC-wbA39N5,1Hl2yu6s_sQWdICd8NjKdD5NRG7sqNI_V,1AeDkjiM_6xTnOAH1Dw2ybpgEZ7EoIAHo,1mIII6Oj0WNtLuHMz3N2esT_Q045talQJ';

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const gallery = document.getElementById('gallery');
    const resultCount = document.getElementById('resultCount');
    const loader = document.getElementById('loader');
    const loadingText = document.getElementById('loadingText');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const errorMessage = document.getElementById('error-message');

    let allFiles = [];
    let currentRenderIndex = 0;
    const ITEMS_PER_CHUNK = 50;

    let globalArchive = null; // Tüm arşivi hafızada tutacağız
    let isFetching = false;
    let progressInterval;

    function startProgressBar() {
        progressContainer.classList.remove('hidden');
        loadingText.textContent = "15.000+ dosya Google'dan taranıyor. Bu işlem arşivin büyüklüğüne göre 1-2 dakika sürebilir, lütfen bekleyin...";
        let width = 0;
        progressBar.style.width = '0%';
        
        // Sahte ama gerçeğe yakın bir dolum animasyonu (90'a kadar)
        progressInterval = setInterval(() => {
            if (width >= 90) {
                clearInterval(progressInterval);
            } else {
                width += Math.random() * 2;
                progressBar.style.width = width + '%';
            }
        }, 1000);
    }

    function completeProgressBar() {
        if (progressInterval) clearInterval(progressInterval);
        progressBar.style.width = '100%';
        loadingText.textContent = "İşlem tamamlanıyor...";
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            loadingText.textContent = "Görseller yükleniyor...";
        }, 800);
    }

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
        if (isFetching) return;
        
        gallery.innerHTML = '';
        hideError();
        resultCount.classList.add('hidden');
        loader.classList.remove('hidden');
        allFiles = [];
        currentRenderIndex = 0;

        try {
            let filesToRender = [];

            if (globalArchive !== null) {
                if (searchTerm) {
                    const term = searchTerm.toLocaleLowerCase('tr-TR');
                    filesToRender = globalArchive.filter(f => f.name.toLocaleLowerCase('tr-TR').includes(term));
                } else {
                    filesToRender = globalArchive;
                }
                await new Promise(r => setTimeout(r, 400));
            } else {
                isFetching = true;
                startProgressBar(); // Yüklenme barını başlat
                
                const url = `${WEB_APP_URL}?folderId=${FOLDER_ID}&t=${new Date().getTime()}`;
                const response = await fetch(url, { redirect: 'follow' });
                
                if (!response.ok) {
                    throw new Error("Sunucuya bağlanırken hata oluştu.");
                }

                const data = await response.json();
                
                completeProgressBar(); // Barı %100 yap ve kapat

                if (!data.success) {
                    throw new Error(data.error || "Görseller yüklenirken bir hata oluştu.");
                }

                globalArchive = data.files;
                
                if (searchTerm) {
                    const term = searchTerm.toLocaleLowerCase('tr-TR');
                    filesToRender = globalArchive.filter(f => f.name.toLocaleLowerCase('tr-TR').includes(term));
                } else {
                    filesToRender = globalArchive;
                }
                isFetching = false;
            }

            if (filesToRender && filesToRender.length > 0) {
                resultCount.textContent = `Toplam ${filesToRender.length} görsel bulundu.`;
                resultCount.classList.remove('hidden');
                allFiles = filesToRender;
                currentRenderIndex = 0;
                renderChunk();
            } else {
                if(searchTerm) {
                    showError(`"${searchTerm}" aramasıyla eşleşen görsel bulunamadı.`);
                } else {
                    showError("Bu klasörde hiç görsel bulunamadı.");
                }
            }

        } catch (error) {
            showError(`Hata: ${error.message}`);
            isFetching = false;
        } finally {
            loader.classList.add('hidden');
        }
    }

    function renderChunk() {
        const chunk = allFiles.slice(currentRenderIndex, currentRenderIndex + ITEMS_PER_CHUNK);
        if (chunk.length === 0) return;

        chunk.forEach((file, index) => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.style.animationDelay = `${(index % ITEMS_PER_CHUNK) * 0.05}s`;
            
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

        currentRenderIndex += ITEMS_PER_CHUNK;
    }

    // Sayfa aşağı kaydırıldıkça yeni resimleri yükle (Sonsuz Kaydırma / Infinite Scroll)
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
            if (currentRenderIndex < allFiles.length) {
                renderChunk();
            }
        }
    });

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
