export async function onRequestPut({ request, env }) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name')?.trim();

    if (!name) {
        return new Response(JSON.stringify({ error: 'Invalid name' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { new_name, new_table_number } = await request.json();

    if (!new_name || !Number.isFinite(new_table_number) || new_table_number < 0) {
        return new Response(JSON.stringify({ error: 'Invalid new name or new table number' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const updateResult = await env.SEATING_DB.prepare("UPDATE Person SET name = ?, table_id = (SELECT table_id FROM DiningTable WHERE table_number = ?) WHERE LOWER(name) = ?")
    .bind(new_name, new_table_number, name.toLowerCase())
    .run();

    if (updateResult.meta.changes === 0) {
        return new Response(JSON.stringify({ error: 'Failed to update' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost({ request, env }) {
    const { name, table_number } = await request.json();

    if (!name || !Number.isFinite(table_number) || table_number < 0) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const resp = await env.SEATING_DB.prepare(
        "INSERT INTO Person (name, table_id) SELECT ?, table_id FROM DiningTable WHERE table_number = ?"
    )
    .bind(name, table_number)
    .run();

    if (resp.meta.changes === 0) {
        return new Response(JSON.stringify({ error: 'Failed to insert' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestDelete({ request, env }) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name')?.trim();

    if (!name) {
        return new Response(JSON.stringify({ error: 'Invalid name' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const resp = await env.SEATING_DB.prepare("DELETE FROM Person WHERE LOWER(name) = ?")
    .bind(name.toLowerCase())
    .run();

    if (resp.meta.changes === 0) {
        return new Response(JSON.stringify({ error: 'Failed to delete' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}