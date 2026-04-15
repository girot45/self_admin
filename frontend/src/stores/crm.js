import { defineStore } from "pinia";
import { useFinanceStore } from "@/stores/finance";

export const useCrmStore = defineStore("crm", {
  state: () => ({
    contacts: [],
    deals: [],
    activities: [],
    loading: false,
    error: null,
  }),

  getters: {
    dealsByStage: (state) => (stage) => {
      return state.deals
        .filter((d) => d.stage === stage)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    dealsByContact: (state) => (contactId) => {
      return state.deals.filter((d) => d.contactId === contactId);
    },

    activitiesByDeal: (state) => (dealId) => {
      return state.activities
        .filter((a) => a.dealId === dealId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    activitiesByContact: (state) => (contactId) => {
      return state.activities.filter((a) => a.contactId === contactId);
    },

    dealFinanceSummary: (state) => (dealId) => {
      const financeStore = useFinanceStore();
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal || !deal.financeIds.length)
        return { income: 0, expense: 0, balance: 0 };
      const linked = financeStore.transactions.filter((tr) =>
        deal.financeIds.includes(tr.id),
      );
      const income = linked
        .filter((tr) => tr.type === "income")
        .reduce((s, tr) => s + tr.amount, 0);
      const expense = linked
        .filter((tr) => tr.type === "expense")
        .reduce((s, tr) => s + tr.amount, 0);
      return { income, expense, balance: income - expense };
    },

    contactDealsTotal: (state) => (contactId) => {
      const deals = state.deals.filter((d) => d.contactId === contactId);
      return deals.reduce((total, deal) => total + (deal.amount || 0), 0);
    },
  },

  actions: {
    createContact(data) {
      const contact = {
        id: crypto.randomUUID(),
        type: data.type,
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        company: data.company ?? null,
        status: data.status ?? "active",
        notes: data.notes ?? null,
        financeIds: [],
        dealIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.contacts.push(contact);
      this.save();
      return contact;
    },

    updateContact(id, data) {
      const index = this.contacts.findIndex((c) => c.id === id);
      if (index === -1) return;
      this.contacts[index] = {
        ...this.contacts[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.save();
    },

    deleteContact(id) {
      this.contacts = this.contacts.filter((c) => c.id !== id);
      this.deals.forEach((deal) => {
        if (deal.contactId === id) deal.contactId = null;
      });
      this.activities.forEach((activity) => {
        if (activity.contactId === id) activity.contactId = null;
      });
      this.save();
    },

    createDeal(data) {
      const deal = {
        id: crypto.randomUUID(),
        title: data.title,
        stage: data.stage ?? "new",
        amount: data.amount ?? 0,
        currency: data.currency ?? "RUB",
        contactId: data.contactId ?? null,
        projectId: data.projectId ?? null,
        taskId: data.taskId ?? null,
        description: data.description ?? null,
        notes: data.notes ?? null,
        closeDate: data.closeDate ?? null,
        financeIds: [],
        activityIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.deals.push(deal);
      if (data.contactId) {
        const contact = this.contacts.find((c) => c.id === data.contactId);
        if (contact) {
          contact.dealIds.push(deal.id);
          this.save();
        }
      } else {
        this.save();
      }
      return deal;
    },

    updateDeal(id, data) {
      const index = this.deals.findIndex((d) => d.id === id);
      if (index === -1) return;
      this.deals[index] = {
        ...this.deals[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.save();
    },

    deleteDeal(id) {
      const deal = this.deals.find((d) => d.id === id);
      if (deal) {
        if (deal.contactId) {
          const contact = this.contacts.find((c) => c.id === deal.contactId);
          if (contact) {
            contact.dealIds = contact.dealIds.filter((dealId) => dealId !== id);
          }
        }
        this.activities = this.activities.filter((a) => a.dealId !== id);
        this.deals = this.deals.filter((d) => d.id !== id);
      }
      this.save();
    },

    moveDeal(id, newStage) {
      const deal = this.deals.find((d) => d.id === id);
      if (!deal) return;
      deal.stage = newStage;
      deal.updatedAt = new Date().toISOString();
      this.save();
    },

    createActivity(data) {
      const activity = {
        id: crypto.randomUUID(),
        type: data.type,
        dealId: data.dealId ?? null,
        contactId: data.contactId ?? null,
        title: data.title,
        description: data.description ?? null,
        date: data.date ?? new Date().toISOString(),
        isDone: data.isDone ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.activities.push(activity);
      if (data.dealId) {
        const deal = this.deals.find((d) => d.id === data.dealId);
        if (deal) {
          deal.activityIds.push(activity.id);
          this.save();
        }
      } else {
        this.save();
      }
      return activity;
    },

    updateActivity(id, data) {
      const index = this.activities.findIndex((a) => a.id === id);
      if (index === -1) return;
      this.activities[index] = {
        ...this.activities[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.save();
    },

    toggleActivityDone(id) {
      const activity = this.activities.find((a) => a.id === id);
      if (!activity) return;
      activity.isDone = !activity.isDone;
      activity.updatedAt = new Date().toISOString();
      this.save();
    },

    deleteActivity(id) {
      const activity = this.activities.find((a) => a.id === id);
      if (activity) {
        if (activity.dealId) {
          const deal = this.deals.find((d) => d.id === activity.dealId);
          if (deal) {
            deal.activityIds = deal.activityIds.filter(
              (activityId) => activityId !== id,
            );
          }
        }
        this.activities = this.activities.filter((a) => a.id !== id);
      }
      this.save();
    },

    linkFinanceToDeal(dealId, financeId) {
      const deal = this.deals.find((d) => d.id === dealId);
      if (!deal || deal.financeIds.includes(financeId)) return;
      deal.financeIds.push(financeId);
      deal.updatedAt = new Date().toISOString();
      this.save();
    },

    unlinkFinanceFromDeal(dealId, financeId) {
      const deal = this.deals.find((d) => d.id === dealId);
      if (!deal) return;
      deal.financeIds = deal.financeIds.filter((id) => id !== financeId);
      deal.updatedAt = new Date().toISOString();
      this.save();
    },

    load() {
      try {
        this.contacts = JSON.parse(localStorage.getItem("crm_contacts")) || [];
        this.deals = JSON.parse(localStorage.getItem("crm_deals")) || [];
        this.activities =
          JSON.parse(localStorage.getItem("crm_activities")) || [];
      } catch (err) {
        console.error("Failed to load CRM data:", err);
        this.contacts = [];
        this.deals = [];
        this.activities = [];
      }
    },

    save() {
      try {
        localStorage.setItem("crm_contacts", JSON.stringify(this.contacts));
        localStorage.setItem("crm_deals", JSON.stringify(this.deals));
        localStorage.setItem("crm_activities", JSON.stringify(this.activities));
      } catch (err) {
        console.error("Failed to save CRM data:", err);
      }
    },
  },
});

export default useCrmStore;
