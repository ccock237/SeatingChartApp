window.addEventListener('screenchange', event => {
    const { screen, name, table_number } = event.detail;
    
    if (screen === 'table-map') {
        document.querySelector("name-search").style.display = 'none';
        document.querySelector("search-results").style.display = 'none';
        const tableMap = document.querySelector("table-map");
        tableMap.style.display = 'flex';
        tableMap.setAttribute('highlighted-table', table_number);
        document.querySelector("control-center").style.display = 'none';
    }
    else if (screen === 'name-search') {
        document.querySelector("name-search").style.display = 'flex';
        document.querySelector("search-results").style.display = 'none';
        document.querySelector("table-map").style.display = 'none';
        document.querySelector("control-center").style.display = 'none';
    }
    else if (screen === 'control-center') {
        document.querySelector('name-search').style.display = 'none';
        document.querySelector("search-results").style.display = 'none';
        document.querySelector("table-map").style.display = 'none';
        document.querySelector('control-center').style.display = 'flex';
    }
});