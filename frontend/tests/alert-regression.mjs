import assert from 'node:assert/strict';

const storage = {};
globalThis.localStorage = {
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
  },
  setItem(key, value) {
    storage[key] = String(value);
  },
  removeItem(key) {
    delete storage[key];
  },
  clear() {
    Object.keys(storage).forEach((key) => delete storage[key]);
  }
};

const { addPatient, prescribeMedicines, getAlerts, updateMedicine, pruneExpiredAlerts } = await import('../src/services/localStorageService.js');

localStorage.clear();
localStorage.setItem('patients', JSON.stringify([]));
localStorage.setItem('medicines', JSON.stringify([
  { id: 'M1', name: 'Paracetamol', category: 'Analgesic', quantity: 200, minimumStock: 50, expiryDate: '2099-12-31', supplier: 'Supplier 1' }
]));
localStorage.setItem('alerts', JSON.stringify([
  {
    id: 'OLD_ALERT_1',
    category: 'disease',
    title: 'Clinical Disease Alert',
    description: 'Old influenza forecast alert from last month.',
    message: 'Old influenza forecast alert from last month.',
    date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'doctor',
    severity: 'Warning',
    type: 'Warning',
    status: 'Active',
    seen: false
  }
]));

for (let i = 1; i <= 3; i += 1) {
  const patient = addPatient({
    id: `P${i}`,
    name: `Patient ${i}`,
    age: 25,
    gender: 'Male',
    phone: '111',
    address: 'A',
    emergencyContact: 'B',
    disease: 'Influenza'
  });

  prescribeMedicines(patient.id, { disease: 'Influenza', medicines: [{ name: 'Paracetamol', quantity: 1 }] });
}

pruneExpiredAlerts(30);
const prunedOldAlert = JSON.parse(localStorage.getItem('alerts') || '[]').filter((alert) => alert.id === 'OLD_ALERT_1');
assert.ok(prunedOldAlert.length === 0, 'Stored alerts older than 30 days should be removed from localStorage');

const diseaseAlerts = getAlerts().filter((alert) => alert.category === 'disease');
assert.ok(diseaseAlerts.length >= 1, 'Expected at least one disease forecast alert after 3 same-disease prescriptions');
assert.ok(diseaseAlerts.length <= 2, `Expected at most 2 disease alerts, found ${diseaseAlerts.length}`);
assert.ok(diseaseAlerts.some((alert) => /influenza/i.test(alert.message || alert.description || '')), 'Influenza disease alert should be visible');
assert.ok(!getAlerts().some((alert) => alert.id === 'OLD_ALERT_1'), 'Alerts older than 30 days should be removed');

updateMedicine({
  id: 'M1',
  name: 'Paracetamol',
  category: 'Analgesic',
  quantity: 200,
  minimumStock: 50,
  expiryDate: '2099-12-31',
  newStockExpiryDate: '2099-12-31',
  supplier: 'Supplier 1'
});

const staleParacetamolAlerts = getAlerts().filter((alert) => /paracetamol.*out of stock/i.test(alert.message || alert.description || ''));
assert.equal(staleParacetamolAlerts.length, 0, 'Paracetamol should not keep an out-of-stock alert when stock is available');

console.log('alert regression checks passed');
