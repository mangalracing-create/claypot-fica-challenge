// Claypot FICA Challenge — leaderboard backend (Netlify Function + Netlify Blobs)
// Endpoint: /.netlify/functions/scores?board=<boardId>
//   GET    -> returns the array of score entries for the board
//   POST   -> appends one entry (JSON body); assigns an id
//   DELETE -> clears the board
//
// Netlify Blobs needs no external account — it is provided by the Netlify platform.
import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });

export default async (req) => {
  const store = getStore("claypot-leaderboard");
  const board = new URL(req.url).searchParams.get("board") || "default";

  try {
    if (req.method === "GET") {
      const list = (await store.get(board, { type: "json" })) || [];
      return json(Array.isArray(list) ? list : []);
    }

    if (req.method === "POST") {
      const entry = await req.json();
      const list = (await store.get(board, { type: "json" })) || [];
      entry.id = entry.id || (Date.now() + "-" + Math.random().toString(36).slice(2, 8));
      list.push(entry);
      // keep the board bounded (most recent 500)
      const trimmed = list.slice(-500);
      await store.setJSON(board, trimmed);
      return json({ ok: true, id: entry.id, count: trimmed.length });
    }

    if (req.method === "DELETE") {
      await store.setJSON(board, []);
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return json({ error: String(err && err.message || err) }, 500);
  }
};
