
import React from 'react';
import { CalendarCheck, ListTodo } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="glass-card p-4 mb-6 animate-fade-in">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight">Lembrete de Boletos</h1>
        </div>
        <div className="flex items-center">
          <div className="relative mr-1">
            <ListTodo className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
