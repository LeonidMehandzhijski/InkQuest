import { BottomNav } from '@/components/BottomNav';
import { AuthSessionSync } from '@/components/AuthSessionSync';

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      <AuthSessionSync />
      {/* Main content — padded at bottom for nav bar */}
      <main className="flex-1 pb-16">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
