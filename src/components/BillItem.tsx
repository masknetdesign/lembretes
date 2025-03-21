
import React from 'react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Bill } from '@/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface BillItemProps {
  bill: Bill;
  onTogglePaid: (id: string, isPaid: boolean) => void;
}

const BillItem: React.FC<BillItemProps> = ({ bill, onTogglePaid }) => {
  const dueDateObj = parseISO(`${bill.dueDate}T${bill.dueTime}`);
  const now = new Date();
  
  const isOverdue = !bill.isPaid && isBefore(dueDateObj, now);
  const isDueSoon = !bill.isPaid && !isOverdue && 
    isBefore(dueDateObj, new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)); // 3 days
  
  return (
    <div 
      className={cn(
        "glass-card p-4 transition-all duration-300 animate-slide-up hover:translate-y-[-2px]",
        bill.isPaid ? "border-l-4 border-l-green-400" : 
        isOverdue ? "border-l-4 border-l-destructive" : 
        isDueSoon ? "border-l-4 border-l-amber-400" : ""
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium truncate">{bill.name}</h3>
        <div className="flex items-center space-x-2 ml-2">
          <span className="text-sm text-muted-foreground">
            {bill.isPaid ? 'Pago' : 'Pendente'}
          </span>
          <Switch
            checked={bill.isPaid}
            onCheckedChange={(checked) => onTogglePaid(bill.id, checked)}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </div>
      
      <div className="flex items-center mt-1">
        <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
        <span className="text-sm font-medium">
          {new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(bill.amount)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-xs text-muted-foreground">
            {format(parseISO(bill.dueDate), "dd 'de' MMM", { locale: ptBR })}
          </span>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-xs text-muted-foreground">
            {bill.dueTime}
          </span>
        </div>
      </div>
      
      {!bill.isPaid && (
        <div className="mt-3 pt-2 border-t border-border flex items-center">
          {isOverdue ? (
            <>
              <AlertCircle className="h-4 w-4 text-destructive mr-1" />
              <span className="text-xs text-destructive">Vencido</span>
            </>
          ) : isDueSoon ? (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-xs text-amber-500">Vence em breve</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Em dia</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BillItem;
