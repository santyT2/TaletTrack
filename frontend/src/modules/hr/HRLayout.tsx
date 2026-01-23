import type { ReactNode } from 'react';
import HRNavigation from './components/HRNavigation';

export default function HRLayout({ children }: { children?: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <HRNavigation />
            <main className="max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
