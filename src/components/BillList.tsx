
import React, { useState } from 'react';
import { Bill } from '@/types';
import BillItem from './BillItem';
import { Input } from '@/components/ui/input';
import { Search, SortAsc, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BillListProps {
  bills: Bill[];
  onTogglePaid: (id: string, isPaid: boolean) => void;
  onDeleteBill?: (id: string) => void;
}

const BillList: React.FC<BillListProps> = ({ bills, onTogglePaid, onDeleteBill }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'amount'>('date');
  const [showPaid, setShowPaid] = useState(true);
  
  // Filter and sort bills
  const filteredBills = bills
    .filter((bill) => {
      const matchesSearch = bill.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPaidFilter = showPaid || !bill.isPaid;
      return matchesSearch && matchesPaidFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = `${a.dueDate}T${a.dueTime}`;
        const dateB = `${b.dueDate}T${b.dueTime}`;
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'amount') {
        return a.amount - b.amount;
      }
      return 0;
    });
    
  // Group by paid/unpaid
  const unpaidBills = filteredBills.filter(bill => !bill.isPaid);
  const paidBills = filteredBills.filter(bill => bill.isPaid);
  
  // Only show all bills when there are some
  const hasUnpaidBills = unpaidBills.length > 0;
  const hasPaidBills = paidBills.length > 0;
  
  return (
    <div className="glass-card p-6 animate-slide-up">
      <h2 className="text-lg font-medium mb-4">Seus Boletos</h2>
      
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar boletos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "transition-all duration-200",
            !showPaid && "bg-secondary"
          )}
          onClick={() => setShowPaid(!showPaid)}
        >
          {showPaid ? "Ocultar Pagos" : "Mostrar Pagos"}
        </Button>
        
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="transition-all duration-200"
            onClick={() => {
              const options: ('date' | 'name' | 'amount')[] = ['date', 'name', 'amount'];
              const currentIndex = options.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % options.length;
              setSortBy(options[nextIndex]);
            }}
          >
            <SortAsc className="h-4 w-4" />
          </Button>
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
            {sortBy === 'date' ? 'D' : sortBy === 'name' ? 'N' : 'V'}
          </div>
        </div>
      </div>
      
      {bills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum boleto cadastrado ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Adicione seu primeiro boleto usando o formulário acima.
          </p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum boleto encontrado para essa busca.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {hasUnpaidBills && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                PENDENTES ({unpaidBills.length})
              </h3>
              <div className="space-y-3">
                {unpaidBills.map((bill) => (
                  <BillItem 
                    key={bill.id} 
                    bill={bill} 
                    onTogglePaid={onTogglePaid} 
                    onDelete={onDeleteBill}
                  />
                ))}
              </div>
            </div>
          )}
          
          {showPaid && hasPaidBills && (
            <div className="space-y-3 pt-3 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground">
                PAGOS ({paidBills.length})
              </h3>
              <div className="space-y-3 opacity-80">
                {paidBills.map((bill) => (
                  <BillItem 
                    key={bill.id} 
                    bill={bill} 
                    onTogglePaid={onTogglePaid}
                    onDelete={onDeleteBill}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillList;
