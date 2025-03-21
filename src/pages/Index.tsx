
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BillForm from '@/components/BillForm';
import BillList from '@/components/BillList';
import { Bill, BillFormData } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  
  const { 
    clearCheckedNotifications, 
    requestNotificationPermission, 
    notificationPermission 
  } = useNotifications(bills);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check notification permission on load
  useEffect(() => {
    if (notificationPermission === 'default') {
      setShowPermissionDialog(true);
    }
  }, [notificationPermission]);
  
  const handleRequestPermission = async () => {
    await requestNotificationPermission();
    setShowPermissionDialog(false);
  };
  
  const handleAddBill = (formData: BillFormData) => {
    const newBill: Bill = {
      ...formData,
      id: crypto.randomUUID(),
      isPaid: false,
      createdAt: new Date().toISOString(),
    };
    
    setBills((prevBills) => [newBill, ...prevBills]);
    toast.success('Boleto adicionado com sucesso');
  };
  
  const handleTogglePaid = (id: string, isPaid: boolean) => {
    setBills((prevBills) =>
      prevBills.map((bill) =>
        bill.id === id ? { ...bill, isPaid } : bill
      )
    );
    
    toast.success(
      isPaid ? 'Boleto marcado como pago' : 'Boleto marcado como pendente'
    );
    
    if (isPaid) {
      clearCheckedNotifications();
    }
  };
  
  const handleDeleteBill = (id: string) => {
    setBills((prevBills) => prevBills.filter((bill) => bill.id !== id));
    toast.success('Boleto excluído com sucesso');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-36 bg-secondary rounded-md mb-4"></div>
          <div className="h-4 w-24 bg-secondary rounded-md"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <div className="container max-w-xl mx-auto py-6 px-4 sm:px-6">
        <Header />
        
        <div className="space-y-6">
          <BillForm onSubmit={handleAddBill} />
          <BillList 
            bills={bills} 
            onTogglePaid={handleTogglePaid}
            onDeleteBill={handleDeleteBill}
          />
        </div>
        
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>Lembrete de Boletos &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
      
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permitir notificações</DialogTitle>
            <DialogDescription>
              Para receber alertas de vencimentos mesmo com a tela desligada ou aplicativo em segundo plano,
              precisamos da sua permissão para enviar notificações.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
              Mais tarde
            </Button>
            <Button onClick={handleRequestPermission}>
              Permitir notificações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
