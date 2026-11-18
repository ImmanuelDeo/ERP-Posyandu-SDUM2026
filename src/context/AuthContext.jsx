import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { loadLocalDB, saveLocalDB } from '../services/supabase';
import { createLocalTenant } from '../services/localAccounts';
import { prepareChild, withMeasurements, prepareImportedChildren } from '../utils/childRecords';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentTenant, setCurrentTenant] = useState('arca');
  const [db, setDb] = useState(null);
  const dbRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const dbData = loadLocalDB();
    dbRef.current = dbData;
    setDb(dbData);
    setInitialized(true);
  }, []);

  const saveDb = useCallback((newDb) => {
    saveLocalDB(newDb);
    dbRef.current = newDb;
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
    const latestDb = dbRef.current;
    if (!latestDb?.[currentTenant]) throw new Error('Posyandu belum siap.');
    const tenant = latestDb[currentTenant];
    let child = prepareChild(input, tenant.children);
    if (firstMeasurement) child = withMeasurements(child, [firstMeasurement]);
    saveDb({ ...latestDb, [currentTenant]: { ...tenant, children: [...tenant.children, child] } });
    return child;
  }, [currentTenant, saveDb]);

  const updateChild = useCallback((childId, updates) => {
    if (!dbRef.current?.[currentTenant]) return false;
    const newDb = { ...dbRef.current };
    const tenant = newDb[currentTenant];
    const childIndex = tenant.children.findIndex(c => c.id === childId);
    if (childIndex === -1) return false;
    newDb[currentTenant] = {
      ...tenant,
      children: tenant.children.map((c, i) => i === childIndex ? { ...c, ...updates } : c)
    };
    saveDb(newDb);
    return true;
  }, [currentTenant, saveDb]);

  const deleteChild = useCallback((childId) => {
    if (!dbRef.current?.[currentTenant]) return false;
    const newDb = { ...dbRef.current };
    const tenant = newDb[currentTenant];
    newDb[currentTenant] = {
      ...tenant,
      children: tenant.children.filter(c => c.id !== childId)
    };
    saveDb(newDb);
    return true;
  }, [currentTenant, saveDb]);

  const addMeasurement = useCallback((childId, measurement) => {
    if (!dbRef.current?.[currentTenant]) return false;
    const newDb = { ...dbRef.current };
    const tenant = newDb[currentTenant];
    const childIndex = tenant.children.findIndex(c => c.id === childId);
    if (childIndex === -1) return false;
    const child = withMeasurements(tenant.children[childIndex], [measurement]);
    newDb[currentTenant] = {
      ...newDb[currentTenant],
      children: tenant.children.map((c, i) => i === childIndex ? child : c)
    };
    saveDb(newDb);
    return true;
  }, [currentTenant, saveDb]);

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
    const created = createLocalTenant(dbRef.current, newTenant);
    saveDb(created.db);
    return created.key;
  }, [saveDb]);

  const importChildren = useCallback((newChildrenList) => {
    const latestDb = dbRef.current;
    const tenant = latestDb?.[currentTenant];
    if (!tenant || !Array.isArray(newChildrenList) || !newChildrenList.length) return 0;
    const children = prepareImportedChildren(newChildrenList, tenant.children);
    saveDb({ ...latestDb, [currentTenant]: { ...tenant, children } });
    return newChildrenList.length;
  }, [currentTenant, saveDb]);

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