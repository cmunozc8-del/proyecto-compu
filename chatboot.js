 window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('send-btn').addEventListener('click', sendMessage);

    document.getElementById('user-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    showWelcomeMessage();
});

function getWelcomeMessage() {
    return "¡Hola! Bienvenido a nuestro restaurante de pupusas.\n\n" +
        "Puedes preguntarme sobre:\n" +
        "- Menú de hoy\n" +
        "- Promociones disponibles\n" +
        "- entregas a momacilio\n" +
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

function sendMessage() {
    const inputField = document.getElementById('user-input');
    const userInput = inputField.value;

    if (userInput.trim() !== '') {
        displayMessage(userInput, 'user');
        inputField.value = '';
        getBotResponse(userInput);
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
    const mensaje = userInput
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    let botResponse = "";

    if (isGreeting(mensaje)) {
        botResponse = getWelcomeMessage();
    }
    else if (mensaje.includes("menu") || mensaje.includes("hoy")) {
        botResponse = "Hoy tenemos pupusas de queso, revueltas, frijol con queso, chicharrón y bebidas frías. También contamos con combos familiares y promociones especiales.";
    }
    else if (mensaje.includes("promocion") || mensaje.includes("promociones")) {
        botResponse = "Tenemos promoción de 3 pupusas + bebida por Q25 y combo familiar con 12 pupusas y gaseosa por Q120.";
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
    else if (mensaje.includes("bebidas") || mensaje.includes("jamaica") || mensaje.includes("horchata") || mensaje.includes("coca")) {
        botResponse = "Le ofrecemos bebidas en lata y naturales. Puede disfrutar de un clásico fresco de Jamaica o de Horchata, o simplemente una lata de Coca-Cola.";
    }
    else if (mensaje.includes("preparacion") || mensaje.includes("hechas") || mensaje.includes("momento") || mensaje.includes("preparadas") || mensaje.includes("frescas")) {
        botResponse = "Todas nuestras pupusas se preparan al momento en que recibimos tu orden. Siempre disfrutarás de un producto fresco y recién salido de la plancha.";
    }
    else if (mensaje.includes("sucursales") || mensaje.includes("pais")) {
        botResponse = "Por el momento contamos con 58 sucursales abiertas y sirviendo ricas pupusas en todo el país. ¡Esperamos poder expandirnos más en un futuro para que puedas encontrarnos en cualquier lugar a donde vayas!";
    }
    else {
        botResponse = "Lo siento, no entiendo tu pregunta. Puedes preguntarme por el menú, promociones, domicilio, horario, pagos, ubicación, acompañamientos, bebidas o sucursales.";
    }

    setTimeout(() => {
        displayMessage(botResponse, "bot");
    }, 1000);
}