

// Este evento asegura que el código corra solo cuando Botpress terminó de cargar
window.addEventListener('botpressWidgetReady', function() {
    console.log('ExtremeBot está listo para trabajar');

    const chatButton = document.getElementById('bp-toggle-chat');

    if (chatButton) {
        chatButton.onclick = function() {
            // .toggle() abre si está cerrado y cierra si está abierto
            window.botpress.toggle(); 
        };
    }
});