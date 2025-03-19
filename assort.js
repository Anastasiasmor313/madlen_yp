let favorites = [];
        
        function renderCatalog() {
          const catalogGrid = document.querySelector('.catalog-grid');
          catalogGrid.innerHTML = catalogData.map(item => `
            <div class="catalog-card" data-id="${item.id}">
              <img src="${item.image}" alt="${item.name}" class="catalog-img">
              <div class="catalog-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <h4>${item.price}</h4>
                <button class="favorite-btn ${favorites.includes(item.id) ? 'active' : ''}" 
                        onclick="toggleFavorite(${item.id})">
                  ${favorites.includes(item.id) ? 'В избранном' : 'Добавить в избранное'}
                </button>
              </div>
            </div>
          `).join('');
        }
        
        function renderFavorites() {
          const favoritesGrid = document.querySelector('.favorites-grid');
          const favoriteItems = catalogData.filter(item => favorites.includes(item.id));
          
          if (favoriteItems.length === 0) {
            favoritesGrid.innerHTML = '<p>В избранном пока ничего нет</p>';
            return;
          }
          
          favoritesGrid.innerHTML = favoriteItems.map(item => `
            <div class="catalog-card" data-id="${item.id}">
              <img src="${item.image}" alt="${item.name}" class="catalog-img">
              <div class="catalog-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <h4>${item.price}</h4>
                <button class="remove-btn" onclick="toggleFavorite(${item.id})">
                  Удалить из избранного
                </button>
              </div>
            </div>
          `).join('');
        }
        
        function toggleFavorite(id) {
          const index = favorites.indexOf(id);
          if (index === -1) {
            favorites.push(id);
          } else {
            favorites.splice(index, 1);
          }
          
          // Save to localStorage
          localStorage.setItem('favorites', JSON.stringify(favorites));
          
          renderCatalog();
          renderFavorites();
        }
        
        // Load favorites from localStorage on page load
        window.addEventListener('DOMContentLoaded', () => {
          const savedFavorites = localStorage.getItem('favorites');
          if (savedFavorites) {
            favorites = JSON.parse(savedFavorites);
          }
          
          renderCatalog();
          renderFavorites();
        });
        
        document.getElementById('orderForm').addEventListener('submit', async function (e) {
          e.preventDefault();
          const form = e.target;
          const formData = new FormData(form);
          let isValid = true;
          form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
              isValid = false;
              field.classList.add('invalid');
            } else {
              field.classList.remove('invalid');
            }
          });
          if (!isValid) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
          }
          try {
            await submitToTelegram(formData);
            showModal();
            form.reset();
          } catch (error) {
            alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте позже.');
          }
        });
        
        document.querySelectorAll('.form-control').forEach(input => {
          input.addEventListener('input', function () {
            if (this.hasAttribute('required')) {
              if (this.value.trim()) {
                this.classList.remove('invalid');
              } else {
                this.classList.add('invalid');
              }
            }
          });
        });
        
        const productContainer = document.querySelector('.product-container');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        let position = 0;
        let visibleCards = 3;
        const totalCards = 6;
        
        function updateSliderPosition() {
          productContainer.style.transform = `translateX(${position}px)`;
        }
        
        function updateVisibleCards() {
          if (window.innerWidth > 1200) {
            visibleCards = 3;
          } else if (window.innerWidth > 768) {
            visibleCards = 2;
          } else {
            visibleCards = 1;
          }
        }
        
        window.addEventListener('resize', () => {
          updateVisibleCards();
          position = 0;
          updateSliderPosition();
        });
        
        updateVisibleCards();
        
        nextBtn.addEventListener('click', () => {
          const cardWidth = document.querySelector('.product-card').offsetWidth;
          position -= cardWidth;
          if (Math.abs(position) >= totalCards * cardWidth) {
            position = 0;
          }
          updateSliderPosition();
        });
        
        prevBtn.addEventListener('click', () => {
          const cardWidth = document.querySelector('.product-card').offsetWidth;
          position += cardWidth;
          if (position > 0) {
            position = -(totalCards - visibleCards) * cardWidth;
          }
          updateSliderPosition();
        });
        
        function showModal() {
          document.getElementById('successModal').style.display = 'flex';
        }
        
        function closeModal() {
          document.getElementById('successModal').style.display = 'none';
        }
        
        async function submitToTelegram(formData) {
          const BOT_TOKEN = '7666104449:AAHJH8W7APKkzHEn-SD6OGwJR2j7bH3MRZU';
          const CHAT_ID = '1200608860';
          const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
          const message = `📩 Вам новая заявка:
        <b>ФИО:</b> ${formData.get('fullName')}
        <b>Телефон:</b> ${formData.get('phone')}
        <b>E-mail:</b> ${formData.get('email')}
        <b>Название продукта:</b> ${formData.get('productName')}
        <b>Количество порций:</b> ${formData.get('portions')}
        <b>Дата изготовления заказа:</b> ${formData.get('orderDate')}
        <b>Способ получения заказа:</b> ${formData.get('deliveryMethod')}
        ${formData.get('comments') ? `<b>Комментарий:</b> ${formData.get('comments')}` : ''}`;
          try {
            const response = await fetch(API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
              })
            });
            if (!response.ok) {
              throw new Error('Failed to send message');
            }
          } catch (error) {
            console.error('Error sending to Telegram:', error);
            throw error;
          }
        }