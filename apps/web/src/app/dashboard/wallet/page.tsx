'use client'
import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { walletApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import { Wallet, ArrowDownRight, ArrowUpRight, Phone, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WalletPage() {
  const [withdrawTab, setWithdrawTab] = useState<'mpesa' | 'paypal'>('mpesa')
  const [amount, setAmount] = useState('')
  const [mpesaNumber, setMpesaNumber] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: wallet, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.get('/api/v1/wallet/balance').then(r => r.data.data),
  })

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => walletApi.get('/api/v1/wallet/transactions?limit=20').then(r => r.data.data),
  })

  const withdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount')
    setLoading(true)
    try {
      if (withdrawTab === 'mpesa') {
        if (!mpesaNumber) return toast.error('Enter M-Pesa number')
        await walletApi.post('/api/v1/wallet/withdraw/mpesa', {
          amount: parseFloat(amount), mpesaNumber,
        })
        toast.success('M-Pesa withdrawal initiated!')
      } else {
        if (!paypalEmail) return toast.error('Enter PayPal email')
        await walletApi.post('/api/v1/wallet/withdraw/paypal', {
          amount: parseFloat(amount), paypalEmail,
        })
        toast.success('PayPal withdrawal initiated!')
      }
      setAmount('')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  const getTransactionBadge = (type: string) => {
    const variants: Record<string, any> = {
      CREDIT: 'teal', DEBIT: 'red', WITHDRAWAL: 'orange',
      COMMISSION: 'gray', ESCROW_HOLD: 'blue', ESCROW_RELEASE: 'teal',
    }
    return variants[type] || 'gray'
  }

  return (
    <DashboardLayout title="Wallet">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance */}
        <div className="space-y-4">
          <Card glow="teal">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/50 text-sm">Available Balance</p>
              <Wallet size={18} className="text-brand-teal" />
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1">
              {formatCurrency(wallet?.balance || 0)}
            </p>
            {wallet?.pendingBalance > 0 && (
              <p className="text-sm text-white/40">
                {formatCurrency(wallet.pendingBalance)} pending
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-white/40 mb-1">Total Earned</p>
                <p className="text-sm font-medium text-brand-teal">{formatCurrency(wallet?.totalEarned || 0)}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-white/40 mb-1">Total Withdrawn</p>
                <p className="text-sm font-medium text-white/70">{formatCurrency(wallet?.totalWithdrawn || 0)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Withdraw Funds</CardTitle>
            <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">
              {(['mpesa', 'paypal'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setWithdrawTab(tab)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                    withdrawTab === tab ? 'bg-brand-blue text-white' : 'text-white/50'
                  }`}
                >
                  {tab === 'mpesa' ? 'M-Pesa' : 'PayPal'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Input
                label="Amount (KES)"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {withdrawTab === 'mpesa' ? (
                <Input
                  label="M-Pesa Number"
                  placeholder="07XXXXXXXX"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                />
              ) : (
                <Input
                  label="PayPal Email"
                  type="email"
                  placeholder="you@example.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                />
              )}
              <Button onClick={withdraw} loading={loading} className="w-full">
                {withdrawTab === 'mpesa' ? <Phone size={14} /> : <CreditCard size={14} />}
                Withdraw via {withdrawTab === 'mpesa' ? 'M-Pesa' : 'PayPal'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            {transactions?.transactions?.length > 0 ? (
              <div className="space-y-2">
                {transactions.transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/3 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'CREDIT' || tx.type === 'ESCROW_RELEASE'
                        ? 'bg-brand-teal/10 text-brand-teal'
                        : 'bg-brand-orange/10 text-brand-orange'
                    }`}>
                      {tx.type === 'CREDIT' || tx.type === 'ESCROW_RELEASE'
                        ? <ArrowDownRight size={16} />
                        : <ArrowUpRight size={16} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 truncate">{tx.description || tx.type}</p>
                      <p className="text-xs text-white/40">{formatRelativeTime(tx.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-medium ${
                        tx.type === 'CREDIT' ? 'text-brand-teal' : 'text-white/70'
                      }`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <Badge variant={getTransactionBadge(tx.status)} size="sm">{tx.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/30 text-sm">
                No transactions yet
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
