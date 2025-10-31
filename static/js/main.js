// static/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    const appState = {
        sources: [],
        transactions: [],
        dashboardData: {},
    };

    async function loadAndRenderAllData() {
        try {
            const dashboardData = await api.getDashboardData();
            const sources = await api.getSources();
            
            appState.dashboardData = dashboardData;
            appState.sources = sources;

            ui.renderSummaryCards(dashboardData.summary);
            ui.renderSources(sources);
            ui.renderRecentTransactions(dashboardData.recent_transactions);
            ui.renderCharts(dashboardData.charts);

        } catch (error) {
            console.error('Error al cargar los datos:', error);
            alert('No se pudieron cargar los datos. Revisa la conexión con el servidor.');
        }
    }

    // ... (handleOpenTransactionModal, handleOpenTransferModal, handleOpenSourceModal se mantienen igual) ...
    function handleOpenTransactionModal(type) {
        const title = type === 'INCOME' ? 'Nuevo Ingreso' : 'Nuevo Gasto';
        const formHtml = ui.getTransactionFormHtml(type, appState.sources);
        ui.showModal(title, formHtml, async (data, closeModal) => { try { await api.createTransaction(data); closeModal(); loadAndRenderAllData(); } catch (error) { console.error('Error al crear transacción:', error); alert('Hubo un error al guardar la transacción.'); } });
    }
    function handleOpenTransferModal() {
        const formHtml = ui.getTransferFormHtml(appState.sources);
        ui.showModal('Realizar Transferencia', formHtml, async (data, closeModal) => { try { if (data.from_source_id === data.to_source_id) { alert('La cuenta de origen y destino no pueden ser la misma.'); return; } await api.createTransfer(data); closeModal(); loadAndRenderAllData(); } catch (error) { console.error('Error al realizar transferencia:', error); alert('Hubo un error al realizar la transferencia.'); } });
    }
    function handleOpenSourceModal() {
        const formHtml = ui.getSourceFormHtml();
        ui.showModal('Nueva Fuente de Dinero', formHtml, async (data, closeModal) => { try { await api.createSource(data); closeModal(); loadAndRenderAllData(); } catch (error) { console.error('Error al crear la fuente:', error); alert('Hubo un error al crear la nueva fuente.'); } });
    }

    // --- NUEVO MANEJADOR DE EVENTOS ---
    /**
     * Maneja el clic en una tarjeta de fuente para mostrar sus detalles.
     * @param {Event} event
     */
    async function handleSourceClick(event) {
        const sourceCard = event.target.closest('[data-source-id]');
        if (!sourceCard) return; // No se hizo clic en una tarjeta

        const sourceId = sourceCard.dataset.sourceId;
        
        try {
            // Buscar la información de la fuente que ya tenemos en el estado
            const sourceInfo = appState.sources.find(s => s.id == sourceId);
            if (!sourceInfo) throw new Error("Fuente no encontrada en el estado de la app.");
            
            // Obtener solo las transacciones para esa fuente
            const transactions = await api.getTransactionsBySource(sourceId);
            
            // Mostrar el modal con la información
            ui.showSourceDetailModal(sourceInfo, transactions);

        } catch (error) {
            console.error("Error al mostrar detalles de la fuente:", error);
            alert("No se pudieron cargar los detalles de la fuente.");
        }
    }
    // --- FIN DEL NUEVO MANEJADOR ---


    function setupEventListeners() {
        // Botones de acción
        document.getElementById('add-income-btn').addEventListener('click', () => handleOpenTransactionModal('INCOME'));
        document.getElementById('add-expense-btn').addEventListener('click', () => handleOpenTransactionModal('EXPENSE'));
        document.getElementById('add-transfer-btn').addEventListener('click', handleOpenTransferModal);
        document.getElementById('add-source-btn').addEventListener('click', handleOpenSourceModal);
        
        // --- NUEVO EVENT LISTENER (usando delegación de eventos) ---
        document.getElementById('sources-list').addEventListener('click', handleSourceClick);
    }
    
    function init() {
        setupEventListeners();
        loadAndRenderAllData();
    }

    init();
});