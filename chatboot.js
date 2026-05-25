window.addEventListener('DOMContentLoaded', function() {
            document.getElementById('send-btn').addEventListener('click', function() {
                sendMessage();
            });

            document.getElementById('user-input').addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });

            document.querySelectorAll('.quick-questions button').forEach(function(button) {
                button.addEventListener('click', function() {
                    sendMessage(button.dataset.question);
                });
            });

            document.getElementById('customer-form').addEventListener('submit', function(e) {
                e.preventDefault();
                submitCustomerData();
            });

            document.getElementById('cancel-customer-modal').addEventListener('click', function() {
                closeCustomerModal();
                displayMessage("Puedes confirmar el pedido cuando estés listo o escribir cancelar.", "bot");
            });

            document.getElementById('card-form').addEventListener('submit', function(e) {
                e.preventDefault();
                submitCardPayment();
            });

            document.getElementById('cancel-card-modal').addEventListener('click', function() {
                closeCardModal();
                displayMessage("Pago con tarjeta cancelado. Puedes elegir efectivo o volver a intentar con tarjeta.", "bot");
            });

            setupCardPreview();

            showWelcomeMessage();
        });

        function normalizeMessage(text) {
            return text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        }

        const orderCatalog = [
            { name: "Combo Buen Provecho", price: 22, aliases: ["combo buen provecho", "buen provecho"] },
            { name: "Combo El Tragón", price: 30, aliases: ["combo el tragon", "el tragon", "tragon"] },
            { name: "Combo Familiar", price: 110, aliases: ["combo familiar", "familiar"] },
            { name: "Menú Infantil", price: 25, aliases: ["menu infantil", "infantil", "macpupusin"] },
            { name: "Loroco con queso", price: 11, aliases: ["loroco", "loroco con queso"] },
            { name: "Chicharrón", price: 10, aliases: ["chicharron"] },
            { name: "Mixtas", price: 12, aliases: ["mixtas", "mixta"] },
            { name: "Queso", price: 8, aliases: ["queso"] },
            { name: "Gaseosa en lata", price: 6, aliases: ["gaseosa", "lata"] },
            { name: "Horchata", price: 8, aliases: ["horchata"] },
            { name: "Jamaica", price: 8, aliases: ["jamaica"] },
            { name: "Tamarindo", price: 8, aliases: ["tamarindo"] },
            { name: "Café", price: 5, aliases: ["cafe"] },
            { name: "Agua pura", price: 4, aliases: ["agua"], exactMatchOnly: true }
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

        function getWelcomeMessage() {
            return "¡Hola! Bienvenido a nuestro restaurante de pupusas.\n\n" +
                "Puedes preguntarme sobre:\n" +
                "- Menú y precios\n" +
                "- Promociones disponibles\n" +
                "- Entregas a domicilio\n" +
                "- Tiempo de entrega\n" +
                "- Horario del restaurante\n" +
                "- Formas de pago\n" +
                "- Ubicación\n" +
                "- Acompañamientos\n" +
                "- Registrar pedido\n" +
                "- Costo de envío\n" +
                "- Descuentos para eventos\n" +
                "- Estado de pedido\n" +
                "- Antojos típicos\n" +
                "- Bebidas\n" +
                "- Preparación\n" +
                "- Sucursales";
        }

        function getUnknownMessage() {
            return "Lo lamento, no entendi tu pregunta, pero con gusto puedes elegir una de estas opciones, Estamos para servirte\n\n" +
                "Puedes preguntarme sobre:\n" +
                "- Menú y precios\n" +
                "- Promociones disponibles\n" +
                "- Entregas a domicilio\n" +
                "- Tiempo de entrega\n" +
                "- Horario del restaurante\n" +
                "- Formas de pago\n" +
                "- Ubicación\n" +
                "- Acompañamientos\n" +
                "- Registrar pedido\n" +
                "- Costo de envío\n" +
                "- Descuentos para eventos\n" +
                "- Estado de pedido\n" +
                "- Antojos típicos\n" +
                "- Bebidas\n" +
                "- Preparación\n" +
                "- Sucursales";
        }

        function getMenuMessage() {
            return "Menú de pupusas:\n" +
                "- Queso: Q8\n" +
                "- Chicharrón: Q10\n" +
                "- Mixtas: Q12\n" +
                "- Loroco con queso: Q11\n\n" +
                "Combos:\n" +
                "- Combo Buen Provecho: 2 pupusas + bebida por Q22\n\n" +
                "- Combo El Tragón: 3 pupusas + bebida por Q30\n\n" +
                "- Combo Familiar: 10 pupusas + 4 bebidas por Q110\n\n" +
                "Menú Infantil:\n" +
                "- 2 mini pupusas de queso o frijol con queso\n" +
                "- Jugo de naranja\n" +
                "- Juguete de MacPupusin\n" +
                "Precio: Q25\n\n" +
                "Si deseas ver el menú de bebidas solo escribe \"bebidas\".";
        }

        function getKidsMenuMessage() {
            return "Menú Infantil:\n" +
                "- 2 mini pupusas de queso o frijol con queso\n" +
                "- Jugo de naranja\n" +
                "- Juguete de MacPupusin\n\n" +
                "Precio: Q25";
        }

        function getBeveragesMessage() {
            return "Menú de bebidas:\n" +
                "- Gaseosa en lata: Q6\n" +
                "- Agua pura: Q4\n" +
                "- Horchata: Q8\n" +
                "- Jamaica: Q8\n" +
                "- Tamarindo: Q8\n" +
                "- Café: Q5";
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

            return "Perfecto, ¿qué deseas ordenar?\n\n" +
                getMenuMessage() + "\n\n" +
                "Puedes escribir uno o varios productos con cantidad.\n\n" +
                "Ejemplos:\n" +
                "- 2 queso, 1 horchata\n" +
                "- 1 combo buen provecho, 2 mixtas\n" +
                "- 1 menu infantil, 1 jamaica";
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

        function getOrderTotal(order) {
            const targetOrder = order || currentOrder;

            return targetOrder.items.reduce(function(total, item) {
                return total + (item.price * item.quantity);
            }, 0);
        }

        function getOrderSummary(order) {
            const targetOrder = order || currentOrder;

            if (targetOrder.items.length === 0) {
                return "Tu pedido aún no tiene productos.";
            }

            const itemLines = targetOrder.items.map(function(item) {
                return "- " + item.quantity + " x " + item.name + ": Q" + (item.price * item.quantity);
            });

            return "Pedido actual:\n" +
                itemLines.join("\n") +
                "\n\nTotal: Q" + getOrderTotal(targetOrder);
        }

        function openCustomerModal() {
            clearCustomerFormError();
            document.getElementById('customer-modal').classList.remove('hidden');
            document.getElementById('customer-name').focus();
        }

        function closeCustomerModal() {
            clearCustomerFormError();
            document.getElementById('customer-modal').classList.add('hidden');
        }

        function showCustomerFormError(message) {
            const errorElement = document.getElementById('customer-form-error');

            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }

        function clearCustomerFormError() {
            const errorElement = document.getElementById('customer-form-error');

            errorElement.textContent = "";
            errorElement.classList.add('hidden');
        }

        function openCardModal() {
            document.getElementById('card-modal').classList.remove('hidden');
            document.getElementById('cardInput').focus();
        }

        function closeCardModal() {
            document.getElementById('card-modal').classList.add('hidden');
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
            const bin = number.slice(0, 6);

            if (/^5224/.test(bin)) {
                return 'Banamex';
            }
            else if (/^4111/.test(bin)) {
                return 'Banorte';
            }
            else if (/^5237/.test(bin)) {
                return 'BBVA';
            }
            else if (/^5289/.test(bin)) {
                return 'Santander';
            }

            return 'Banco Desconocido';
        }

        function updateCardColor(cardType) {
            const cardFront = document.getElementById('cardFront');
            const cardBack = document.getElementById('cardBack');
            let color = '#333333';

            if (cardType === 'Visa') {
                color = '#1d4ed8';
            }
            else if (cardType === 'Mastercard') {
                color = '#b91c1c';
            }

            cardFront.style.backgroundColor = color;
            cardBack.style.backgroundColor = color;
        }

        function setupCardPreview() {
            const cardInput = document.getElementById('cardInput');
            const cardHolderInput = document.getElementById('cardHolderInput');
            const expiryInput = document.getElementById('expiryInput');
            const cvvInput = document.getElementById('cvvInput');
            const cardNumberDisplay = document.getElementById('cardNumber');
            const cardTypeDisplay = document.getElementById('cardType');
            const cardHolderDisplay = document.getElementById('cardHolder');
            const expiryDateDisplay = document.getElementById('expiryDate');
            const bankNameDisplay = document.getElementById('bankName');
            const cvvDisplay = document.getElementById('cvvDisplay');

            [cardInput, cardHolderInput, expiryInput].forEach(function(input) {
                input.addEventListener('focus', function() {
                    document.getElementById('cardDisplay').classList.remove('flipped');
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
                document.getElementById('cardDisplay').classList.add('flipped');
            });

            cvvInput.addEventListener('input', function() {
                const cvv = cvvInput.value.replace(/\D/g, '').slice(0, 3);
                cvvInput.value = cvv;
                cvvDisplay.textContent = cvv || '###';
            });
        }

        function resetCardForm() {
            document.getElementById('card-form').reset();
            document.getElementById('cardNumber').textContent = '#### #### #### ####';
            document.getElementById('cardType').textContent = 'Visa/Mastercard';
            document.getElementById('cardHolder').textContent = 'Nombre del Titular';
            document.getElementById('expiryDate').textContent = 'MM/AA';
            document.getElementById('cvvDisplay').textContent = '###';
            document.getElementById('bankName').textContent = 'Banco';
            document.getElementById('cardDisplay').classList.remove('flipped');
            updateCardColor('Desconocida');
        }

        function disablePaymentButtons() {
            document.querySelectorAll('.payment-options button').forEach(function(button) {
                button.disabled = true;
            });
        }

        function submitCardPayment() {
            const cardNumber = document.getElementById('cardInput').value.replace(/\D/g, '');
            const cardHolder = document.getElementById('cardHolderInput').value.trim();
            const expiry = document.getElementById('expiryInput').value.trim();
            const cvv = document.getElementById('cvvInput').value.replace(/\D/g, '');

            if (cardNumber.length !== 16 || cardHolder === "" || !/^\d{2}\/\d{2}$/.test(expiry) || cvv.length !== 3) {
                displayMessage("Por favor ingresa número de tarjeta de 16 dígitos, titular, fecha en formato MM/AA y CVV de 3 dígitos.", "bot");
                return;
            }

            const cardType = detectCardType(cardNumber);
            const bankName = detectBank(cardNumber);
            const lastDigits = cardNumber.slice(-4);

            closeCardModal();
            resetCardForm();
            disablePaymentButtons();

            displayMessage("Pago con tarjeta registrado.\n\n" +
                "- Tipo: " + cardType + "\n" +
                "- Banco: " + bankName + "\n" +
                "- Titular: " + cardHolder + "\n" +
                "- Terminación: **** " + lastDigits, "bot");

            displayDeliveryMessage("Tarjeta de débito/crédito");
        }

        function submitCustomerData() {
            const name = document.getElementById('customer-name').value.trim();
            const phone = document.getElementById('customer-phone').value.trim();
            const address = document.getElementById('customer-address').value.trim();
            const phoneDigits = phone.replace(/\D/g, "");

            if (name === "" || phoneDigits.length < 8 || address === "") {
                showCustomerFormError("Por favor completa nombre, teléfono válido y dirección.");
                return;
            }

            clearCustomerFormError();

            currentOrder.customer.name = name;
            currentOrder.customer.phone = phone;
            currentOrder.customer.address = address;

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
                }
            };

            closeCustomerModal();
            document.getElementById('customer-form').reset();

            displayMessage("Datos registrados:\n" +
                "- Nombre: " + name + "\n" +
                "- Teléfono: " + phone + "\n" +
                "- Dirección: " + address + "\n\n" +
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

            messageElement.classList.add('message', 'bot');
            messageElement.textContent = "METODOS DE PAGO";

            optionsElement.classList.add('payment-options');

            cashButton.type = "button";
            cashButton.classList.add('primary');
            cashButton.textContent = "Efectivo al momento de entrega";
            cashButton.addEventListener('click', function() {
                cashButton.disabled = true;
                cardButton.disabled = true;
                displayMessage("Efectivo al momento de entrega", "user");
                displayDeliveryMessage("Efectivo al momento de entrega");
            });

            cardButton.type = "button";
            cardButton.classList.add('secondary');
            cardButton.textContent = "Tarjeta de débito/crédito";
            cardButton.addEventListener('click', function() {
                displayMessage("Tarjeta de débito/crédito", "user");
                openCardModal();
            });

            optionsElement.appendChild(cashButton);
            optionsElement.appendChild(cardButton);
            messageElement.appendChild(optionsElement);
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function displayDeliveryMessage(paymentMethod) {
            if (!completedOrder) {
                displayMessage("No encontré un pedido confirmado. Puedes iniciar uno escribiendo \"pedido\".", "bot");
                return;
            }

            const deliveryPeople = ["Carlos Méndez", "Andrea López", "Luis Ramírez", "María González", "José Hernández"];
            const deliveryPerson = deliveryPeople[Math.floor(Math.random() * deliveryPeople.length)];
            const orderNumber = Math.floor(10000 + Math.random() * 90000);
            const deliveryTime = Math.floor(30 + Math.random() * 16);

            displayMessage("Pedido confirmado.\n\n" +
                "Número de pedido: " + orderNumber + "\n" +
                "Método de pago: " + paymentMethod + "\n" +
                "Repartidor asignado: " + deliveryPerson + "\n" +
                "Tiempo estimado de llegada: " + deliveryTime + " minutos\n\n" +
                "Resumen:\n" +
                getOrderSummary(completedOrder) + "\n\n" +
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

            if (mensaje.includes("ver pedido") || mensaje.includes("resumen") || mensaje.includes("total")) {
                return getOrderSummary() + "\n\n¿Confirmar pedido? Escribe \"confirmar\" para continuar o \"cancelar\" para cancelar.";
            }

            if (currentOrder.step === "items") {
                if (mensaje.includes("confirmar") || mensaje === "si" || mensaje === "sí" || mensaje.includes("finalizar") || mensaje === "listo") {
                    if (currentOrder.items.length === 0) {
                        return "Aún no has agregado productos. Escribe algo como: 2 queso, 1 horchata.";
                    }

                    currentOrder.step = "customer";
                    setTimeout(function() {
                        openCustomerModal();
                    }, 1100);

                    return "Perfecto, abriré un recuadro para registrar tu nombre completo, número de teléfono y dirección.";
                }

                const items = parseOrderItems(userInput);

                if (items.length === 0) {
                    return "No pude reconocer productos en tu mensaje.\n\n" +
                        "Escribe algo como:\n" +
                        "- 2 queso, 1 horchata\n" +
                        "- 1 combo familiar, 2 jamaica\n\n" +
                        "También puedes escribir \"menu\" para ver opciones o \"cancelar pedido\".";
                }

                addItemsToOrder(items);
                return getOrderSummary() + "\n\n¿Confirmar pedido? Escribe \"confirmar\" para continuar o \"cancelar\" para cancelar.";
            }

            if (currentOrder.step === "customer") {
                setTimeout(function() {
                    openCustomerModal();
                }, 500);

                return "Completa tus datos en el recuadro para continuar con el pago.";
            }

            resetOrder();
            return "Ocurrió un problema con el pedido. Puedes iniciar uno nuevo escribiendo \"pedido\".";
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

        function getBotResponse(userInput) {
            const mensaje = normalizeMessage(userInput);
            let botResponse = "";

            if (currentOrder.active) {
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
            else if (mensaje.includes("promocion") || mensaje.includes("promociones") || mensaje.includes("combos")) {
                botResponse = "Tenemos estos combos disponibles:\n\n" +
                    "- Combo Buen Provecho: 2 pupusas + bebida por Q22\n\n" +
                    "- Combo El Tragón: 3 pupusas + bebida por Q30\n\n" +
                    "- Combo Familiar: 10 pupusas + 4 bebidas por Q110\n\n" +
                    "- Menú Infantil: 2 mini pupusas, jugo de naranja y juguete de MacPupusin por Q25.";
            }
            else if (mensaje.includes("infantil") || mensaje.includes("nino") || mensaje.includes("ninos") || mensaje.includes("macpupusin")) {
                botResponse = getKidsMenuMessage();
            }
            else if (mensaje.includes("cobran") || mensaje.includes("envio") || mensaje.includes("servicio a domicilio")) {
                botResponse = "El costo del envío varía según tu ubicación, usualmente está entre Q. 10.00 y Q. 20.00. Al compartirnos tu ubicación exacta, el sistema calculará el costo automáticamente.";
            }
            else if (mensaje.includes("entrega") || mensaje.includes("domicilio") || mensaje.includes("delivery")) {
                botResponse = "Sí, hacemos entregas a domicilio en zonas cercanas. Solo comparte tu ubicación para verificar cobertura.";
            }
            else if (mensaje.includes("estado")) {
                botResponse = "Puede consultar su orden en tiempo real escribiendo la palabra “Estado” seguida de tu número de pedido. También enviaremos una notificación cuando el repartidor esté en camino.";
            }
            else if (mensaje.includes("cuanto tarda") || mensaje.includes("tiempo de entrega")) {
                botResponse = "El tiempo estimado de entrega es de 30 a 45 minutos, dependiendo de la ubicación y la cantidad de pedidos.";
            }
            else if (mensaje.includes("horario") || mensaje.includes("abiertos")) {
                botResponse = "Estamos abiertos todos los días de 10:00 a.m. a 10:00 p.m.";
            }
            else if (mensaje.includes("tarjeta") || mensaje.includes("pagar") || mensaje.includes("pago")) {
                botResponse = "Sí, aceptamos efectivo, tarjetas de crédito, débito y transferencias.";
            }
            else if (mensaje.includes("ubicados") || mensaje.includes("ubicacion") || mensaje.includes("donde estan")) {
                botResponse = "Estamos ubicados en el centro comercial principal de la ciudad. También puedes pedir por delivery.";
            }
            else if (mensaje.includes("acompanamientos") || mensaje.includes("salsas") || mensaje.includes("curtido") || mensaje.includes("aderezos")) {
                botResponse = "¡Por supuesto! Todos nuestros menús van acompañados con sus respectivos aderezos. Si desea porciones extra, puede solicitarlas con un costo adicional de Q. 5.00.";
            }
            else if (mensaje.includes("evento") || mensaje.includes("grande") || mensaje.includes("mayorista") || mensaje.includes("descuento")) {
                botResponse = "¡Sí, para pedidos mayoristas aplicamos un descuento! Para pedidos mayores a 25 pupusas ofrecemos precios especiales.";
            }
            else if (mensaje.includes("antojos") || mensaje.includes("tipicos") || mensaje.includes("platanitos") || mensaje.includes("rellenitos") || mensaje.includes("atoles")) {
                botResponse = "Sí, para acompañar tu pedido contamos con platanitos fritos con crema y frijoles, rellenitos o atoles como arroz con leche, atol de plátano, entre otros.";
            }
            else if (mensaje.includes("preparacion") || mensaje.includes("hechas") || mensaje.includes("momento") || mensaje.includes("preparadas") || mensaje.includes("frescas")) {
                botResponse = "Todas nuestras pupusas se preparan al momento en que recibimos tu orden. Siempre disfrutarás de un producto fresco y recién salido de la plancha.";
            }
            else if (mensaje.includes("sucursales") || mensaje.includes("pais")) {
                botResponse = "Por el momento contamos con 58 sucursales abiertas y sirviendo ricas pupusas en todo el país. ¡Esperamos poder expandirnos más en un futuro para que puedas encontrarnos en cualquier lugar a donde vayas!";
            }
            else {
                botResponse = getUnknownMessage();
            }

            setTimeout(function() {
                displayMessage(botResponse, "bot");
            }, 1000);
        }