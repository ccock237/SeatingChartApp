export async function get(path) {
    const response = await fetch(path, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    let resObj;

    // Check if there is json first
    if (response.headers.get('Content-Type')?.includes('application/json')) {
        resObj = await response.json();
    }

    console.log('GET', path, resObj);
    return resObj;
}

export async function put(path, body) {
    const response = await fetch(path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${await response.text()}`);
    }

    const resObj = await response.json();

    console.log('PUT', path, body, resObj);
    return resObj;
}

export async function post(path, body) {
    const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${await response.text()}`);
    }

    const resObj = await response.json();

    console.log('POST', path, body, resObj);
    return resObj;
}

export async function remove(path) {
    const response = await fetch(path, { method: "DELETE" });

    if (!response.ok) {
        throw new Error(`Request failed with status ${await response.text()}`);
    }

    const resObj = await response.json();

    console.log("DELETE", path, resObj);
    return resObj;
}