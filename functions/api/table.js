export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name')?.trim();
    const table = url.searchParams.get('table')?.trim();

    let results;

    if (name && name.length >= 2) {
        const resp = await env.SEATING_DB.prepare(
            'SELECT Person.name, DiningTable.table_number, DiningTable.label FROM Person INNER JOIN DiningTable ON Person.table_id = DiningTable.table_id WHERE LOWER(Person.name) LIKE ? ORDER BY Person.name'
        )
        .bind(`%${name.toLowerCase()}%`)
        .all();

        results = resp.results;
    }
    else if (table && table.length >= 1) {
        const resp = await env.SEATING_DB.prepare(
            'SELECT Person.name, DiningTable.table_number, DiningTable.label FROM Person INNER JOIN DiningTable ON Person.table_id = DiningTable.table_id WHERE DiningTable.table_number = ? ORDER BY Person.name'
        )
        .bind(table)
        .all();

        results = resp.results;
    }
    else {
        return new Response({ status: 204 });
    }

    return new Response(
        JSON.stringify(results),
        { headers: { 'Content-Type': 'application/json' } }
    );
}

export async function onRequestPut({ request, env }) {
    const url = new URL(request.url);
    const tableNumber = Number(url.searchParams.get('table'));

    if (!Number.isFinite(tableNumber) || tableNumber < 0) {
        return new Response(JSON.stringify({ error: 'Invalid table number' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { label, type, grid_row, grid_col } = await request.json();

    if (type !== 'Round' && type !== 'Rectangle') {
        return new Response(JSON.stringify({ error: 'Invalid type' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!Number.isFinite(grid_col) || grid_col < 1 || !Number.isFinite(grid_row) || grid_row < 1) {
        return new Response(JSON.stringify({ error: 'Invalid grid position' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Update the Table record in the DinnerTable table
    const updateResult = await env.SEATING_DB.prepare(
        'UPDATE DiningTable SET label = ?, type = ?, grid_col = ?, grid_row = ? WHERE table_number = ?'
    )
    .bind(label, type, grid_col, grid_row, tableNumber)
    .run();

    if (updateResult.meta.changes === 0) {
        return new Response(JSON.stringify({ error: 'Unable to update table' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost({ request, env }) {
    const { table_number, label, type, grid_col, grid_row } = await request.json();

    if (!Number.isFinite(table_number) || table_number < 0) {
        return new Response(JSON.stringify({ error: 'Invalid table number' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (type !== 'Round' && type !== 'Rectangle') {
        return new Response(JSON.stringify({ error: 'Invalid type' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!Number.isFinite(grid_col) || grid_col < 1 || !Number.isFinite(grid_row) || grid_row < 1) {
        return new Response(JSON.stringify({ error: 'Invalid grid position' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Insert a new Table record into the DinnerTable table
    const insertResult = await env.SEATING_DB.prepare(
        'INSERT INTO DiningTable (table_number, label, type, grid_col, grid_row) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(table_number, label, type, grid_col, grid_row)
    .run();

    if (insertResult.meta.changes === 0) {
        return new Response(JSON.stringify({ error: 'Failed to create table' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
