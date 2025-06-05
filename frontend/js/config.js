// Configuración automática para Minikube
const API_CONFIG = {
    getBaseURL: function() {
        const hostname = window.location.hostname;
        
        // Si estamos en localhost (desarrollo)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        
        // Si estamos en Minikube
        return 'http://' + hostname + ':30000';
    }
};

const API_BASE_URL = API_CONFIG.getBaseURL();
window.API_BASE_URL = API_BASE_URL;

console.log('🔧 API Base URL:', API_BASE_URL);
