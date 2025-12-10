import { Header } from "@/components/Header";
import { RegisterForm } from "@/components/AuthForms";
import { Footer } from "@/components/Footer";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
}
