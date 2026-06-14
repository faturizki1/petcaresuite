import { useState } from 'react';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useWebsiteContent, useUpdateWebsiteContent } from '../website.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function WebsiteContentPage() {
  const { data = [] } = useWebsiteContent();
  const update = useUpdateWebsiteContent();
  const [editing, setEditing] = useState<any | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  useDocumentTitle('Website Content');

  const handleEdit = (section: any) => {
    setEditing(section);
    const content = section.content || {};
    const values: Record<string, string> = {};

    if (section.section_key === 'hero') {
      values.title = content.title || '';
      values.subtitle = content.subtitle || '';
      values.ctaText = content.ctaText || '';
    } else if (section.section_key === 'services') {
      values.sectionTitle = content.sectionTitle || '';
    } else if (section.section_key === 'about') {
      values.content = content.content || '';
    } else if (section.section_key === 'contact') {
      values.address = content.address || '';
      values.phone = content.phone || '';
      values.email = content.email || '';
    } else {
      Object.entries(content).forEach(([key, val]) => {
        values[key] = typeof val === 'string' ? val : JSON.stringify(val);
      });
    }

    setFieldValues(values);
  };

  const handleSave = () => {
    if (!editing) return;

    let content: any = {};

    if (editing.section_key === 'hero') {
      content = {
        title: fieldValues.title || '',
        subtitle: fieldValues.subtitle || '',
        ctaText: fieldValues.ctaText || ''
      };
    } else if (editing.section_key === 'services') {
      content = { sectionTitle: fieldValues.sectionTitle || '' };
    } else if (editing.section_key === 'about') {
      content = { content: fieldValues.content || '' };
    } else if (editing.section_key === 'contact') {
      content = {
        address: fieldValues.address || '',
        phone: fieldValues.phone || '',
        email: fieldValues.email || ''
      };
    } else {
      content = { ...fieldValues };
    }

    update.mutate({ sectionKey: editing.section_key, content });
    setEditing(null);
    setFieldValues({});
  };

  const renderFields = () => {
    if (!editing) return null;

    const key = editing.section_key;

    if (key === 'hero') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Title</label>
            <Input
              value={fieldValues.title || ''}
              onChange={(e) => setFieldValues((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Hero title"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Subtitle</label>
            <Input
              value={fieldValues.subtitle || ''}
              onChange={(e) => setFieldValues((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Hero subtitle"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">CTA Button Text</label>
            <Input
              value={fieldValues.ctaText || ''}
              onChange={(e) => setFieldValues((prev) => ({ ...prev, ctaText: e.target.value }))}
              placeholder="e.g. Book Appointment"
            />
          </div>
        </div>
      );
    }

    if (key === 'services') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Section Title</label>
          <Input
            value={fieldValues.sectionTitle || ''}
            onChange={(e) => setFieldValues((prev) => ({ ...prev, sectionTitle: e.target.value }))}
            placeholder="e.g. Our Services"
          />
        </div>
      );
    }

    if (key === 'about') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Content</label>
          <Textarea
            value={fieldValues.content || ''}
            onChange={(e) => setFieldValues((prev) => ({ ...prev, content: e.target.value }))}
            rows={6}
            placeholder="About content..."
          />
        </div>
      );
    }

    if (key === 'contact') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Address</label>
            <Input
              value={fieldValues.address || ''}
              onChange={(e) => setFieldValues((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Clinic address"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Phone</label>
            <Input
              value={fieldValues.phone || ''}
              onChange={(e) => setFieldValues((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone number"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Email</label>
            <Input
              value={fieldValues.email || ''}
              onChange={(e) => setFieldValues((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email address"
            />
          </div>
        </div>
      );
    }

    // Generic key-value pairs for unknown sections
    return (
      <div className="space-y-4">
        {Object.entries(fieldValues).map(([fieldKey, val]) => (
          <div key={fieldKey} className="space-y-2">
            <label className="block text-sm font-medium capitalize">{fieldKey}</label>
            <Input
              value={val || ''}
              onChange={(e) => setFieldValues((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
              placeholder={fieldKey}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Website Content</h1>
        <p className="mt-1 text-sm text-slate-500">Manage hero, services, and other content sections.</p>
      </div>

      <div className="grid gap-4">
        {data.map((sec: any) => (
          <Card key={sec.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold capitalize">{sec.section_key}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {sec.section_key === 'hero' && 'Title, subtitle, and CTA button'}
                  {sec.section_key === 'services' && 'Services section heading'}
                  {sec.section_key === 'about' && 'About section content'}
                  {sec.section_key === 'contact' && 'Address, phone, and email'}
                  {!['hero', 'services', 'about', 'contact'].includes(sec.section_key) && 'Custom content section'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleEdit(sec)}>
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold capitalize">Edit {editing.section_key}</h3>
          {renderFields()}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setEditing(null); setFieldValues({}); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={update.isLoading}>
              {update.isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}