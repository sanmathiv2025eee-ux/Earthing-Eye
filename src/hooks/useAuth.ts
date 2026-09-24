import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

export const INDUSTRIAL_ROLES: { role: UserRole; title: string; description: string; permissions: string[] }[] = [
  {
    role: 'CHIEF_ELECTRICAL_INSPECTOR',
    title: 'Chief Electrical Inspector (CEI)',
    description: 'Statutory compliance authority. Full privileges to modify IEEE safety limits, certify reports, and sign off audit records.',
    permissions: ['EDIT_THRESHOLDS', 'RESOLVE_ALARMS', 'SIGN_AUDIT_LOG', 'COMMISSION_DEVICES', 'EXPORT_STATUTORY_CERTIFICATES']
  },
  {
    role: 'SITE_RELIABILITY_ENGINEER',
    title: 'Site Reliability Engineer (SRE / Substation EE)',
    description: 'Plant maintenance lead. Can acknowledge alarms, commission ESP32 telemetry nodes, and dispatch maintenance crews.',
    permissions: ['ACKNOWLEDGE_ALARMS', 'COMMISSION_DEVICES', 'RECALIBRATE_NODES', 'VIEW_DIAGNOSTICS']
  },
  {
    role: 'FIELD_MAINTENANCE_TECH',
    title: 'Field Maintenance Technician',
    description: 'Ground operations tech. Performs soil rehydration, pit clamp inspections, and initiates field test telemetry.',
    permissions: ['TRIGGER_TEST', 'LOG_FIELD_NOTE', 'VIEW_DIAGNOSTICS']
  },
  {
    role: 'COMPLIANCE_AUDITOR',
    title: 'Statutory Compliance Auditor (OSHA/ISO)',
    description: 'Third-party auditor. Read-only verified access to immutable audit trails, SHA-256 logs, and historical standards data.',
    permissions: ['VIEW_AUDIT_TRAIL', 'VERIFY_HASHES', 'EXPORT_COMPLIANCE_PACK']
  }
];

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  CHIEF_ELECTRICAL_INSPECTOR: {
    uid: 'usr-cei-01',
    name: 'Er. Rajesh Varma, FIE',
    email: 'r.varma@gridtransmission.net',
    role: 'CHIEF_ELECTRICAL_INSPECTOR',
    licenseNumber: 'CEI-GRID-2024-8890-IN',
    organization: 'Central Electricity Authority / Transmission Grid',
    certifiedStandards: ['IEEE_80', 'IS_3043', 'IEC_62305']
  },
  SITE_RELIABILITY_ENGINEER: {
    uid: 'usr-sre-02',
    name: 'Sarah Jenkins, PE',
    email: 's.jenkins@apexdatacenter.io',
    role: 'SITE_RELIABILITY_ENGINEER',
    licenseNumber: 'PE-ELEC-449102-CA',
    organization: 'Apex Tier-IV Infrastructure Engineering',
    certifiedStandards: ['NEC_250', 'IEEE_80']
  },
  FIELD_MAINTENANCE_TECH: {
    uid: 'usr-tech-03',
    name: 'Marcus Brody',
    email: 'm.brody@fieldops.industrial.com',
    role: 'FIELD_MAINTENANCE_TECH',
    licenseNumber: 'NICET-III-EARTH-9912',
    organization: 'Substation Field Operations Group',
    certifiedStandards: ['IS_3043']
  },
  COMPLIANCE_AUDITOR: {
    uid: 'usr-aud-04',
    name: 'Elena Rostova, CISA',
    email: 'e.rostova@global-safety-audit.org',
    role: 'COMPLIANCE_AUDITOR',
    licenseNumber: 'ISO-45001-LEAD-5520',
    organization: 'International Industrial Safety Audit Bureau',
    certifiedStandards: ['IEEE_80', 'IEC_62305', 'NFPA_780']
  }
};

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.CHIEF_ELECTRICAL_INSPECTOR);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
    });

    // Sign in anonymously to authenticate to Firebase if needed
    signInAnonymously(auth).catch((err) => {
      console.warn('Firebase anonymous sign-in info:', err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const switchRole = (role: UserRole) => {
    setCurrentUser(MOCK_USERS[role]);
  };

  return {
    currentUser,
    firebaseUser,
    loading,
    switchRole,
    rolesList: INDUSTRIAL_ROLES
  };
}
