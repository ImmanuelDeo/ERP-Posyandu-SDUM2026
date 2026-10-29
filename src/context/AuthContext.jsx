import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadLocalDB, saveLocalDB } from '../services/supabase';

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

  const addChild = useCallback((child) => {
    if (!db) return false;
    const newDb = { ...db };
    newDb[currentTenant] = {
      ...newDb[currentTenant],
      children: [...newDb[currentTenant].children, { ...child, id: `local-${Date.now()}` }]
    };
    saveDb(newDb);
    return true;
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
    child.history = [...child.history, { ...measurement, usia: child.usiaBulan + 1 }];
    child.usiaBulan += 1;
    child.bb = measurement.bb;
    child.tb = measurement.tb;
    child.lk = measurement.lk;
    child.lila = measurement.lila;
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