
import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    {props.children}
  </svg>
);

export const AIAssistantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l-.219.645-.219-.645a2.25 2.25 0 01-1.453-1.453l-.645-.219.645-.219a2.25 2.25 0 011.453-1.453l.219-.645.219.645a2.25 2.25 0 011.453 1.453l.645.219-.645.219a2.25 2.25 0 01-1.453 1.453z" /></Icon>
);
export const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const AuditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25L15 7.125M15 21.75v-4.5a2.25 2.25 0 00-2.25-2.25H9.75a2.25 2.25 0 00-2.25 2.25v4.5" /></Icon>;
export const TechSupportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.472-2.472a.563.563 0 01.796 0l2.472 2.472M11.42 15.17l-2.472 2.472a.563.563 0 01-.796 0l-2.472-2.472m5.74-13.22l-2.472 2.472a.563.563 0 01-.796 0L9.26 6.345M16.5 13.5L12 18m0 0l-1.148-1.148M12 18l1.148-1.148m-1.296 5.852a.562.562 0 01-.796 0l-2.472-2.472" /></Icon>;
export const DocsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9a2.25 2.25 0 00-2.25-2.25H9.75" /></Icon>;
export const PlantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6m-6 4.5h6" /></Icon>;
export const AdminIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></Icon>;
export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.025 1.11-1.212l2.14-.81a1.125 1.125 0 011.298.396l.872 1.393a1.125 1.125 0 001.385.54l2.25-1.002a1.125 1.125 0 011.24.992v2.33a1.125 1.125 0 00.91.996l2.35.392a1.125 1.125 0 01.874 1.258l-.428 2.373a1.125 1.125 0 00.558 1.21l1.934 1.116a1.125 1.125 0 01.21 1.956l-1.63 1.28a1.125 1.125 0 00-.518 1.343l.79 2.223a1.125 1.125 0 01-1.05 1.543l-2.37-.428a1.125 1.125 0 00-1.21.558l-1.116 1.934a1.125 1.125 0 01-1.956.21l-1.28-1.63a1.125 1.125 0 00-1.343-.518l-2.223.79a1.125 1.125 0 01-1.543-1.05l.428-2.37a1.125 1.125 0 00-.558-1.21l-1.934-1.116a1.125 1.125 0 01-.21-1.956l1.63-1.28a1.125 1.125 0 00.518-1.343l-.79-2.223a1.125 1.125 0 011.05-1.543l2.37.428a1.125 1.125 0 001.21-.558l1.116-1.934a1.125 1.125 0 011.956-.21zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></Icon>;
export const ManufacturingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.95 14.95 0 00-5.84-2.56m0 0a14.95 14.95 0 01-5.84 2.56m5.84-2.56v-4.82a9 9 0 005.84-7.38c0-1.06-.2-2.07-.55-3.02A16.02 16.02 0 009.62 3.99a16.02 16.02 0 00-5.43 2.01M9.62 3.99c-1.18.33-2.29.76-3.32 1.27m5.43-2.01l-.001-.001" /></Icon>;
export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></Icon>;
export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></Icon>;
export const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></Icon>;
export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></Icon>;
export const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" /></Icon>;
export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></Icon>;
export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6zM19.5 10.5c0 7.142-7.5 9.75-7.5 9.75s-7.5-2.608-7.5-9.75S7.358 3 12 3s7.5 4.642 7.5 7.5z" /></Icon>;
export const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const TranslateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 12m0 0 4.5-9M3 12h18M21 12l-4.5 9M21 12l-4.5-9" /></Icon>;
export const VolumeUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></Icon>;
export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></Icon>;
export const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></Icon>;
export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></Icon>;
export const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>;
export const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75v6c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125v-6m-4.5 0V7.5a3.375 3.375 0 013.375-3.375h1.5a3.375 3.375 0 013.375 3.375V9.75m-4.5 0h4.5m-4.5 0a3.375 3.375 0 01-3.375 3.375H1.5a3.375 3.375 0 01-3.375-3.375V9.75" /><path d="M7.5 15.75l.563-.563m0 0a.563.563 0 01.792 0l.563.563m-1.912-1.912a.563.563 0 01.792 0l.563.563" /><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.75v6.75a3.375 3.375 0 003.375 3.375h1.5a3.375 3.375 0 003.375-3.375V3.75m-1.5 9a3.375 3.375 0 00-3.375-3.375h-1.5a3.375 3.375 0 00-3.375 3.375m1.5 0v3.75" /></Icon>;
export const TicketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-3m2.25-4.5h4.5m-4.5 0h3m-3 0h-3m2.25-4.5h4.5m-4.5 0h3m-3 0h-3m2.25-4.5h4.5m-4.5 0h3m-3 0h-3M15 21H5.25a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v9a2.25 2.25 0 01-2.25 2.25H15m-3-14.25h.008v.008H12V3.75z" /></Icon>;
export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></Icon>;
export const WrenchScrewdriverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.472-2.472a.563.563 0 01.796 0l2.472 2.472M11.42 15.17l-2.472 2.472a.563.563 0 01-.796 0l-2.472-2.472m5.74-13.22l-2.472 2.472a.563.563 0 01-.796 0L4.558 11.42a2.652 2.652 0 00-3.75 3.75l5.877 5.877" /></Icon>;
export const ClipboardDocumentCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25L15 7.125m-2.25 10.5l-3.375-3.375M12.75 21l-3.375-3.375" /></Icon>;
export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>;
export const ArrowUpOnSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v12" /></Icon>;
export const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M12 18a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75h.008v.008h-.008V6.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25a2.25 2.25 0 00-2.25-2.25h-1.5a.75.75 0 01-.75-.75V5.25a2.25 2.25 0 00-2.25-2.25H9.75A2.25 2.25 0 007.5 5.25v.75c0 .414-.336.75-.75.75h-1.5A2.25 2.25 0 003 8.25z" /></Icon>;
export const CodeBracketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l-3.75 3.75 3.75 3.75M17.25 7.5l-3.75 3.75 3.75 3.75" /></Icon>;
export const ChevronDoubleUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 18.75l7.5-7.5 7.5 7.5" /></Icon>;
export const SpeakerXMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5 10.5m0-10.5L9 19.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M19.5 12l-2.25-2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></Icon>;
export const RssIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-3h.008v.008H4.5V9zm0 6h.008v.008H4.5v-.008zm0-3h.008v.008H4.5V12zm6.75-6.75a7.5 7.5 0 00-7.5-7.5H4.5a2.25 2.25 0 000 4.5h.75" /></Icon>;
export const BeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 2.25a.75.75 0 00-1.5 0v1.085A2.25 2.25 0 0112 5.513V12.75a3 3 0 003 3h1.5a3 3 0 003-3V5.513a2.25 2.25 0 01-.75-2.178V2.25a.75.75 0 00-1.5 0v.143a.75.75 0 01-1.5 0V2.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A3.75 3.75 0 007.5 9.75v.75c0 1.036-.84 1.875-1.875 1.875h-1.5A1.875 1.875 0 012.25 10.5v-.75A3.75 3.75 0 006 3h-1.5A2.25 2.25 0 002.25 5.25v.75" /></Icon>;
export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const QrCodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path fillRule="evenodd" d="M2.25 2.25h19.5v19.5H2.25V2.25zM12 18a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H12.75a.75.75 0 01-.75-.75zM10.5 15a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H11.25a.75.75 0 01-.75-.75zM12 12a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H12.75a.75.75 0 01-.75-.75zM10.5 9a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H11.25a.75.75 0 01-.75-.75zM7.5 15a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H8.25a.75.75 0 01-.75-.75zM9 12a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H9.75A.75.75 0 019 12zm-1.5 6a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H8.25a.75.75 0 01-.75-.75zM9 6a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H9.75A.75.75 0 019 6zM7.5 9a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H8.25a.75.75 0 01-.75-.75z" clipRule="evenodd" /></Icon>;
export const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5h10.5M6.75 10.5h10.5M6.75 13.5h10.5M3.75 17.25h16.5c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.75c-.621 0-1.125.504-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125zm0 0h16.5m-16.5 0p-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25h16.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H3.75z" /></Icon>;
export const SignalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18m3.75-10.5V18m3.75-4.5V18m3.75-7.5V18m3.75-1.5V18" /></Icon>;
export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></Icon>;
export const AlarmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></Icon>;

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></Icon>
);

export const GripVerticalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l.001 14M15 5l.001 14" /></Icon>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.71c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></Icon>
);

export const CrmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></Icon>
);

export const RhIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM10.5 9.375a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z" /></Icon>
);

export const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></Icon>
);

export const ArchiveBoxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></Icon>
);

export const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></Icon>
);

export const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></Icon>
);

export const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></Icon>
);

export const EmailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></Icon>
);

export const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></Icon>
);

export const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></Icon>
);

export const TEfficiencyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-8.25 0v13.5m0 0l-3-3m3 3l3-3" strokeWidth={2.5}/>
    </Icon>
);

export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></Icon>
);

export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></Icon>
);

export const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></Icon>
);

export const LanguageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></Icon>
);

export const SpeakerWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></Icon>
);

export const ChatBubbleLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></Icon>
);

export const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></Icon>
);

export const VideoCameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></Icon>
);

export const GlobeAmericasIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></Icon>
);

export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></Icon>
);

export const UserPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></Icon>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.663M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></Icon>
);

export const BanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></Icon>
);

export const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></Icon>
);