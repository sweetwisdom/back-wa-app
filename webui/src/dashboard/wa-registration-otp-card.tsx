import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';

type Props = {
  value: string;
  busy?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function WaRegistrationOtpCard({ value, busy, onChange, onSubmit }: Props) {
  return (
    <Card className="border-dashed">
      <CardContent className="grid gap-2 p-3">
        <CardTitle className="inline-flex items-center gap-2 text-sm"><KeyRound size={15} />OTP</CardTitle>
        <div className="flex items-center gap-2">
          <InputOTP maxLength={8} value={value} onChange={onChange} pattern={REGEXP_ONLY_DIGITS} inputMode="numeric" autoComplete="one-time-code" disabled={busy}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
              <InputOTPSlot index={6} />
              <InputOTPSlot index={7} />
            </InputOTPGroup>
          </InputOTP>
          <Button type="button" size="icon" disabled={busy || !value.trim()} title="提交 OTP" aria-label="提交 OTP" onClick={onSubmit}><CheckCircle2 size={14} /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
