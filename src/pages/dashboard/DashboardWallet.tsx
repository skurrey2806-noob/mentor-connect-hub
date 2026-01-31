import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Transaction, PayoutMethod, Withdrawal } from '@/types/database';

export default function DashboardWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const [methodForm, setMethodForm] = useState({
    method_type: 'bank',
    account_name: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
  });

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      const [walletRes, payoutRes, withdrawRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', user.id).single(),
        supabase.from('payout_methods').select('*').eq('user_id', user.id).order('is_primary', { ascending: false }),
        supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ]);

      if (walletRes.data) {
        setBalance(walletRes.data.balance);
        
        // Fetch transactions separately
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('wallet_id', walletRes.data.id)
          .order('created_at', { ascending: false })
          .limit(20);
        
        setTransactions((txData as Transaction[]) || []);
      }

      setPayoutMethods((payoutRes.data as PayoutMethod[]) || []);
      setWithdrawals((withdrawRes.data as Withdrawal[]) || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayoutMethod = async () => {
    if (!user) return;

    try {
      await supabase.from('payout_methods').insert({
        user_id: user.id,
        ...methodForm,
        is_primary: payoutMethods.length === 0,
      });
      
      toast.success('Payout method added');
      setIsAddMethodOpen(false);
      setMethodForm({
        method_type: 'bank',
        account_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        upi_id: '',
      });
      fetchWalletData();
    } catch (error) {
      toast.error('Failed to add payout method');
    }
  };

  const handleWithdraw = async () => {
    if (!user || !selectedMethod || !withdrawAmount) return;
    
    const amount = parseInt(withdrawAmount);
    if (amount <= 0 || amount > balance) {
      toast.error('Invalid amount');
      return;
    }

    try {
      await supabase.from('withdrawals').insert({
        user_id: user.id,
        payout_method_id: selectedMethod,
        amount,
        status: 'pending',
      });
      
      toast.success('Withdrawal request submitted');
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
      setSelectedMethod('');
      fetchWalletData();
    } catch (error) {
      toast.error('Failed to submit withdrawal');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'debit':
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <ArrowDownRight className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getWithdrawalBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status] || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet & Payouts</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">₹{(balance * 1.5).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">₹{balance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full" disabled={balance <= 0 || payoutMethods.length === 0}>
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Available Balance</Label>
                    <p className="text-2xl font-bold text-primary">₹{balance.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount to Withdraw (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={balance}
                    />
                  </div>

                  <div>
                    <Label>Payout Method</Label>
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payout method" />
                      </SelectTrigger>
                      <SelectContent>
                        {payoutMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.method_type === 'upi'
                              ? `UPI: ${method.upi_id}`
                              : `${method.bank_name} - ${method.account_number?.slice(-4)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleWithdraw} className="w-full">
                    Confirm Withdrawal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Methods */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment Methods</CardTitle>
            <Dialog open={isAddMethodOpen} onOpenChange={setIsAddMethodOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Method Type</Label>
                    <Select
                      value={methodForm.method_type}
                      onValueChange={(v) => setMethodForm({ ...methodForm, method_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Account</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Account Holder Name</Label>
                    <Input
                      value={methodForm.account_name}
                      onChange={(e) => setMethodForm({ ...methodForm, account_name: e.target.value })}
                    />
                  </div>

                  {methodForm.method_type === 'bank' ? (
                    <>
                      <div>
                        <Label>Bank Name</Label>
                        <Input
                          value={methodForm.bank_name}
                          onChange={(e) => setMethodForm({ ...methodForm, bank_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Account Number</Label>
                        <Input
                          value={methodForm.account_number}
                          onChange={(e) => setMethodForm({ ...methodForm, account_number: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>IFSC Code</Label>
                        <Input
                          value={methodForm.ifsc_code}
                          onChange={(e) => setMethodForm({ ...methodForm, ifsc_code: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label>UPI ID</Label>
                      <Input
                        value={methodForm.upi_id}
                        onChange={(e) => setMethodForm({ ...methodForm, upi_id: e.target.value })}
                        placeholder="yourname@upi"
                      />
                    </div>
                  )}

                  <Button onClick={handleAddPayoutMethod} className="w-full">
                    Add Payment Method
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {payoutMethods.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No payment methods added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {payoutMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {method.method_type === 'upi' ? (
                          <CreditCard className="h-5 w-5" />
                        ) : (
                          <Building className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{method.account_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.method_type === 'upi'
                            ? method.upi_id
                            : `${method.bank_name} •••• ${method.account_number?.slice(-4)}`}
                        </p>
                      </div>
                    </div>
                    {method.is_primary && (
                      <Badge variant="secondary">Primary</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No withdrawals yet.
              </p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">₹{withdrawal.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(withdrawal.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className={getWithdrawalBadge(withdrawal.status)}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No transactions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.description || 'Transaction'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'credit' || tx.type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' || tx.type === 'refund' ? '+' : '-'}₹{tx.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
