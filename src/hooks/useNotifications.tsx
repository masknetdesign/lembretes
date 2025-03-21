
import { useEffect, useRef } from 'react';
import { format, isAfter, isBefore, parseISO, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { Bill } from '@/types';

export function useNotifications(bills: Bill[]) {
  const checkedBillsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    // Função para verificar boletos próximos do vencimento
    const checkUpcomingBills = () => {
      const now = new Date();
      
      bills.forEach((bill) => {
        // Pular boletos já pagos ou já verificados
        if (bill.isPaid || checkedBillsRef.current.has(bill.id)) return;
        
        const dueDateObj = parseISO(`${bill.dueDate}T${bill.dueTime}`);
        
        // Verifica se é 24 horas antes do vencimento
        const is24HoursBefore = isAfter(dueDateObj, now) && isBefore(dueDateObj, new Date(now.getTime() + 24 * 60 * 60 * 1000));
        
        // Verifica se está prestes a vencer (2 horas antes)
        const isAboutToExpire = isAfter(dueDateObj, now) && isBefore(dueDateObj, new Date(now.getTime() + 2 * 60 * 60 * 1000));
        
        // Verifica se acabou de vencer (até 1 hora depois)
        const justExpired = isBefore(dueDateObj, now) && isAfter(dueDateObj, subHours(now, 1));
        
        // Exibe notificações de acordo com a situação
        if (is24HoursBefore && !checkedBillsRef.current.has(`${bill.id}-24h`)) {
          toast.info(
            `O boleto ${bill.name} vence em 24 horas`,
            {
              icon: <Bell className="h-4 w-4" />,
              description: `Valor: ${new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(bill.amount)} - Vence em ${format(dueDateObj, "dd 'de' MMMM", { locale: ptBR })} às ${bill.dueTime}`,
              duration: 6000,
            }
          );
          checkedBillsRef.current.add(`${bill.id}-24h`);
        }
        
        if (isAboutToExpire && !checkedBillsRef.current.has(`${bill.id}-2h`)) {
          toast.warning(
            `O boleto ${bill.name} vence em breve!`,
            {
              icon: <Bell className="h-4 w-4" />,
              description: `Valor: ${new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(bill.amount)} - Vence em poucas horas às ${bill.dueTime}`,
              duration: 8000,
            }
          );
          checkedBillsRef.current.add(`${bill.id}-2h`);
        }
        
        if (justExpired && !checkedBillsRef.current.has(`${bill.id}-expired`)) {
          toast.error(
            `O boleto ${bill.name} venceu!`,
            {
              icon: <Bell className="h-4 w-4" />,
              description: `Valor: ${new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(bill.amount)} - Venceu às ${bill.dueTime}`,
              duration: 10000,
            }
          );
          checkedBillsRef.current.add(`${bill.id}-expired`);
        }
      });
    };

    // Verificar imediatamente ao carregar
    checkUpcomingBills();
    
    // Configurar intervalo para verificar a cada minuto
    const intervalId = setInterval(checkUpcomingBills, 60 * 1000);
    
    // Limpar intervalo ao desmontar o componente
    return () => clearInterval(intervalId);
  }, [bills]);
  
  // Função para limpar notificações verificadas (util ao excluir boletos)
  const clearCheckedNotifications = () => {
    checkedBillsRef.current.clear();
  };
  
  return { clearCheckedNotifications };
}
