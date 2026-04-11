import { defineStore } from "pinia";

export const useFinanceStore = defineStore("finance", {
  state: () => ({
    transactions: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalIncome: (state) =>
      state.transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
    totalExpense: (state) =>
      state.transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    balance: (state) => state.totalIncome - state.totalExpense,
  },

  actions: {
    addTransaction(data) {
      const transaction = {
        id: crypto.randomUUID(),
        amount: data.amount,
        type: data.type,
        description: data.description,
        category: data.category ?? "uncategorized",
        date: data.date ?? new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.transactions.push(transaction);
      this.save();
      return transaction;
    },
    save() {
      localStorage.setItem(
        "finance_transactions",
        JSON.stringify(this.transactions),
      );
    },
    load() {
      const data = localStorage.getItem("finance_transactions");
      if (data) {
        try {
          this.transactions = JSON.parse(data);
        } catch (e) {
          console.error("Failed to load finance data:", e);
        }
      }
    },
  },
});
