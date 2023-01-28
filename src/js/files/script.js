// Подключение функционала "Чертогов Фрилансера"
import { ScrollReveal } from "../libs/scrollreveal.min.js";
import { isMobile } from "./functions.js";
// Подключение списка активных модулей
import { flsModules } from "./modules.js";

window.onload = function () {
    document.addEventListener("click", documentActions)

    function documentActions(e) {
        const targetElement = e.target
        if (window.innerWidth > 768 && isMobile.any()) {
            if (targetElement.classList.contains('menu__arrow')) {
                targetElement.closest('.menu__item').classList.toggle('_hover')
            }
            if (!targetElement.closest('.menu__item') && document.querySelectorAll('.menu__item._hover').length > 0) {
                _removeClasses(document.querySelectorAll('.menu__item._hover'), '_hover')
            }
        }
        if (targetElement.classList.contains('search-form__icon')) {
            document.querySelector('.search-form').classList.toggle('_active')
        } else if (!targetElement.closest('.search-form') && document.querySelectorAll('.search-form._active')) {
            document.querySelector('.search-form').classList.remove('_active')
        }
        if (targetElement.classList.contains('products__more')) {
            getProducts(targetElement);
            e.preventDefault()
        }
        if (targetElement.classList.contains('action-product__button')) {
            const productId = targetElement.closest('.item-product').dataset.pid;
            addToCart(targetElement, productId);
            e.preventDefault();
        }
        if (targetElement.classList.contains('cart-header__icon') || targetElement.closest('.cart-header__icon')) {
            if (document.querySelector('.cart-list').children.length > 0) {
                document.querySelector('.cart-header').classList.toggle('_active');
            }
            e.preventDefault();
        } else if (!targetElement.closest('.cart-header') && !targetElement.classList.contains('action-product__button')) {
            document.querySelector('.cart-header').classList.remove('_active');
        }
        if (targetElement.classList.contains('cart-list__delete')) {
            const productId = targetElement.closest('.cart-list__item').dataset.cartPid;
            updateCart(targetElement, productId, false);
            e.preventDefault();
        }
    }

    //Header
    const headerElement = document.querySelector('.header')

    const callback = function (entries, observe) {
        if (entries[0].isIntersecting) {
            headerElement.classList.remove('_scroll')
        } else {
            headerElement.classList.add('_scroll')
        }
    }

    const headerObserver = new IntersectionObserver(callback)
    headerObserver.observe(headerElement)

    //Load More Products
    async function getProducts(button) {
        if (!button.classList.contains('_hold')) {
            button.classList.add('_hold')
            const file = "json/products.json"
            let response = await fetch(file, {
                method: "GET"
            })
            if (response.ok) {
                let result = await response.json()
                loadProducts(result)
                button.classList.remove('_hold')
                button.remove()
            } else {
                alert("Ошибка")
            }
        }
    }
    function loadProducts(data) {
        const productsItem = document.querySelector('.products__items')

        data.products.forEach(product => {
            const productId = product.id;
            const productUrl = product.url;
            const productImage = product.image;
            const productTitle = product.title;
            const productText = product.text;
            const productPrice = product.price;
            const productOldPrice = product.priceOld;
            const productShareUrl = product.shareUrl;
            const productLikeUrl = product.likeUrl;
            const productLabels = product.labels;

            let productTemplateStart = `<article data-pid="${productId}" class="products__item item-product">`;
            let productTemplateEnd = `</article>`;

            let productTemplateLabels = '';
            if (productLabels) {
                let productTemplateLabelsStart = `<div class="item-product__labels">`;
                let productTemplateLabelsEnd = `</div>`;
                let productTemplateLabelsContent = '';

                productLabels.forEach(labelItem => {
                    productTemplateLabelsContent += `<div class="item-product__label item-product__label_${labelItem.type}">${labelItem.value}</div>`;
                });

                productTemplateLabels += productTemplateLabelsStart;
                productTemplateLabels += productTemplateLabelsContent;
                productTemplateLabels += productTemplateLabelsEnd;
            }

            let productTemplateImage = `
    	<a href="${productUrl}" class="item-product__image _ibg">
    		<img src="img/products/${productImage}" alt="${productTitle}">
    	</a>
    `;

            let productTemplateBodyStart = `<div class="item-product__body">`;
            let productTemplateBodyEnd = `</div>`;

            let productTemplateContent = `
    	<div class="item-product__content">
    		<h3 class="item-product__title">${productTitle}</h3>
    		<div class="item-product__text">${productText}</div>
    	</div>
    `;

            let productTemplatePrices = '';
            let productTemplatePricesStart = `<div class="item-product__prices">`;
            let productTemplatePricesCurrent = `<div class="item-product__price">Rp ${productPrice}</div>`;
            let productTemplatePricesOld = `<div class="item-product__price item-product__price_old">Rp ${productOldPrice}</div>`;
            let productTemplatePricesEnd = `</div>`;

            productTemplatePrices = productTemplatePricesStart;
            productTemplatePrices += productTemplatePricesCurrent;
            if (productOldPrice) {
                productTemplatePrices += productTemplatePricesOld;
            }
            productTemplatePrices += productTemplatePricesEnd;

            let productTemplateActions = `
    	<div class="item-product__actions action-product">
    		<div class="action-product__body">
    			<a href="" class="action-product__button btn btn_white">Add to cart</a>
    			<a href="${productShareUrl}" class="action-product__link _icon-share">Share</a>
    			<a href="${productLikeUrl}" class="action-product__link _icon-favorite">Like</a>
    		</div>
    	</div>
    `;

            let productTemplateBody = '';
            productTemplateBody += productTemplateBodyStart;
            productTemplateBody += productTemplateContent;
            productTemplateBody += productTemplatePrices;
            productTemplateBody += productTemplateActions;
            productTemplateBody += productTemplateBodyEnd;

            let productTemplate = '';
            productTemplate += productTemplateStart;
            productTemplate += productTemplateLabels;
            productTemplate += productTemplateImage;
            productTemplate += productTemplateBody;
            productTemplate += productTemplateEnd;

            productsItem.insertAdjacentHTML('beforeend', productTemplate)
        });
    }
    function addToCart(productButton, productId) {
        if (!productButton.classList.contains('_hold')) {
            productButton.classList.add('_hold')
            productButton.classList.add('_fly')

            const cart = document.querySelector('.cart-header__icon')
            const product = document.querySelector(`[data-pid="${productId}"]`)
            const productImage = product.querySelector('.item-product__image')

            const productImageFly = productImage.cloneNode(true)

            const productImageFlyWidth = productImage.offsetWidth
            const productImageFlyHeight = productImage.offsetHeight
            const productImageFlyTop = productImage.getBoundingClientRect().top
            const productImageFlyLeft = productImage.getBoundingClientRect().left

            productImageFly.setAttribute('class', '_flyImage _ibg')
            productImageFly.style.cssText =
                `
			left: ${productImageFlyLeft}px;
			top: ${productImageFlyTop}px;
			width: ${productImageFlyWidth}px;
			height: ${productImageFlyHeight}px;
			`;

            document.body.append(productImageFly)

            const cartFlyLeft = cart.getBoundingClientRect().left
            const cartFlyTop = cart.getBoundingClientRect().top

            productImageFly.style.cssText = `
			left: ${cartFlyLeft}px;
			top: ${cartFlyTop}px;
			width: 0px;
			height: 0px;
			opacity: 0;
			`
            productImageFly.addEventListener('transitionend', function () {
                if (productButton.classList.contains('_fly')) {
                    productImageFly.remove()
                    updateCart(productButton, productId)
                    productButton.classList.remove('_fly')
                }
            })
        }
    }
    function updateCart(productButton, productId, productAdd = true) {
        const cart = document.querySelector('.cart-header');
        const cartIcon = cart.querySelector('.cart-header__icon');
        const cartQuantity = cartIcon.querySelector('span');
        const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`);
        const cartList = document.querySelector('.cart-list');

        // Добавляем
        if (productAdd) {
            if (cartQuantity) {
                cartQuantity.innerHTML = ++cartQuantity.innerHTML;
            } else {
                cartIcon.insertAdjacentHTML('beforeend', `<span>1</span>`);
            }
            if (!cartProduct) {
                const product = document.querySelector(`[data-pid="${productId}"]`);
                const cartProductImage = product.querySelector('.item-product__image').innerHTML;
                const cartProductTitle = product.querySelector('.item-product__title').innerHTML;
                const cartProductContent = `
				<a href="" class="cart-list__image _ibg">${cartProductImage}</a>
				<div class="cart-list__body">
					<a href="" class="cart-list__title">${cartProductTitle}</a>
					<div class="cart-list__quantity">Quantity: <span>1</span></div>
					<a class="cart-list__delete" href="#">Delete</a>
				</div>`;
                cartList.insertAdjacentHTML('beforeend', `<li data-cart-pid="${productId}" class="cart-list__item">${cartProductContent}</li>`)
            } else {
                const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
                cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML;
            }
            //После всех дейсвтий
            productButton.classList.remove('_hold');
        } else {
            const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
            cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML;
            if (!parseInt(cartProductQuantity.innerHTML)) {
                cartProduct.remove();
            }

            const cartQuantityValue = --cartQuantity.innerHTML;

            if (cartQuantityValue) {
                cartQuantity.innerHTML = cartQuantityValue;
            } else {
                cartQuantity.remove();
                cart.classList.remove('_active');
            }
        }
    }

    // Furniture Gallery
    const furniture = document.querySelector('.furniture__body')
    if (furniture && !isMobile.any()) {
        const furnitureItems = document.querySelector('.furniture__items');
        const furnitureColumn = document.querySelectorAll('.furniture__column');

        const speed = furniture.dataset.speed

        let positionX = 0
        let coordXprocent = 0

        function setMouseGalleryStyle() {
            let furnitureItemsWidth = 0
            furnitureColumn.forEach(element => {
                furnitureItemsWidth += element.offsetWidth
            });

            const furnitureDifferent = furnitureItemsWidth - furniture.offsetWidth
            const distX = Math.floor(coordXprocent - positionX)

            positionX = positionX + (distX * speed)
            let position = furnitureDifferent / 200 * positionX

            furnitureItems.style.cssText = `transform: translate3d(${-position}px,0,0);`

            if (Math.abs(distX) > 0) {
                requestAnimationFrame(setMouseGalleryStyle)
            } else {
                furniture.classList.remove('_init')
            }
        }
        furniture.addEventListener("mousemove", function (e) {
            const furnitureWidth = furniture.offsetWidth
            const coordX = e.pageX - furnitureWidth / 2
            coordXprocent = coordX / furnitureWidth * 200

            if (!furniture.classList.contains('._init')) {
                requestAnimationFrame(setMouseGalleryStyle)
                furniture.classList.add('_init')
            }
        })
    }

    // ScrollReveal
    const sr = ScrollReveal({
        origin: "top",
        distance: "80px",
        duration: 1300,
        delay: 100,
        mobile: false,
        // reset: true
    });

    sr.reveal(`.header__logo, .footer__main, .furniture__label, .tips__title, .products__title`);
    sr.reveal(`.rooms__body, .main-slider__content`, { origin: "left" });

    sr.reveal(`.furniture__title`, { delay: 200 });
    sr.reveal(`.header__menu, .menu-footer__column, .products__item, .advantages__item`, { delay: 200, interval: 100 });
    sr.reveal(`.header__search`, { delay: 300 });
    sr.reveal(`.actions-header__item_favorites, .footer__subscribe`, { delay: 400 });
    sr.reveal(`.cart-header__icon`, { delay: 500 });
    sr.reveal(`.actions-header__item_user`, { delay: 600 });
}

