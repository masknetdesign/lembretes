
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BillForm from '@/components/BillForm';
import BillList from '@/components/BillList';
import { Bill, BillFormData } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

const Index = () => {
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to show smooth animations
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
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
          <BillList bills={bills} onTogglePaid={handleTogglePaid} />
        </div>
        
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>Lembrete de Boletos &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
