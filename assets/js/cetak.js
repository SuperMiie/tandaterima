function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('supermiieDB', 1);
        request.onerror = (event) => reject(request.error);
        request.onsuccess = (event) => resolve(request.result);
    });
}

async function loadData(id) {
    const db = await openDB();
    const tx = db.transaction('tandaTerima', 'readonly');
    const store = tx.objectStore('tandaTerima');
    return new Promise((resolve, reject) => {
        const data = store.get(id);
        data.onsuccess = () => resolve(data.result);
        data.onerror = (event) => reject(data.error);
    });
}

function displayDate() { 
    const today = new Date(); 
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; 
    document.getElementById('currentDate').innerText = today.toLocaleDateString('id-ID', options); 
}

function splitNameAndPhone(namePhone) { 
    const parts = namePhone.split(' '); 
    const phone = parts.pop(); 
    const name = parts.join(' '); 
    return { name, phone };
}

window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const data = await loadData(id);
    const { name, phone } = splitNameAndPhone(data.dari);
    const detailElement = document.getElementById('tampilan');
    document.title = `${name}_${data.number}`;
    detailElement.innerHTML = `
        <div class="row border border-dark mx-3">
            <div class="col-12 mt-3">
                <h2 class="text-center my-0"><u>TANDA TERIMA</u></h2>
                <div class="text-center font-weight-bold">No._: ${data.number}</div>
            </div>
            <div class="col-12 mb-4"></div>
            <div class="col-12 mb-4"></div>
            <br>
            <div class="col-12 mt-5">
                <div class="row mb-3 mr-2">
                    <div class="col-2">
                        Diterima dari
                    </div>
                    <div class="col-1 text-right">:</div>
                    <div class="col-9 border-bottom border-dark px-1">${data.dari}</div>
                </div>
                <div class="row mb-3 mr-2">
                    <div class="col-2">
                        Berupa
                    </div>
                    <div class="col-1 text-right">:</div>
                    <div class="col-9 border-bottom border-dark px-1">${data.berupa}</div>
                </div>
                <div class="row mb-3 mr-2">
                    <div class="col-2">
                        Diterima oleh
                    </div>
                    <div class="col-1 text-right">:</div>
                    <div class="col-9 border-bottom border-dark font-weight-bold px-1">${data.toko}</div>
                </div>
                <div class="row mb-3 mr-2">
                    <div class="col-2">
                        Untuk keperluan
                    </div>
                    <div class="col-1 text-right">:</div>
                    <div class="col-9 border-bottom border-dark px-1">${data.untuk}</div>
                </div>
            </div>
            <br>
            <div class="col-12 mt-4 mb-4">
               <div class="float-right d-flex">
                   <div class="font-weight-bold">Tanggal :</div>
                   <div class="border-bottom border-dark">&nbsp; <span id="currentDate"></span> &nbsp;</div>
               </div>
            </div>
            
            <br>
            <div class="col-12 mt-4">
                <div class="row">
                    <div class="col-4 text-center">
                        <span>Received By</span>
                    </div>
                    <div class="col-4"></div>
                    <div class="col-4 text-center">
                        <span>Signed By</span>
                    </div>
                </div>
           </div>
           <br>
           <div class="mt-5"></div>
           
           <div class="col-12 mt-5">
               <div class="row">
                   <div class="col-4 text-center">
                        _________________________
                        <br>
                        <small><i>*dibuat oleh : ${data.create}</i></small>
                   </div>
                   <div class="col-4"></div>
                   <div class="col-4 text-center">
                        _________________________
                   </div>
               </div>
           </div>
           <div class="col-12 mt-5"></div>
        </div>
    `;
    
    displayDate();
    window.print();
}