import { LoginForm } from '@/components/features/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-900/20 to-orange-900/30 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
       
      </div>
    </main>
  );
}