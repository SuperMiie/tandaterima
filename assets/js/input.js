function openDB() { 
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

async function saveData(data) {
    const db = await openDB();
    const tx = db.transaction('tandaTerima', 'readwrite');
    const store = tx.objectStore('tandaTerima');
    store.put(data);
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = (event) => reject(tx.error);
    });
}

async function loadData() { 
    const db = await openDB(); 
    if (!db.objectStoreNames.contains('tandaTerima')) { 
        return []; 
    } 
    const tx = db.transaction('formData', 'readonly'); 
    const store = tx.objectStore('formData'); 
    return new Promise((resolve, reject) => { 
        const data = store.getAll(); 
        data.onsuccess = () => resolve(data.result); 
        data.onerror = (event) => reject(data.error); 
    }); 
}

function generateNumber() {
    return new Promise((resolve, reject) => {
        let db;
        let request = indexedDB.open("supermiieDB", 1);

        request.onerror = function(event) {
        console.log("Error opening the database.");
        reject(event);
        };

        request.onsuccess = function(event) {
        db = event.target.result;
        let transaction = db.transaction(["tandaTerima"], "readonly");
        let objectStore = transaction.objectStore("tandaTerima");

        let date = new Date();
        let day = ('0' + date.getDate()).slice(-2);
        let month = ('0' + (date.getMonth() + 1)).slice(-2);
        let year = date.getFullYear().toString().slice(-2);

        let index = objectStore.index("monthIndex");
        let keyRange = IDBKeyRange.only(month + year);
        let countRequest = index.count(keyRange);

        countRequest.onsuccess = function() {
            let sequence = ('000' + (countRequest.result + 1)).slice(-4);
            let generatedNumber = day + month + year + sequence;
            console.log("Generated Number:", generatedNumber);
            resolve(generatedNumber);
        };
        };

        request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains("tandaTerima")) {
            let objectStore = db.createObjectStore("tandaTerima", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("monthIndex", "monthYear");
        }
        };
    });
}

window.onload = async function() {
    generateNumber().then((generatedNumber) => { 
        document.getElementById('uniqueNumber').value = generatedNumber; 
    });

    const form = document.getElementById('inputForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        let date = new Date(); 
        let monthYear = ('0' + (date.getMonth() + 1)).slice(-2) + date.getFullYear().toString().slice(-2);

        const today = new Date();
        const formData = {
            id: Date.now(),
            number: await generateNumber(),
            monthYear: monthYear,
            create: form.elements['create'].value,
            dari: form.elements['dari'].value,
            berupa: form.elements['berupa'].value,
            toko: form.elements['toko'].value,
            untuk: form.elements['untuk'].value,
            date: today.toLocaleDateString('id-ID'), 
            time: today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        await saveData(formData);
        // alert('Data berhasil disimpan!');

        window.open(`cetak.html?id=${formData.id}`, '_blank');
        window.location.href = '../../index.html';
    });
}