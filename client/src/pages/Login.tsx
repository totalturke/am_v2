import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/TranslationContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Building, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Form schema for login
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  // Login form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle form submission
  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setError(null);
    try {
      await login(data.username, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  // Demo login credentials
  const demoCredentials = [
    { role: t('common.controlCenter'), username: "miguel", password: "password" },
    { role: t('common.maintenanceAgent'), username: "carlos", password: "password" },
    { role: t('common.purchasingAgent'), username: "pedro", password: "password" },
  ];

  // Handle demo login
  const handleDemoLogin = (username: string, password: string) => {
    form.setValue("username", username);
    form.setValue("password", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <Building className="h-10 w-10 text-primary-500" />
            <h1 className="text-3xl font-bold text-primary-500">AirMaint</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.loginTitle')}</CardTitle>
            <CardDescription>
              {t('auth.loginDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.username')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('auth.enterUsername')} autoComplete="username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.password')}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder={t('auth.enterPassword')} 
                          autoComplete="current-password" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.loggingIn')}
                    </>
                  ) : (
                    t('auth.login')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-neutral-500 text-center w-full">
              {t('auth.demoAccounts')}
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {demoCredentials.map((cred, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDemoLogin(cred.username, cred.password)}
                  className="text-xs"
                >
                  {t('auth.loginAs', { role: cred.role, username: cred.username })}
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
