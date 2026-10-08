
import Link from "next/link";
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Registration Restricted</h1>
        <p className="text-gray-500 mb-4">Accounts are created by company administrators only.</p>
        <Link href="/login" className="text-blue-600 hover:underline">Back to Login</Link>
      </div>
    </div>
  );
}
