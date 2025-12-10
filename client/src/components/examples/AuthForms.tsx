import { LoginForm, RegisterForm } from "../AuthForms";

export default function AuthFormsExample() {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <LoginForm />
      <RegisterForm />
    </div>
  );
}
