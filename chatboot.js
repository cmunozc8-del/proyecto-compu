window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('chat-form').addEventListener('submit', function(e) {
        e.preventDefault();
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

    showWelcomeMessage();
});

function normalizeMessage(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

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

    if (isGreeting(mensaje)) {
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
    else if (mensaje.includes("cuanto tarda") || mensaje.includes("tiempo") || mensaje.includes("pedido")) {
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
