import type { ReactNode } from 'react';
import HRNavigation from './components/HRNavigation';

export default function HRLayout({ children }: { children?: ReactNode }) {
    return (
        <div className="bg-gray-50 min-h-screen">
            <HRNavigation />
            <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </div>
    );
}
