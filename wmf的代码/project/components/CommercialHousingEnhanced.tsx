import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, Home, FileText, AlertTriangle, Plus, X, Eye, Trash2, UserPlus,
  DollarSign, Calendar, Bell, TrendingUp, Download, Search, Filter, Edit2,
  CheckCircle, XCircle, Clock, AlertCircle, Users, BarChart3, Receipt,
  FileSpreadsheet, Phone, Mail, Star, Award, Key, Droplet, Zap
} from 'lucide-react';
import { UserRole, RentBill, ContractExtended, BiddingProject, TenantProfile,
  ApartmentApplicationExtended, ApartmentRoom, UtilityMeterReading, UtilityBill,
  DepositRecord, CheckInRecord } from '../types';
import {
  MOCK_RENT_BILLS, MOCK_CONTRACTS_EXTENDED, MOCK_BIDDING_PROJECTS,
  MOCK_TENANT_PROFILES, MOCK_APARTMENT_APPLICATIONS_EXTENDED,
  MOCK_APARTMENT_ROOMS, MOCK_UTILITY_READINGS, MOCK_UTILITY_BILLS,
  MOCK_DEPOSIT_RECORDS, MOCK_CHECKIN_RECORDS
} from '../constants';

interface CommercialHousingEnhancedProps {
  userRole: UserRole;
}

// localStorage hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };
  return [storedValue, setValue] as const;
}

type CommercialTab = 'contracts' | 'rent' | 'bidding' | 'tenants' | 'analytics';
type ApartmentTab = 'applications' | 'rooms' | 'utilities' | 'deposits' | 'checkin';

const CommercialHousingEnhanced: React.FC<CommercialHousingEnhancedProps> = ({ userRole }) => {
  const [mainTab, setMainTab] = useState<'commercial' | 'apartment'>('commercial');
  const [commercialTab, setCommercialTab] = useState<CommercialTab>('contracts');
  const [apartmentTab, setApartmentTab] = useState<ApartmentTab>('applications');

  // 数据状态
  const [contracts, setContracts] = useLocalStorage<ContractExtended[]>('contracts-extended', MOCK_CONTRACTS_EXTENDED);
  const [rentBills, setRentBills] = useLocalStorage<RentBill[]>('rent-bills', MOCK_RENT_BILLS);
  const [biddingProjects, setBiddingProjects] = useLocalStorage<BiddingProject[]>('bidding-projects', MOCK_BIDDING_PROJECTS);
  const [tenants, setTenants] = useLocalStorage<TenantProfile[]>('tenant-profiles', MOCK_TENANT_PROFILES);
