import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadLocalDB, saveLocalDB } from '../services/supabase';
import { prepareChild, validateMeasurement } from '../utils/childRecords';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentTenant, setCurrentTenant] = useState('arca');
  const [db, setDb] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const dbData = loadLocalDB();
    setDb(dbData);
    setInitialized(true);
  }, []);

  const saveDb = useCallback((newDb) => {
    saveLocalDB(newDb);
    setDb(newDb);
  }, []);

  const switchTenant = useCallback((tenantKey) => {
    if (db && db[tenantKey]) {
      setCurrentTenant(tenantKey);
    }
  }, [db]);

  const getTenantData = useCallback(() => {
    return db?.[currentTenant] || null;
  }, [db, currentTenant]);

  const addChild = useCallback((input, firstMeasurement = null) => {
    if (!db?.[currentTenant]) throw new Error('Posyandu belum siap.');
    const tenant = db[currentTenant];
    const child = prepareChild(input, tenant.children);
    if (firstMeasurement) {
      const measurement = validateMeasurement(child, firstMeasurement);
      child.history = [measurement];
      Object.assign(child, measurement, { usiaBulan: measurement.usia });
    }
    saveDb({ ...db, [currentTenant]: { ...tenant, children: [...tenant.children, child] } });
    return child;
  }, [db, currentTenant, saveDb]);

  const updateChild = useCallback((childId, updates) => {
    if (!db) return false;
    const newDb = { ...db };
    const tenant = newDb[currentTenant];
    const childIndex = tenant.children.findIndex(c => c.id === childId);
    if (childIndex === -1) return false;
    newDb[currentTenant] = {
      ...tenant,
      children: tenant.children.map((c, i) => i === childIndex ? { ...c, ...updates } : c)
    };
    saveDb(newDb);
    return true;
  }, [db, currentTenant, saveDb]);

  const deleteChild = useCallback((childId) => {
    if (!db) return false;
    const newDb = { ...db };
    const tenant = newDb[currentTenant];
    newDb[currentTenant] = {
      ...tenant,
      children: tenant.children.filter(c => c.id !== childId)
    };
    saveDb(newDb);
    return true;
  }, [db, currentTenant, saveDb]);

  const addMeasurement = useCallback((childId, measurement) => {
    if (!db) return false;
    const newDb = { ...db };
    const tenant = newDb[currentTenant];
    const childIndex = tenant.children.findIndex(c => c.id === childId);
    if (childIndex === -1) return false;
    const child = { ...tenant.children[childIndex] };
    const validated = validateMeasurement(child, measurement);
    if (child.history.some(h => h.tgl === validated.tgl)) throw new Error('Pemeriksaan pada tanggal ini sudah ada.');
    child.history = [...child.history, validated].sort((a, b) => a.tgl.localeCompare(b.tgl));
    const latest = child.history.at(-1);
    child.usiaBulan = latest.usia;
    child.bb = latest.bb;
    child.tb = latest.tb;
    child.lk = latest.lk;
    child.lila = latest.lila;
    newDb[currentTenant] = {
      ...newDb[currentTenant],
      children: tenant.children.map((c, i) => i === childIndex ? child : c)
    };
    saveDb(newDb);
    return true;
  }, [db, currentTenant, saveDb]);

  const exportToCSV = useCallback(() => {
    const tenant = getTenantData();
    if (!tenant) return null;
    let csv = "NIK,Nama Anak,Jenis Kelamin,Usia Bulan,BB (kg),TB (cm),LK (cm),LiLA (cm),Nama Orang Tua,No HP,Alamat\n";
    tenant.children.forEach(c => {
      const last = c.history[c.history.length - 1];
      if (last) {
        csv += `"${c.nik}","${c.nama}","${c.gender}",${c.usiaBulan},${last.bb},${last.tb},${last.lk},${last.lila},"${c.namaOrtu}","${c.telp}","${c.alamat}"\n`;
      }
    });
    return csv;
  }, [getTenantData]);

  const addTenant = useCallback((newTenant) => {
    if (!db) return '';
    const key = newTenant.id || `pos-${Date.now()}`;
    const newDb = {
      ...db,
      [key]: {
        id: key,
        title: newTenant.title || 'Posyandu Baru',
        district: newTenant.district || 'Kabupaten Banyumas',
        children: newTenant.children || []
      }
    };
    saveDb(newDb);
    return key;
  }, [db, saveDb]);

  const importChildren = useCallback((newChildrenList) => {
    if (!db || !Array.isArray(newChildrenList) || newChildrenList.length === 0) return 0;
    const newDb = { ...db };
    const currentChildren = [...(newDb[currentTenant]?.children || [])];

    let addedCount = 0;
    newChildrenList.forEach((child) => {
      // Cek apakah balita sudah ada berdasarkan NIK (jika ada NIK valid)
      const existingIndex = child.nik ? currentChildren.findIndex(c => c.nik === child.nik) : -1;
      if (existingIndex >= 0) {
        // Gabungkan riwayat jika ada pengukuran baru
        const existingChild = currentChildren[existingIndex];
        const mergedHistory = [...(existingChild.history || [])];
        if (child.history && child.history.length > 0) {
          child.history.forEach(h => {
            const isDup = mergedHistory.some(m => m.tgl === h.tgl);
            if (!isDup) mergedHistory.push(h);
          });
        }
        currentChildren[existingIndex] = {
          ...existingChild,
          ...child,
          history: mergedHistory,
          bb: child.bb || existingChild.bb,
          tb: child.tb || existingChild.tb,
          lk: child.lk || existingChild.lk,
          lila: child.lila || existingChild.lila,
        };
      } else {
        currentChildren.push({
          ...child,
          id: child.id || `import-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        });
      }
      addedCount++;
    });

    newDb[currentTenant] = {
      ...newDb[currentTenant],
      children: currentChildren
    };
    saveDb(newDb);
    return addedCount;
  }, [db, currentTenant, saveDb]);

  return (
    <AuthContext.Provider value={{
      currentTenant,
      db,
      initialized,
      switchTenant,
      getTenantData,
      addTenant,
      addChild,
      updateChild,
      deleteChild,
      addMeasurement,
      importChildren,
      exportToCSV,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}