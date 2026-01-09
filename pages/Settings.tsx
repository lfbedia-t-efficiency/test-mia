
import React, { useState } from 'react';
import { 
    UserIcon, CameraIcon, GlobeAmericasIcon, ClockIcon, 
    LockClosedIcon, ShieldCheckIcon, PlantIcon, ManufacturingIcon, 
    ArrowDownIcon, CheckCircleIcon, EyeIcon 
} from '../components/icons/Icons';

// Mock User Data (Synced with Administration.tsx - Ana Lopez)
const INITIAL_USER_DATA = {
    // System Data (Read-only matches Admin User model)
    id: 'U-1001',
    employeeId: 'EMP-001',
    name: 'Ana Lopez',
    position: 'Supervisor de Producción',
    role: 'Supervisor', // System Role
    accessLevel: 'Proceso', // Access Scope
    whatsapp: '5512345678',
    email: 'ana.lopez@company.com',
    status: 'active',
    plant: 'Planta Monterrey',
    process: 'Ensamble',
    subprocess: '' 
};

// Language List (Alphabetical by Native Name)
const LANGUAGES = [
    { code: 'DE', name: 'Deutsch' },
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Español' },
    { code: 'FR', name: 'Français' },
    { code: 'IT', name: 'Italiano' },
    { code: 'PT', name: 'Português' },
    { code: 'RU', name: 'Pусский' },
    { code: 'AR', name: 'العربية' },
    { code: 'ZH', name: '中文' },
    { code: 'JA', name: '日本語' },
    { code: 'KO', name: '한국어' },
];

// Timezones (24 Main UTC Offsets)
const TIMEZONES = [
    '(UTC-12:00) International Date Line West',
    '(UTC-11:00) Coordinated Universal Time-11',
    '(UTC-10:00) Hawaii',
    '(UTC-09:00) Alaska',
    '(UTC-08:00) Pacific Time (US & Canada)',
    '(UTC-07:00) Mountain Time (US & Canada)',
    '(UTC-06:00) Central Time (US & Canada), Mexico City',
    '(UTC-05:00) Eastern Time (US & Canada)',
    '(UTC-04:00) Atlantic Time (Canada)',
    '(UTC-03:00) Buenos Aires, Brasilia',
    '(UTC-02:00) Coordinated Universal Time-02',
    '(UTC-01:00) Azores',
    '(UTC+00:00) Dublin, Edinburgh, Lisbon, London',
    '(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
    '(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
    '(UTC+03:00) Moscow, St. Petersburg, Volgograd, Minsk',
    '(UTC+04:00) Abu Dhabi, Muscat',
    '(UTC+05:00) Islamabad, Karachi',
    '(UTC+06:00) Astana, Dhaka',
    '(UTC+07:00) Bangkok, Hanoi, Jakarta',
    '(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi',
    '(UTC+09:00) Osaka, Sapporo, Tokyo',
    '(UTC+10:00) Canberra, Melbourne, Sydney',
    '(UTC+11:00) Solomon Is., New Caledonia',
    '(UTC+12:00) Fiji, Kamchatka, Marshall Is.',
];

interface SettingsProps {
    language?: string;
    setLanguage?: (lang: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ language = 'Español', setLanguage }) => {
    // Preferences State
    const [timezone, setTimezone] = useState('(UTC-06:00) Central Time (US & Canada), Mexico City');
    const [photo, setPhoto] = useState('https://picsum.photos/seed/user/200/200');

    // Security State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Simple translation map for this page
    const t = (key: string) => {
        const dict: any = {
            'Español': {
                title: 'Configuración de Perfil',
                lang: 'Idioma',
                tz: 'Zona Horaria',
                empInfo: 'Información de Empleado',
                fullName: 'Nombre Completo',
                id: '# Interno / ID',
                email: 'Correo Electrónico',
                context: 'Contexto y Permisos',
                pos: 'Puesto',
                role: 'Rol de Sistema',
                scope: 'Nivel de Acceso (Scope)',
                plant: 'Planta Asignada',
                process: 'Proceso',
                sub: 'Subproceso',
                sysMsg: '* Estos datos son administrados por el sistema. Contacte a IT para solicitar cambios.',
                security: 'Seguridad',
                pass: 'Contraseña',
                changePass: 'Modificar Contraseña',
                newPass: 'Nueva Contraseña',
                confPass: 'Confirmar Contraseña',
                minChar: 'Mínimo 6 caracteres',
                repeat: 'Repetir contraseña',
                cancel: 'Cancelar',
                savePass: 'Guardar Nueva Contraseña'
            },
            'English': {
                title: 'Profile Settings',
                lang: 'Language',
                tz: 'Timezone',
                empInfo: 'Employee Information',
                fullName: 'Full Name',
                id: 'Employee ID',
                email: 'Email',
                context: 'Context & Permissions',
                pos: 'Position',
                role: 'System Role',
                scope: 'Access Level (Scope)',
                plant: 'Assigned Plant',
                process: 'Process',
                sub: 'Subprocess',
                sysMsg: '* Data managed by system. Contact IT for changes.',
                security: 'Security',
                pass: 'Password',
                changePass: 'Change Password',
                newPass: 'New Password',
                confPass: 'Confirm Password',
                minChar: 'Min 6 chars',
                repeat: 'Repeat password',
                cancel: 'Cancel',
                savePass: 'Save New Password'
            },
            'Deutsch': { title: 'Profileinstellungen', lang: 'Sprache', tz: 'Zeitzone', empInfo: 'Mitarbeiterinformationen', fullName: 'Vollständiger Name', id: 'Mitarbeiter-ID', email: 'E-Mail', context: 'Kontext & Berechtigungen', pos: 'Position', role: 'Systemrolle', scope: 'Zugriffsebene', plant: 'Zugewiesenes Werk', process: 'Prozess', sub: 'Teilprozess', sysMsg: '* Daten vom System verwaltet.', security: 'Sicherheit', pass: 'Passwort', changePass: 'Passwort ändern', newPass: 'Neues Passwort', confPass: 'Passwort bestätigen', minChar: 'Min. 6 Zeichen', repeat: 'Passwort wiederholen', cancel: 'Abbrechen', savePass: 'Speichern' },
            'Français': { title: 'Paramètres du Profil', lang: 'Langue', tz: 'Fuseau Horaire', empInfo: 'Informations Employé', fullName: 'Nom Complet', id: 'ID Employé', email: 'Email', context: 'Contexte & Permissions', pos: 'Poste', role: 'Rôle Système', scope: 'Niveau d\'Accès', plant: 'Usine Assignée', process: 'Processus', sub: 'Sous-processus', sysMsg: '* Données gérées par le système.', security: 'Sécurité', pass: 'Mot de passe', changePass: 'Modifier Mot de Passe', newPass: 'Nouveau Mot de Passe', confPass: 'Confirmer Mot de Passe', minChar: 'Min 6 car.', repeat: 'Répéter mot de passe', cancel: 'Annuler', savePass: 'Enregistrer' },
            'Português': { title: 'Configurações de Perfil', lang: 'Idioma', tz: 'Fuso Horário', empInfo: 'Informações do Funcionário', fullName: 'Nome Completo', id: 'ID Funcionário', email: 'Email', context: 'Contexto e Permissões', pos: 'Cargo', role: 'Papel do Sistema', scope: 'Nível de Acesso', plant: 'Planta Atribuída', process: 'Processo', sub: 'Subprocesso', sysMsg: '* Dados gerenciados pelo sistema.', security: 'Segurança', pass: 'Senha', changePass: 'Alterar Senha', newPass: 'Nova Senha', confPass: 'Confirmar Senha', minChar: 'Mín 6 caracteres', repeat: 'Repetir senha', cancel: 'Cancelar', savePass: 'Salvar' },
            // Basic fallbacks for others
            'Italiano': { title: 'Impostazioni Profilo', lang: 'Lingua', tz: 'Fuso Orario', empInfo: 'Info Dipendente', security: 'Sicurezza', pass: 'Password', changePass: 'Cambia Password' },
            'Pусский': { title: 'Настройки профиля', lang: 'Язык', tz: 'Часовой пояс', empInfo: 'Информация о сотруднике', security: 'Безопасность', pass: 'Пароль', changePass: 'Изменить пароль' },
            'العربية': { title: 'إعدادات الملف الشخصي', lang: 'لغة', tz: 'منطقة زمنية', empInfo: 'معلومات الموظف', security: 'أمان', pass: 'كلمة المرور', changePass: 'تغيير كلمة المرور' },
            '中文': { title: '个人资料设置', lang: '语言', tz: '时区', empInfo: '员工信息', security: '安全', pass: '密码', changePass: '更改密码' },
            '日本語': { title: 'プロフィール設定', lang: '言語', tz: 'タイムゾーン', empInfo: '従業員情報', security: 'セキュリティ', pass: 'パスワード', changePass: 'パスワードを変更' },
            '한국어': { title: '프로필 설정', lang: '언어', tz: '시간대', empInfo: '직원 정보', security: '보안', pass: '비밀번호', changePass: '비밀번호 변경' }
        };
        // Fallback to English for other languages to keep code concise
        const langDict = dict[language] || dict['English'];
        return langDict[key] || dict['English'][key] || key;
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setPhoto(url);
        }
    };

    const handleSavePassword = () => {
        if (newPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }
        if (newPassword.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        alert("Contraseña actualizada correctamente.");
        setIsChangingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    const ReadOnlyField = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                {icon} {label}
            </label>
            <div className="text-sm font-semibold text-gray-700 truncate" title={value}>{value || '-'}</div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Editable Preferences */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Photo & Basic Settings Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner">
                                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                                <CameraIcon className="w-5 h-5" />
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </label>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800">{INITIAL_USER_DATA.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">{INITIAL_USER_DATA.position}</p>

                        <div className="w-full space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-2">
                                    <GlobeAmericasIcon className="w-4 h-4 text-gray-400"/> {t('lang')}
                                </label>
                                <div className="relative">
                                    <select 
                                        value={language} 
                                        onChange={(e) => setLanguage && setLanguage(e.target.value)}
                                        className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        {LANGUAGES.map(lang => (
                                            <option key={lang.code} value={lang.name}>{lang.name}</option>
                                        ))}
                                    </select>
                                    <ArrowDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none"/>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-gray-400"/> {t('tz')}
                                </label>
                                <div className="relative">
                                    <select 
                                        value={timezone} 
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        {TIMEZONES.map((tz, idx) => (
                                            <option key={idx} value={tz}>{tz}</option>
                                        ))}
                                    </select>
                                    <ArrowDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Read-Only Info & Security */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Personal & Contact Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-blue-600"/> {t('empInfo')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label={t('fullName')} value={INITIAL_USER_DATA.name} />
                            <ReadOnlyField label={t('id')} value={INITIAL_USER_DATA.employeeId} />
                            <ReadOnlyField label={t('email')} value={INITIAL_USER_DATA.email} />
                            <ReadOnlyField label="WhatsApp" value={INITIAL_USER_DATA.whatsapp} />
                        </div>
                    </div>

                    {/* System Scope */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                            <ShieldCheckIcon className="w-4 h-4 text-purple-600"/> {t('context')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label={t('pos')} value={INITIAL_USER_DATA.position} />
                            <ReadOnlyField label={t('role')} value={INITIAL_USER_DATA.role} />
                            <ReadOnlyField label={t('scope')} value={INITIAL_USER_DATA.accessLevel} />
                            <div className="hidden md:block"></div> {/* Spacer */}
                            
                            <ReadOnlyField label={t('plant')} value={INITIAL_USER_DATA.plant} icon={<PlantIcon className="w-3 h-3"/>} />
                            <ReadOnlyField label={t('process')} value={INITIAL_USER_DATA.process} icon={<ManufacturingIcon className="w-3 h-3"/>} />
                            <ReadOnlyField label={t('sub')} value={INITIAL_USER_DATA.subprocess} />
                        </div>
                        <p className="text-xs text-gray-400 mt-4 italic bg-gray-50 p-2 rounded text-center">
                            {t('sysMsg')}
                        </p>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                            <LockClosedIcon className="w-4 h-4 text-red-600"/> {t('security')}
                        </h4>
                        
                        {!isChangingPassword ? (
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div>
                                    <p className="text-sm font-bold text-gray-700">{t('pass')}</p>
                                    <p className="text-xs text-gray-500">****************</p>
                                </div>
                                <button 
                                    onClick={() => setIsChangingPassword(true)}
                                    className="text-xs bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm transition-colors"
                                >
                                    {t('changePass')}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">{t('newPass')}</label>
                                        <div className="relative">
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder={t('minChar')}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">{t('confPass')}</label>
                                        <div className="relative">
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder={t('repeat')}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2 top-2 text-gray-400 hover:text-blue-600"
                                            >
                                                <EyeIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button 
                                        onClick={() => { setIsChangingPassword(false); setNewPassword(''); setConfirmPassword(''); }}
                                        className="text-xs text-gray-600 hover:text-gray-900 font-bold px-3 py-2"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button 
                                        onClick={handleSavePassword}
                                        disabled={!newPassword || !confirmPassword}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded font-bold shadow-sm disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-4 h-4"/> {t('savePass')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Settings;
