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

async function loadData() {
    const db = await openDB();
    if (!db.objectStoreNames.contains('tandaTerima')) {
        return [];
    }
    const tx = db.transaction('tandaTerima', 'readonly');
    const store = tx.objectStore('tandaTerima');
    return new Promise((resolve, reject) => {
        const data = store.getAll();
        data.onsuccess = () => resolve(data.result);
        data.onerror = (event) => reject(data.error);
    });
}

async function deleteData(id) {
    const db = await openDB();
    const tx = db.transaction('tandaTerima', 'readwrite');
    const store = tx.objectStore('tandaTerima');
    store.delete(id);
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = (event) => reject(tx.error);
    });
}

function deleteRow(id, number) {
    if (confirm(`Apakah Anda yakin ingin menghapus data dengan Nomor : ${number}?`)) {
        deleteData(id).then(() => {
            window.location.reload();
        });
    }
}

function splitNameAndPhone(namePhone) { 
    const parts = namePhone.split(' '); 
    const phoneFull = parts.pop(); 
    const phoneClean = phoneFull.replace(/[^0-9]/g, '');
    const name = parts.join(' ');

    return { name, phoneFull, phoneClean };
}

window.onload = async function() {
    const data = await loadData();
    const outputElement = document.getElementById('list');

    if (data.length === 0) { 
        outputElement.innerHTML = `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th class="text-center align-middle">Hapus</th>
                        <th class="text-center align-middle">No.</th>
                        <th class="text-center align-middle">Tanggal</th>
                        <th class="text-center align-middle">Customer</th>
                        <th class="text-center align-middle">Phone</th>
                        <th class="text-center align-middle">Berupa</th>
                        <th class="text-center align-middle">Keperluan</th>
                        <th class="text-center align-middle">Dibuat</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th class="text-center align-middle p-2" colspan="8"><i class="text-danger">Belum ada Tanda Terima saat ini.</i></th>
                    </tr>
                </tbody>
            </table>   
        `;
    } else {
        outputElement.innerHTML = `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th class="text-center align-middle">Hapus</th>
                        <th class="text-center align-middle">No.</th>
                        <th class="text-center align-middle">Tanggal</th>
                        <th class="text-center align-middle">Customer</th>
                        <th class="text-center align-middle">Phone</th>
                        <th class="text-center align-middle">Diterima</th>
                        <th class="text-center align-middle">Tujuan</th>
                        <th class="text-center align-middle">Dibuat</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => { 
                        const { name, phoneFull, phoneClean } = splitNameAndPhone(item.dari); 
                        return ` 
                        <tr>
                            <td class="text-center align-middle p-2"><button onclick="deleteRow(${item.id}, '${item.number}')" class="btn btn-sm delete-row"><i class="fas fa-times text-danger"></i></button></td>
                            <td class="text-center align-middle p-2"><a href="assets/html/cetak.html?id=${item.id}" target="_blank"><strong>${item.number}</strong></a></td>
                            <td class="text-center align-middle p-2">${item.date}</td>
                            <td class="text-center align-middle p-2"><strong>${name}</strong></td>
                            <td class="text-center align-middle p-2"><a href="https://api.whatsapp.com/send?phone=${phoneClean}" target="_blank">${phoneFull}</a></td>
                            <td class="text-center align-middle p-2">${item.berupa}</td>
                            <td class="text-center align-middle p-2">${item.untuk}</td>
                            <td class="text-center align-middle p-2">${item.create}</td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>   
        `;
    }
}
