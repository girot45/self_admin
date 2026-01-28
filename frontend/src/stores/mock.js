// src/mockData.js

export const mockData = {
    // Данные для карт/счетов
    cards: [
        { id: 1, name: "Visa **** 1234", type: "card", currency: "RUB", balance: 50000, isActive: true },
        { id: 2, name: "MasterCard **** 5678", type: "card", currency: "RUB", balance: 75000, isActive: true },
        { id: 3, name: "Мир **** 9012", type: "card", currency: "RUB", balance: 30000, isActive: true },
        { id: 4, name: "Наличные", type: "cash", currency: "RUB", balance: 15000, isActive: true },
        { id: 5, name: "Кредитная карта", type: "credit", currency: "RUB", balance: -25000, isActive: true }
    ],

    // Данные для всех счетов (включая карты, банки, электронные кошельки)
    accounts: [
        { id: 1, name: "Visa **** 1234", type: "card", currency: "RUB", balance: 50000, isActive: true },
        { id: 2, name: "MasterCard **** 5678", type: "card", currency: "RUB", balance: 75000, isActive: true },
        { id: 3, name: "Мир **** 9012", type: "card", currency: "RUB", balance: 30000, isActive: true },
        { id: 4, name: "Тинькофф Банк", type: "bank", currency: "RUB", balance: 150000, isActive: true },
        { id: 5, name: "Сбербанк", type: "bank", currency: "RUB", balance: 200000, isActive: true },
        { id: 6, name: "ВТБ", type: "bank", currency: "RUB", balance: 100000, isActive: true },
        { id: 7, name: "Наличные", type: "cash", currency: "RUB", balance: 15000, isActive: true },
        { id: 8, name: "PayPal", type: "electronic", currency: "USD", balance: 500, isActive: true },
        { id: 9, name: "ЮMoney", type: "electronic", currency: "RUB", balance: 25000, isActive: true },
        { id: 10, name: "QIWI", type: "electronic", currency: "RUB", balance: 10000, isActive: true }
    ],

    // Категории расходов
    expenseCategories: [
        { id: 1, name: "Продукты", icon: "🍎", color: "#4CAF50", isActive: true },
        { id: 2, name: "Транспорт", icon: "🚗", color: "#2196F3", isActive: true },
        { id: 3, name: "Кафе и рестораны", icon: "🍽️", color: "#FF9800", isActive: true },
        { id: 4, name: "Развлечения", icon: "🎬", color: "#9C27B0", isActive: true },
        { id: 5, name: "Коммунальные услуги", icon: "🏠", color: "#607D8B", isActive: true },
        { id: 6, name: "Здоровье", icon: "🏥", color: "#F44336", isActive: true },
        { id: 7, name: "Одежда", icon: "👕", color: "#E91E63", isActive: true },
        { id: 8, name: "Техника", icon: "💻", color: "#3F51B5", isActive: true },
        { id: 9, name: "Прочее", icon: "📦", color: "#9E9E9E", isActive: true }
    ],

    // Источники доходов
    incomeSources: [
        { id: 1, name: "Зарплата", icon: "💰", color: "#4CAF50", isActive: true },
        { id: 2, name: "Фриланс", icon: "💼", color: "#2196F3", isActive: true },
        { id: 3, name: "Инвестиции", icon: "📈", color: "#FF9800", isActive: true },
        { id: 4, name: "Подарок", icon: "🎁", color: "#9C27B0", isActive: true },
        { id: 5, name: "Возврат долга", icon: "🔄", color: "#607D8B", isActive: true },
        { id: 6, name: "Премия", icon: "⭐", color: "#FFC107", isActive: true },
        { id: 7, name: "Сдача в аренду", icon: "🏠", color: "#795548", isActive: true }
    ],

    // Категории доходов
    incomeCategories: [
        { id: 1, name: "Основной доход", icon: "💼", color: "#4CAF50", isActive: true },
        { id: 2, name: "Дополнительный доход", icon: "➕", color: "#2196F3", isActive: true },
        { id: 3, name: "Пассивный доход", icon: "📊", color: "#FF9800", isActive: true },
        { id: 4, name: "Разовое поступление", icon: "🎯", color: "#9C27B0", isActive: true },
        { id: 5, name: "Инвестиционный доход", icon: "📈", color: "#FFC107", isActive: true }
    ],

    // Настройки комиссий для переводов
    transferCommissions: [
        { fromType: "card", toType: "card", commissionRate: 0.015, minCommission: 50, maxCommission: 1500 },
        { fromType: "card", toType: "bank", commissionRate: 0.01, minCommission: 30, maxCommission: 1000 },
        { fromType: "card", toType: "electronic", commissionRate: 0.02, minCommission: 20, maxCommission: 500 },
        { fromType: "bank", toType: "bank", commissionRate: 0.005, minCommission: 10, maxCommission: 300 },
        { fromType: "bank", toType: "card", commissionRate: 0.012, minCommission: 25, maxCommission: 800 },
        { fromType: "electronic", toType: "electronic", commissionRate: 0.008, minCommission: 5, maxCommission: 200 },
        { fromType: "cash", toType: "bank", commissionRate: 0.03, minCommission: 100, maxCommission: 3000 }
    ],

    // Моковые транзакции для истории
    transactions: [
        { id: 1, type: "expense", amount: -1500, categoryId: 1, cardId: 1, date: "2024-01-15T10:30:00", comment: "Продукты в Пятерочке" },
        { id: 2, type: "expense", amount: -300, categoryId: 2, cardId: 1, date: "2024-01-15T08:15:00", comment: "Метро" },
        { id: 3, type: "income", amount: 50000, sourceId: 1, categoryId: 1, date: "2024-01-10T12:00:00", comment: "Зарплата за январь" },
        { id: 4, type: "expense", amount: -1200, categoryId: 3, cardId: 2, date: "2024-01-14T19:45:00", comment: "Ужин в ресторане" },
        { id: 5, type: "transfer", amount: -10000, commission: 150, fromAccountId: 1, toAccountId: 4, date: "2024-01-12T14:20:00", comment: "Перевод на накопительный счет" }
    ]
};

// Вспомогательные функции для работы с моковыми данными
export const mockHelpers = {
    // Получить карту по ID
    getCardById(id) {
        return mockData.cards.find(card => card.id === id);
    },

    // Получить счет по ID
    getAccountById(id) {
        return mockData.accounts.find(account => account.id === id);
    },

    // Получить категорию расходов по ID
    getExpenseCategoryById(id) {
        return mockData.expenseCategories.find(category => category.id === id);
    },

    // Получить источник дохода по ID
    getIncomeSourceById(id) {
        return mockData.incomeSources.find(source => source.id === id);
    },

    // Получить категорию дохода по ID
    getIncomeCategoryById(id) {
        return mockData.incomeCategories.find(category => category.id === id);
    },

    // Получить комиссию для перевода между типами счетов
    getTransferCommission(fromAccountId, toAccountId) {
        const fromAccount = this.getAccountById(fromAccountId);
        const toAccount = this.getAccountById(toAccountId);
        
        if (!fromAccount || !toAccount) {
            return { commissionRate: 0.02, minCommission: 50, maxCommission: 1000 };
        }
        
        const commissionRule = mockData.transferCommissions.find(
            rule => rule.fromType === fromAccount.type && rule.toType === toAccount.type
        );
        
        return commissionRule || { commissionRate: 0.02, minCommission: 50, maxCommission: 1000 };
    },

    // Рассчитать комиссию для суммы
    calculateCommission(amount, fromAccountId, toAccountId) {
        const commissionRule = this.getTransferCommission(fromAccountId, toAccountId);
        const calculated = amount * commissionRule.commissionRate;
        
        // Ограничение по минимальной и максимальной комиссии
        if (calculated < commissionRule.minCommission) {
            return commissionRule.minCommission;
        }
        if (calculated > commissionRule.maxCommission) {
            return commissionRule.maxCommission;
        }
        
        return Math.round(calculated);
    },

    // Форматирование валюты
    formatCurrency(amount, currency = "RUB") {
        const formatter = new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        });
        return formatter.format(amount);
    },

    // Получить активные карты
    getActiveCards() {
        return mockData.cards.filter(card => card.isActive);
    },

    // Получить активные счета
    getActiveAccounts() {
        return mockData.accounts.filter(account => account.isActive);
    },

    // Получить активные категории расходов
    getActiveExpenseCategories() {
        return mockData.expenseCategories.filter(category => category.isActive);
    },

    // Получить активные источники доходов
    getActiveIncomeSources() {
        return mockData.incomeSources.filter(source => source.isActive);
    },

    // Получить активные категории доходов
    getActiveIncomeCategories() {
        return mockData.incomeCategories.filter(category => category.isActive);
    }
};