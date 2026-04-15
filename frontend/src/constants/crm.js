const CONTACT_TYPES = {
  PERSON: "physical_person",
  COMPANY: "legal_entity",
  IP: "ip",
};

const DEAL_STAGES = {
  NEW: "new",
  IN_PROGRESS: "in_progress",
  NEGOTIATIONS: "negotiations",
  INVOICE_SENT: "invoice_sent",
  WON: "won",
  LOST: "lost",
};

const DEAL_STAGE_SEVERITY = {
  NEW: "info",
  IN_PROGRESS: "warn",
  NEGOTIATIONS: "primary",
  INVOICE_SENT: "secondary",
  WON: "success",
  LOST: "danger",
};

const CONTACT_STATUSES = {
  ACTIVE: "active",
  ARCHIVED: "archived",
};

const ACTIVITY_TYPES = {
  CALL: "call",
  MEETING: "meeting",
  EMAIL: "email",
  TASK: "task",
};

export {
  CONTACT_TYPES,
  DEAL_STAGES,
  DEAL_STAGE_SEVERITY,
  CONTACT_STATUSES,
  ACTIVITY_TYPES,
};
