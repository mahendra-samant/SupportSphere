import { getTickets } from "../services/api";

export async function loadAllTickets() {
  const allTickets = [];
  let page = 1;
  while (page <= 100) {
    const payload = await getTickets({ page, page_size: 50 });
    if (Array.isArray(payload)) return payload;
    allTickets.push(...(payload?.results || []));
    if (!payload?.next) break;
    page += 1;
  }
  return allTickets;
}
