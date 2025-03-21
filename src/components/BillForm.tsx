
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { BillFormData } from '@/types';

interface BillFormProps {
  onSubmit: (data: BillFormData) => void;
}

const BillForm: React.FC<BillFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueTime, setDueTime] = useState('12:00');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nome do boleto é obrigatório');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Valor deve ser maior que zero');
      return;
    }

    if (!dueDate) {
      setError('Data de vencimento é obrigatória');
      return;
    }

    const formattedDate = format(dueDate, 'yyyy-MM-dd');
    
    const billData: BillFormData = {
      name: name.trim(),
      amount: parseFloat(amount),
      dueDate: formattedDate,
      dueTime: dueTime || '12:00'
    };

    onSubmit(billData);
    
    // Reset form
    setName('');
    setAmount('');
    setDueDate(undefined);
    setDueTime('12:00');
  };

  // Function to handle amount input with proper formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  return (
    <div className="glass-card p-6 mb-6 animate-slide-up">
      <h2 className="text-lg font-medium mb-4">Novo Boleto</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bill-name">Nome do Boleto</Label>
          <Input
            id="bill-name"
            placeholder="Ex: Conta de Luz"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bill-amount">Valor (R$)</Label>
          <Input
            id="bill-amount"
            placeholder="00,00"
            value={amount}
            onChange={handleAmountChange}
            type="number"
            step="0.01"
            min="0.01"
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data de Vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left transition-all duration-200 font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  locale={ptBR}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bill-time">Horário</Label>
            <div className="flex">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-r-none border-r-0"
              >
                <Clock className="h-4 w-4" />
              </Button>
              <Input
                id="bill-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="rounded-l-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="text-destructive text-sm animate-fade-in">
            {error}
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full transition-all duration-300 hover:shadow-md"
        >
          Adicionar Boleto
        </Button>
      </form>
    </div>
  );
};

export default BillForm;
