window.addEventListener('DOMContentLoaded', function() {
    var chatForm = document.getElementById('chat-form');
    var userInput = document.getElementById('user-input');
    var quickQuestionButtons = document.querySelectorAll('.quick-questions button');
    var customerForm = document.getElementById('customer-form');
    var cancelCustomerModal = document.getElementById('cancel-customer-modal');
    var deliveryMapForm = document.getElementById('delivery-map-form');
    var cancelDeliveryMapModal = document.getElementById('cancel-delivery-map-modal');
    var cardForm = document.getElementById('card-form');
    var cancelCardModal = document.getElementById('cancel-card-modal');
    var cardReminder = document.getElementById('card-reminder');
    var cardReminderTimer = null;

    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }

    if (userInput) {
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    quickQuestionButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            sendMessage(button.dataset.question);
        });
    });

    if (customerForm) {
        customerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitCustomerData();
        });
    }

    if (cancelCustomerModal) {
        cancelCustomerModal.addEventListener('click', function() {
            closeCustomerModal();
            displayMessage("Puedes confirmar el pedido cuando estes listo o escribir cancelar.", "bot");
        });
    }

    if (deliveryMapForm) {
        deliveryMapForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitDeliveryMapSearch();
        });
    }

    if (cancelDeliveryMapModal) {
        cancelDeliveryMapModal.addEventListener('click', function() {
            closeDeliveryMapModal();
        });
    }

    if (cardForm) {
        cardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitCardPayment();
        });
    }

    if (cancelCardModal) {
        cancelCardModal.addEventListener('click', function() {
            closeCardModal();
            resetCardForm();
            displayMessage("Pago con tarjeta cancelado. Puedes elegir efectivo o volver a intentar con tarjeta.", "bot");
        });
    }

    if (typeof setupCardPreview === 'function') {
        setupCardPreview();
    }

    showWelcomeMessage();

    function showCardReminder() {
        if (!cardReminder) {
            return;
        }

        if (cardReminderTimer) {
            clearTimeout(cardReminderTimer);
            cardReminderTimer = null;
        }

        cardReminder.classList.remove('hidden');
        cardReminderTimer = setTimeout(function() {
            cardReminder.classList.add('hidden');
            cardReminderTimer = null;
        }, 10000);
    }

    function hideCardReminder() {
        if (!cardReminder) {
            return;
        }

        if (cardReminderTimer) {
            clearTimeout(cardReminderTimer);
            cardReminderTimer = null;
        }

        cardReminder.classList.add('hidden');
    }

    window.showCardReminder = showCardReminder;
    window.hideCardReminder = hideCardReminder;
});

        function normalizeMessage(text) {
            return text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        }

        const orderCatalog = [
            { name: "Combo Buen Provecho", price: 22, aliases: ["combo buen provecho", "buen provecho"] },
            { name: "Combo El Tragon", price: 30, aliases: ["combo el tragon", "el tragon", "tragon"] },
            { name: "Combo Familiar", price: 110, aliases: ["combo familiar", "familiar"] },
            { name: "Menu Infantil", price: 25, aliases: ["menu infantil", "infantil", "macpupusin"] },
            { name: "Loroco con queso", price: 11, aliases: ["loroco", "loroco con queso"] },
            { name: "Chicharron", price: 10, aliases: ["chicharron"] },
            { name: "Mixtas", price: 12, aliases: ["mixtas", "mixta"] },
            { name: "Queso", price: 8, aliases: ["queso"] },
            { name: "Gaseosa en lata", price: 6, aliases: ["gaseosa", "lata"] },
            { name: "Horchata", price: 8, aliases: ["horchata"] },
            { name: "Jamaica", price: 8, aliases: ["jamaica"] },
            { name: "Tamarindo", price: 8, aliases: ["tamarindo"] },
            { name: "Cafe", price: 5, aliases: ["cafe"] },
            { name: "Agua pura", price: 4, aliases: ["agua", "agua pura"], exactMatchOnly: true }
        ];

        let currentOrder = {
            active: false,
            step: "items",
            items: [],
            customer: {
                name: "",
                phone: "",
                address: ""
            }
        };

        let completedOrder = null;

        const BOT_RESPONSE_DELAY_MS = 850;
        const DELIVERY_MODAL_AFTER_RESPONSE_MS = 3000;
        const DELIVERY_INTRO_MESSAGE = "Asi es, hacemos pedidos a domicilio, solo brindanos tu direccion y te dare el tiempo estimado y el precio de envio";
        const NO_ORDER_DELIVERY_TIME_MESSAGE = "no tenemos ningun pedido registrado, brindame el numero de pedido o realiza uno para poder brindarte el aproximado de entrega segun tu direccion";

        function getWelcomeMessage() {
            return "Hola. Bienvenido a MacPUPUSAS.\n\n" +
                "Puedes preguntarme sobre:\n" +
                "- Menu y precios\n" +
                "- Combos disponibles\n" +
                "- Promociones disponibles\n" +
                "- Entregas a domicilio\n" +
                "- Tiempo de entrega\n" +
                "- Horario del restaurante\n" +
                "- Formas de pago\n" +
                "- Ubicacion\n" +
                "- Acompanamientos\n" +
                "- Registrar pedido\n" +
                "- Costo de envio\n" +
                "- Descuentos para eventos\n" +
                "- Estado de pedido\n" +
                "- Bebidas";
        }

        function getUnknownMessage() {
            return "Lo lamento, no entendi tu pregunta, pero con gusto puedes elegir una de estas opciones. Estamos para servirte.\n\n" +
                "Puedes preguntarme sobre:\n" +
                "- Menu y precios\n" +
                "- Combos disponibles\n" +
                "- Promociones disponibles\n" +
                "- Entregas a domicilio\n" +
                "- Tiempo de entrega\n" +
                "- Horario del restaurante\n" +
                "- Formas de pago\n" +
                "- Ubicacion\n" +
                "- Acompanamientos\n" +
                "- Registrar pedido\n" +
                "- Costo de envio\n" +
                "- Bebidas";
        }

        function getMenuMessage() {
            return "Menu de pupusas:\n" +
                "- Queso: Q8\n" +
                "- Chicharron: Q10\n" +
                "- Mixtas: Q12\n" +
                "- Loroco con queso: Q11\n\n" +
                "Tambien puedes escribir \"combos\" para ver combos o \"bebidas\" para ver bebidas.";
        }

        function getCombosMessage() {
            return "Combos disponibles:\n" +
                "- Combo Buen Provecho: 2 pupusas + bebida por Q22\n" +
                "- Combo El Tragon: 3 pupusas + bebida por Q30\n" +
                "- Combo Familiar: 10 pupusas + 4 bebidas por Q110\n" +
                "- Menu Infantil: 2 mini pupusas, jugo de naranja y juguete de MacPupusin por Q25.";
        }

        function getPromotionsMessage() {
            return "Promociones disponibles:\n" +
                "- Martes Pupusero: paga 2 pupusas y recibe la tercera gratis.\n" +
                "- Envio gratis en pedidos mayores a Q80 dentro del area de cobertura.\n" +
                "- Por la compra de 6 pupusas o mas, recibe una bebida natural gratis.\n" +
                "- Pedidos mayores a 25 pupusas tienen descuento especial.\n" +
                "- Cliente frecuente: en tu quinto pedido recibes una bebida gratis o 15% de descuento.\n" +
                "- Hora feliz: de 3:00 p.m. a 5:00 p.m., bebidas naturales a Q6.";
        }

        function getOrderStartMenuMessage() {
            return "Menu de pupusas:\n" +
                "- Queso: Q8\n" +
                "- Chicharron: Q10\n" +
                "- Mixtas: Q12\n" +
                "- Loroco con queso: Q11";
        }

        function getKidsMenuMessage() {
            return "Menu Infantil:\n" +
                "- 2 mini pupusas de queso o frijol con queso\n" +
                "- Jugo de naranja\n" +
                "- Juguete de MacPupusin\n\n" +
                "Precio: Q25";
        }

        function getBeveragesMessage() {
            return "Menu de bebidas:\n" +
                "- Gaseosa en lata: Q6\n" +
                "- Agua pura: Q4\n" +
                "- Horchata: Q8\n" +
                "- Jamaica: Q8\n" +
                "- Tamarindo: Q8\n" +
                "- Cafe: Q5";
        }

        function isOrderStart(mensaje) {
            return mensaje === "pedido" ||
                mensaje.includes("hacer pedido") ||
                mensaje.includes("realizar pedido") ||
                mensaje.includes("registrar pedido") ||
                mensaje.includes("nuevo pedido") ||
                mensaje.includes("quiero pedir") ||
                mensaje.includes("quiero ordenar") ||
                mensaje.includes("ordenar") ||
                mensaje.includes("comprar");
        }

        function isDeliveryTimeQuestion(mensaje) {
            return mensaje.includes("tiempo de entrega") ||
                mensaje.includes("cuanto tarda") ||
                mensaje.includes("cuanto demora") ||
                mensaje.includes("cuando llega") ||
                mensaje.includes("aproximado de entrega");
        }

        function isLocationQuestion(mensaje) {
            return mensaje.includes("ubicacion") ||
                mensaje.includes("ubicacion exacta") ||
                mensaje.includes("ubicados") ||
                mensaje.includes("donde estan") ||
                mensaje.includes("donde esta") ||
                mensaje.includes("donde quedan") ||
                mensaje.includes("donde queda") ||
                mensaje.includes("en que zona estan") ||
                mensaje.includes("en que zona quedan") ||
                mensaje.includes("en que zona estan ubicados") ||
                mensaje.includes("direccion") ||
                mensaje.includes("local") ||
                mensaje.includes("sucursal") ||
                mensaje.includes("como llegar") ||
                mensaje.includes("referencia") ||
                mensaje.includes("google maps") ||
                mensaje.includes("mapa") ||
                mensaje.includes("mapas") ||
                mensaje.includes("cerca de") ||
                mensaje.includes("metrocentro") ||
                mensaje.includes("zona 4") ||
                mensaje.includes("villa nueva");
        }

        function isDeliveryAddressRequest(mensaje) {
            return mensaje.includes("entregas a domicilio") ||
                mensaje.includes("entregan a domicilio") ||
                mensaje.includes("pedido a domicilio") ||
                mensaje.includes("pedidos a domicilio") ||
                mensaje.includes("hacen pedidos a domicilio") ||
                mensaje.includes("hacen entregas a domicilio") ||
                mensaje.includes("llevan a domicilio") ||
                mensaje.includes("servicio a domicilio") ||
                mensaje.includes("servicio delivery") ||
                mensaje.includes("domicilio") ||
                mensaje.includes("delivery") ||
                mensaje.includes("envio") ||
                mensaje.includes("envian") ||
                mensaje.includes("enviar");
        }

        function scheduleDeliveryMapModal() {
            setTimeout(function() {
                openDeliveryMapModal();
            }, BOT_RESPONSE_DELAY_MS + DELIVERY_MODAL_AFTER_RESPONSE_MS);
        }

        function isBlockedDuringOrderQuestion(mensaje) {
            return mensaje === "combos" ||
                mensaje.includes("ver combos") ||
                mensaje.includes("promocion") ||
                mensaje.includes("promociones") ||
                mensaje.includes("oferta") ||
                mensaje.includes("descuento") ||
                mensaje.includes("horario") ||
                mensaje.includes("abiertos") ||
                mensaje.includes("pago") ||
                mensaje.includes("pagar") ||
                mensaje.includes("tarjeta") ||
                isDeliveryTimeQuestion(mensaje) ||
                isDeliveryAddressRequest(mensaje);
        }

        function getBlockedDuringOrderMessage() {
            return "Ahora mismo estamos registrando tu pedido. Para consultar otras opciones como promociones, horario, pagos o domicilio, primero escribe \"cancelar\" para salir del pedido.\n\n" +
                "Si deseas continuar, escribe productos del menu, \"ver pedido\", \"confirmar\", \"quitar\", \"eliminar\" o \"borrar\".";
        }

        function resetOrder() {
            currentOrder = {
                active: false,
                step: "items",
                items: [],
                customer: {
                    name: "",
                    phone: "",
                    address: ""
                }
            };
        }

        function startOrder() {
            resetOrder();
            currentOrder.active = true;

            return "Perfecto, que deseas ordenar?\n\n" +
                getMenuMessage() + "\n\n" +
                getCombosMessage() + "\n\n" +
                "Puedes escribir uno o varios productos con cantidad.\n\n" +
                "Ejemplos:\n" +
                "- 2 queso, 1 horchata\n" +
                "- 3 mixtas, 1 jamaica\n" +
                "- 2 loroco con queso, 1 agua pura\n\n" +
                "Si luego quieres quitar algo, usa \"quitar\", \"eliminar\" o \"borrar\" seguido del producto.\n" +
                "Ejemplo: \"quitar 1 queso\" o \"eliminar horchata\".";
        }

        function findCatalogItem(fragment) {
            const searchableFragment = fragment
                .replace(/\bpupusa\b/g, "")
                .replace(/\bpupusas\b/g, "")
                .replace(/\bde\b/g, "")
                .replace(/\s+/g, " ")
                .trim();
            const fragmentWithoutQuantity = searchableFragment
                .replace(/\b\d+\b/g, "")
                .replace(/\s+/g, " ")
                .trim();

            for (let i = 0; i < orderCatalog.length; i++) {
                const product = orderCatalog[i];

                for (let j = 0; j < product.aliases.length; j++) {
                    if (product.exactMatchOnly && fragmentWithoutQuantity !== product.aliases[j]) {
                        continue;
                    }

                    if (searchableFragment.includes(product.aliases[j])) {
                        return product;
                    }
                }
            }

            return null;
        }

        function parseOrderItems(userInput) {
            const normalizedInput = normalizeMessage(userInput).replace(/\by\b/g, ",");
            const fragments = normalizedInput
                .split(",")
                .map(function(fragment) {
                    return fragment.trim();
                })
                .filter(function(fragment) {
                    return fragment !== "";
                });

            const items = [];

            fragments.forEach(function(fragment) {
                const product = findCatalogItem(fragment);

                if (product) {
                    const quantityMatch = fragment.match(/\b(\d+)\b/);
                    const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;

                    items.push({
                        name: product.name,
                        price: product.price,
                        quantity: quantity
                    });
                }
            });

            return items;
        }

        function parseOrderRemovals(userInput) {
            const normalizedInput = normalizeMessage(userInput).replace(/\by\b/g, ",");

            if (!/\b(quitar|eliminar|borrar)\b/.test(normalizedInput)) {
                return [];
            }

            const fragments = normalizedInput
                .split(",")
                .map(function(fragment) {
                    return fragment.trim();
                })
                .filter(function(fragment) {
                    return fragment !== "";
                });

            const items = [];

            fragments.forEach(function(fragment) {
                const cleanedFragment = fragment
                    .replace(/\b(quitar|eliminar|borrar)\b/g, "")
                    .replace(/\bde\b/g, " ")
                    .replace(/\bdel\b/g, " ")
                    .replace(/\bel\b/g, " ")
                    .replace(/\bla\b/g, " ")
                    .replace(/\blos\b/g, " ")
                    .replace(/\blas\b/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();

                if (cleanedFragment === "") {
                    return;
                }

                const product = findCatalogItem(cleanedFragment);

                if (product) {
                    const quantityMatch = cleanedFragment.match(/\b(\d+)\b/);
                    const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : null;

                    items.push({
                        name: product.name,
                        quantity: quantity
                    });
                }
            });

            return items;
        }

        function addItemsToOrder(items) {
            items.forEach(function(item) {
                const existingItem = currentOrder.items.find(function(orderItem) {
                    return orderItem.name === item.name;
                });

                if (existingItem) {
                    existingItem.quantity += item.quantity;
                }
                else {
                    currentOrder.items.push(item);
                }
            });
        }

        function removeItemsFromOrder(items) {
            const removedItems = [];
            const missingItems = [];

            items.forEach(function(item) {
                const existingItem = currentOrder.items.find(function(orderItem) {
                    return orderItem.name === item.name;
                });

                if (!existingItem) {
                    missingItems.push(item.name);
                    return;
                }

                const quantityToRemove = item.quantity === null
                    ? existingItem.quantity
                    : Math.min(item.quantity, existingItem.quantity);

                existingItem.quantity -= quantityToRemove;

                if (existingItem.quantity <= 0) {
                    currentOrder.items = currentOrder.items.filter(function(orderItem) {
                        return orderItem.name !== item.name;
                    });
                }

                removedItems.push({
                    name: item.name,
                    quantity: quantityToRemove
                });
            });

            return {
                removedItems: removedItems,
                missingItems: missingItems
            };
        }

        function getOrderTotal(order) {
            const targetOrder = order || currentOrder;

            return targetOrder.items.reduce(function(total, item) {
                return total + (item.price * item.quantity);
            }, 0);
        }

        function getOrderGrandTotal(order) {
            const targetOrder = order || currentOrder;
            const deliveryCost = targetOrder.deliveryEstimate ? targetOrder.deliveryEstimate.cost : 0;

            return getOrderTotal(targetOrder) + deliveryCost;
        }

        function getOrderSummary(order) {
            const targetOrder = order || currentOrder;

            if (targetOrder.items.length === 0) {
                return "Tu pedido aun no tiene productos.";
            }

            const itemLines = targetOrder.items.map(function(item) {
                return "- " + item.quantity + " x " + item.name + ": Q" + (item.price * item.quantity);
            });

            const deliveryCost = targetOrder.deliveryEstimate ? targetOrder.deliveryEstimate.cost : 0;
            const hasDelivery = deliveryCost > 0;
            const totalWithDelivery = getOrderTotal(targetOrder) + deliveryCost;

            return "Pedido actual:\n" +
                itemLines.join("\n") +
                (hasDelivery ? "\n\nCosto de envio: Q" + deliveryCost : "") +
                "\n\nTotal: Q" + totalWithDelivery;
        }

        function openCustomerModal() {
            const customerModal = document.getElementById('customer-modal');
            const customerName = document.getElementById('customer-name');
            if (!customerModal || !customerName) {
                return;
            }
            clearCustomerFormError();
            customerModal.classList.remove('hidden');
            customerName.focus();
        }

        function closeCustomerModal() {
            const customerModal = document.getElementById('customer-modal');
            if (!customerModal) {
                return;
            }
            clearCustomerFormError();
            customerModal.classList.add('hidden');
        }

        function showCustomerFormError(message) {
            const errorElement = document.getElementById('customer-form-error');
            if (!errorElement) {
                return;
            }

            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }

        function clearCustomerFormError() {
            const errorElement = document.getElementById('customer-form-error');
            if (!errorElement) {
                return;
            }

            errorElement.textContent = "";
            errorElement.classList.add('hidden');
        }

        function openDeliveryMapModal() {
            const deliveryMapModal = document.getElementById('delivery-map-modal');
            const deliveryAddressInput = document.getElementById('delivery-address-input');
            if (!deliveryMapModal || !deliveryAddressInput) {
                return;
            }
            clearDeliveryMapError();
            deliveryMapModal.classList.remove('hidden');
            deliveryAddressInput.focus();
        }

        function closeDeliveryMapModal() {
            const deliveryMapModal = document.getElementById('delivery-map-modal');
            if (!deliveryMapModal) {
                return;
            }
            clearDeliveryMapError();
            deliveryMapModal.classList.add('hidden');
        }

        function showDeliveryMapError(message) {
            const errorElement = document.getElementById('delivery-map-error');
            if (!errorElement) {
                return;
            }

            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }

        function clearDeliveryMapError() {
            const errorElement = document.getElementById('delivery-map-error');
            if (!errorElement) {
                return;
            }

            errorElement.textContent = "";
            errorElement.classList.add('hidden');
        }

        function submitDeliveryMapSearch() {
            const addressInput = document.getElementById('delivery-address-input');
            const deliveryMapForm = document.getElementById('delivery-map-form');
            if (!addressInput || !deliveryMapForm) {
                return;
            }
            const address = addressInput.value.trim();

            if (address === "") {
                showDeliveryMapError("Por favor escribe una direccion para calcular el envio.");
                return;
            }

            const deliveryEstimate = getRandomDeliveryEstimate();

            closeDeliveryMapModal();
            deliveryMapForm.reset();
            displayMessage("Direccion para entrega:\n" + address, "user");
            displayDeliveryEstimate(address, deliveryEstimate);
        }

        function getRandomDeliveryEstimate() {
            return {
                cost: Math.floor(10 + Math.random() * 11),
                minutes: Math.floor(30 + Math.random() * 16)
            };
        }

        function hasConfirmedOrder() {
            return completedOrder && completedOrder.orderNumber;
        }

        function getConfirmedOrderStatusMessage() {
            if (!hasConfirmedOrder()) {
                return NO_ORDER_DELIVERY_TIME_MESSAGE;
            }

            return "Tu pedido ya esta registrado.\n\n" +
                "Numero de pedido: " + completedOrder.orderNumber + "\n" +
                "Estado: " + completedOrder.status + "\n" +
                "Metodo de pago: " + completedOrder.paymentMethod + "\n" +
                "Repartidor asignado: " + completedOrder.deliveryPerson + "\n" +
                "Direccion: " + completedOrder.customer.address + "\n" +
                "Costo de envio: Q" + completedOrder.deliveryEstimate.cost + "\n" +
                "Tiempo estimado de llegada: " + completedOrder.deliveryEstimate.minutes + " minutos";
        }

        function openCardModal() {
            const cardModal = document.getElementById('card-modal');
            const cardInput = document.getElementById('cardInput');
            if (!cardModal || !cardInput) {
                return;
            }
            if (typeof window.resetCardPreviewOrientation === 'function') {
                window.resetCardPreviewOrientation();
            }
            cardModal.classList.remove('hidden');
            cardInput.focus();
        }

        function closeCardModal() {
            const cardModal = document.getElementById('card-modal');
            if (!cardModal) {
                return;
            }
            cardModal.classList.add('hidden');
            if (typeof window.resetCardPreviewOrientation === 'function') {
                window.resetCardPreviewOrientation();
            }
            if (typeof window.hideCardReminder === 'function') {
                window.hideCardReminder();
            }
        }

        function formatCardNumber(number) {
            return number.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
        }

        function detectCardType(number) {
            const firstDigit = number.charAt(0);

            if (firstDigit === '4') {
                return 'Visa';
            }
            else if (firstDigit === '5') {
                return 'Mastercard';
            }

            return 'Desconocida';
        }

        function detectBank(number) {
            const firstDigit = number.charAt(0);

            if (firstDigit === '4') {
                return 'Banco Industrial S.A.';
            }
            else if (firstDigit === '5') {
                return 'BAC Credomatic';
            }

            return 'Banco Desconocido';
        }

        function updateCardColor(cardType) {
            const cardDisplay = document.getElementById('cardDisplay');
            if (!cardDisplay) {
                return;
            }

            cardDisplay.classList.remove('neutral', 'visa', 'mastercard');

            if (cardType === 'Visa') {
                cardDisplay.classList.add('visa');
            }
            else if (cardType === 'Mastercard') {
                cardDisplay.classList.add('mastercard');
            }
            else {
                cardDisplay.classList.add('neutral');
            }
        }

        function setupCardPreview() {
            const cardInput = document.getElementById('cardInput');
            const cardHolderInput = document.getElementById('cardHolderInput');
            const expiryInput = document.getElementById('expiryInput');
            const cvvInput = document.getElementById('cvvInput');
            const cardDisplay = document.getElementById('cardDisplay');
            const cardNumberDisplay = document.getElementById('cardNumber');
            const cardTypeDisplay = document.getElementById('cardType');
            const cardHolderDisplay = document.getElementById('cardHolder');
            const expiryDateDisplay = document.getElementById('expiryDate');
            const bankNameDisplay = document.getElementById('bankName');
            const cvvDisplay = document.getElementById('cvvDisplay');

            if (!cardDisplay || !cardInput || !cardHolderInput || !expiryInput || !cvvInput ||
                !cardNumberDisplay || !cardTypeDisplay || !cardHolderDisplay ||
                !expiryDateDisplay || !bankNameDisplay || !cvvDisplay) {
                return;
            }

            let spinState = {
                rotation: 0,
                dragging: false,
                startX: 0,
                startRotation: 0
            };
            let idleResetTimer = null;

            function applyCardRotation(rotation) {
                spinState.rotation = rotation;
                cardDisplay.style.setProperty('--card-spin', rotation + 'deg');
            }

            function resetCardRotation() {
                if (idleResetTimer) {
                    clearTimeout(idleResetTimer);
                    idleResetTimer = null;
                }
                spinState.rotation = 0;
                cardDisplay.style.setProperty('--card-spin', '0deg');
                cardDisplay.style.setProperty('--card-tilt', '0deg');
            }

            function scheduleIdleReset() {
                if (idleResetTimer) {
                    clearTimeout(idleResetTimer);
                }

                idleResetTimer = setTimeout(function() {
                    resetCardRotation();
                }, 5000);
            }

            cardDisplay.addEventListener('pointerdown', function(event) {
                spinState.dragging = true;
                spinState.startX = event.clientX;
                spinState.startRotation = spinState.rotation;
                cardDisplay.classList.add('is-dragging');
                cardDisplay.setPointerCapture(event.pointerId);
                if (idleResetTimer) {
                    clearTimeout(idleResetTimer);
                    idleResetTimer = null;
                }
            });

            cardDisplay.addEventListener('pointermove', function(event) {
                if (!spinState.dragging) {
                    return;
                }

                const deltaX = event.clientX - spinState.startX;
                const nextRotation = (spinState.startRotation + (deltaX * 0.8)) % 360;
                const normalizedRotation = nextRotation < 0 ? nextRotation + 360 : nextRotation;

                applyCardRotation(normalizedRotation);
                scheduleIdleReset();
            });

            function endDrag(event) {
                if (!spinState.dragging) {
                    return;
                }

                spinState.dragging = false;
                cardDisplay.classList.remove('is-dragging');

                if (cardDisplay.hasPointerCapture(event.pointerId)) {
                    cardDisplay.releasePointerCapture(event.pointerId);
                }

                scheduleIdleReset();
            }

            cardDisplay.addEventListener('pointerup', endDrag);
            cardDisplay.addEventListener('pointercancel', endDrag);

            [cardInput, cardHolderInput, expiryInput].forEach(function(input) {
                input.addEventListener('focus', function() {
                    const cardDisplay = document.getElementById('cardDisplay');
                    if (cardDisplay) {
                        cardDisplay.classList.remove('flipped');
                    }
                });
            });

            cardInput.addEventListener('input', function() {
                const cardNumber = cardInput.value.replace(/\D/g, '').slice(0, 16);
                const cardType = cardNumber ? detectCardType(cardNumber) : 'Visa/Mastercard';

                cardInput.value = formatCardNumber(cardNumber);
                cardNumberDisplay.textContent = cardNumber ? formatCardNumber(cardNumber) : '#### #### #### ####';
                cardTypeDisplay.textContent = cardType;
                bankNameDisplay.textContent = cardNumber ? detectBank(cardNumber) : 'Banco';
                updateCardColor(cardNumber ? cardType : 'Desconocida');

                if (cardNumber === '') {
                    updateCardColor('Desconocida');
                }
            });

            cardHolderInput.addEventListener('input', function() {
                cardHolderDisplay.textContent = cardHolderInput.value || 'Nombre del Titular';
            });

            expiryInput.addEventListener('input', function() {
                const cleanDate = expiryInput.value.replace(/\D/g, '').slice(0, 4);
                let formattedDate = cleanDate;

                if (cleanDate.length > 2) {
                    formattedDate = cleanDate.slice(0, 2) + '/' + cleanDate.slice(2);
                }

                expiryInput.value = formattedDate;
                expiryDateDisplay.textContent = formattedDate || 'MM/AA';
            });

            cvvInput.addEventListener('focus', function() {
                const cardDisplay = document.getElementById('cardDisplay');
                if (cardDisplay) {
                    cardDisplay.classList.add('flipped');
                }
            });

            cvvInput.addEventListener('input', function() {
                const cvv = cvvInput.value.replace(/\D/g, '').slice(0, 3);
                cvvInput.value = cvv;
                cvvDisplay.textContent = cvv || '###';
            });

            window.resetCardPreviewOrientation = resetCardRotation;
        }

        function resetCardForm() {
            const cardForm = document.getElementById('card-form');
            const cardNumber = document.getElementById('cardNumber');
            const cardType = document.getElementById('cardType');
            const cardHolder = document.getElementById('cardHolder');
            const expiryDate = document.getElementById('expiryDate');
            const cvvDisplay = document.getElementById('cvvDisplay');
            const bankName = document.getElementById('bankName');
            const cardDisplay = document.getElementById('cardDisplay');

            if (!cardForm || !cardNumber || !cardType || !cardHolder || !expiryDate || !cvvDisplay || !bankName || !cardDisplay) {
                return;
            }

            cardForm.reset();
            cardNumber.textContent = '#### #### #### ####';
            cardType.textContent = 'Visa/Mastercard';
            cardHolder.textContent = 'Nombre del Titular';
            expiryDate.textContent = 'MM/AA';
            cvvDisplay.textContent = '###';
            bankName.textContent = 'Banco';
            cardDisplay.classList.remove('flipped');
            cardDisplay.classList.remove('visa', 'mastercard');
            cardDisplay.classList.add('neutral');
            resetCardRotation();
            updateCardColor('Desconocida');
            if (typeof window.hideCardReminder === 'function') {
                window.hideCardReminder();
            }
        }

        function disablePaymentButtons() {
            document.querySelectorAll('.payment-options button').forEach(function(button) {
                button.disabled = true;
            });
        }

        function submitCardPayment() {
            const cardInput = document.getElementById('cardInput');
            const cardHolderInput = document.getElementById('cardHolderInput');
            const expiryInput = document.getElementById('expiryInput');
            const cvvInput = document.getElementById('cvvInput');

            if (!cardInput || !cardHolderInput || !expiryInput || !cvvInput) {
                return;
            }

            const cardNumber = cardInput.value.replace(/\D/g, '');
            const cardHolder = cardHolderInput.value.trim();
            const expiry = expiryInput.value.trim();
            const cvv = cvvInput.value.replace(/\D/g, '');

            if (cardNumber.length !== 16 || cardHolder === "" || !/^\d{2}\/\d{2}$/.test(expiry) || cvv.length !== 3) {
                if (typeof window.showCardReminder === 'function') {
                    window.showCardReminder();
                }
                displayMessage("Por favor ingresa numero de tarjeta de 16 digitos, titular, fecha en formato MM/AA y CVV de 3 digitos.", "bot");
                return;
            }

            const cardType = detectCardType(cardNumber);
            const bankName = detectBank(cardNumber);
            const lastDigits = cardNumber.slice(-4);

            if (typeof window.hideCardReminder === 'function') {
                window.hideCardReminder();
            }

            displayMessage("Pago con tarjeta registrado.\n\n" +
                "- Tipo: " + cardType + "\n" +
                "- Banco: " + bankName + "\n" +
                "- Titular: " + cardHolder + "\n" +
                "- Terminacion: **** " + lastDigits, "bot");

            displayDeliveryMessage("Tarjeta de debito/credito");
            closeCardModal();
            resetCardForm();
            disablePaymentButtons();
        }

        function submitCustomerData() {
            const nameInput = document.getElementById('customer-name');
            const phoneInput = document.getElementById('customer-phone');
            const addressInput = document.getElementById('customer-address');

            if (!nameInput || !phoneInput || !addressInput) {
                return;
            }

            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const address = addressInput.value.trim();
            const phoneDigits = phone.replace(/\D/g, "");

            if (name === "" || phoneDigits.length < 8 || address === "") {
                showCustomerFormError("Por favor completa nombre, telefono valido y direccion.");
                return;
            }

            clearCustomerFormError();

            currentOrder.customer.name = name;
            currentOrder.customer.phone = phone;
            currentOrder.customer.address = address;
            const deliveryEstimate = getRandomDeliveryEstimate();

            completedOrder = {
                items: currentOrder.items.map(function(item) {
                    return {
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    };
                }),
                customer: {
                    name: name,
                    phone: phone,
                    address: address
                },
                deliveryEstimate: deliveryEstimate
            };

            closeCustomerModal();
            const customerForm = document.getElementById('customer-form');
            if (customerForm) {
                customerForm.reset();
            }

            displayMessage("Datos registrados:\n" +
                "- Nombre: " + name + "\n" +
                "- Telefono: " + phone + "\n" +
                "- Direccion: " + address + "\n" +
                "- Costo de envio: Q" + deliveryEstimate.cost + "\n" +
                "- Tiempo estimado de llegada: " + deliveryEstimate.minutes + " minutos\n\n" +
                getOrderSummary(completedOrder), "bot");

            displayPaymentOptions();
            resetOrder();
        }

        function displayPaymentOptions() {
            const chatBox = document.getElementById('chat-box');
            const messageElement = document.createElement('div');
            const optionsElement = document.createElement('div');
            const cashButton = document.createElement('button');
            const cardButton = document.createElement('button');
            const transferButton = document.createElement('button');

            messageElement.classList.add('message', 'bot');
            messageElement.textContent = "METODOS DE PAGO";

            optionsElement.classList.add('payment-options');

            cashButton.type = "button";
            cashButton.classList.add('primary');
            cashButton.textContent = "Efectivo al momento de entrega";
            cashButton.addEventListener('click', function() {
                disablePaymentButtons();
                displayMessage("Efectivo al momento de entrega", "user");
                displayDeliveryMessage("Efectivo al momento de entrega");
            });

            cardButton.type = "button";
            cardButton.classList.add('secondary');
            cardButton.textContent = "Tarjeta de debito/credito";
            cardButton.addEventListener('click', function() {
                displayMessage("Tarjeta de debito/credito", "user");
                openCardModal();
            });

            transferButton.type = "button";
            transferButton.classList.add('secondary');
            transferButton.textContent = "Transferencia bancaria";
            transferButton.addEventListener('click', function() {
                disablePaymentButtons();
                displayMessage("Transferencia bancaria", "user");
                displayDeliveryMessage("Transferencia bancaria");
            });

            optionsElement.appendChild(cashButton);
            optionsElement.appendChild(cardButton);
            optionsElement.appendChild(transferButton);
            messageElement.appendChild(optionsElement);
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function getBankTransferInstructions(order) {
            return "Datos para transferencia bancaria:\n" +
                "- Banco: Banco Industrial\n" +
                "- Tipo de cuenta: Monetaria\n" +
                "- Numero de cuenta: 001-123456-7\n" +
                "- Nombre de la cuenta: MacPUPUSAS, S.A.\n" +
                "- NIT: 1234567-8\n" +
                "- Monto a transferir: Q" + getOrderGrandTotal(order) + "\n" +
                "- Referencia o concepto: Pedido #" + order.orderNumber + "\n\n" +
                "Despues de realizar la transferencia, envia el comprobante con:\n" +
                "- Nombre completo\n" +
                "- Numero de pedido\n" +
                "- Banco desde donde transferiste\n" +
                "- Numero de autorizacion o transaccion\n" +
                "- Ultimos 4 digitos de la cuenta origen, si aplica\n\n" +
                "Puedes enviarlo al WhatsApp 4280-2479 o al correo pagos@macpupusas.test.";
        }

        function displayDeliveryMessage(paymentMethod) {
            if (!completedOrder) {
                displayMessage("No encontre un pedido confirmado. Puedes iniciar uno escribiendo \"pedido\".", "bot");
                return;
            }

            const deliveryPeople = ["Carlos Mendez", "Andrea Lopez", "Luis Ramirez", "Maria Gonzalez", "Jose Hernandez"];
            completedOrder.deliveryPerson = deliveryPeople[Math.floor(Math.random() * deliveryPeople.length)];
            completedOrder.orderNumber = Math.floor(10000 + Math.random() * 90000);
            completedOrder.deliveryEstimate = completedOrder.deliveryEstimate || getRandomDeliveryEstimate();
            completedOrder.paymentMethod = paymentMethod;
            completedOrder.status = paymentMethod === "Transferencia bancaria"
                ? "Pendiente de comprobante de transferencia"
                : "Confirmado";

            const paymentInstructions = paymentMethod === "Transferencia bancaria"
                ? "\n\n" + getBankTransferInstructions(completedOrder)
                : "";
            const confirmationIntro = paymentMethod === "Transferencia bancaria"
                ? "Pedido registrado. Queda pendiente validar la transferencia."
                : "Pedido confirmado.";

            displayMessage(confirmationIntro + "\n\n" +
                "Numero de pedido: " + completedOrder.orderNumber + "\n" +
                "Estado: " + completedOrder.status + "\n" +
                "Metodo de pago: " + completedOrder.paymentMethod + "\n" +
                "Repartidor asignado: " + completedOrder.deliveryPerson + "\n" +
                "Costo de envio: Q" + completedOrder.deliveryEstimate.cost + "\n" +
                "Tiempo estimado de llegada: " + completedOrder.deliveryEstimate.minutes + " minutos\n\n" +
                "Resumen:\n" +
                getOrderSummary(completedOrder) + "\n\n" +
                "Total con envio: Q" + getOrderGrandTotal(completedOrder) +
                paymentInstructions + "\n\n" +
                "Gracias por tu compra. Estamos para servirte.", "bot");
        }

        function handleOrderFlow(userInput) {
            const mensaje = normalizeMessage(userInput);

            if (mensaje.includes("cancelar")) {
                resetOrder();
                closeCustomerModal();
                return "Pedido cancelado. Puedes iniciar uno nuevo escribiendo \"pedido\".";
            }

            if (mensaje === "menu" || mensaje === "pupusas" || mensaje === "precios" || mensaje.includes("ver menu") || mensaje.includes("ver pupusas") || mensaje.includes("menu de pupusas")) {
                return getMenuMessage() + "\n\nPuedes seguir agregando productos a tu pedido.";
            }

            if (mensaje === "bebidas" || mensaje.includes("menu de bebidas") || mensaje.includes("ver bebidas")) {
                return getBeveragesMessage() + "\n\nPuedes seguir agregando bebidas a tu pedido.";
            }

            if (isBlockedDuringOrderQuestion(mensaje)) {
                return getBlockedDuringOrderMessage();
            }

            if (mensaje.includes("ver pedido") || mensaje.includes("resumen") || mensaje.includes("total")) {
                return getOrderSummary() + "\n\nConfirmar pedido? Escribe \"confirmar\" para continuar o \"cancelar\" para cancelar.";
            }

            if (currentOrder.step === "items") {
                const removalItems = parseOrderRemovals(userInput);

                if (removalItems.length > 0) {
                    const removalResult = removeItemsFromOrder(removalItems);
                    let removalResponse = "";

                    if (removalResult.removedItems.length > 0) {
                        removalResponse += "Pedido actualizado:\n" +
                            removalResult.removedItems.map(function(item) {
                                return "- Se quito " + item.quantity + " x " + item.name;
                            }).join("\n");
                    }

                    if (removalResult.missingItems.length > 0) {
                        removalResponse += (removalResponse ? "\n\n" : "") +
                            "No encontre en tu pedido:\n" +
                            removalResult.missingItems.map(function(name) {
                                return "- " + name;
                            }).join("\n");
                    }

                    if (!removalResponse) {
                        return "No pude identificar el producto que deseas eliminar. Prueba con \"quitar 1 queso\" o \"borrar horchata\".";
                    }

                    removalResponse += "\n\n" + getOrderSummary() + "\n\nConfirmar pedido? Escribe \"confirmar\" para continuar o \"cancelar\" para cancelar.";
                    return removalResponse;
                }

                if (mensaje.includes("confirmar") || mensaje === "si" || mensaje.includes("finalizar") || mensaje === "listo") {
                    if (currentOrder.items.length === 0) {
                        return "Aun no has agregado productos. Escribe algo como: 2 queso, 1 horchata.";
                    }

                    currentOrder.step = "customer";
                    setTimeout(function() {
                        openCustomerModal();
                    }, 700);

                    return "Perfecto, abrire un recuadro para registrar tu nombre completo, numero de telefono y direccion.";
                }

                const items = parseOrderItems(userInput);

                if (items.length === 0) {
                    return "No pude reconocer productos en tu mensaje.\n\n" +
                        "Escribe algo como:\n" +
                        "- 2 queso, 1 horchata\n" +
                        "- 1 combo familiar, 2 jamaica\n\n" +
                        "Tambien puedes escribir \"menu\", \"bebidas\" o \"cancelar pedido\".";
                }

                addItemsToOrder(items);
                return getOrderSummary() + "\n\nConfirmar pedido? Escribe \"confirmar\" para continuar o \"cancelar\" para cancelar.";
            }

            if (currentOrder.step === "customer") {
                setTimeout(function() {
                    openCustomerModal();
                }, 500);

                return "Completa tus datos en el recuadro para continuar con el pago.";
            }

            resetOrder();
            return "Ocurrio un problema con el pedido. Puedes iniciar uno nuevo escribiendo \"pedido\".";
        }

        function isGreeting(mensaje) {
            const saludos = [
                "hola",
                "holi",
                "buenos dias",
                "buen dia",
                "buenas tardes",
                "buenas noches",
                "buenas",
                "que tal",
                "que onda",
                "saludos"
            ];

            return saludos.some(function(saludo) {
                return mensaje.includes(saludo);
            });
        }

        function getFarewellMessage() {
            return "Gracias por visitar MacPUPUSAS. Que tu camino siga ligero, tu dia con buen sabor y que el antojo te traiga de vuelta pronto. Aqui te esperamos con pupusas calientitas, curtido fresco y salsita de la casa.";
        }

        function isFarewell(mensaje) {
            const despedidas = [
                "adios",
                "hasta luego",
                "hasta pronto",
                "hasta manana",
                "nos vemos",
                "bye",
                "chao",
                "chau",
                "me voy",
                "ya me voy",
                "me retiro",
                "me despido"
            ];

            return despedidas.some(function(despedida) {
                return mensaje.includes(despedida);
            });
        }

        function showWelcomeMessage() {
            displayMessage(getWelcomeMessage(), 'bot');
        }

        function sendMessage(customMessage) {
            const inputField = document.getElementById('user-input');
            const userInput = customMessage || inputField.value;

            if (userInput.trim() !== '') {
                displayMessage(userInput, 'user');
                inputField.value = '';
                getBotResponse(userInput);
                inputField.focus();
            }
        }

        function displayMessage(message, sender) {
            const chatBox = document.getElementById('chat-box');
            const messageElement = document.createElement('div');

            messageElement.classList.add('message', sender);
            messageElement.textContent = message;

            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function displayDeliveryEstimate(address, deliveryEstimate) {
            const chatBox = document.getElementById('chat-box');
            const messageElement = document.createElement('div');
            const estimateElement = document.createElement('div');

            messageElement.classList.add('message', 'bot');
            messageElement.textContent = "Listo. Con esta direccion calculamos una estimacion de entrega:";

            estimateElement.classList.add('delivery-estimate');
            estimateElement.textContent = "Direccion: " + address + "\n" +
                "Costo de envio: Q" + deliveryEstimate.cost + "\n" +
                "Tiempo estimado de llegada: " + deliveryEstimate.minutes + " minutos";

            messageElement.appendChild(estimateElement);
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function showTypingIndicator() {
            const chatBox = document.getElementById('chat-box');
            const messageElement = document.createElement('div');
            const dotsElement = document.createElement('div');

            messageElement.classList.add('message', 'bot', 'typing-message');
            dotsElement.classList.add('typing-indicator');
            dotsElement.setAttribute('aria-label', 'El chatbot esta escribiendo');

            for (let i = 0; i < 3; i++) {
                dotsElement.appendChild(document.createElement('span'));
            }

            messageElement.appendChild(dotsElement);
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;

            return messageElement;
        }

        function removeTypingIndicator(typingElement) {
            if (typingElement && typingElement.parentNode) {
                typingElement.parentNode.removeChild(typingElement);
            }
        }

        function getBotResponse(userInput) {
            const mensaje = normalizeMessage(userInput);
            let botResponse = "";

            if (isFarewell(mensaje)) {
                resetOrder();
                closeCustomerModal();
                closeDeliveryMapModal();
                closeCardModal();
                botResponse = getFarewellMessage();
            }
            else if (currentOrder.active) {
                botResponse = handleOrderFlow(userInput);
            }
            else if (isOrderStart(mensaje)) {
                botResponse = startOrder();
            }
            else if (isGreeting(mensaje)) {
                botResponse = getWelcomeMessage();
            }
            else if (mensaje.includes("bebidas") || mensaje.includes("jamaica") || mensaje.includes("horchata") || mensaje.includes("coca") || mensaje.includes("agua") || mensaje.includes("cafe")) {
                botResponse = getBeveragesMessage();
            }
            else if (mensaje.includes("menu") || mensaje.includes("precios") || mensaje.includes("pupusas")) {
                botResponse = getMenuMessage();
            }
            else if (mensaje.includes("combo") || mensaje.includes("combos")) {
                botResponse = getCombosMessage();
            }
            else if (mensaje.includes("promocion") || mensaje.includes("promociones") || mensaje.includes("oferta") || mensaje.includes("ofertas") || mensaje.includes("descuento")) {
                botResponse = getPromotionsMessage();
            }
            else if (mensaje.includes("infantil") || mensaje.includes("nino") || mensaje.includes("ninos") || mensaje.includes("macpupusin")) {
                botResponse = getKidsMenuMessage();
            }
            else if (isDeliveryTimeQuestion(mensaje)) {
                botResponse = getConfirmedOrderStatusMessage();
            }
            else if (mensaje.includes("cobran") || isDeliveryAddressRequest(mensaje)) {
                scheduleDeliveryMapModal();

                botResponse = DELIVERY_INTRO_MESSAGE;
            }
            else if (mensaje.includes("estado")) {
                botResponse = hasConfirmedOrder()
                    ? getConfirmedOrderStatusMessage()
                    : "Puedes consultar tu orden en tiempo real escribiendo la palabra \"Estado\" seguida de tu numero de pedido. Tambien enviaremos una notificacion cuando el repartidor este en camino.";
            }
            else if (mensaje.includes("horario") || mensaje.includes("abiertos")) {
                botResponse = "Claro que si. En MacPUPUSAS te esperamos todos los dias de 10:00 a.m. a 10:00 p.m. Ven con hambre, que las pupusas salen calientitas y listas para alegrarte el dia.";
            }
            else if (mensaje.includes("tarjeta") || mensaje.includes("pagar") || mensaje.includes("pago")) {
                botResponse = "Claro, en MacPUPUSAS queremos que pagues como te quede mas comodo.\n\n" +
                    "Aceptamos:\n" +
                    "- Efectivo al recibir tu pedido\n" +
                    "- Tarjeta de debito o credito\n" +
                    "- Transferencia bancaria\n" +
                    "- Deposito bancario\n" +
                    "- Pago movil o billetera digital, segun disponibilidad\n\n" +
                    "Cuando confirmes tu pedido, te mostraremos las opciones disponibles para finalizarlo.";
            }
            else if (isLocationQuestion(mensaje)) {
                botResponse = "Nos encuentras en el local 110, segundo nivel de Metrocentro, zona 4 de Villa Nueva. Ven con hambre y buen animo, que en MacPUPUSAS estamos listos para recibirte con pupusas calientitas y una sonrisa.";
            }
            else if (mensaje.includes("acompanamientos") || mensaje.includes("salsas") || mensaje.includes("curtido") || mensaje.includes("aderezos")) {
                botResponse = "Nuestras pupusas van acompanadas con curtido fresco y salsita roja de la casa, como debe ser. Tambien puedes pedir extras como curtido adicional, salsa picante, crema, frijolitos, aguacate o platanitos fritos para completar tu antojo.";
            }
            else if (mensaje.includes("evento") || mensaje.includes("grande") || mensaje.includes("mayorista")) {
                botResponse = "Para eventos o pedidos mayoristas, consulta nuestras promociones. Los pedidos mayores a 25 pupusas tienen descuento especial.";
            }
            else if (mensaje.includes("antojos") || mensaje.includes("tipicos") || mensaje.includes("platanitos") || mensaje.includes("rellenitos") || mensaje.includes("atoles")) {
                botResponse = "Para acompanar tu pedido contamos con platanitos fritos con crema y frijoles, rellenitos y atoles como arroz con leche o atol de platano.";
            }
            else if (mensaje.includes("preparacion") || mensaje.includes("hechas") || mensaje.includes("momento") || mensaje.includes("preparadas") || mensaje.includes("frescas")) {
                botResponse = "Todas nuestras pupusas se preparan al momento en que recibimos tu orden. Siempre disfrutaras de un producto fresco y recien salido de la plancha.";
            }
            else if (mensaje.includes("sucursales") || mensaje.includes("pais")) {
                botResponse = "Por el momento contamos con 58 sucursales abiertas y sirviendo pupusas en todo el pais.";
            }
            else {
                botResponse = getUnknownMessage();
            }

            const typingElement = showTypingIndicator();

            setTimeout(function() {
                removeTypingIndicator(typingElement);
                displayMessage(botResponse, "bot");
            }, BOT_RESPONSE_DELAY_MS);
        }
