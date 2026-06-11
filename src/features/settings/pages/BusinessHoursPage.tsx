import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input } from '@/components/ui';
import { useBusinessHours, useUpdateBusinessHours } from '../settings.hooks';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function BusinessHoursPage() {
  const { data } = useBusinessHours();
  const update = useUpdateBusinessHours();
  const [hours, setHours] = useState(data || DAYS.map((_, i) => ({ dayOfWeek: i, startTime: '08:00', endTime: '17:00', isClosed: false })));

  async function save() {
    await update.mutateAsync(hours);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Business Hours" description="Set operating hours per day." />
      <div className="grid gap-4">
        {hours.map((h, i) => (
          <Card key={i} className="p-4">
            <div className="grid gap-2">
              <p className="font-semibold">{DAYS[h.dayOfWeek]}</p>
              <div className="flex gap-2">
                <Input type="time" value={h.startTime} onChange={(e) => { const newHours = [...hours]; newHours[i].startTime = e.target.value; setHours(newHours); }} />
                <Input type="time" value={h.endTime} onChange={(e) => { const newHours = [...hours]; newHours[i].endTime = e.target.value; setHours(newHours); }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Button onClick={save}>Save Hours</Button>
    </div>
  );
}
