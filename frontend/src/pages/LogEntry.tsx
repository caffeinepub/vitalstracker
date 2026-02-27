import { useState } from 'react';
import { CheckCircle2, Loader2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAddVitalsReading } from '../hooks/useQueries';

interface FormField {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  min: number;
  max: number;
  step: number;
  hint: string;
}

const FIELDS: FormField[] = [
  {
    key: 'heartRate', label: 'Heart Rate', unit: 'bpm',
    placeholder: '72', min: 30, max: 220, step: 1,
    hint: 'Normal: 60–100 bpm',
  },
  {
    key: 'systolicBP', label: 'Systolic Blood Pressure', unit: 'mmHg',
    placeholder: '120', min: 70, max: 250, step: 1,
    hint: 'Normal: 90–120 mmHg',
  },
  {
    key: 'diastolicBP', label: 'Diastolic Blood Pressure', unit: 'mmHg',
    placeholder: '80', min: 40, max: 150, step: 1,
    hint: 'Normal: 60–80 mmHg',
  },
  {
    key: 'spo2', label: 'Blood Oxygen (SpO₂)', unit: '%',
    placeholder: '98', min: 70, max: 100, step: 0.1,
    hint: 'Normal: ≥95%',
  },
  {
    key: 'temperature', label: 'Body Temperature', unit: '°C',
    placeholder: '36.6', min: 30, max: 45, step: 0.1,
    hint: 'Normal: 36.1–37.2°C',
  },
  {
    key: 'respiratoryRate', label: 'Respiratory Rate', unit: 'br/min',
    placeholder: '16', min: 5, max: 40, step: 1,
    hint: 'Normal: 12–20 br/min',
  },
];

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;

function validateField(field: FormField, value: string): string | null {
  if (!value.trim()) return `${field.label} is required`;
  const num = parseFloat(value);
  if (isNaN(num)) return 'Must be a valid number';
  if (num < field.min || num > field.max) {
    return `Must be between ${field.min} and ${field.max} ${field.unit}`;
  }
  return null;
}

export function LogEntry() {
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const mutation = useAddVitalsReading();

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    FIELDS.forEach((field) => {
      const err = validateField(field, values[field.key] || '');
      if (err) newErrors[field.key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await mutation.mutateAsync({
        heartRate: parseFloat(values.heartRate),
        systolicBP: parseFloat(values.systolicBP),
        diastolicBP: parseFloat(values.diastolicBP),
        spo2: parseFloat(values.spo2),
        temperature: parseFloat(values.temperature),
        respiratoryRate: parseFloat(values.respiratoryRate),
      });
      setSubmitted(true);
      setValues({});
      setErrors({});
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save reading';
      setErrors({ _form: message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center">
            <ClipboardList className="w-4.5 h-4.5 text-teal" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Log Vitals</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your current vital signs. All fields are required. Values are validated against physiologically plausible ranges.
        </p>
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-status-normal-bg border border-status-normal/30 text-status-normal mb-6 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Reading saved successfully!</p>
            <p className="text-xs opacity-80 mt-0.5">Your vitals have been recorded and are now visible on the dashboard.</p>
          </div>
        </div>
      )}

      {/* Form error */}
      {errors._form && (
        <div className="p-4 rounded-lg bg-status-critical-bg border border-status-critical/30 text-status-critical mb-6 text-sm">
          {errors._form}
        </div>
      )}

      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Vital Signs Entry</CardTitle>
          <CardDescription className="text-xs">
            Record your measurements at the time of reading. Timestamp is set automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-sm font-medium text-foreground">
                    {field.label}
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">({field.unit})</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.key}
                      type="number"
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      placeholder={field.placeholder}
                      value={values[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={`font-mono bg-input border-border focus:border-teal focus:ring-teal/20 pr-14 ${
                        errors[field.key] ? 'border-status-critical focus:border-status-critical' : ''
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                      {field.unit}
                    </span>
                  </div>
                  {errors[field.key] ? (
                    <p className="text-xs text-status-critical">{errors[field.key]}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{field.hint}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-teal text-navy hover:bg-teal-bright font-semibold gap-2 h-11"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving reading...
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-4 h-4" />
                    Save Vitals Reading
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Reference ranges */}
      <Card className="mt-4 bg-card border-border">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Clinical Reference Ranges</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FIELDS.map((field) => (
              <div key={field.key} className="text-xs">
                <span className="text-muted-foreground">{field.label}: </span>
                <span className="text-status-normal font-medium font-mono">{field.hint.replace('Normal: ', '')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
