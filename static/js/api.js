const API_BASE_URL = '/api';

const api = {
    /**
     * Obtiene todos los datos para el dashboard.
     * @returns {Promise<any>}
     */
    getDashboardData: async () => {
        const response = await fetch(`${API_BASE_URL}/dashboard-data`);
        if (!response.ok) throw new Error('Error al obtener los datos del dashboard');
        return response.json();
    },

    /**
     * Obtiene todas las fuentes de dinero.
     * @returns {Promise<any>}
     */
    getSources: async () => {
        const response = await fetch(`${API_BASE_URL}/sources`);
        if (!response.ok) throw new Error('Error al obtener las fuentes de dinero');
        return response.json();
    },
    // --- NUEVA FUNCIÓN ---
    /**
     * Obtiene todas las transacciones para una fuente específica.
     * @param {number} sourceId
     * @returns {Promise<any>}
     */
    getTransactionsBySource: async (sourceId) => {
        const response = await fetch(`${API_BASE_URL}/transactions?source_id=${sourceId}`);
        if (!response.ok) throw new Error(`Error al obtener transacciones para la fuente ${sourceId}`);
        return response.json();
    },
    // --- FIN DE LA NUEVA FUNCIÓN ---
    /**
     * Crea una nueva fuente de dinero.
     * @param {object} sourceData - { name, initial_balance }
     * @returns {Promise<any>}
     */
    createSource: async (sourceData) => {
        const response = await fetch(`${API_BASE_URL}/sources`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sourceData),
        });
        if (!response.ok) throw new Error('Error al crear la fuente');
        return response.json();
    },
    
    /**
     * Crea una nueva transacción.
     * @param {object} transactionData - { type, description, amount, category, source_id }
     * @returns {Promise<any>}
     */
    createTransaction: async (transactionData) => {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData),
        });
        if (!response.ok) throw new Error('Error al crear la transacción');
        return response.json();
    },

    /**
     * Crea una nueva transferencia.
     * @param {object} transferData - { from_source_id, to_source_id, amount, description }
     * @returns {Promise<any>}
     */
    createTransfer: async (transferData) => {
        const response = await fetch(`${API_BASE_URL}/transfers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transferData),
        });
        if (!response.ok) throw new Error('Error al crear la transferencia');
        return response.json();
    },
};