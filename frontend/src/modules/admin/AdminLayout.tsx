import type { ReactNode } from 'react';
import AdminNavigation from './components/AdminNavigation';

export default function AdminLayout({ children }: { children?: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavigation />
            <main className="max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
