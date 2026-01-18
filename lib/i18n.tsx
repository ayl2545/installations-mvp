'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'he';

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // General
    'app.title': 'Installations Management',
    'app.loading': 'Loading...',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.delete': 'Delete',
    'app.edit': 'Edit',
    'app.create': 'Create',
    'app.back': 'Back',
    'app.submit': 'Submit',
    'app.search': 'Search',
    'app.filter': 'Filter',
    'app.all': 'All',
    'app.none': 'None',
    'app.yes': 'Yes',
    'app.no': 'No',
    'app.actions': 'Actions',
    'app.details': 'Details',
    'app.view': 'View',
    
    // Dev Auth
    'devAuth.title': 'Dev Auth',
    'devAuth.selectUser': 'Select user...',
    'devAuth.loggedAs': 'Logged in as',
    'devAuth.switchLang': 'עברית',
    
    // Roles
    'role.admin': 'Admin',
    'role.installer': 'Installer',
    
    // Navigation
    'nav.orders': 'Orders',
    'nav.teams': 'Teams',
    'nav.myOrders': 'My Orders',
    'nav.newOrder': 'New Order',
    
    // Orders
    'orders.title': 'Orders',
    'orders.new': 'New Order',
    'orders.all': 'All Orders',
    'orders.myOrders': 'My Orders',
    'orders.noOrders': 'No orders found',
    'orders.customer': 'Customer',
    'orders.address': 'Site Address',
    'orders.description': 'Description',
    'orders.status': 'Status',
    'orders.team': 'Team',
    'orders.assignedTo': 'Assigned To',
    'orders.externalRef': 'External Ref',
    'orders.createdAt': 'Created At',
    'orders.updatedAt': 'Updated At',
    'orders.assign': 'Assign',
    'orders.assignToTeam': 'Assign to Team',
    'orders.selectTeam': 'Select team...',
    'orders.unassigned': 'Unassigned',
    'orders.viewDetails': 'View Details',
    'orders.createNew': 'Create New Order',
    'orders.filterByStatus': 'Filter by Status',
    'orders.filterByTeam': 'Filter by Team',
    'orders.scheduledDate': 'Scheduled Date',
    'orders.estimatedDays': 'Estimated Days',
    'orders.selectDate': 'Select date...',
    'orders.days': 'days',
    'orders.dateConflict': 'Date conflict with another order',
    'orders.blockedReason': 'Reason for blocking',
    'orders.blockedReasonRequired': 'Please provide a reason for blocking',
    
    // Order Status
    'status.new': 'New',
    'status.assigned': 'Assigned',
    'status.inProgress': 'In Progress',
    'status.blocked': 'Blocked',
    'status.done': 'Done',
    
    // Teams
    'teams.title': 'Teams',
    'teams.new': 'New Team',
    'teams.name': 'Team Name',
    'teams.installer': 'Installer',
    'teams.noTeams': 'No teams found',
    'teams.createTeam': 'Create Team',
    'teams.createInstaller': 'Create Installer',
    'teams.installerName': 'Installer Name',
    'teams.installerEmail': 'Installer Email',
    
    // Updates
    'updates.title': 'Updates',
    'updates.add': 'Add Update',
    'updates.type': 'Type',
    'updates.message': 'Message',
    'updates.needs': 'Needs',
    'updates.noUpdates': 'No updates yet',
    'updates.createdBy': 'Created by',
    
    // Update Types
    'updateType.progress': 'Progress',
    'updateType.blocker': 'Blocker',
    'updateType.complete': 'Complete',
    'updateType.note': 'Note',
    
    // Messages
    'msg.selectUserFirst': 'Please select a user from the dev auth selector above.',
    'msg.accessDenied': 'Access denied',
    'msg.notFound': 'Not found',
    'msg.error': 'An error occurred',
    'msg.saved': 'Saved successfully',
    'msg.created': 'Created successfully',
    'msg.deleted': 'Deleted successfully',
  },
  he: {
    // General
    'app.title': 'ניהול התקנות',
    'app.loading': 'טוען...',
    'app.save': 'שמור',
    'app.cancel': 'ביטול',
    'app.delete': 'מחק',
    'app.edit': 'ערוך',
    'app.create': 'צור',
    'app.back': 'חזור',
    'app.submit': 'שלח',
    'app.search': 'חיפוש',
    'app.filter': 'סינון',
    'app.all': 'הכל',
    'app.none': 'ללא',
    'app.yes': 'כן',
    'app.no': 'לא',
    'app.actions': 'פעולות',
    'app.details': 'פרטים',
    'app.view': 'צפייה',
    
    // Dev Auth
    'devAuth.title': 'מצב פיתוח',
    'devAuth.selectUser': 'בחר משתמש...',
    'devAuth.loggedAs': 'מחובר כ',
    'devAuth.switchLang': 'English',
    
    // Roles
    'role.admin': 'מנהל',
    'role.installer': 'מתקין',
    
    // Navigation
    'nav.orders': 'הזמנות',
    'nav.teams': 'צוותים',
    'nav.myOrders': 'ההזמנות שלי',
    'nav.newOrder': 'הזמנה חדשה',
    
    // Orders
    'orders.title': 'הזמנות',
    'orders.new': 'הזמנה חדשה',
    'orders.all': 'כל ההזמנות',
    'orders.myOrders': 'ההזמנות שלי',
    'orders.noOrders': 'לא נמצאו הזמנות',
    'orders.customer': 'לקוח',
    'orders.address': 'כתובת האתר',
    'orders.description': 'תיאור',
    'orders.status': 'סטטוס',
    'orders.team': 'צוות',
    'orders.assignedTo': 'משויך ל',
    'orders.externalRef': 'מספר חיצוני',
    'orders.createdAt': 'נוצר ב',
    'orders.updatedAt': 'עודכן ב',
    'orders.assign': 'שייך',
    'orders.assignToTeam': 'שייך לצוות',
    'orders.selectTeam': 'בחר צוות...',
    'orders.unassigned': 'לא משויך',
    'orders.viewDetails': 'צפה בפרטים',
    'orders.createNew': 'צור הזמנה חדשה',
    'orders.filterByStatus': 'סנן לפי סטטוס',
    'orders.filterByTeam': 'סנן לפי צוות',
    'orders.scheduledDate': 'תאריך מתוכנן',
    'orders.estimatedDays': 'מספר ימים',
    'orders.selectDate': 'בחר תאריך...',
    'orders.days': 'ימים',
    'orders.dateConflict': 'התנגשות עם הזמנה אחרת בתאריכים אלו',
    'orders.blockedReason': 'סיבת החסימה',
    'orders.blockedReasonRequired': 'נדרש להזין סיבה לחסימה',
    
    // Order Status
    'status.new': 'חדש',
    'status.assigned': 'משויך',
    'status.inProgress': 'בעבודה',
    'status.blocked': 'חסום',
    'status.done': 'הושלם',
    
    // Teams
    'teams.title': 'צוותים',
    'teams.new': 'צוות חדש',
    'teams.name': 'שם הצוות',
    'teams.installer': 'מתקין',
    'teams.noTeams': 'לא נמצאו צוותים',
    'teams.createTeam': 'צור צוות',
    'teams.createInstaller': 'צור מתקין',
    'teams.installerName': 'שם המתקין',
    'teams.installerEmail': 'אימייל המתקין',
    
    // Updates
    'updates.title': 'עדכונים',
    'updates.add': 'הוסף עדכון',
    'updates.type': 'סוג',
    'updates.message': 'הודעה',
    'updates.needs': 'נדרש',
    'updates.noUpdates': 'אין עדכונים עדיין',
    'updates.createdBy': 'נוצר על ידי',
    
    // Update Types
    'updateType.progress': 'התקדמות',
    'updateType.blocker': 'חסימה',
    'updateType.complete': 'הושלם',
    'updateType.note': 'הערה',
    
    // Messages
    'msg.selectUserFirst': 'בחר משתמש מבורר ההתחברות למעלה.',
    'msg.accessDenied': 'גישה נדחתה',
    'msg.notFound': 'לא נמצא',
    'msg.error': 'אירעה שגיאה',
    'msg.saved': 'נשמר בהצלחה',
    'msg.created': 'נוצר בהצלחה',
    'msg.deleted': 'נמחק בהצלחה',
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('he'); // Default to Hebrew
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('lang') as Language;
    if (saved && (saved === 'en' || saved === 'he')) {
      setLangState(saved);
    }
    // If no saved preference, keep Hebrew as default
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  const dir = lang === 'he' ? 'rtl' : 'ltr';

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Return default values if not in provider (SSR) - Hebrew as default
    return {
      lang: 'he' as Language,
      setLang: () => {},
      t: (key: string) => translations.he[key] || key,
      dir: 'rtl' as const,
    };
  }
  return context;
}

// Helper hook for status translation
export function useStatusTranslation() {
  const { t } = useI18n();
  
  return (status: string) => {
    const statusMap: Record<string, string> = {
      'NEW': t('status.new'),
      'ASSIGNED': t('status.assigned'),
      'IN_PROGRESS': t('status.inProgress'),
      'BLOCKED': t('status.blocked'),
      'DONE': t('status.done'),
    };
    return statusMap[status] || status;
  };
}

// Helper hook for update type translation
export function useUpdateTypeTranslation() {
  const { t } = useI18n();
  
  return (type: string) => {
    const typeMap: Record<string, string> = {
      'PROGRESS': t('updateType.progress'),
      'BLOCKER': t('updateType.blocker'),
      'COMPLETE': t('updateType.complete'),
      'NOTE': t('updateType.note'),
    };
    return typeMap[type] || type;
  };
}
