export async function onRequestGet({ request, env, params }) {

    const { results } = await env.SEATING_DB.prepare(
        "SELECT table_number, grid_col, grid_row, type, label, width, height, spanRow, spanCol FROM DiningTable ORDER BY table_number"
    ).all();

    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
    });

}