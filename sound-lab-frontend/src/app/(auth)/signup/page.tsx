import { SignupForm } from '@/components/features/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
   
     <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-900/20 to-orange-900/30 p-4">
          <div className="w-full max-w-md">
            <SignupForm />
            
          </div>
        </main>
  );
}