async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('supermiieDB', 1);
        request.onerror = (event) => reject(request.error);
        request.onsuccess = (event) => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('tandaTerima')) {
                const objectStore = db.createObjectStore('tandaTerima', { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('monthIndex', 'monthYear', { unique: false });
            }
        };
    });
}

async function exportData() {
    const db = await openDB();
    const tx = db.transaction('tandaTerima', 'readonly');
    const store = tx.objectStore('tandaTerima');
    const allData = await store.getAll();
    
    allData.onsuccess = function() {        
        const json = JSON.stringify(allData.result);        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    allData.onerror = function() {
        console.error('Error saat mengambil data dari IndexedDB:', allData.error);
    };
}

async function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async function(event) {
        const json = event.target.result;
        const data = JSON.parse(json);
        const db = await openDB();
        const tx = db.transaction('tandaTerima', 'readwrite');
        const store = tx.objectStore('tandaTerima');
        for (const item of data) {
            await store.put(item);
        }
        alert('Data berhasil diimpor ke IndexedDB');
    };
    reader.onerror = function(event) {
        console.error('Error reading file:', event.target.error);
    };
    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('exportButton').addEventListener('click', exportData);
    document.getElementById('importInput').addEventListener('change', importData);
});