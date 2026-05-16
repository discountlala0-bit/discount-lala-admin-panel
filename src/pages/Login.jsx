import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { sendOtp, verifyOtp, verifyIdToken } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sessionInfo, setSessionInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return toast.error('Enter a phone number')
    setLoading(true)
    try {
      const res = await sendOtp(phone.trim())
      setSessionInfo(res.data.sessionInfo)
      setStep('otp')
      toast.success('OTP sent successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim()) return toast.error('Enter the OTP')
    setLoading(true)
    try {
      const otpRes = await verifyOtp(sessionInfo, otp.trim())
      const idToken = otpRes.data.idToken
      const tokenRes = await verifyIdToken(idToken)
      login(tokenRes.data.token)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Discount Lala</CardTitle>
          <CardDescription>Admin Panel — Sign in with your phone number</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground">OTP sent to {phone}</p>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Sign In
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => { setStep('phone'); setOtp('') }}
              >
                Change number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
