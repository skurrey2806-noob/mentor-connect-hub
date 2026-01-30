import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  IndianRupee,
  Clock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Transaction } from '@/types/database';
import { format } from 'date-fns';

const tokenPackages = [
  { amount: 500, bonus: 0, price: 500 },
  { amount: 1000, bonus: 100, price: 1000 },
  { amount: 2500, bonus: 300, price: 2500 },
  { amount: 5000, bonus: 750, price: 5000 },
];

export default function WalletPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTokens, setIsAddingTokens] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchWalletData();
    }
  }, [user, authLoading]);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (walletData) {
        setBalance(walletData.balance);

        // Fetch transactions
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('*')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false })
          .limit(20);

        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTokens = async (amount: number) => {
    if (!user) return;

    setIsAddingTokens(true);
    try {
      // Get wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();

      if (!wallet) throw new Error('Wallet not found');

      // Update balance
      const newBalance = wallet.balance + amount;
      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      // Create transaction
      await supabase.from('transactions').insert({
        wallet_id: wallet.id,
        type: 'credit',
        amount: amount,
        description: 'Token purchase',
      });

      setBalance(newBalance);
      toast.success(`₹${amount} tokens added to your wallet!`);
      setDialogOpen(false);
      fetchWalletData();
    } catch (error) {
      console.error('Error adding tokens:', error);
      toast.error('Failed to add tokens');
    } finally {
      setIsAddingTokens(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="h-4 w-4 text-mentor-success" />;
      case 'debit':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-mentor-warning" />;
      case 'refund':
        return <ArrowDownLeft className="h-4 w-4 text-mentor-info" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (authLoading || isLoading) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-40 rounded-lg bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container max-w-4xl py-8">
        <h1 className="mb-8 text-3xl font-bold">My Wallet</h1>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary to-mentor-pink text-primary-foreground">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-80">Available Balance</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <IndianRupee className="h-8 w-8" />
                  <span className="text-5xl font-bold">{balance}</span>
                </div>
                <p className="mt-2 text-sm opacity-80">tokens</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20">
                <Wallet className="h-8 w-8" />
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="lg"
                  className="mt-6"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tokens
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Tokens</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {tokenPackages.map((pkg) => (
                      <Card
                        key={pkg.amount}
                        className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                        onClick={() => handleAddTokens(pkg.amount + pkg.bonus)}
                      >
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-primary">
                            ₹{pkg.amount}
                          </p>
                          {pkg.bonus > 0 && (
                            <Badge className="mt-2" variant="secondary">
                              +₹{pkg.bonus} bonus
                            </Badge>
                          )}
                          <p className="mt-2 text-sm text-muted-foreground">
                            Get ₹{pkg.amount + pkg.bonus}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <p className="mb-2 text-sm font-medium">Custom Amount</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                      />
                      <Button
                        onClick={() => {
                          const amount = parseInt(customAmount);
                          if (amount >= 100) {
                            handleAddTokens(amount);
                          } else {
                            toast.error('Minimum amount is ₹100');
                          }
                        }}
                        disabled={!customAmount || isAddingTokens}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.description || 'Transaction'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-right font-semibold ${
                        tx.type === 'credit' || tx.type === 'refund'
                          ? 'text-mentor-success'
                          : 'text-destructive'
                      }`}
                    >
                      {tx.type === 'credit' || tx.type === 'refund' ? '+' : '-'}₹
                      {tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No transactions yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  Add Your First Tokens
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
