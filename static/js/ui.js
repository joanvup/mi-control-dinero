// static/js/ui.js

const ui = {
    // ... (el resto del objeto ui se mantiene igual: categories, charts, formatCurrency, renderSummaryCards) ...
    categories: {
        expense: ['Comida', 'Transporte', 'Vivienda', 'Ocio', 'Salud', 'Compras', 'Servicios', 'Otros'],
        income: ['Salario', 'Ventas', 'Regalo', 'Inversiones', 'Otros']
    },
    charts: {},
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
    },
    renderSummaryCards: (summary) => {
        const container = document.getElementById('summary-cards');
        container.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-gray-600 text-sm font-semibold">Saldo Total</h3>
                <p class="text-3xl font-bold text-blue-500">${ui.formatCurrency(summary.total_balance)}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-gray-600 text-sm font-semibold">Ingresos Totales</h3>
                <p class="text-3xl font-bold text-green-500">${ui.formatCurrency(summary.total_income)}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-gray-600 text-sm font-semibold">Gastos Totales</h3>
                <p class="text-3xl font-bold text-red-500">${ui.formatCurrency(summary.total_expense)}</p>
            </div>
        `;
    },

    /**
     * Renderiza la lista de fuentes de dinero.
     * @param {Array<object>} sources
     */
    renderSources: (sources) => {
        const container = document.getElementById('sources-list');
        // --- MODIFICADO ---
        // Se añade `data-source-id` para identificar la tarjeta y clases para hacerla interactiva
        container.innerHTML = sources.map(source => `
            <div class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:shadow-xl hover:transform hover:-translate-y-1 transition-all duration-200" data-source-id="${source.id}">
                <div>
                    <p class="font-semibold text-gray-800">${source.name}</p>
                    <p class="text-xl text-gray-600">${ui.formatCurrency(source.balance)}</p>
                </div>
                 <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
            </div>
        `).join('');
        // --- FIN DE LA MODIFICACIÓN ---
    },
    
    // ... (se mantienen `renderRecentTransactions` y `renderCharts`) ...
    renderRecentTransactions: (transactions) => {
        const container = document.getElementById('transactions-table-body');
        if (transactions.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="text-center py-4">No hay transacciones recientes.</td></tr>`;
            return;
        }
        container.innerHTML = transactions.map(t => `
            <tr class="border-b border-gray-200 hover:bg-gray-100">
                <td class="py-3 px-6 text-left whitespace-nowrap">${t.description}</td>
                <td class="py-3 px-6 text-left">${t.category}</td>
                <td class="py-3 px-6 text-center">
                    <span class="py-1 px-3 rounded-full text-xs ${t.type === 'INCOME' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}">
                        ${t.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                    </span>
                </td>
                 <td class="py-3 px-6 text-center">${t.source_name}</td>
                <td class="py-3 px-6 text-right font-semibold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}">
                    ${t.type === 'EXPENSE' ? '-' : ''}${ui.formatCurrency(t.amount)}
                </td>
            </tr>
        `).join('');
    },
    renderCharts: (chartData) => {
        const incomeVsExpenseCtx = document.getElementById('incomeVsExpenseChart').getContext('2d');
        if (ui.charts.incomeVsExpense) ui.charts.incomeVsExpense.destroy();
        ui.charts.incomeVsExpense = new Chart(incomeVsExpenseCtx, { type: 'bar', data: { labels: chartData.income_vs_expense.labels, datasets: [ { label: 'Ingresos', data: chartData.income_vs_expense.income, backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }, { label: 'Gastos', data: chartData.income_vs_expense.expense, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 } ] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
        const expenseDistributionCtx = document.getElementById('expenseDistributionChart').getContext('2d');
        if (ui.charts.expenseDistribution) ui.charts.expenseDistribution.destroy();
        ui.charts.expenseDistribution = new Chart(expenseDistributionCtx, { type: 'doughnut', data: { labels: chartData.expense_distribution.labels, datasets: [{ data: chartData.expense_distribution.data, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'], }] }, options: { responsive: true, maintainAspectRatio: false } });
    },

    // --- NUEVA FUNCIÓN ---
    /**
     * Muestra un modal con los detalles y transacciones de una fuente.
     * @param {object} source - La fuente de dinero (con nombre y saldo).
     * @param {Array<object>} transactions - Lista de transacciones de esa fuente.
     */
    showSourceDetailModal: (source, transactions) => {
        let transactionsHtml;
        if (transactions.length === 0) {
            transactionsHtml = `<p class="text-center text-gray-500 py-4">No hay movimientos en esta fuente.</p>`;
        } else {
            const rows = transactions.map(t => `
                <tr class="border-b">
                    <td class="py-2 px-3 text-sm text-gray-600">${new Date(t.date).toLocaleDateString()}</td>
                    <td class="py-2 px-3">${t.description}</td>
                    <td class="py-2 px-3 text-right font-mono ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}">
                        ${t.type === 'EXPENSE' ? '-' : '+'}${ui.formatCurrency(t.amount)}
                    </td>
                </tr>
            `).join('');

            transactionsHtml = `
                <div class="max-h-80 overflow-y-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="border-b bg-gray-50">
                                <th class="py-2 px-3 font-semibold text-sm">Fecha</th>
                                <th class="py-2 px-3 font-semibold text-sm">Descripción</th>
                                <th class="py-2 px-3 font-semibold text-sm text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        }

        const modalContent = `
            <div class="mb-4">
                <p class="text-gray-600">Saldo Actual</p>
                <p class="text-3xl font-bold text-blue-500">${ui.formatCurrency(source.balance)}</p>
            </div>
            <h3 class="text-lg font-semibold mb-2 text-gray-800">Historial de Movimientos</h3>
            ${transactionsHtml}
        `;
        
        // Usamos el modal genérico, pero sin formulario ni botones de acción.
        ui.showModal(`Detalle de: ${source.name}`, modalContent, () => {}, true);
    },
    // --- FIN DE LA NUEVA FUNCIÓN ---
    
    /**
     * Muestra un modal con un formulario dinámico.
     * @param {string} title - Título del modal.
     * @param {string} contentHtml - Contenido HTML del modal (puede ser un formulario o info).
     * @param {function} onSubmit - Callback que se ejecuta al enviar el formulario.
     * @param {boolean} isInfoModal - Si es true, oculta los botones del formulario.
     */
    showModal: (title, contentHtml, onSubmit, isInfoModal = false) => {
        const modalContainer = document.getElementById('modal-container');
        const modalId = `modal-${Date.now()}`;
        
        const formButtons = `
            <div class="flex justify-end pt-2">
                <button type="submit" class="px-4 bg-indigo-500 p-3 rounded-lg text-white hover:bg-indigo-400">Guardar</button>
                <button type="button" class="modal-close-btn px-4 bg-transparent p-3 rounded-lg text-indigo-500 hover:bg-gray-100 hover:text-indigo-400 mr-2">Cancelar</button>
            </div>
        `;

        const modalHtml = `
            <div id="${modalId}" class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0 pointer-events-none z-50">
                <div class="absolute w-full h-full bg-gray-900 opacity-50 modal-overlay"></div>
                
                <div class="modal-content bg-white w-11/12 md:max-w-lg mx-auto rounded-lg shadow-lg z-50 overflow-y-auto transform -translate-y-full">
                    <div class="py-4 text-left px-6">
                        <div class="flex justify-between items-center pb-3">
                            <p class="text-2xl font-bold">${title}</p>
                            <button class="modal-close cursor-pointer z-50">
                                <svg class="fill-current text-black" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path></svg>
                            </button>
                        </div>

                        <form id="modal-form">
                            ${contentHtml}
                            ${isInfoModal ? '' : formButtons}
                        </form>
                    </div>
                </div>
            </div>
        `;

        modalContainer.innerHTML = modalHtml;
        const modal = document.getElementById(modalId);
        const form = modal.querySelector('#modal-form');
        
        // ... (el resto de la lógica de showModal se mantiene igual) ...
        const closeModal = () => { modal.querySelector('.modal-content').classList.add('-translate-y-full'); modal.classList.add('opacity-0'); modal.classList.add('pointer-events-none'); document.body.classList.remove('modal-active'); setTimeout(() => modalContainer.innerHTML = '', 300); };
        setTimeout(() => { modal.classList.remove('opacity-0', 'pointer-events-none'); modal.querySelector('.modal-content').classList.remove('-translate-y-full'); document.body.classList.add('modal-active'); }, 10);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        if (!isInfoModal) { modal.querySelector('.modal-close-btn').addEventListener('click', closeModal); }
        form.addEventListener('submit', (e) => { e.preventDefault(); if (isInfoModal) { closeModal(); return; } const formData = new FormData(e.target); const data = Object.fromEntries(formData.entries()); onSubmit(data, closeModal); });
    },
    
    // ... (el resto del objeto ui se mantiene igual: getTransactionFormHtml, getTransferFormHtml, getSourceFormHtml) ...
    getTransactionFormHtml: (type, sources) => {
        const title = type === 'INCOME' ? 'Agregar Ingreso' : 'Agregar Gasto';
        const categories = type === 'INCOME' ? ui.categories.income : ui.categories.expense;
        const sourceOptions = sources.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        const categoryOptions = categories.map(c => `<option value="${c}">${c}</option>`).join('');
        return `
            <input type="hidden" name="type" value="${type}">
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="description">Descripción</label><input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="description" name="description" type="text" required></div>
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="amount">Monto</label><input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="amount" name="amount" type="number" step="0.01" required></div>
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="source_id">Fuente</label><select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="source_id" name="source_id" required>${sourceOptions}</select></div>
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="category">Categoría</label><select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="category" name="category" required>${categoryOptions}</select></div>
        `;
    },
    getTransferFormHtml: (sources) => {
        const sourceOptions = sources.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        return `
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="from_source_id">Desde</label><select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="from_source_id" name="from_source_id" required>${sourceOptions}</select></div>
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="to_source_id">Hacia</label><select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="to_source_id" name="to_source_id" required>${sourceOptions}</select></div>
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="amount">Monto</label><input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="amount" name="amount" type="number" step="0.01" required></div>
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="description">Descripción</label><input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="description" name="description" type="text" placeholder="Ej: Ahorros mensuales"></div>
        `;
    },
    getSourceFormHtml: () => {
        return `
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="name">Nombre de la Fuente</label><input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="name" name="name" type="text" required></div>
            <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2" for="initial_balance">Saldo Inicial</label><input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" id="initial_balance" name="initial_balance" type="number" step="0.01" value="0" required></div>
        `;
    }
};