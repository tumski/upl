import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <h1 className="mb-8 text-center text-2xl font-bold">Sign in to your account</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
