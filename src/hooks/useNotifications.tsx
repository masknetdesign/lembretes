import { useEffect, useRef, useState } from 'react';
import { format, isAfter, isBefore, parseISO, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { Bill } from '@/types';

export function useNotifications(bills: Bill[]) {
  const checkedBillsRef = useRef<Set<string>>(new Set());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Register service worker for background notifications
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/notification-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    }
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Initialize audio element for notification sound
    audioRef.current = new Audio('/notification-sound.mp3');
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);
  
  // Request notification permission if not granted
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Este navegador não suporta notificações');
      return;
    }
    
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    
    return Notification.permission;
  };
  
  // Schedule notification for a specific bill
  const scheduleNotification = (bill: Bill, type: 'warning' | 'urgent' | 'expired') => {
    const dueDateObj = parseISO(`${bill.dueDate}T${bill.dueTime}`);
    const now = new Date();
    
    // Calculate delay until notification should be shown
    let delay = 0;
    if (type === 'warning') {
      // 24 hours before
      delay = dueDateObj.getTime() - now.getTime() - (24 * 60 * 60 * 1000);
    } else if (type === 'urgent') {
      // 2 hours before
      delay = dueDateObj.getTime() - now.getTime() - (2 * 60 * 60 * 1000);
    } else if (type === 'expired') {
      // At due time
      delay = dueDateObj.getTime() - now.getTime();
    }
    
    // Don't schedule if the notification time has already passed
    if (delay < 0) return;
    
    // Format messages
    let title = '';
    let description = '';
    
    if (type === 'warning') {
      title = `O boleto ${bill.name} vence em 24 horas`;
      description = `Valor: ${new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(bill.amount)} - Vence em ${format(dueDateObj, "dd 'de' MMMM", { locale: ptBR })} às ${bill.dueTime}`;
    } else if (type === 'urgent') {
      title = `O boleto ${bill.name} vence em breve!`;
      description = `Valor: ${new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(bill.amount)} - Vence em poucas horas às ${bill.dueTime}`;
    } else if (type === 'expired') {
      title = `O boleto ${bill.name} venceu!`;
      description = `Valor: ${new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(bill.amount)} - Venceu às ${bill.dueTime}`;
    }
    
    // Schedule notification
    setTimeout(() => {
      // Show browser notification
      if (Notification.permission === 'granted') {
        try {
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.error('Error playing sound:', err));
          }
          
          // Create notification
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
              body: description,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `bill-${bill.id}-${type}`,
              requireInteraction: true
            });
          });
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      }
      
      // Also show in-app toast
      if (type === 'warning') {
        toast.info(title, {
          icon: <Bell className="h-4 w-4" />,
          description: description,
          duration: 6000,
        });
      } else if (type === 'urgent') {
        toast.warning(title, {
          icon: <Bell className="h-4 w-4" />,
          description: description,
          duration: 8000,
        });
      } else if (type === 'expired') {
        toast.error(title, {
          icon: <Bell className="h-4 w-4" />,
          description: description,
          duration: 10000,
        });
      }
      
      // Mark as checked
      checkedBillsRef.current.add(`${bill.id}-${type}`);
    }, Math.max(0, delay));
  };
  
  // Schedule all notifications for bills
  useEffect(() => {
    // Request permission first
    requestNotificationPermission().then(permission => {
      if (permission !== 'granted') {
        toast.error('Para receber notificações, você precisa permitir o acesso');
        return;
      }
      
      // Schedule notifications for each bill
      bills.forEach(bill => {
        // Skip paid bills
        if (bill.isPaid) return;
        
        const dueDateObj = parseISO(`${bill.dueDate}T${bill.dueTime}`);
        const now = new Date();
        
        // If due date is in the future, schedule notifications
        if (isAfter(dueDateObj, now)) {
          // 24h warning
          if (!checkedBillsRef.current.has(`${bill.id}-warning`)) {
            scheduleNotification(bill, 'warning');
          }
          
          // 2h urgent
          if (!checkedBillsRef.current.has(`${bill.id}-urgent`)) {
            scheduleNotification(bill, 'urgent');
          }
          
          // At expiration
          if (!checkedBillsRef.current.has(`${bill.id}-expired`)) {
            scheduleNotification(bill, 'expired');
          }
        }
      });
    });
    
    // Also run the original check function for immediate notifications
    const checkUpcomingBills = () => {
      const now = new Date();
      
      bills.forEach((bill) => {
        // Skip paid bills or already checked
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
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.error('Error playing sound:', err));
          }
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
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.error('Error playing sound:', err));
          }
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
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.error('Error playing sound:', err));
          }
        }
      });
    };
    
    // Check immediately and set interval
    checkUpcomingBills();
    const intervalId = setInterval(checkUpcomingBills, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [bills]);
  
  // Function to clear checked notifications
  const clearCheckedNotifications = () => {
    checkedBillsRef.current.clear();
  };
  
  return { 
    clearCheckedNotifications,
    requestNotificationPermission,
    notificationPermission
  };
}
